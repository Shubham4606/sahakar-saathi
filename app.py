"""
SahakarSaathi - multilingual cooperative assistant.
Flask backend + Gemini + simple RAG (answers come only from files in /knowledge).
"""
import glob
import hashlib
import json
import os
import threading
import time
from collections import defaultdict, deque

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from google import genai
from google.genai import types

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_DIR = os.path.join(BASE_DIR, "knowledge")
CACHE_FILE = os.path.join(BASE_DIR, ".index_cache.json")

CHAT_MODEL = os.getenv("CHAT_MODEL", "gemini-3.6-flash")
EMBED_MODEL = os.getenv("EMBED_MODEL", "gemini-embedding-001")
EMBED_DIM = 768
TOP_K = 4
MAX_CHARS = 800

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "pa": "Punjabi",
}

SYSTEM_PROMPT = """You are SahakarSaathi, a friendly assistant for cooperative members, farmers and rural \
users in India. You help with cooperative laws and by-laws, Ministry of Cooperation schemes, PACS services, \
PMFBY crop insurance, loans, financial literacy and grievance redressal.

Rules:
1. Answer ONLY from the CONTEXT given in the user message. Do not use outside knowledge for facts.
2. If the CONTEXT does not contain the answer, say clearly that you do not have verified information on this, \
and tell the person to ask their PACS secretary, the District Cooperative office or the state Registrar of \
Cooperative Societies. For crop insurance, mention helpline 14447.
3. Never invent section numbers, amounts, dates, deadlines or phone numbers. Only state what is in the CONTEXT.
4. Reply in {language}. Use simple everyday words and short sentences. Explain any technical term.
5. For steps, use a numbered list. Keep answers under about 180 words unless the person asks for more.
6. For legal topics, end with one short line (in {language}) saying this is general guidance, not legal advice.
7. Be polite and never lecture. If the question is unrelated to the topics above, politely say what you can help with."""

app = Flask(__name__)

# ------------------------------------------------------------------ Gemini client
_client = None


def get_client():
    global _client
    if _client is None:
        key = os.getenv("GEMINI_API_KEY")
        if not key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=key)
    return _client


# ------------------------------------------------------------------ Knowledge base
def read_file(path):
    if path.lower().endswith(".pdf"):
        from pypdf import PdfReader

        reader = PdfReader(path)
        return "\n\n".join((page.extract_text() or "") for page in reader.pages)
    with open(path, encoding="utf-8") as f:
        return f.read()


def split_text(text, limit=900):
    parts, current = [], ""
    for para in [p.strip() for p in text.split("\n\n") if p.strip()]:
        if current and len(current) + len(para) > limit:
            parts.append(current)
            current = para
        else:
            current = f"{current}\n\n{para}" if current else para
    if current:
        parts.append(current)
    return parts


def load_chunks():
    chunks = []
    files = []
    for ext in ("md", "txt", "pdf"):
        files += glob.glob(os.path.join(KB_DIR, f"*.{ext}"))
    for path in sorted(files):
        text = read_file(path).strip()
        if not text:
            continue
        first = text.splitlines()[0]
        title = first.lstrip("# ").strip() if first.startswith("#") else os.path.splitext(os.path.basename(path))[0]
        for part in split_text(text):
            chunks.append({"source": title, "text": f"{title}\n{part}"})
    return chunks


def embed(texts, task):
    out = []
    for i in range(0, len(texts), 50):
        res = get_client().models.embed_content(
            model=EMBED_MODEL,
            contents=texts[i : i + 50],
            config=types.EmbedContentConfig(task_type=task, output_dimensionality=EMBED_DIM),
        )
        out.extend(e.values for e in res.embeddings)
    arr = np.array(out, dtype=np.float32)
    arr /= np.linalg.norm(arr, axis=1, keepdims=True) + 1e-9
    return arr


_index = {"chunks": None, "vecs": None}
_lock = threading.Lock()


def ensure_index():
    if _index["vecs"] is not None:
        return
    with _lock:
        if _index["vecs"] is not None:
            return
        chunks = load_chunks()
        if not chunks:
            raise RuntimeError("No documents found in the knowledge folder")
        key = hashlib.sha256((EMBED_MODEL + str(EMBED_DIM) + "||".join(c["text"] for c in chunks)).encode()).hexdigest()
        vecs = None
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE) as f:
                    cached = json.load(f)
                if cached.get("key") == key:
                    vecs = np.array(cached["vecs"], dtype=np.float32)
            except Exception:
                vecs = None
        if vecs is None:
            vecs = embed([c["text"] for c in chunks], "RETRIEVAL_DOCUMENT")
            try:
                with open(CACHE_FILE, "w") as f:
                    json.dump({"key": key, "vecs": vecs.tolist()}, f)
            except OSError:
                pass
        _index["chunks"], _index["vecs"] = chunks, vecs


def retrieve(query):
    ensure_index()
    qv = embed([query], "RETRIEVAL_QUERY")[0]
    scores = _index["vecs"] @ qv
    top = np.argsort(scores)[::-1][:TOP_K]
    return [_index["chunks"][i] for i in top]


# ------------------------------------------------------------------ Rate limit (per IP)
_hits = defaultdict(deque)
LIMIT, WINDOW = 20, 60  # 20 questions per minute per IP


def too_many_requests():
    ip = (request.headers.get("X-Forwarded-For") or request.remote_addr or "?").split(",")[0].strip()
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > WINDOW:
        q.popleft()
    if len(q) >= LIMIT:
        return True
    q.append(now)
    return False


# ------------------------------------------------------------------ Routes
MODELS = [CHAT_MODEL] + [m.strip() for m in os.getenv("CHAT_MODEL_FALLBACK", "").split(",") if m.strip()]


def generate_with_retry(prompt, system):
    """Ask Gemini. If Google is busy (503/429), wait and try again instead of failing."""
    last = None
    for model in MODELS:
        for attempt in range(4):
            try:
                return get_client().models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system,
                        temperature=0.3,
                        max_output_tokens=4000,
                    ),
                )
            except Exception as exc:
                last = exc
                code = getattr(exc, "code", None)
                if code in (429, 500, 503, 504):
                    time.sleep(2 * (attempt + 1))
                    continue
                if code == 404:
                    break
                raise
    raise last


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/healthz")
def health():
    return jsonify(ok=True)


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    lang = data.get("language", "en")
    history = data.get("history") or []

    if not message:
        return jsonify(error="Please type or say a question."), 400
    if len(message) > MAX_CHARS:
        return jsonify(error=f"Please keep your question under {MAX_CHARS} characters."), 400
    if lang not in LANGUAGES:
        lang = "en"
    if too_many_requests():
        return jsonify(error="Too many questions in a short time. Please wait a minute."), 429

    # Use the last user turn too, so follow-up questions ("and the deadline?") still find the right documents
    prev_user = [h.get("text", "") for h in history if h.get("role") == "user"][-1:]
    query = " ".join(prev_user + [message])[:1200]

    try:
        chunks = retrieve(query)
        context = "\n\n".join(f"[{i + 1}] {c['text']}" for i, c in enumerate(chunks))
        convo = ""
        for h in history[-6:]:
            who = "User" if h.get("role") == "user" else "Assistant"
            convo += f"{who}: {str(h.get('text', ''))[:600]}\n"

        prompt = f"CONTEXT:\n{context}\n\nPREVIOUS CONVERSATION:\n{convo or '(none)'}\n\nUSER QUESTION:\n{message}"
        resp = generate_with_retry(prompt, SYSTEM_PROMPT.format(language=LANGUAGES[lang]))
        answer = (resp.text or "").strip()
        if not answer:
            answer = "Sorry, I could not prepare an answer. Please try asking in a different way."
        sources = list(dict.fromkeys(c["source"] for c in chunks))
        return jsonify(answer=answer, sources=sources)
    except Exception as exc:  # keep the real error in server logs, show a friendly one to the user
        app.logger.exception("chat failed: %s", exc)
        return jsonify(error="The assistant is not available right now. Please try again in a moment."), 500


@app.post("/api/feedback")
def feedback():
    data = request.get_json(silent=True) or {}
    app.logger.info("FEEDBACK %s", json.dumps({"helpful": data.get("helpful"), "q": str(data.get("question", ""))[:200]}))
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=os.getenv("FLASK_DEBUG") == "1")