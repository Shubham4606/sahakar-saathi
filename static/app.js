(() => {
  // ---------------------------------------------------------------- settings
  const LANGS = [
    { code: 'en', name: 'English', speech: 'en-IN' },
    { code: 'hi', name: 'हिन्दी', speech: 'hi-IN' },
    { code: 'mr', name: 'मराठी', speech: 'mr-IN' },
    { code: 'gu', name: 'ગુજરાતી', speech: 'gu-IN' },
    { code: 'bn', name: 'বাংলা', speech: 'bn-IN' },
    { code: 'ta', name: 'தமிழ்', speech: 'ta-IN' },
    { code: 'te', name: 'తెలుగు', speech: 'te-IN' },
    { code: 'kn', name: 'ಕನ್ನಡ', speech: 'kn-IN' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', speech: 'pa-IN' },
  ];

  const WELCOME = {
    en: 'Hello! Ask me about cooperative laws, PACS services, PMFBY crop insurance, loans or how to file a complaint.',
    hi: 'नमस्ते! सहकारी कानून, PACS सेवाएँ, PMFBY फसल बीमा, ऋण या शिकायत दर्ज करने के बारे में पूछिए।',
    mr: 'नमस्कार! सहकार कायदे, PACS सेवा, PMFBY पीक विमा, कर्ज किंवा तक्रार कशी नोंदवायची याबद्दल विचारा.',
    gu: 'નમસ્તે! સહકારી કાયદા, PACS સેવાઓ, PMFBY પાક વીમો, લોન અથવા ફરિયાદ કેવી રીતે નોંધાવવી તે વિશે પૂછો.',
    bn: 'নমস্কার! সমবায় আইন, PACS পরিষেবা, PMFBY ফসল বিমা, ঋণ বা অভিযোগ জানানোর বিষয়ে জিজ্ঞাসা করুন।',
    ta: 'வணக்கம்! கூட்டுறவுச் சட்டங்கள், PACS சேவைகள், PMFBY பயிர் காப்பீடு, கடன் அல்லது புகார் அளிப்பது பற்றி கேளுங்கள்.',
    te: 'నమస్కారం! సహకార చట్టాలు, PACS సేవలు, PMFBY పంట బీమా, రుణాలు లేదా ఫిర్యాదు ఎలా చేయాలో అడగండి.',
    kn: 'ನಮಸ್ಕಾರ! ಸಹಕಾರ ಕಾನೂನುಗಳು, PACS ಸೇವೆಗಳು, PMFBY ಬೆಳೆ ವಿಮೆ, ಸಾಲ ಅಥವಾ ದೂರು ಸಲ್ಲಿಸುವ ಬಗ್ಗೆ ಕೇಳಿ.',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਸਹਿਕਾਰੀ ਕਾਨੂੰਨ, PACS ਸੇਵਾਵਾਂ, PMFBY ਫ਼ਸਲ ਬੀਮਾ, ਕਰਜ਼ੇ ਜਾਂ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਬਾਰੇ ਪੁੱਛੋ।',
  };

  const PLACEHOLDER = {
    en: 'Type your question', hi: 'अपना सवाल लिखिए', mr: 'तुमचा प्रश्न लिहा', gu: 'તમારો પ્રશ્ન લખો',
    bn: 'আপনার প্রশ্ন লিখুন', ta: 'உங்கள் கேள்வியை எழுதுங்கள்', te: 'మీ ప్రశ్న రాయండి',
    kn: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ', pa: 'ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ',
  };

  const SUGGEST = {
    en: ['How do I claim PMFBY insurance?', 'What is a PACS?', 'How to file a complaint against my society?', 'What is Kisan Credit Card?'],
    hi: ['PMFBY बीमा का दावा कैसे करें?', 'PACS क्या है?', 'अपनी सोसायटी की शिकायत कहाँ करें?', 'किसान क्रेडिट कार्ड क्या है?'],
    mr: ['PMFBY विम्याचा दावा कसा करायचा?', 'PACS म्हणजे काय?', 'सोसायटीची तक्रार कुठे करायची?', 'किसान क्रेडिट कार्ड म्हणजे काय?'],
    gu: ['PMFBY વીમાનો દાવો કેવી રીતે કરવો?', 'PACS શું છે?', 'મારી સોસાયટી સામે ફરિયાદ કેવી રીતે કરવી?', 'કિસાન ક્રેડિટ કાર્ડ શું છે?'],
    bn: ['PMFBY বিমার দাবি কীভাবে করব?', 'PACS কী?', 'আমার সমিতির বিরুদ্ধে অভিযোগ কীভাবে করব?', 'কিষান ক্রেডিট কার্ড কী?'],
    ta: ['PMFBY காப்பீட்டைக் கோருவது எப்படி?', 'PACS என்றால் என்ன?', 'எனது சங்கத்தின் மீது புகார் அளிப்பது எப்படி?', 'கிசான் கடன் அட்டை என்றால் என்ன?'],
    te: ['PMFBY బీమాను ఎలా క్లెయిమ్ చేయాలి?', 'PACS అంటే ఏమిటి?', 'నా సొసైటీపై ఫిర్యాదు ఎలా చేయాలి?', 'కిసాన్ క్రెడిట్ కార్డ్ అంటే ఏమిటి?'],
    kn: ['PMFBY ವಿಮೆಯನ್ನು ಹೇಗೆ ಕ್ಲೈಮ್ ಮಾಡುವುದು?', 'PACS ಎಂದರೇನು?', 'ನನ್ನ ಸೊಸೈಟಿ ವಿರುದ್ಧ ದೂರು ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?', 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಎಂದರೇನು?'],
    pa: ['PMFBY ਬੀਮੇ ਦਾ ਦਾਅਵਾ ਕਿਵੇਂ ਕਰੀਏ?', 'PACS ਕੀ ਹੈ?', 'ਆਪਣੀ ਸੋਸਾਇਟੀ ਖ਼ਿਲਾਫ਼ ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਕਰੀਏ?', 'ਕਿਸਾਨ ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਕੀ ਹੈ?'],
  };

  const GREETINGS = ['नमस्कार', 'નમસ્તે', 'নমস্কার', 'வணக்கம்', 'నమస్కారం', 'ನಮಸ್ಕಾರ', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'Hello'];

  // ---------------------------------------------------------------- elements
  const $ = (id) => document.getElementById(id);
  const langsEl = $('langs'), messagesEl = $('messages'), chipsEl = $('chips');
  const inputEl = $('input'), sendEl = $('send'), micEl = $('mic'), statusEl = $('status');
  const speakerEl = $('speaker'), subEl = $('chat-sub'), greetEl = $('greet');

  // ---------------------------------------------------------------- state
  let lang = localStorage.getItem('ss_lang') || 'en';
  if (!LANGS.some((l) => l.code === lang)) lang = 'en';
  let history = [];
  let speakerOn = false;
  let speakNext = false;
  let busy = false;

  const langInfo = () => LANGS.find((l) => l.code === lang);

  // ---------------------------------------------------------------- rendering helpers
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  function md(text) {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let html = '', list = null;
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const raw of esc.split('\n')) {
      const line = raw.trim();
      let m;
      if ((m = line.match(/^[-*•]\s+(.*)/))) {
        if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; }
        html += `<li>${inline(m[1])}</li>`;
      } else if ((m = line.match(/^\d+[.)]\s+(.*)/))) {
        if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; }
        html += `<li>${inline(m[1])}</li>`;
      } else if (line === '') {
        close();
      } else {
        close();
        html += `<p>${inline(line)}</p>`;
      }
    }
    close();
    return html;
  }

  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(kind, html) {
    const div = document.createElement('div');
    div.className = `msg ${kind}`;
    div.innerHTML = html;
    messagesEl.appendChild(div);
    scrollDown();
    return div;
  }

  function addFeedback(container, question) {
    const fb = document.createElement('div');
    fb.className = 'fb';
    fb.innerHTML = '<span>Was this helpful?</span><button type="button" data-v="1">Yes</button><button type="button" data-v="0">No</button>';
    fb.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful: b.dataset.v === '1', question }),
      }).catch(() => {});
      fb.textContent = 'Thank you for your feedback.';
    });
    container.appendChild(fb);
  }

  // ---------------------------------------------------------------- voice output
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`>-]/g, ' ').replace(/\s+/g, ' ').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = langInfo().speech;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  speakerEl.addEventListener('click', () => {
    speakerOn = !speakerOn;
    speakerEl.setAttribute('aria-pressed', String(speakerOn));
    if (!speakerOn && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  // ---------------------------------------------------------------- voice input
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, listening = false;

  if (!SR) {
    micEl.disabled = true;
    micEl.title = 'Voice input works in Chrome or Edge';
  } else {
    micEl.addEventListener('click', () => {
      if (listening) { rec.stop(); return; }
      rec = new SR();
      rec.lang = langInfo().speech;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onstart = () => { listening = true; micEl.classList.add('listening'); statusEl.textContent = 'Listening… speak now'; };
      rec.onresult = (e) => {
        let text = '';
        for (const r of e.results) text += r[0].transcript;
        inputEl.value = text;
        if (e.results[e.results.length - 1].isFinal) { speakNext = true; send(); }
      };
      rec.onerror = (e) => {
        statusEl.textContent = e.error === 'not-allowed'
          ? 'Microphone is blocked. Allow the microphone in your browser and try again.'
          : 'Could not hear you. Please try again.';
      };
      rec.onend = () => {
        listening = false; micEl.classList.remove('listening');
        if (statusEl.textContent.startsWith('Listening')) statusEl.textContent = '';
      };
      rec.start();
    });
  }

  // ---------------------------------------------------------------- sending
  async function send(textOverride) {
    const text = (textOverride ?? inputEl.value).trim();
    if (!text || busy) return;
    busy = true; sendEl.disabled = true;
    inputEl.value = ''; statusEl.textContent = '';
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    addMessage('user', md(text));
    const typing = addMessage('bot', '<span class="typing" aria-label="Typing"><i></i><i></i><i></i></span>');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language: lang, history: history.slice(-6) }),
      });
      const data = await res.json();
      typing.remove();
      if (!res.ok) {
        addMessage('bot error', `<p>${data.error || 'Something went wrong. Please try again.'}</p>`);
      } else {
        const bubble = addMessage('bot', md(data.answer));
        if (data.sources && data.sources.length) {
          const src = document.createElement('div');
          src.className = 'src';
          src.textContent = 'Source: ';
          data.sources.forEach((s) => { const sp = document.createElement('span'); sp.textContent = s; src.appendChild(sp); });
          bubble.appendChild(src);
        }
        addFeedback(bubble, text);
        history.push({ role: 'user', text }, { role: 'assistant', text: data.answer });
        if (speakerOn || speakNext) speak(data.answer);
      }
    } catch (err) {
      typing.remove();
      addMessage('bot error', '<p>Could not reach the assistant. Check your internet connection and try again.</p>');
    } finally {
      busy = false; sendEl.disabled = false; speakNext = false;
      scrollDown();
    }
  }

  sendEl.addEventListener('click', () => send());
  inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  // ---------------------------------------------------------------- language
  function renderChips() {
    chipsEl.innerHTML = '';
    (SUGGEST[lang] || SUGGEST.en).forEach((q) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = q;
      b.addEventListener('click', () => send(q));
      chipsEl.appendChild(b);
    });
  }

  function setLanguage(code, isFirst) {
    lang = code;
    localStorage.setItem('ss_lang', code);
    history = [];
    messagesEl.innerHTML = '';
    addMessage('bot', `<p>${WELCOME[code]}</p>`);
    inputEl.placeholder = PLACEHOLDER[code];
    subEl.textContent = `Answering in ${LANGS.find((l) => l.code === code).name}`;
    renderChips();
    langsEl.querySelectorAll('.lang').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.code === code)));
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (!isFirst) inputEl.focus();
  }

  LANGS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lang'; b.textContent = l.name; b.dataset.code = l.code;
    b.addEventListener('click', () => setLanguage(l.code));
    langsEl.appendChild(b);
  });

  // topic buttons in the page: scroll to chat and ask
  document.querySelectorAll('.ask').forEach((b) => {
    b.addEventListener('click', () => {
      $('chat').scrollIntoView({ behavior: 'smooth', block: 'center' });
      send(b.dataset.q);
    });
  });

  // ---------------------------------------------------------------- rotating greeting (one calm motion in the hero)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    let i = 0;
    setInterval(() => {
      greetEl.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % GREETINGS.length;
        greetEl.textContent = GREETINGS[i];
        greetEl.classList.remove('out');
      }, 350);
    }, 2400);
  }

  setLanguage(lang, true);
})();
