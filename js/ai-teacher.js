const CONFIG = {
  apiKey: 'sk-Nj9BwUPvlnKkPGct1XjWYO2x9Xe4Uch9q23iUYSQDatmfgPa',
  apiUrl: 'https://api.chatanywhere.tech/v1/chat/completions',
  model: 'gpt-4o-mini',
  storageKey: 'ai_teacher_messages',
  sessionsKey: 'ai_teacher_sessions',
  activeSessionKey: 'ai_teacher_active_session',
  themeKey: 'ai_teacher_theme',
  subjectKey: 'ai_teacher_subject',
  maxTokens: 2000,
  maxHistory: 20,
  maxImageSize: 4 * 1024 * 1024,
};

const SYSTEM_PROMPT = `তুমি একজন পেশাদার AI শিক্ষক। তুমি "Study With Keshab" প্ল্যাটফর্মের শিক্ষার্থীদের পড়াতে সাহায্য করবে।

তোমার কাজ:
1. শিক্ষার্থীরা যে কোনো বিষয়ে প্রশ্ন করবে, তুমি সহজ বাংলায় উত্তর দেবে
2. উত্তর সবসময় ধাপে ধাপে (step by step) বুঝিয়ে দেবে
3. খুব সহজ ও সাবলীল ভাষায় উত্তর দেবে, যাতে যে কেউ বুঝতে পারে
4. উদাহরণ (example) দিয়ে বোঝানোর চেষ্টা করবে
5. শিক্ষার্থীকে উৎসাহিত করবে এবং ধৈর্য ধরে শেখাবে
6. কোনো প্রশ্ন খুব কঠিন হলে, সেটাকে ছোট ছোট অংশে ভাগ করে বুঝিয়ে দেবে
7. যেকোনো বিষয়ের (Physics, Chemistry, Math, Biology, History, Geography, GK, English, Computer) উত্তর দেবে
8. জটিল টার্ম বা ফর্মুলা থাকলে সেটা সহজ ভাষায় ব্যাখ্যা করবে
9. পড়ার টিপস ও শেখার কৌশল শেয়ার করবে

গাণিতিক সমীকরণ লেখার নিয়ম (MATH FORMATTING - অবশ্যই মানতে হবে):
- সমীকরণ inline লিখতে: \\( সমীকরণ \\) ব্যবহার করো। যেমন: \\( 2000 = x \\times \\frac{8}{100} \\) 
- সমীকরণ আলাদা লাইনে (display) লিখতে: \\[ সমীকরণ \\[ ব্যবহার করো। যেমন: \\[ x = \\frac{2000 \\times 100}{8} \\) 
- ভগ্নাংশ: \\frac{লব}{হর} — যেমন \\frac{8}{100}
- গুণ চিহ্ন: \\times
- ভাগ চিহ্ন: \\div
- বাংলা শব্দ সমীকরণে: \\text{মূল্য} — যেমন \\( \\text{মূল্য} \\times \\frac{8}{100} = 2000 \\) 
- প্রতিটি সমীকরণের ধাপ আলাদা \\[ \\[ এ লিখবে

উত্তরের ফরম্যাট (FORMATTING RULES):
- ধাপগুলো শুরু করবে এইভাবে: "প্রথমে:", "তারপর:", "এখন:", "শেষে:", "অতএব:", "সুতরাং:"
- প্রতিটি ধাপ আলাদা অনুচ্ছেদে লিখবে। দুই ধাপের মাঝে একটি খালি লাইন রাখবে।
- তালিকার জন্য "•" চিহ্ন ব্যবহার করবে
- সংখ্যা তালিকার জন্য "1. ", "2. " ফরম্যাট ব্যবহার করবে
- উত্তর শেষে 2-3টি সম্পর্কিত প্রশ্ন সুপারিশ করবে "আরও জানতে চাইলে:" দিয়ে শুরু করে

উত্তরের স্টাইল:
- পড়তে ভালো লাগে এমন করে উত্তর দেবে
- খুব বড় উত্তর না করে, প্রাসঙ্গিক ও সংক্ষিপ্ত উত্তর দেবে
- গাণিতিক সমস্যার সমাধানে প্রতিটি ধাপ স্পষ্টভাবে দেখাবে

মনে রেখো: তুমি একজন বন্ধুর মতো শিক্ষক - যে কোনো প্রশ্ন জিজ্ঞাসা করতে শিক্ষার্থীরা স্বাচ্ছন্দ্য বোধ করে।`;

const SUBJECTS = [
  { value: 'general', label: 'সাধারণ', icon: 'fa-graduation-cap' },
  { value: 'physics', label: 'পদার্থবিদ্যা', icon: 'fa-atom' },
  { value: 'chemistry', label: 'রসায়ন', icon: 'fa-flask' },
  { value: 'math', label: 'গণিত', icon: 'fa-calculator' },
  { value: 'biology', label: 'জীববিজ্ঞান', icon: 'fa-dna' },
  { value: 'history', label: 'ইতিহাস', icon: 'fa-landmark' },
  { value: 'geography', label: 'ভূগোল', icon: 'fa-globe-asia' },
  { value: 'gk', label: 'সাধারণ জ্ঞান', icon: 'fa-lightbulb' },
];

const SUGGESTIONS = {
  general: ['পদার্থবিদ্যার সূত্র বলো', 'গণিতের সমস্যা সমাধান করো', 'রসায়নের বিক্রিয়া বুঝিয়ে দাও', 'জীববিজ্ঞানের জিন কী?', 'ভারতের ইতিহাস বলো'],
  physics: ['নিউটনের গতিসূত্রগুলো কী কী?', 'আলোর প্রতিসরণ কাকে বলে?', 'বিদ্যুৎ প্রবাহ কাকে বলে?', 'মহাকর্ষ বল কী?'],
  chemistry: ['পরমাণু কী?', 'রাসায়নিক বিক্রিয়া কাকে বলে?', 'pH মান কী?', 'জৈব যৌগ কাকে বলে?'],
  math: ['পিথাগোরাসের উপপাদ্যটি বলো', 'বীজগণিত কী?', 'জ্যামিতি কাকে বলে?', 'ত্রিকোণমিতির সূত্রগুলো বলো'],
  biology: ['কোষ কী?', 'DNA ও RNA-র পার্থক্য কী?', 'প্রকাশিত খাদ্য কী?', 'জিন কী?'],
  history: ['ভারতের স্বাধীনতা কবে?', 'সিপাহী বিদ্রোহ কী?', 'বাংলা বিভাজন কবে হয়?'],
  geography: ['ভারতের সর্বোচ্চ শৃঙ্গ কোনটি?', 'গঙ্গা নদীর উৎপত্তি কোথায়?', 'জলবায়ু কাকে বলে?'],
  gk: ['সর্ববৃহৎ মহাদেশ কোনটি?', 'বাংলাদেশের রাজধানী কী?', 'জাতীয় পশু কোনটি?', 'সূর্যের নিকটতম গ্রহ কোনটি?'],
};

const PRESETS = [
  { id: 'mcq', label: 'MCQ', icon: 'fa-list-check', prompt: 'এই বিষয়ে 4টি অপশন সহ একটি MCQ প্রশ্ন তৈরি করো। উত্তরসহ ব্যাখ্যা দাও।\n\nপ্রশ্ন: ' },
  { id: 'example', label: 'উদাহরণ', icon: 'fa-lightbulb', prompt: 'এ বিষয়টি বুঝানোর জন্য একটি বাস্তব উদাহরণ দাও। সহজ ভাষায় ব্যাখ্যা করো।\n\nবিষয়: ' },
  { id: 'simplify', label: 'সহজভাবে', icon: 'fa-child-reaching', prompt: 'নিচের বিষয়টি খুব সহজ ভাষায় বুঝিয়ে দাও। কঠিন শব্দ ব্যবহার করবে না। 5 বছর বাচ্চাকেও বুঝানো যায় এমন করে বলো।\n\nবিষয়: ' },
  { id: 'summary', label: 'সারাংশ', icon: 'fa-compress', prompt: 'নিচের বিষয়টির একটি সংক্ষিপ্ত সারাংশ (5-7 লাইনে) লিখো। গুরুত্বপূর্ণ পয়েন্টগুলো উল্লেখ করো।\n\nবিষয়: ' },
  { id: 'tips', label: 'টিপস', icon: 'fa-star', prompt: 'নিচের বিষয়টি সহজে মনে রাখার জন্য কিছু কার্যকরী টিপস ও কৌশল দাও। পড়ার সময় কী কী বিষয়ে খেয়াল রাখতে হবে তাও বলো।\n\nবিষয়: ' },
];

const WELCOME_CONTENT = `
  <div class="ai-teacher-welcome" id="welcome-screen">
    <div class="welcome-logo"><i class="fas fa-chalkboard-teacher"></i></div>
    <h3>AI শিক্ষককে প্রশ্ন করুন</h3>
    <p>যেকোনো বিষয়ে আপনার প্রশ্ন লিখুন। AI শিক্ষক সহজ ভাষায় ধাপে ধাপে উত্তর দেবেন।</p>
    <div class="ai-teacher-suggestions" id="welcome-suggestions"></div>
  </div>
`;

// ===== STATE =====
let state = {
  messages: [],
  isProcessing: false,
  currentSubject: 'general',
  lastAiMessageId: null,
  activeSessionId: null,
  attachedImage: null,
  chapterContext: null,
  activePreset: null,
};

// ===== DOM REFS =====
const $ = (id) => document.getElementById(id);
const dom = {};

function initDom() {
  dom.chatForm = $('ai-teacher-form');
  dom.chatInput = $('ai-teacher-input');
  dom.chatMessages = $('ai-teacher-messages');
  dom.clearBtn = $('ai-teacher-clear');
  dom.sendBtn = $('ai-teacher-send');
  dom.themeBtn = $('ai-teacher-theme');
  dom.voiceBtn = $('ai-teacher-voice');
  dom.imageBtn = $('ai-teacher-image');
  dom.imageInput = $('ai-teacher-image-input');
  dom.imagePreview = $('image-preview');
  dom.subjectSelect = $('ai-teacher-subject');
  dom.charCount = $('char-count');
  dom.presetsContainer = $('preset-actions');
  dom.newChatBtn = $('ai-teacher-new-chat');
  dom.historyBtn = $('ai-teacher-history');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initDom();
  initTheme();
  initSubject();
  initChapterContext();
  initStarterQuestion();

  // Restore active session or start fresh
  const savedActiveId = localStorage.getItem(CONFIG.activeSessionKey);
  if (savedActiveId) {
    const sessions = loadSessions();
    const session = sessions.find(s => s.id === savedActiveId);
    if (session) {
      state.activeSessionId = session.id;
      state.messages = session.messages;
      state.currentSubject = session.subject || 'general';
      if (dom.subjectSelect) dom.subjectSelect.value = state.currentSubject;
    } else {
      state.activeSessionId = generateSessionId();
      state.messages = loadMessages();
    }
  } else {
    state.activeSessionId = generateSessionId();
    state.messages = loadMessages();
  }

  render();
  bindEvents();
  autoResizeInput();
  initScrollBtn();
  updateSendBtn();
});

// ===== THEME =====
function initTheme() {
  const saved = localStorage.getItem(CONFIG.themeKey) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  if (dom.themeBtn) {
    dom.themeBtn.innerHTML = saved === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(CONFIG.themeKey, next);
  dom.themeBtn.innerHTML = next === 'dark'
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

// ===== SUBJECT =====
function initSubject() {
  const saved = localStorage.getItem(CONFIG.subjectKey) || 'general';
  state.currentSubject = saved;
  if (dom.subjectSelect) {
    dom.subjectSelect.value = saved;
  }
}

// ===== CHAPTER CONTEXT =====
function getChapterContextFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  const chapter = params.get('chapter');
  const chapterName = params.get('chapterName');
  const description = params.get('description');

  if (!subject && !chapter && !chapterName) return null;

  return {
    subject: subject || 'general',
    chapter: chapter || '',
    chapterName: chapterName || chapter || '',
    description: description || '',
  };
}

function initChapterContext() {
  const context = getChapterContextFromUrl();
  state.chapterContext = context;

  if (!context) return;

  if (context.subject) {
    state.currentSubject = context.subject;
    localStorage.setItem(CONFIG.subjectKey, context.subject);
    if (dom.subjectSelect) dom.subjectSelect.value = context.subject;
  }

  const headerText = document.querySelector('.ai-teacher-header-text');
  if (headerText && context.chapterName) {
    const subjectLabel = getSubjectLabel(context.subject);
    headerText.innerHTML = `
      <h2>AI শিক্ষক</h2>
      <p class="ai-chapter-context">${escapeHtml(subjectLabel)} · ${escapeHtml(context.chapterName)}</p>
    `;
  }

  if (dom.chatInput && context.chapterName) {
    dom.chatInput.placeholder = `${context.chapterName} নিয়ে প্রশ্ন লিখুন...`;
  }
}

function initStarterQuestion() {
  const params = new URLSearchParams(window.location.search);
  const starterQuestion = params.get('ask');
  if (!starterQuestion || !dom.chatInput) return;

  dom.chatInput.value = starterQuestion;
  autoResizeInput();
  updateSendBtn();
}

function getChapterInstruction() {
  if (!state.chapterContext) return '';

  const { subject, chapter, chapterName, description } = state.chapterContext;
  return `

শিক্ষার্থী এখন নির্দিষ্ট চ্যাপ্টার থেকে AI Teacher ব্যবহার করছে।
Subject: ${getSubjectLabel(subject)}
Chapter ID/Folder: ${chapter || 'উল্লেখ নেই'}
Chapter Name: ${chapterName || 'উল্লেখ নেই'}
Description: ${description || 'উল্লেখ নেই'}

এই চ্যাপ্টারের context ধরে উত্তর দাও। প্রশ্ন অস্পষ্ট হলে ধরে নাও সেটি এই চ্যাপ্টার সম্পর্কিত। বাংলায় সহজভাবে step-by-step বুঝিয়ে দাও।`;
}

function changeSubject(value) {
  state.currentSubject = value;
  localStorage.setItem(CONFIG.subjectKey, value);
  if (isWelcomeVisible()) {
    renderWelcomeSuggestions();
  }
}

function getSubjectLabel(value) {
  const s = SUBJECTS.find(x => x.value === value);
  return s ? s.label : 'সাধারণ';
}

// ===== SESSION STORAGE =====
function loadSessions() {
  try { return JSON.parse(localStorage.getItem(CONFIG.sessionsKey)) || []; }
  catch { return []; }
}

function saveSessions(sessions) {
  try { localStorage.setItem(CONFIG.sessionsKey, JSON.stringify(sessions)); } catch {}
}

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadMessages() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveMessages() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.messages));
  } catch {}
}

function getSessionTitle(messages) {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'নতুন চ্যাট';
  return first.content.slice(0, 40) + (first.content.length > 40 ? '...' : '');
}

function saveCurrentSession() {
  if (state.messages.length === 0) return;
  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.id === state.activeSessionId);
  const session = {
    id: state.activeSessionId || generateSessionId(),
    title: getSessionTitle(state.messages),
    subject: state.currentSubject,
    timestamp: Date.now(),
    messages: state.messages,
  };
  if (idx !== -1) sessions[idx] = session;
  else sessions.unshift(session);
  state.activeSessionId = session.id;
  saveSessions(sessions);
  localStorage.setItem(CONFIG.activeSessionKey, session.id);
}

function startNewChat() {
  saveCurrentSession();
  state.messages = [];
  state.activeSessionId = generateSessionId();
  localStorage.setItem(CONFIG.activeSessionKey, state.activeSessionId);
  saveMessages();
  dom.chatMessages.innerHTML = '';
  showWelcome();
  showToast('নতুন চ্যাট শুরু হয়েছে', 'success');
}

function loadSession(sessionId) {
  saveCurrentSession();
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;
  state.messages = session.messages;
  state.activeSessionId = session.id;
  state.currentSubject = session.subject || 'general';
  if (dom.subjectSelect) dom.subjectSelect.value = state.currentSubject;
  localStorage.setItem(CONFIG.activeSessionKey, session.id);
  saveMessages();
  render();
  closeHistoryPanel();
  showToast('চ্যাট লোড হয়েছে', 'success');
}

function deleteSession(sessionId, e) {
  e.stopPropagation();
  const sessions = loadSessions().filter(s => s.id !== sessionId);
  saveSessions(sessions);
  if (state.activeSessionId === sessionId) {
    state.messages = [];
    state.activeSessionId = generateSessionId();
    saveMessages();
    render();
  }
  renderHistoryList();
  showToast('চ্যাট মুছে ফেলা হয়েছে', 'info');
}

// ===== HISTORY PANEL =====
function openHistoryPanel() {
  saveCurrentSession();
  renderHistoryList();
  document.getElementById('history-panel').classList.add('open');
  document.getElementById('history-overlay').classList.add('open');
}

function closeHistoryPanel() {
  document.getElementById('history-panel').classList.remove('open');
  document.getElementById('history-overlay').classList.remove('open');
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  if (!list) return;
  const sessions = loadSessions();
  const countEl = document.getElementById('history-count');
  if (countEl) countEl.textContent = sessions.length;

  if (sessions.length === 0) {
    list.innerHTML = '<div class="history-empty"><div class="history-empty-icon-wrap"><i class="fas fa-comment-slash"></i></div><p>কোনো পুরনো চ্যাট নেই</p><p style="font-size:0.75rem;opacity:0.5">আপনার চ্যাটগুলি এখানে সংরক্ষিত হবে</p></div>';
    return;
  }
  list.innerHTML = sessions.map(s => {
    const isActive = s.id === state.activeSessionId;
    const timeAgo = getRelativeTime(s.timestamp);
    return `
      <div class="history-item ${isActive ? 'active' : ''}" data-id="${s.id}">
        <div class="history-item-icon"><i class="fas fa-comment-dots"></i></div>
        <div class="history-item-body">
          <div class="history-item-title">${escapeHtml(s.title)}</div>
          <div class="history-item-meta">
            <i class="far fa-clock"></i> ${timeAgo}
            <i class="fas fa-circle" style="font-size:3px"></i>
            ${s.messages.length}টি বার্তা
          </div>
        </div>
        <button class="history-delete-btn" data-id="${s.id}" title="মুছুন"><i class="fas fa-trash"></i></button>
      </div>`;
  }).join('');

  // Attach click/delete handlers
  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.history-delete-btn')) return;
      loadSession(el.dataset.id);
      closeHistoryPanel();
    });
  });
  list.querySelectorAll('.history-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSession(btn.dataset.id);
      renderHistoryList();
    });
  });
}

// ===== RENDER =====
function render() {
  dom.chatMessages.innerHTML = '';
  if (state.messages.length === 0) {
    showWelcome();
    return;
  }
  state.messages.forEach(msg => appendMessageDOM(msg, false));
  scrollToBottom();
}

function showWelcome() {
  dom.chatMessages.innerHTML = WELCOME_CONTENT;
  renderWelcomeSuggestions();
}

function isWelcomeVisible() {
  return !!document.getElementById('welcome-screen');
}

function renderWelcomeSuggestions() {
  const container = document.getElementById('welcome-suggestions');
  if (!container) return;
  const suggestions = SUGGESTIONS[state.currentSubject] || SUGGESTIONS.general;
  container.innerHTML = suggestions.map(s =>
    `<button class="suggestion-chip" data-query="${s}"><span>${s}</span></button>`
  ).join('');
  container.querySelectorAll('.suggestion-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      dom.chatInput.value = btn.dataset.query;
      dom.chatForm.dispatchEvent(new Event('submit'));
    });
  });
}

// ===== APPEND MESSAGE DOM =====
function appendMessageDOM(msg, animate = true) {
  if (isWelcomeVisible()) {
    dom.chatMessages.innerHTML = '';
  }

  const div = document.createElement('div');
  div.className = `ai-teacher-message ${msg.role}-message`;
  div.dataset.messageId = msg.id;

  const avatar = msg.role === 'user' ? 'fa-user-graduate' : 'fa-robot';
  const sender = msg.role === 'user' ? 'আপনি' : 'AI শিক্ষক';
  const time = msg.timestamp ? formatTime(msg.timestamp) : '';

  let contentHTML = formatMessageContent(msg.content);

  let actionsHTML = '';
  if (msg.role === 'assistant') {
    actionsHTML = `
      <div class="message-actions">
        <button class="msg-action-btn copy-btn" title="কপি"><i class="fas fa-copy"></i> কপি</button>
        <button class="msg-action-btn regenerate-btn" title="পুনরায় উত্তর"><i class="fas fa-redo"></i> নতুন উত্তর</button>
      </div>
    `;
  } else {
    actionsHTML = `
      <div class="message-actions">
        <button class="msg-action-btn edit-btn" title="সম্পাদনা"><i class="fas fa-pen"></i> সম্পাদনা</button>
        <button class="msg-action-btn copy-btn" title="কপি"><i class="fas fa-copy"></i> কপি</button>
      </div>
    `;
  }

  div.innerHTML = `
    <div class="message-avatar"><i class="fas ${avatar}"></i></div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">${sender}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-text">${contentHTML}</div>
      ${actionsHTML}
    </div>
  `;

  dom.chatMessages.appendChild(div);

  if (animate) {
    div.style.animation = 'none';
    requestAnimationFrame(() => {
      div.style.animation = 'messageSlide 0.35s ease';
    });
  }

  bindMessageActions(div, msg);
  scrollToBottom();
}

function formatTime(ts) {
  const d = new Date(ts);
  let time = d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  time = time.replace(/[০-৯]/g, c => String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
  return time;
}

function formatMessageContent(text) {
  if (!text) return '';
  const mathBlocks = [];
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => {
    const html = `<div class="math-block">${latexToHtml(m.trim())}</div>`;
    mathBlocks.push(html);
    return `%%MATHBLOCK_${mathBlocks.length - 1}%%`;
  });
  const paragraphs = text.split(/\n\n+/);
  let result = paragraphs.map(p => formatParagraph(p.trim())).join('');
  mathBlocks.forEach((html, i) => {
    result = result.replace(`%%MATHBLOCK_${i}%%`, html);
  });
  return result;
}

function formatParagraph(text) {
  if (!text) return '';
  if (text.startsWith('<div class="math-block"') || /^%%MATHBLOCK_\d+%%$/.test(text.trim())) return text;
  const stepPatterns = [
    /^প্রথমে[:\s,]/,
    /^তারপর[:\s,]/,
    /^এখন[:\s,]/,
    /^শেষে[:\s,]/,
    /^অতএব[:\s,]/,
    /^উপসংহার[:\s,]/,
    /^সুতরাং[:\s,]/,
    /^অর্থাৎ[:\s,]/,
    /^তাহলে[:\s,]/,
    /^তাই[:\s]/,
    /^অতএব[:\s,]/,
    /^বিশেষ[:\s]/,
    /^মনে রাখো[:\s]/,
    /^টিপস[:\s]/,
    /^নিয়ম[:\s]/,
  ];
  const isStep = stepPatterns.some(p => p.test(text));
  const firstLineStep = stepPatterns.some(p => p.test(text.split('\n')[0]));
  const lines = text.split('\n').filter(l => l.trim());
  if (isStep && firstLineStep) {
    return formatStepBlock(text, lines);
  }
  const bareText = text.replace(/\\[\(\[\]]|\\[\)\]]/g, '').trim();
  const isMathEq = (/^[\s]*[0-9+\-×÷=()xya-zA-Z.%\s\/^{}_\\]+[\s]*$/.test(bareText)
    || /^\\\(.*\\\)$/.test(text.trim()))
    && text.length < 100
    && /[0-9]/.test(text)
    && /[=+\-×÷]/.test(text)
    && !isStep;
  if (isMathEq) {
    const processed = processInlineMath(text, true);
    return `<div class="math-block">${processed}</div>`;
  }
  const isFormula = /^(সূত্র|Formula|নিয়ম|সূত্রমতে|আমরা জানি|প্রয়োগ)/i.test(text.trim());
  if (isFormula && text.length < 60) {
    const processed = processInlineMath(text);
    return `<div class="formula-box"><span class="formula-label">সূত্র</span>${processed}</div>`;
  }
  const bulletLines = lines.filter(l => /^[•\-*]\s/.test(l.trim()) || /^\[\d+\]/.test(l.trim()));
  if (bulletLines.length === lines.length && lines.length > 1) {
    const items = lines.map(l => {
      const clean = l.replace(/^[•\-*]\s/, '').trim();
      return `<li>${processInlineMath(clean)}</li>`;
    }).join('');
    return `<ul class="bullet-list">${items}</ul>`;
  }
  const numberList = lines.filter(l => /^\d+[\.\)]\s/.test(l.trim()));
  if (numberList.length === lines.length && lines.length > 1) {
    const items = lines.map(l => {
      const clean = l.replace(/^\d+[\.\)]\s/, '').trim();
      return `<li>${processInlineMath(clean)}</li>`;
    }).join('');
    return `<ol class="math-list">${items}</ol>`;
  }
  const isMultiLineMath = lines.every(l => /[0-9=+\-×÷()xya-zA-Z.%\s\/^]/.test(l))
    && lines.length > 1
    && lines.some(l => /=/.test(l));
  if (isMultiLineMath) {
    const processed = lines.map(l => processInlineMath(l.trim())).join('<br>');
    return `<div class="math-block">${processed}</div>`;
  }
  const processed = processInlineMath(text);
  if (/<div class="math-block"/.test(processed) || /<pre>/.test(processed)) {
    return `<div class="paragraph">${processed}</div>`;
  }
  return `<p>${processed}</p>`;
}

function formatStepBlock(text, lines) {
  const stepIcons = {
    'প্রথমে': '1', 'তারপর': '2', 'এখন': '3', 'শেষে': '4',
    'অতএব': '5', 'উপসংহার': '5', 'সুতরাং': '5', 'অর্থাৎ': '6',
    'তাহলে': '→', 'তাই': '→', 'মনে রাখো': '💡', 'টিপস': '💡',
    'বিশেষ': '⭐', 'নিয়ম': '📌',
  };
  let icon = '→';
  let label = lines[0];
  for (const [key, emoji] of Object.entries(stepIcons)) {
    if (lines[0].includes(key)) { icon = emoji; label = key; break; }
  }
  const processedLines = lines.map(l => processInlineMath(l));
  const stepTitle = processedLines[0];
  const restContent = processedLines.slice(1).join('<br>');
  return `<div class="step-block">
    <span class="step-icon">${icon}</span>
    <span class="step-content">${stepTitle}${restContent ? '<br>' + restContent : ''}</span>
  </div>`;
}

function latexToHtml(latex) {
  let result = latex;

  // 1. \frac FIRST — before anything strips braces
  let prev;
  do {
    prev = result;
    result = result.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, den) =>
      `<span class="fraction"><span class="top">${num.trim()}</span><span class="bottom">${den.trim()}</span></span>`
    );
  } while (result !== prev);

  // 2. \text{}, \sqrt{} before brace removal
  result = result
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // 3. superscript/subscript before brace removal
  result = result
    .replace(/\^\{([^}]+)\}/g, (_, e) => `<sup>${e}</sup>`)
    .replace(/\^(\w)/g, (_, e) => `<sup>${e}</sup>`)
    .replace(/_\{([^}]+)\}/g, (_, e) => `<sub>${e}</sub>`)
    .replace(/_(\w)/g, (_, e) => `<sub>${e}</sub>`);

  // 4. trig, greek, operators
  result = result
    .replace(/\\(sin|cos|tan|cot|sec|csc|log|ln|lim|max|min)\b/g, '$1')
    .replace(/\\theta/g, 'θ').replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ').replace(/\\delta/g, 'δ').replace(/\\pi/g, 'π')
    .replace(/\\phi/g, 'φ').replace(/\\omega/g, 'ω').replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ').replace(/\\sigma/g, 'σ')
    .replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠').replace(/\\approx/g, '≈').replace(/\\infty/g, '∞')
    .replace(/\\%/g, '%')
    .replace(/\\left[\(\[{]/g, '(').replace(/\\right[\)\]}]/g, ')')
    .replace(/\\left\./g, '').replace(/\\right\./g, '');

  // 5. remove remaining braces last
  result = result
    .replace(/\{([^{}]*)\}/g, '$1')
    .replace(/\\\\/g, '<br>').replace(/\\_/g, '_').replace(/\\,/g, ' ')
    .replace(/\s+/g, ' ').trim();

  return result;
}

function processInlineMath(text, skipEscape = false) {
  if (!skipEscape) {
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Block LaTeX: \[...\] (single-line only here; multiline handled in formatMessageContent)
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) =>
    `<div class="math-block">${latexToHtml(m.trim())}</div>`
  );
  // Inline LaTeX: \(...\)
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) =>
    `<span class="math-inline">${latexToHtml(m.trim())}</span>`
  );

  // Standalone LaTeX expressions
  text = text.replace(/(\\frac\{[^}]+\}\{[^}]+\}|\\text\{[^}]*\}|\\times|\\div|\\cdot|\\pm|\\sqrt\{[^}]*\})/g, (m) =>
    latexToHtml(m)
  );

  // Fix escaped percent
  text = text.replace(/\\%/g, '%');

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>');
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');

  // Plain fractions like 8/100
  text = text.replace(/\b(\d+)\/(\d+)\b/g, (match, num, den) => {
    if (den.length <= 3 && num.length <= den.length + 1) {
      return `<span class="fraction"><span class="top">${num}</span><span class="bottom">${den}</span></span>`;
    }
    return match;
  });

  return text;
}

// ===== MESSAGE ACTIONS =====
function bindMessageActions(div, msg) {
  const copyBtn = div.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(msg.content).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> কপি হয়েছে';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> কপি';
        }, 2000);
        showToast('কপি করা হয়েছে!', 'success');
      }).catch(() => {
        fallbackCopy(msg.content, copyBtn);
      });
    });
  }

  const regenerateBtn = div.querySelector('.regenerate-btn');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => regenerateLastAnswer());
  }

  const editBtn = div.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (!div.querySelector('.edit-textarea')) {
        enableEditMode(div, msg);
      }
    });
  }
}

function fallbackCopy(text, btn) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  btn.classList.add('copied');
  btn.innerHTML = '<i class="fas fa-check"></i> কপি হয়েছে';
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = '<i class="fas fa-copy"></i> কপি';
  }, 2000);
  showToast('কপি করা হয়েছে!', 'success');
}

// ===== EDIT MESSAGE =====
function enableEditMode(div, msg) {
  const textDiv = div.querySelector('.message-text');
  const originalText = msg.content;
  textDiv.innerHTML = `<textarea class="edit-textarea">${originalText}</textarea>
    <div class="edit-actions">
      <button class="edit-save-btn"><i class="fas fa-check"></i> সংরক্ষণ</button>
      <button class="edit-cancel-btn"><i class="fas fa-times"></i> বাতিল</button>
    </div>`;

  const textarea = textDiv.querySelector('.edit-textarea');
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);

  textDiv.querySelector('.edit-save-btn').addEventListener('click', () => {
    const newText = textarea.value.trim();
    if (newText && newText !== originalText) {
      const idx = state.messages.findIndex(m => m.id === msg.id);
      if (idx !== -1) {
        state.messages[idx].content = newText;
        state.messages[idx].edited = true;
        saveMessages();
        textDiv.innerHTML = formatMessageContent(newText);
        showToast('বার্তা সম্পাদিত হয়েছে', 'success');
      }
    } else {
      textDiv.innerHTML = formatMessageContent(originalText);
    }
  });

  textDiv.querySelector('.edit-cancel-btn').addEventListener('click', () => {
    textDiv.innerHTML = formatMessageContent(originalText);
  });
}

// ===== VOICE INPUT =====
let recognition = null;
let isListening = false;

function toggleVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('আপনার ব্রাউজার ভয়েস ইনপুট সমর্থন করে না', 'error');
    return;
  }

  if (isListening) {
    stopVoiceInput();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'bn-BD';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    dom.voiceBtn.classList.add('listening');
    dom.voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
    showToast('বলুন...', 'info');
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
      dom.chatInput.value = finalTranscript || dom.chatInput.value;
    }
    autoResizeInput();
  };

  recognition.onerror = (event) => {
    console.error('Speech error:', event.error);
    stopVoiceInput();
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      showToast(`ত্রুটি: ${event.error}`, 'error');
    }
    dom.chatInput.focus();
  };

  recognition.onend = () => {
    stopVoiceInput();
  };

  recognition.start();
}

function stopVoiceInput() {
  isListening = false;
  if (recognition) {
    try { recognition.stop(); } catch {}
    recognition = null;
  }
  dom.voiceBtn.classList.remove('listening');
  dom.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
}

// ===== ADD MESSAGE =====
function addMessage(content, role) {
  const msg = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    content: content.trim(),
    role,
    subject: state.currentSubject,
    timestamp: Date.now(),
    edited: false,
  };
  state.messages.push(msg);
  saveMessages();
  appendMessageDOM(msg);
  return msg;
}

// ===== REGENERATE =====
function regenerateLastAnswer() {
  const lastAiIdx = findLastAiIndex();
  if (lastAiIdx === -1 || state.isProcessing) return;

  showToast('নতুন উত্তর তৈরি হচ্ছে...', 'info');

  const lastUserIdx = findLastUserIndexBefore(lastAiIdx);

  if (lastUserIdx !== -1) {
    state.messages.splice(lastAiIdx, 1);
    saveMessages();
    const lastUserMsg = state.messages[lastUserIdx];
    const lastAiDiv = dom.chatMessages.querySelector(`[data-message-id="${state.messages[lastUserIdx]?.id}"]`);
    const nextDiv = lastAiDiv ? lastAiDiv.nextElementSibling : null;
    if (nextDiv && nextDiv.classList.contains('assistant-message')) {
      nextDiv.remove();
    }

    sendToAPI(lastUserMsg.content);
  }
}

function findLastAiIndex() {
  for (let i = state.messages.length - 1; i >= 0; i--) {
    if (state.messages[i].role === 'assistant') return i;
  }
  return -1;
}

function findLastUserIndexBefore(aiIdx) {
  for (let i = aiIdx - 1; i >= 0; i--) {
    if (state.messages[i].role === 'user') return i;
  }
  return -1;
}

// ===== IMAGE ATTACHMENT =====
function handleImageSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > CONFIG.maxImageSize) {
    showToast('ছবির সাইজ 4MB-এর কম হতে হবে', 'error');
    return;
  }
  if (!file.type.startsWith('image/')) {
    showToast('শুধু ইমেজ ফাইল সিলেক্ট করুন', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.attachedImage = { data: ev.target.result, name: file.name, type: file.type };
    showImagePreview();
    showToast('ছবি সংযুক্ত হয়েছে', 'success');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function showImagePreview() {
  if (!dom.imagePreview || !state.attachedImage) return;
  dom.imagePreview.innerHTML = `
    <img src="${state.attachedImage.data}" alt="attached">
    <button type="button" id="remove-image" class="remove-image-btn">&times;</button>
  `;
  dom.imagePreview.style.display = 'flex';
  document.getElementById('remove-image')?.addEventListener('click', removeImage);
}

function removeImage() {
  state.attachedImage = null;
  if (dom.imagePreview) {
    dom.imagePreview.innerHTML = '';
    dom.imagePreview.style.display = 'none';
  }
  showToast('ছবি সরানো হয়েছে', 'info');
}

function addImageMessageToChat(imageData, caption) {
  if (isWelcomeVisible()) dom.chatMessages.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'ai-teacher-message user-message';
  const time = formatTime(Date.now());
  div.innerHTML = `
    <div class="message-avatar"><i class="fas fa-user-graduate"></i></div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">আপনি</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-text">
        <div class="image-attachment-preview">
          <img src="${imageData}" alt="attachment" onclick="window.open('${imageData}','_blank')" loading="lazy">
        </div>
        ${caption ? '<p style="margin:6px 0 0">' + escapeHtml(caption) + '</p>' : ''}
      </div>
    </div>
  `;
  dom.chatMessages.appendChild(div);
  scrollToBottom();
}

// ===== PROMPT PRESETS =====
function applyPreset(presetId) {
  const preset = PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  state.activePreset = preset;
  const input = dom.chatInput;
  input.value = preset.prompt;
  input.focus();
  autoResizeInput();
  updateSendBtn();
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === presetId));
  showToast(`"${preset.label}" মোড সক্রিয়`, 'info');
}

function clearPreset() {
  state.activePreset = null;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

// ===== SEND MESSAGE =====
async function handleSubmit(e) {
  e.preventDefault();
  const question = dom.chatInput.value.trim();
  if ((!question && !state.attachedImage) || state.isProcessing) return;

  const hasImage = !!state.attachedImage;
  const imageData = state.attachedImage?.data;
  const currentPreset = state.activePreset;

  dom.chatInput.value = '';
  autoResizeInput();
  updateSendBtn();
  if (hasImage) removeImage();

  if (hasImage) {
    addImageMessageToChat(imageData, question || 'ছবিটি ব্যাখ্যা করুন');
    const msg = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), content: question || 'ছবিটি ব্যাখ্যা করুন', role: 'user', subject: state.currentSubject, timestamp: Date.now(), edited: false, image: imageData };
    state.messages.push(msg);
    saveMessages();
    await sendToAPI(msg.content, currentPreset);
  } else {
    addMessage(question, 'user');
    await sendToAPI(question, currentPreset);
  }

  clearPreset();
}

async function sendToAPI(question, preset) {
  if (state.isProcessing) return;
  state.isProcessing = true;
  setInputState(true);
  showTypingIndicator();

  const subjectLabel = getSubjectLabel(state.currentSubject);
  const subjectInstruction = `শিক্ষার্থীর বর্তমান বিষয়: "${subjectLabel}"। এই বিষয় অনুযায়ী উত্তর দাও।${getChapterInstruction()}`;

  const presetInstruction = preset
    ? `শিক্ষার্থী "${preset.label}" মোড ব্যবহার করছে। তার অনুরোধ অনুযায়ী উত্তর দাও।\n\n`
    : '';

  const recentMessages = state.messages.slice(-CONFIG.maxHistory);
  const apiMessages = [
    { role: 'system', content: presetInstruction + SYSTEM_PROMPT + '\n\n' + subjectInstruction },
    ...recentMessages.map(m => {
      if (m.image) {
        return { role: 'user', content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: m.image } }] };
      }
      return { role: m.role === 'user' ? 'user' : 'assistant', content: m.content };
    })
  ];

  try {
    const res = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: CONFIG.maxTokens,
        stream: true,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${res.status} - ${errText.slice(0, 200)}`);
    }

    removeTypingIndicator();

    // Create streaming message bubble
    const msgId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const streamDiv = createStreamingBubble(msgId);
    let fullText = '';

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            updateStreamingBubble(streamDiv, fullText);
          }
        } catch {}
      }
    }

    // Finalize: save to state and re-render with full formatting
    const msg = {
      id: msgId,
      content: fullText.trim(),
      role: 'assistant',
      subject: state.currentSubject,
      timestamp: Date.now(),
      edited: false,
    };
    state.messages.push(msg);
    saveMessages();

    // Replace streaming div with fully formatted message
    streamDiv.remove();
    appendMessageDOM(msg, false);
    extractAndShowFollowUps(fullText);

  } catch (err) {
    removeTypingIndicator();
    const errorMsg = `দুঃখিত, একটি ত্রুটি হয়েছে:\n\n${err.message}\n\nআপনি চেষ্টা করতে পারেন:\n• ইন্টারনেট সংযোগ যাচাই করুন\n• আবার চেষ্টা করুন\n• প্রশ্নটি অন্যভাবে লিখুন`;
    addMessage(errorMsg, 'assistant');
    showToast('ত্রুটি হয়েছে!', 'error');
  } finally {
    state.isProcessing = false;
    setInputState(false);
  }
}

// ===== STREAMING BUBBLE =====
function createStreamingBubble(id) {
  if (isWelcomeVisible()) dom.chatMessages.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'ai-teacher-message assistant-message streaming';
  div.dataset.messageId = id;
  div.innerHTML = `
    <div class="message-avatar"><i class="fas fa-robot"></i></div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">AI শিক্ষক</span>
        <span class="streaming-badge"><i class="fas fa-circle"></i> লিখছে</span>
      </div>
      <div class="message-text stream-text"></div>
    </div>
  `;
  dom.chatMessages.appendChild(div);
  scrollToBottom();
  return div;
}

function updateStreamingBubble(div, text) {
  const textEl = div.querySelector('.stream-text');
  if (textEl) {
    // Show raw text with cursor during streaming
    textEl.innerHTML = escapeHtml(text) + '<span class="stream-cursor">▋</span>';
    scrollToBottom();
  }
}

function escapeHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getRelativeTime(ts) {
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
  let d = new Date(ts).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
  d = d.replace(/[০-৯]/g, c => String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
  return d;
}

// ===== FOLLOW-UP SUGGESTIONS =====
function extractAndShowFollowUps(answer) {
  const lines = answer.split('\n');
  const followUpLines = [];
  let collecting = false;

  for (const line of lines) {
    if (/^(আরও জানতে|সম্পর্কিত|আরো জানতে|জানতে চাইলে|আরো পড়ুন)/i.test(line.trim())) {
      collecting = true;
    }
    if (collecting) {
      followUpLines.push(line);
    }
  }

  if (followUpLines.length === 0) return;

  const chips = followUpLines
    .flatMap(line => line.split(/[,;]/))
    .map(s => s.replace(/^[\d.۔\-*\s\[\]]+/, '').trim())
    .filter(s => s.length > 5 && s.length < 80);

  if (chips.length === 0) return;

  const lastMsg = dom.chatMessages.querySelector('.assistant-message:last-child .message-content');
  if (!lastMsg) return;

  const followUpDiv = document.createElement('div');
  followUpDiv.className = 'follow-up-section';
  followUpDiv.innerHTML = `
    <div class="follow-up-label"><i class="fas fa-lightbulb"></i> আরও জানতে চাইলে:</div>
    <div class="follow-up-chips">
      ${chips.slice(0, 4).map(c => `<button class="follow-up-chip">${c}</button>`).join('')}
    </div>
  `;

  lastMsg.appendChild(followUpDiv);

  followUpDiv.querySelectorAll('.follow-up-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      dom.chatInput.value = btn.textContent.trim();
      dom.chatForm.dispatchEvent(new Event('submit'));
    });
  });
}

// ===== TYPING INDICATOR =====
function showTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'ai-teacher-message assistant-message typing-indicator-container';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="message-avatar"><i class="fas fa-robot"></i></div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">AI শিক্ষক</span>
      </div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="typing-label">উত্তর লিখছে...</div>
    </div>
  `;
  dom.chatMessages.appendChild(div);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ===== INPUT STATE =====
function setInputState(disabled) {
  dom.chatInput.disabled = disabled;
  dom.sendBtn.disabled = disabled || !dom.chatInput.value.trim();
  if (disabled) {
    dom.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  } else {
    dom.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
  }
}

function updateSendBtn() {
  if (!state.isProcessing) {
    dom.sendBtn.disabled = !dom.chatInput.value.trim();
  }
}

// ===== CLEAR =====
function clearChat() {
  state.messages = [];
  saveMessages();
  dom.chatMessages.innerHTML = '';
  showWelcome();
  showToast('কথোপকথন মুছে ফেলা হয়েছে', 'info');
}

// ===== EXPORT CHAT =====
function exportChat() {
  if (state.messages.length === 0) {
    showToast('কোনো কথোপকথন নেই', 'info');
    return;
  }
  const lines = state.messages.map(m => {
    const role = m.role === 'user' ? 'আপনি' : 'AI শিক্ষক';
    let time = new Date(m.timestamp).toLocaleString('bn-BD');
    time = time.replace(/[০-৯]/g, c => String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
    return `[${time}] ${role}:\n${m.content}\n`;
  });
  const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `AI-শিক্ষক-${new Date().toLocaleDateString('en-GB').replace(/\//g,'-')}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('চ্যাট ডাউনলোড হচ্ছে!', 'success');
}

// ===== AUTO-RESIZE INPUT =====
function autoResizeInput() {
  dom.chatInput.style.height = 'auto';
  dom.chatInput.style.height = Math.min(dom.chatInput.scrollHeight, 120) + 'px';
  updateCharCount();
  updateSendBtn();
}

function updateCharCount() {
  const len = dom.chatInput.value.length;
  if (dom.charCount) {
    dom.charCount.textContent = `${len}/2000`;
    dom.charCount.className = 'char-count' + (len > 1900 ? ' limit' : '');
  }
}

// ===== SCROLL =====
function scrollToBottom() {
  requestAnimationFrame(() => {
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
  });
}

function initScrollBtn() {
  const btn = document.createElement('button');
  btn.id = 'scroll-down-btn';
  btn.className = 'scroll-down-btn';
  btn.innerHTML = '<i class="fas fa-chevron-down"></i>';
  btn.title = 'নিচে যান';
  dom.chatMessages.parentElement.appendChild(btn);
  dom.scrollBtn = btn;

  btn.addEventListener('click', () => scrollToBottom());

  dom.chatMessages.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = dom.chatMessages;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    btn.classList.toggle('visible', !isNearBottom && scrollHeight > clientHeight + 50);
  });
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== EVENT BINDING =====
function bindEvents() {
  dom.chatForm.addEventListener('submit', handleSubmit);

  dom.chatInput.addEventListener('input', () => {
    autoResizeInput();
    updateSendBtn();
  });

  dom.chatInput.addEventListener('focus', () => {
    setTimeout(scrollToBottom, 300);
  });

  dom.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      dom.chatForm.dispatchEvent(new Event('submit'));
    }
  });

  if (dom.newChatBtn) dom.newChatBtn.addEventListener('click', startNewChat);
  if (dom.historyBtn) dom.historyBtn.addEventListener('click', openHistoryPanel);
  document.getElementById('history-close')?.addEventListener('click', closeHistoryPanel);
  document.getElementById('history-overlay')?.addEventListener('click', closeHistoryPanel);
  dom.clearBtn.addEventListener('click', clearChat);

  if (dom.themeBtn) dom.themeBtn.addEventListener('click', toggleTheme);
  if (dom.voiceBtn) dom.voiceBtn.addEventListener('click', toggleVoiceInput);
  if (dom.imageBtn && dom.imageInput) {
    dom.imageBtn.addEventListener('click', () => dom.imageInput.click());
    dom.imageInput.addEventListener('change', handleImageSelect);
  }
  if (dom.subjectSelect) {
    dom.subjectSelect.addEventListener('change', (e) => changeSubject(e.target.value));
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      dom.chatInput.focus();
    }
    if (e.key === 'Escape') {
      if (isListening) stopVoiceInput();
      closeHistoryPanel();
    }
  });

  let touchStartY = 0;
  dom.chatMessages.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  dom.chatMessages.addEventListener('touchend', () => {
    const atTop = dom.chatMessages.scrollTop === 0;
    if (atTop) {
      dom.chatInput.blur();
    }
  }, { passive: true });
}

function updateSendBtn() {
  if (!state.isProcessing) {
    dom.sendBtn.disabled = !dom.chatInput.value.trim();
  }
}
