(function () {
  'use strict';

  // Auto-detect API base — route to Node server (port 3000) when running on Live Server
  const API_BASE = (location.port === '5500' || location.port === '5501')
    ? location.protocol + '//' + location.hostname + ':3000'
    : location.origin;

  const STORAGE_KEY = 'swk_notebook_entries';
  const SYS_PROMPT = `তুমি একজন নোটবুক সহায়ক। ছাত্র যা বলবে, তা সুন্দরভাবে নোট আকারে ফরম্যাট করবে। নিচের নিয়ম অনুসরণ করো:

১. বিষয় অনুযায়ী একটি উপযুক্ত শিরোনাম দাও
২. মূল পয়েন্টগুলো ছোট ছোট অনুচ্ছেদে ভাগ করে লেখ
৩. গুরুত্বপূর্ণ শব্দ **বোল্ড** করে দাও
৪. উদাহরণ থাকলে "উদাহরণ:" লিখে দাও
৫. ৩-৫ লাইনের মধ্যে রাখো
৬. ফলাফল শুধুমাত্র নোট কন্টেন্ট দাও — কোন অতিরিক্ত কথা নয়
৭. সহজ বাংলায় লেখো`;

  let entries = [];
  let popupOpen = false;

  const NB = {};

  function loadEntries() {
    try {
      entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { entries = []; }
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }

  NB.getEntries = function () {
    loadEntries();
    return [...entries].reverse();
  };

  NB.addEntry = function (content, subject) {
    loadEntries();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      content: content.trim(),
      subject: subject || 'সাধারণ',
      timestamp: Date.now(),
      pinned: false
    };
    entries.push(entry);
    saveEntries();
    return entry;
  };

  NB.deleteEntry = function (id) {
    loadEntries();
    entries = entries.filter(e => e.id !== id);
    saveEntries();
  };

  NB.togglePin = function (id) {
    loadEntries();
    const entry = entries.find(e => e.id === id);
    if (entry) {
      entry.pinned = !entry.pinned;
      // bump timestamp so pinned entries can also move in sort
      entry.timestamp = Date.now();
      saveEntries();
    }
  };

  NB.clearAll = function () {
    entries = [];
    saveEntries();
  };

  NB.updateEntry = function (id, content, subject) {
    loadEntries();
    const entry = entries.find(e => e.id === id);
    if (entry) {
      if (content) entry.content = content.trim();
      if (subject) entry.subject = subject;
      entry.timestamp = Date.now();
      if (typeof entry.pinned !== 'boolean') entry.pinned = false;
      saveEntries();
    }
  };

  NB.formatTime = function (ts) {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'এইমাত্র';
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'গতকাল';
    if (days < 7) return `${days} দিন আগে`;
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ===== WIDGET UI =====
  function createWidget() {
    if (document.getElementById('nb-bot-toggle')) return;

    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = '/css/ai-notebook.css';
    document.head.appendChild(styles);

    const toggle = document.createElement('button');
    toggle.id = 'nb-bot-toggle';
    toggle.className = 'nb-bot-toggle';
    toggle.innerHTML = '<i class="fas fa-feather"></i>';
    toggle.title = 'নোটবুক বট';
    document.body.appendChild(toggle);

    const popup = document.createElement('div');
    popup.id = 'nb-bot-popup';
    popup.className = 'nb-bot-popup';
    popup.innerHTML = `
      <div class="nb-bot-header">
        <div class="nb-bot-header-title">
          <i class="fas fa-feather"></i>
          <span>নোটবুক বট</span>
        </div>
        <div class="nb-bot-header-actions">
          <button class="nb-bot-header-btn" id="nb-open-notebook" title="আমার নোটবুক">
            <i class="fas fa-book-open"></i>
          </button>
        </div>
      </div>
      <div class="nb-bot-messages" id="nb-bot-messages">
        <div class="nb-bot-msg bot">👋 হ্যালো! আজ কী শিখলে? আমি তা তোমার নোটবুকে সুন্দর করে সেভ করে দেব।</div>
      </div>
      <div class="nb-bot-suggestions" id="nb-bot-suggestions">
        <button class="nb-bot-chip" data-text="আজকে পদার্থবিদ্যায় নিউটনের তৃতীয় সূত্র শিখেছি">পদার্থবিদ্যা</button>
        <button class="nb-bot-chip" data-text="গণিতে বীজগণিতের ফর্মুলা শিখেছি। সূত্রগুলো হলো...">গণিত</button>
        <button class="nb-bot-chip" data-text="জীববিজ্ঞানে কোষ সম্পর্কে যা জানলাম">জীববিজ্ঞান</button>
        <button class="nb-bot-chip" data-text="ইতিহাসে মুঘল সম্রাটদের সম্পর্কে পড়লাম">ইতিহাস</button>
      </div>
      <div class="nb-bot-input-area">
        <textarea class="nb-bot-input" id="nb-bot-input" placeholder="আজ কী শিখলে? লিখে বলো..." rows="1"></textarea>
        <button class="nb-bot-send" id="nb-bot-send" disabled><i class="fas fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(popup);

    // Bind events
    toggle.addEventListener('click', () => {
      popupOpen = !popupOpen;
      popup.classList.toggle('open', popupOpen);
      toggle.classList.toggle('open', popupOpen);
      if (popupOpen) document.getElementById('nb-bot-input').focus();
    });

    const input = document.getElementById('nb-bot-input');
    const sendBtn = document.getElementById('nb-bot-send');
    const messagesEl = document.getElementById('nb-bot-messages');

    function updateSendBtn() {
      sendBtn.disabled = !input.value.trim();
    }

    input.addEventListener('input', () => {
      updateSendBtn();
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) handleSend();
      }
    });

    function addMessage(text, type) {
      const div = document.createElement('div');
      div.className = `nb-bot-msg ${type}`;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function handleSend() {
      const text = input.value.trim();
      if (!text) return;

      addMessage(text, 'user');
      input.value = '';
      input.style.height = 'auto';
      updateSendBtn();

      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'nb-bot-msg loading';
      loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> নোট তৈরি হচ্ছে...';
      messagesEl.appendChild(loadingDiv);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      try {
        const resp = await fetch(API_BASE + '/api/notebook-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, systemPrompt: SYS_PROMPT })
        });
        const data = await resp.json();
        loadingDiv.remove();

        if (data.result) {
          // Show formatted note
          const noteDiv = document.createElement('div');
          noteDiv.className = 'nb-bot-msg bot';
          noteDiv.style.background = 'var(--notebook-tab-bg)';
          noteDiv.style.border = '1px solid var(--notebook-accent)';
          noteDiv.style.borderLeft = '3px solid var(--notebook-accent)';
          noteDiv.style.maxWidth = '95%';

          const formatter = (typeof window !== 'undefined' && typeof window.renderContent === 'function')
            ? window.renderContent
            : (typeof renderContent === 'function' ? renderContent : null);

          noteDiv.innerHTML = formatter
            ? formatter(data.result)
            : data.result
                .replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');

          messagesEl.appendChild(noteDiv);

          // Save button
          const actionsDiv = document.createElement('div');
          actionsDiv.style.cssText = 'display:flex;gap:6px;align-self:flex-end;padding:0 4px';
          const saveBtn = document.createElement('button');
          saveBtn.innerHTML = '<i class="fas fa-save"></i> নোটবুকে সেভ';
          saveBtn.style.cssText = 'padding:6px 14px;border-radius:8px;border:none;background:var(--notebook-accent);color:#fff;cursor:pointer;font-size:0.72rem;font-family:inherit';
          actionsDiv.appendChild(saveBtn);
          messagesEl.appendChild(actionsDiv);

          saveBtn.addEventListener('click', () => {
            NB.addEntry(data.result);
            saveBtn.innerHTML = '<i class="fas fa-check"></i> সেভ হয়েছে!';
            saveBtn.style.background = '#27ae60';
            saveBtn.disabled = true;
            const linkDiv = document.createElement('div');
            linkDiv.className = 'nb-bot-msg bot';
            linkDiv.innerHTML = '📖 <a href="ai-notebook.html" style="color:var(--notebook-accent);text-decoration:underline;">আমার নোটবুক দেখো →</a>';
            messagesEl.appendChild(linkDiv);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          });

          messagesEl.scrollTop = messagesEl.scrollHeight;
        } else {
          addMessage('⚠️ দুঃখিত, নোট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।', 'bot');
        }
      } catch (err) {
        loadingDiv.remove();
        addMessage('⚠️ নেটওয়ার্ক সমস্যা। আবার চেষ্টা করো।', 'bot');
      }
    }

    sendBtn.addEventListener('click', handleSend);

    document.getElementById('nb-bot-suggestions').addEventListener('click', (e) => {
      const chip = e.target.closest('.nb-bot-chip');
      if (chip) {
        input.value = chip.dataset.text;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        updateSendBtn();
        input.focus();
      }
    });

    document.getElementById('nb-open-notebook').addEventListener('click', () => {
      window.open('ai-notebook.html', '_blank');
    });
  }

  // ===== INIT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

  window.NotebookBot = NB;
})();
