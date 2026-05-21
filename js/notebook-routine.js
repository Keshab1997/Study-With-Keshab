(function () {
  'use strict';

  // Auto-detect API base — route to Node server (port 3000) when running on Live Server
  const API_BASE = (location.port === '5500' || location.port === '5501')
    ? location.protocol + '//' + location.hostname + ':3000'
    : location.origin;

  const ROUTINE_KEY = 'swk_notebook_routine';
  const REMINDER_KEY = 'swk_notebook_reminders';
  const AI_ROUTINE_PROMPT = `তুমি একজন স্টাডি প্ল্যানিং সহায়ক। শিক্ষার্থী যা বলবে তার ভিত্তিতে একটি ৭ দিনের স্টাডি রুটিন তৈরি করো। নিচের ফরম্যাটে শুধুমাত্র JSON দাও, কোনো অতিরিক্ত কথা নয়:

{
  "routine": [
    { "day": "সোমবার", "slots": [{ "start": "07:00", "end": "08:30", "subject": "পদার্থবিদ্যা", "priority": "high" }] }
  ]
}

নিয়ম:
১. প্রতিদিনে ২-৪ টি স্লট দাও
২. সময় ২৪ ঘন্টা ফরম্যাটে (HH:MM) দাও
৩. স্লট ১-২ ঘন্টার মধ্যে রাখো
৪. গুরুত্বপূর্ণ বিষয়ের priority "high" দাও
৫. সকাল ৬টা থেকে রাত ১০টার মধ্যে সময় রাখো
৬. প্রতিটি স্লটে যা পড়বে তার বিষয় স্পষ্ট করে লেখো
৭. শুধুমাত্র JSON আউটপুট দাও`;

  const DAYS = ['সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার', 'রবিবার'];
  const SUBJECT_ICONS = {
    'পদার্থবিদ্যা': '⚛️', 'রসায়ন': '🧪', 'গণিত': '📐', 'জীববিজ্ঞান': '🧬',
    'ইতিহাস': '📜', 'ভূগোল': '🌍', 'ইংরেজি': '📖', 'সাধারণ জ্ঞান': '🧠',
    'কারেন্ট অ্যাফেয়ার্স': '📰', 'অন্যান্য': '📚'
  };

  let routines = [];
  let reminders = [];
  let reminderInterval = null;

  // ===== DATA LOAD/SAVE =====
  function loadRoutines() {
    try { routines = JSON.parse(localStorage.getItem(ROUTINE_KEY)) || []; } catch { routines = []; }
  }
  function saveRoutines() {
    try { localStorage.setItem(ROUTINE_KEY, JSON.stringify(routines)); } catch {}
  }
  function loadReminders() {
    try { reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || []; } catch { reminders = []; }
  }
  function saveReminders() {
    try { localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders)); } catch {}
  }

  // ===== ROUTINE: "এখন কী পড়বে" =====
  function updateCurrentStudy() {
    const nowSubject = document.getElementById('routine-now-subject');
    const nowTime = document.getElementById('routine-now-time');
    const nowCard = document.getElementById('routine-now-card');
    if (!nowSubject || !nowTime || !nowCard) return;

    loadRoutines();
    const now = new Date();
    const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Sunday=0 -> রবিবার=6
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // Find matching routine slot
    let found = null;
    const todayRoutines = routines.filter(r => r.day === currentDay);
    for (const r of todayRoutines) {
      for (const slot of r.slots) {
        if (currentTime >= slot.start && currentTime < slot.end) {
          found = slot;
          break;
        }
      }
      if (found) break;
    }

    if (found) {
      const icon = SUBJECT_ICONS[found.subject] || '📚';
      nowSubject.textContent = icon + ' ' + found.subject;
      nowTime.textContent = found.start + ' – ' + found.end + (found.priority === 'high' ? '  🔴' : '');
      nowCard.classList.add('active-slot');
    } else {
      // Check if next slot is upcoming
      let upcoming = null;
      for (const r of todayRoutines) {
        for (const slot of r.slots) {
          if (slot.start > currentTime && (!upcoming || slot.start < upcoming.start)) {
            upcoming = slot;
          }
        }
      }
      if (upcoming) {
        const icon = SUBJECT_ICONS[upcoming.subject] || '📚';
        nowSubject.textContent = '⏳ ' + icon + ' ' + upcoming.subject;
        nowTime.textContent = 'শুরু হবে ' + upcoming.start + ' টায়';
        nowCard.classList.remove('active-slot');
      } else {
        nowSubject.textContent = '🎉 আজকের জন্য ফ্রি!';
        nowTime.textContent = 'কোনো রুটিন বাকি নেই';
        nowCard.classList.remove('active-slot');
      }
    }
  }

  // ===== RENDER ROUTINE =====
  function renderRoutine() {
    const sheet = document.getElementById('routine-sheet');
    if (!sheet) return;
    loadRoutines();

    if (routines.length === 0) {
      sheet.innerHTML = `
        <div class="notebook-empty">
          <i class="fas fa-calendar-week" style="font-size:3rem;opacity:0.3;margin-bottom:16px;display:block"></i>
          <h3>কোনো রুটিন নেই</h3>
          <p>নিজে যোগ করো অথবা AI দিয়ে তৈরি করো</p>
        </div>`;
      return;
    }

    sheet.innerHTML = DAYS.map(day => {
      const dayRoutines = routines.filter(r => r.day === day);
      if (dayRoutines.length === 0) return '';
      const slots = dayRoutines.flatMap(r => r.slots).sort((a, b) => a.start.localeCompare(b.start));
      const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
      const isToday = day === today;

      return `
        <div class="routine-day-card ${isToday ? 'routine-today' : ''}">
          <div class="routine-day-header">
            <span class="routine-day-name">${isToday ? '🔵 ' : ''}${day}${isToday ? ' (আজ)' : ''}</span>
            <span class="routine-day-count">${slots.length}টি সেশন</span>
          </div>
          <div class="routine-slots">
            ${slots.map(slot => `
              <div class="routine-slot ${slot.priority === 'high' ? 'routine-slot-high' : ''}">
                <span class="routine-slot-time">${slot.start} – ${slot.end}</span>
                <span class="routine-slot-subject">${SUBJECT_ICONS[slot.subject] || '📚'} ${slot.subject}</span>
                <div class="routine-slot-actions">
                  ${slot.priority === 'high' ? '<span class="routine-pill-high">গুরুত্বপূর্ণ</span>' : ''}
                  <button class="routine-slot-del" data-day="${day}" data-start="${slot.start}" title="মুছুন">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }).join('');

    // Delete slot handlers
    sheet.querySelectorAll('.routine-slot-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day;
        const start = btn.dataset.start;
        deleteRoutineSlot(day, start);
      });
    });

    updateCurrentStudy();
  }

  function deleteRoutineSlot(day, start) {
    loadRoutines();
    let found = false;
    for (const r of routines) {
      if (r.day === day) {
        const idx = r.slots.findIndex(s => s.start === start);
        if (idx !== -1) {
          r.slots.splice(idx, 1);
          found = true;
          break;
        }
      }
    }
    if (found) {
      // Remove empty day entries
      routines = routines.filter(r => r.slots && r.slots.length > 0);
      saveRoutines();
      renderRoutine();
    }
  }

  // ===== ADD ROUTINE MANUALLY =====
  function addRoutineSlot() {
    const day = document.getElementById('r-day').value;
    const subject = document.getElementById('r-subject').value;
    const start = document.getElementById('r-start').value;
    const end = document.getElementById('r-end').value;
    const priority = document.getElementById('r-priority').value;

    if (!start || !end) return;
    if (start >= end) {
      alert('শেষ সময় শুরু সময়ের পরে হতে হবে');
      return;
    }

    loadRoutines();
    let dayEntry = routines.find(r => r.day === day);
    if (!dayEntry) {
      dayEntry = { day, slots: [] };
      routines.push(dayEntry);
    }
    dayEntry.slots.push({ start, end, subject, priority });
    saveRoutines();
    renderRoutine();
  }

  // ===== AI ROUTINE GENERATION =====
  async function generateAIRoutine() {
    const btn = document.getElementById('routine-ai-btn');
    const userGoal = prompt('তোমার স্টাডি লক্ষ্য কী? (যেমন: আগামী ১ মাসে Physics syllabus শেষ করতে চাই। প্রতিদিন ৩-৪ ঘন্টা সময় পাই)');
    if (!userGoal || !userGoal.trim()) return;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> তৈরি হচ্ছে...';
    btn.disabled = true;

    try {
      const resp = await fetch(API_BASE + '/api/notebook-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userGoal.trim(),
          systemPrompt: AI_ROUTINE_PROMPT
        })
      });
      const data = await resp.json();

      if (data.result) {
        // Parse JSON from AI response
        let jsonStr = data.result;
        // Strip markdown code fences if present
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1];
        try {
          const parsed = JSON.parse(jsonStr.trim());
          if (parsed.routine && Array.isArray(parsed.routine)) {
            loadRoutines();
            for (const dayEntry of parsed.routine) {
              if (!dayEntry.day || !dayEntry.slots) continue;
              let existing = routines.find(r => r.day === dayEntry.day);
              if (!existing) {
                existing = { day: dayEntry.day, slots: [] };
                routines.push(existing);
              }
              for (const slot of dayEntry.slots) {
                if (slot.start && slot.end && slot.subject) {
                  existing.slots.push({
                    start: slot.start,
                    end: slot.end,
                    subject: slot.subject,
                    priority: slot.priority || 'normal'
                  });
                }
              }
            }
            saveRoutines();
            renderRoutine();
            alert('✅ AI রুটিন তৈরি হয়েছে!');
          } else {
            alert('⚠️ রুটিন তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।');
          }
        } catch (parseErr) {
          alert('⚠️ AI রেসপন্স ঠিকমতো পার্স করা যায়নি। আবার চেষ্টা করো।');
        }
      } else {
        alert('⚠️ রুটিন তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('⚠️ নেটওয়ার্ক সমস্যা। আবার চেষ্টা করো।');
    } finally {
      btn.innerHTML = '<i class="fas fa-robot"></i> AI দিয়ে রুটিন তৈরি করো';
      btn.disabled = false;
    }
  }

  // ===== REMINDERS =====
  function renderReminders() {
    const list = document.getElementById('reminder-list');
    if (!list) return;
    loadReminders();

    // Remove expired reminders
    const now = Date.now();
    reminders = reminders.filter(r => r.time > now);
    saveReminders();

    if (reminders.length === 0) {
      list.innerHTML = `
        <div class="notebook-empty">
          <i class="fas fa-bell" style="font-size:3rem;opacity:0.3;margin-bottom:16px;display:block"></i>
          <h3>কোনো রিমাইন্ডার নেই</h3>
          <p>উপরে ফর্ম পূরণ করে রিমাইন্ডার যোগ করো</p>
        </div>`;
      return;
    }

    reminders.sort((a, b) => a.time - b.time);

    list.innerHTML = reminders.map(r => {
      const d = new Date(r.time);
      const timeStr = d.toLocaleString('bn-BD', {
        day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit'
      });
      const isSoon = r.time - now < 3600000; // within 1 hour

      return `
        <div class="reminder-item ${isSoon ? 'reminder-soon' : ''}">
          <div class="reminder-icon"><i class="fas fa-bell"></i></div>
          <div class="reminder-body">
            <span class="reminder-text">${escapeHtml(r.text)}</span>
            <span class="reminder-time-display">📅 ${timeStr}</span>
          </div>
          <button class="reminder-del" data-id="${r.id}" title="মুছুন">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>`;
    }).join('');

    // Delete handlers
    list.querySelectorAll('.reminder-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        loadReminders();
        reminders = reminders.filter(r => r.id !== id);
        saveReminders();
        renderReminders();
      });
    });
  }

  function addReminder() {
    const textEl = document.getElementById('rem-text');
    const timeEl = document.getElementById('rem-time');
    const text = textEl.value.trim();
    const time = timeEl.value;

    if (!text) { alert('রিমাইন্ডারের বিবরণ লিখো'); return; }
    if (!time) { alert('সময় সেট করো'); return; }

    const timeMs = new Date(time).getTime();
    if (timeMs <= Date.now()) { alert('ভবিষ্যতের সময় দাও'); return; }

    loadReminders();
    reminders.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      text,
      time: timeMs
    });
    saveReminders();
    renderReminders();

    textEl.value = '';
    timeEl.value = '';

    // Schedule notification
    scheduleReminderCheck();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== BROWSER NOTIFICATION =====
  function scheduleReminderCheck() {
    if (reminderInterval) clearInterval(reminderInterval);
    // Check every 30 seconds
    reminderInterval = setInterval(checkReminders, 30000);
    checkReminders(); // immediate check
  }

  function checkReminders() {
    loadReminders();
    const now = Date.now();
    let changed = false;

    for (const r of reminders) {
      // Fire notification if time is within last 60 seconds
      if (r.time <= now && r.time > now - 60000) {
        showReminderNotification(r);
        changed = true;
      }
    }

    // Clean expired
    const before = reminders.length;
    reminders = reminders.filter(r => r.time > now - 60000);
    if (reminders.length < before) {
      changed = true;
      saveReminders();
      renderReminders();
    }
  }

  function showReminderNotification(reminder) {
    // Browser Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📚 Study With Keshab – রিমাইন্ডার', {
        body: reminder.text,
        icon: 'images/icons/icon-192x192.png',
        vibrate: [200, 100, 200]
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          new Notification('📚 Study With Keshab – রিমাইন্ডার', {
            body: reminder.text,
            icon: 'images/icons/icon-192x192.png',
            vibrate: [200, 100, 200]
          });
        }
      });
    }

    // Also play a sound
    try {
      const audio = new Audio('audio/notification.wav');
      audio.play().catch(() => {});
    } catch {}
  }

  // ===== DOM INIT =====
  function init() {
    // Routine add button
    const addBtn = document.getElementById('routine-add-btn');
    if (addBtn) addBtn.addEventListener('click', addRoutineSlot);

    // AI Routine button
    const aiBtn = document.getElementById('routine-ai-btn');
    if (aiBtn) aiBtn.addEventListener('click', generateAIRoutine);

    // Reminder add button
    const remBtn = document.getElementById('reminder-add-btn');
    if (remBtn) remBtn.addEventListener('click', addReminder);

    // Request notification permission upfront
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial renders
    renderRoutine();
    renderReminders();
    scheduleReminderCheck();

    // Re-check current study every 60 seconds
    setInterval(updateCurrentStudy, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();