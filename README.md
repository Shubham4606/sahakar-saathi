# SahakarSaathi - multilingual cooperative assistant

Flask + Gemini + RAG. Answers only from the files in `knowledge/`, in 9 Indian languages, with voice input and output.

## 1. Run on your laptop (test first)

```bash
python -m venv .venv
# Windows:   .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env        # Mac/Linux: cp .env.example .env
# open .env and paste your Gemini key (free at https://aistudio.google.com/apikey)
python app.py
```
Open http://localhost:5000 in **Chrome or Edge** (voice input needs them).

## 2. Put it on a real website (Render, free)

1. Create a GitHub account, then a new empty repo, and upload this whole folder. **Do not upload `.env`** (`.gitignore` already blocks it).
   ```bash
   git init
   git add .
   git commit -m "SahakarSaathi"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/sahakar-saathi.git
   git push -u origin main
   ```
2. Go to https://render.com, sign in with GitHub, click **New > Web Service**, pick the repo.
3. Render reads `render.yaml`. If it asks: Build command `pip install -r requirements.txt`, Start command `gunicorn app:app --workers 1 --threads 4 --timeout 120`.
4. Under **Environment**, add `GEMINI_API_KEY` = your key.
5. Click **Deploy**. In a few minutes you get a public link like `https://sahakar-saathi.onrender.com`.
6. Custom domain (optional): Render > Settings > Custom Domains. HTTPS is automatic, and HTTPS is required for the microphone to work on a live site.

Notes: the free plan sleeps after ~15 minutes idle, so the first visit after a break takes ~30-60 seconds. Open the site before your demo to wake it. Voice output needs a voice for that language installed on the device (Android phones and Chrome usually have Hindi and Marathi).

## 3. Add or change the knowledge

Drop `.md`, `.txt` or text-based `.pdf` files into `knowledge/` and redeploy (git push). The first line of each file is shown as the source name. The bundled files are a starter summary: **replace or check them against the official Acts, by-laws and scheme guidelines before you present.**

## 4. Hardware kiosk (Raspberry Pi)

Connect a USB mic and speaker, then:
```bash
chromium-browser --kiosk --autoplay-policy=no-user-gesture-required https://YOUR-SITE-URL
```
Add that command to autostart so the kiosk opens on power-on.

## Structure
```
app.py            backend + RAG + Gemini
templates/        index.html
static/           style.css, app.js
knowledge/        documents the assistant answers from
requirements.txt  Procfile  render.yaml
```
