/* ============================================
   FIFA WORLD CUP 2026™ — Travel Dashboard v5
   ============================================ */
(() => {
  'use strict';

  const KEYS = { schedule: 'wc26_schedule', tasks: 'wc26_tasks', airbnb: 'wc26_airbnb', expenses: 'wc26_expenses', travelers: 'wc26_travelers', categories: 'wc26_categories' };
  let state = { schedule: [], tasks: [], airbnb: [], expenses: [], travelers: [], categories: [] };
  let currentTab = 'schedule', taskFilter = 'all';

  const TZ_OPTIONS = [
    { value: 'JST', label: 'JST（日本）', offset: 9 },
    { value: 'CT', label: 'CT（ダラス）', offset: -5 },
    { value: 'PT', label: 'PT（ロサンゼルス）', offset: -7 },
  ];
  const TZ_MAP = {}; TZ_OPTIONS.forEach(t => TZ_MAP[t.value] = t);

  // ── SVG Icons (matching tab icon style: stroke-based, currentColor) ──
  const ICONS = {
    calendar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="3" height="3" rx=".5"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>',
    money: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    calendarSmall: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    note: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    flight: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C20.3 6.7 21 5.5 21 4.5 21 3.1 19.5 2 18.5 3c-1 .5-2.2 1.2-3 2L12 8.5 4.2 6.8a.5.5 0 00-.5.2l-1.4 1.4a.5.5 0 00.1.7L9 13l-2.5 2.5-2.8-.7a.5.5 0 00-.5.1l-.7.7a.5.5 0 000 .7l2.8 2.8a.5.5 0 00.7 0l.7-.7a.5.5 0 00.1-.5L6.1 15 9 12.5l3.8 6.6a.5.5 0 00.7.1l1.4-1.4a.5.5 0 00.2-.5z"/></svg>',
    hotel: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V7a2 2 0 012-2h6v16"/><path d="M11 7h8a2 2 0 012 2v12"/><path d="M7 11h.01M7 15h.01M15 11h.01M15 15h.01"/><path d="M3 21h18"/></svg>',
    food: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    transport: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0"/><path d="M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0"/><path d="M5 17H3V6a1 1 0 011-1h9v12m-4 0h4m4 0h2v-6h-8m0-5h5l3 5"/></svg>',
    ticket: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 01-3 3v0a3 3 0 013 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3v0a3 3 0 013-3v0a3 3 0 01-3-3z"/><path d="M13 6v4m0 4v4"/></svg>',
    box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  };

  const EXP_CATS = [
    { value: 'flight', icon: ICONS.flight, label: '航空券', cls: 'cat-flight' },
    { value: 'hotel', icon: ICONS.hotel, label: '宿泊', cls: 'cat-hotel' },
    { value: 'food', icon: ICONS.food, label: '食事', cls: 'cat-food' },
    { value: 'transport', icon: ICONS.transport, label: '交通', cls: 'cat-transport' },
    { value: 'ticket', icon: ICONS.ticket, label: 'チケット', cls: 'cat-ticket' },
    { value: 'other', icon: ICONS.box, label: 'その他', cls: 'cat-other' },
  ];

  const TRAVELER_COLORS = ['#6B0000', '#6600CC', '#1A0066', '#006655', '#E60000', '#B388FF', '#3366FF', '#00CC66', '#FF4500', '#CC77AA', '#33AAFF', '#CCDD00', '#FF9988', '#DD0055', '#33FFCC', '#FFFF00', '#000000', '#FFFFFF', '#D4AF37'];
  const CATEGORY_COLORS = ['#6B0000', '#6600CC', '#1A0066', '#006655', '#E60000', '#B388FF', '#3366FF', '#00CC66', '#FF4500', '#CC77AA', '#33AAFF', '#CCDD00', '#FF9988', '#DD0055', '#33FFCC', '#FFFF00', '#000000', '#FFFFFF', '#D4AF37'];

  const EMOJI_GROUPS = [
    { icon: '✈️', emojis: ['✈️', '🛫', '🛬', '🏟️', '⚽', '🥅', '🏆', '🎫', '🎟️', '🎉', '🎊', '🗺️', '🧳', '🛂', '🛃', '🛄', '🪪', '📸', '🗼', '🗽', '🌎', '🌍', '🌏', '🏨', '🏠', '🏡', '🌴', '🏖️', '🌇', '🌆'] },
    { icon: '🍽️', emojis: ['🍽️', '🍕', '🍔', '🌮', '🌯', '🥩', '🍣', '🍱', '🍜', '🍝', '🍖', '🥗', '🍳', '☕', '🍺', '🍻', '🥂', '🧃', '🍷', '🫕', '🧁', '🍦', '🍩'] },
    { icon: '🚗', emojis: ['🚗', '🚕', '🚌', '🚎', '🚆', '🚇', '🚄', '🚅', '🚈', '🛵', '🏍️', '🚲', '🛴', '🚁', '⛴️', '🚢', '🚐', '🚙', '⛽', '🅿️', '🛻'] },
    { icon: '💰', emojis: ['💰', '💵', '💴', '💳', '🏧', '🧾', '💸', '🏦', '💹', '📊', '📈'] },
    { icon: '📝', emojis: ['📝', '📋', '🛂', '🛃', '💊', '🧴', '👕', '👟', '🎒', '🧳', '🔌', '📱', '💻', '📷', '🔑', '🏥', '☂️', '🕶️', '👓'] },
    { icon: '😀', emojis: ['😀', '😂', '🤣', '😍', '🥳', '😎', '🤩', '🥺', '😴', '🤔', '👏', '🙌', '✌️', '🤞', '👍', '💪', '🫶', '❤️', '🔥', '⭐', '✨', '🎵'] },
  ];

  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  const fmt$ = n => '¥' + Number(n).toLocaleString('ja-JP');
  function load() { try { for (const k of Object.keys(KEYS)) { const r = localStorage.getItem(KEYS[k]); if (r) state[k] = JSON.parse(r); } } catch { } }
  function save(k) { localStorage.setItem(KEYS[k], JSON.stringify(state[k])); }

  function fmtDate(d) { if (!d) return ''; const x = new Date(d + 'T00:00:00'); const w = ['日', '月', '火', '水', '木', '金', '土']; return `${x.getMonth() + 1}/${x.getDate()}(${w[x.getDay()]})`; }
  function createEmpty(i, t, s) { const e = document.createElement('div'); e.className = 'empty-state'; e.innerHTML = `<div class="empty-state__icon svg-icon--empty">${i}</div><p class="empty-state__text">${t}</p><p class="empty-state__sub">${s}</p>`; return e; }

  function convertTime(time, from, to) { if (!time) return null; const [h, m] = time.split(':').map(Number); const diff = (TZ_MAP[to].offset - TZ_MAP[from].offset) * 60; let total = h * 60 + m + diff, ds = 0; while (total < 0) { total += 1440; ds--; } while (total >= 1440) { total -= 1440; ds++; } return { time: `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`, dayShift: ds }; }
  function toJstDate(d, t, tz) { if (!d || !t) return d; const r = convertTime(t, tz, 'JST'); if (!r || r.dayShift === 0) return d; const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + r.dayShift); return x.toISOString().slice(0, 10); }
  function toJstMin(item) { if (!item.startTime) return 0; const r = convertTime(item.startTime, item.startTz || 'JST', 'JST'); if (!r) return 0; const [h, m] = r.time.split(':').map(Number); return h * 60 + m + (r.dayShift || 0) * 1440; }
  function getTColor(t, i) { return t.color || TRAVELER_COLORS[i % TRAVELER_COLORS.length]; }

  // Day numbering: find earliest JST date as Day 1
  function getDayNumber(jstDate, allJstDates) {
    if (!allJstDates.length) return 1;
    const sorted = [...new Set(allJstDates)].sort();
    const idx = sorted.indexOf(jstDate);
    return idx >= 0 ? idx + 1 : 1;
  }

  // ── Tabs ──
  function initTabs() { $$('.tab').forEach(tab => tab.addEventListener('click', () => { const t = tab.dataset.tab; if (t === currentTab) return; currentTab = t; $$('.tab').forEach(b => b.classList.remove('active')); tab.classList.add('active'); $$('.section').forEach(s => s.classList.remove('active')); $(`#section-${t}`).classList.add('active'); })); }

  // ══════════════════════════════
  //  EMOJI PICKER
  // ══════════════════════════════
  let emojiTarget = null;
  function initEmojiPicker() {
    const tabs = $('#emoji-picker-tabs'), grid = $('#emoji-picker-grid'), ov = $('#emoji-picker-overlay');
    EMOJI_GROUPS.forEach((g, i) => { const b = document.createElement('button'); b.className = 'emoji-tab' + (i === 0 ? ' active' : ''); b.textContent = g.icon; b.addEventListener('click', () => { tabs.querySelectorAll('.emoji-tab').forEach(x => x.classList.remove('active')); b.classList.add('active'); renderGrid(i); }); tabs.appendChild(b); });
    renderGrid(0);
    function renderGrid(idx) { grid.innerHTML = ''; EMOJI_GROUPS[idx].emojis.forEach(e => { const b = document.createElement('button'); b.className = 'emoji-cell'; b.textContent = e; b.addEventListener('click', () => { if (emojiTarget) emojiTarget.value = (emojiTarget.value || '') + e; closeEP(); }); grid.appendChild(b); }); }
    $('#emoji-picker-close').addEventListener('click', closeEP); ov.addEventListener('click', e => { if (e.target === ov) closeEP(); });
  }
  function openEP(el) { emojiTarget = el; $('#emoji-picker-overlay').classList.add('open'); }
  function closeEP() { $('#emoji-picker-overlay').classList.remove('open'); }

  // ══════════════════════════════
  //  CATEGORY MODAL (add + edit)
  // ══════════════════════════════
  let catCb = null, selCatColor = CATEGORY_COLORS[0], editingCatId = null;
  function initCategoryModal() {
    const pal = $('#color-palette');
    CATEGORY_COLORS.forEach((c, i) => { const s = document.createElement('button'); s.className = 'color-swatch' + (i === 0 ? ' selected' : ''); s.style.background = c; s.addEventListener('click', () => { pal.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected')); s.classList.add('selected'); selCatColor = c; }); pal.appendChild(s); });
    const close = () => { $('#category-overlay').classList.remove('open'); editingCatId = null; };
    $('#category-close').addEventListener('click', close); $('#category-cancel').addEventListener('click', close); $('#category-overlay').addEventListener('click', e => { if (e.target === $('#category-overlay')) close(); });
    $('#category-save-btn').addEventListener('click', () => {
      const n = $('#category-name-input').value.trim(); if (!n) return;
      if (editingCatId) {
        const cat = state.categories.find(c => c.id === editingCatId);
        if (cat) { cat.name = n; cat.color = selCatColor; save('categories'); renderSchedule(); }
      } else {
        const cat = { id: uid(), name: n, color: selCatColor }; state.categories.push(cat); save('categories');
        if (catCb) catCb(cat);
      }
      catCb = null; close();
    });
  }
  function openCatModal(cb, editId) {
    catCb = cb; editingCatId = editId || null;
    const cat = editId ? state.categories.find(c => c.id === editId) : null;
    $('#category-modal-title').textContent = cat ? 'カテゴリ編集' : 'カテゴリ追加';
    $('#category-name-input').value = cat ? cat.name : '';
    selCatColor = cat ? cat.color : CATEGORY_COLORS[0];
    $('#color-palette').querySelectorAll('.color-swatch').forEach(s => { s.classList.toggle('selected', s.style.backgroundColor === selCatColor || rgbToHex(s.style.backgroundColor) === selCatColor); });
    $('#category-overlay').classList.add('open'); setTimeout(() => $('#category-name-input').focus(), 100);
  }
  function rgbToHex(rgb) { if (!rgb || rgb.startsWith('#')) return rgb; const m = rgb.match(/\d+/g); if (!m || m.length < 3) return rgb; return '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('').toUpperCase(); }

  // ══════════════════════════════
  //  TRAVELER MODAL (add + edit)
  // ══════════════════════════════
  let selTravColor = TRAVELER_COLORS[0], editingTravId = null;
  function initTravelerModal() {
    const pal = $('#traveler-color-palette');
    TRAVELER_COLORS.forEach((c, i) => { const s = document.createElement('button'); s.className = 'color-swatch' + (i === 0 ? ' selected' : ''); s.style.background = c; s.addEventListener('click', () => { pal.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected')); s.classList.add('selected'); selTravColor = c; }); pal.appendChild(s); });
    const close = () => { $('#traveler-overlay').classList.remove('open'); editingTravId = null; };
    $('#traveler-close').addEventListener('click', close); $('#traveler-cancel').addEventListener('click', close); $('#traveler-overlay').addEventListener('click', e => { if (e.target === $('#traveler-overlay')) close(); });
    $('#traveler-save').addEventListener('click', () => {
      const n = $('#traveler-name-input').value.trim(); if (!n) return;
      if (editingTravId) {
        const t = state.travelers.find(t => t.id === editingTravId);
        if (t) { t.name = n; t.color = selTravColor; save('travelers'); renderTravelers(); renderExpenses(); }
      } else {
        if (state.travelers.some(t => t.name === n)) return;
        state.travelers.push({ id: uid(), name: n, color: selTravColor }); save('travelers'); renderTravelers(); renderExpenses();
      }
      close();
    });
    $('#traveler-name-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#traveler-save').click(); } });
  }
  function openTravelerModal(editId) {
    editingTravId = editId || null;
    const t = editId ? state.travelers.find(x => x.id === editId) : null;
    $('#traveler-modal-title').textContent = t ? '旅行者編集' : '旅行者追加';
    $('#traveler-name-input').value = t ? t.name : '';
    const nextIdx = t ? TRAVELER_COLORS.indexOf(t.color) : state.travelers.length % TRAVELER_COLORS.length;
    selTravColor = t ? (t.color || TRAVELER_COLORS[0]) : TRAVELER_COLORS[nextIdx >= 0 ? nextIdx : 0];
    $('#traveler-color-palette').querySelectorAll('.color-swatch').forEach(s => { s.classList.toggle('selected', rgbToHex(s.style.backgroundColor) === selTravColor); });
    $('#traveler-overlay').classList.add('open'); setTimeout(() => $('#traveler-name-input').focus(), 100);
  }

  // ══════════════════════════════
  //  DETAIL MODAL
  // ══════════════════════════════
  function openDetail(title, html) { $('#detail-title').textContent = title; $('#detail-body').innerHTML = html; $('#detail-overlay').classList.add('open'); }
  function initDetailModal() { const cl = () => $('#detail-overlay').classList.remove('open'); $('#detail-close').addEventListener('click', cl); $('#detail-overlay').addEventListener('click', e => { if (e.target === $('#detail-overlay')) cl(); }); }

  // ══════════════════════════════
  //  MODAL SYSTEM
  // ══════════════════════════════
  function openModal(title, buildFn, onSave) { $('#modal-title').textContent = title; const f = $('#modal-form'); f.innerHTML = ''; buildFn(f); $('#modal-overlay').classList.add('open'); $('#modal-save').onclick = () => { if (onSave() !== false) closeModal(); }; $('#modal-cancel').onclick = closeModal; $('#modal-close').onclick = closeModal; $('#modal-overlay').onclick = e => { if (e.target === $('#modal-overlay')) closeModal(); }; }
  function closeModal() { $('#modal-overlay').classList.remove('open'); }

  function addSectionLabel(f, t) { const l = document.createElement('div'); l.className = 'form-section-label'; l.textContent = t; f.appendChild(l); }
  function addField(f, o) { const g = document.createElement('div'); g.className = 'form-group'; const l = document.createElement('label'); l.className = 'form-label'; l.textContent = o.label; l.htmlFor = `field-${o.name}`; g.appendChild(l); let inp; if (o.type === 'textarea') { inp = document.createElement('textarea'); inp.className = 'form-textarea'; } else if (o.type === 'select') { inp = document.createElement('select'); inp.className = 'form-select'; (o.options || []).forEach(op => { const opt = document.createElement('option'); opt.value = op.value; opt.textContent = op.label; inp.appendChild(opt); }); } else { inp = document.createElement('input'); inp.className = 'form-input'; inp.type = o.type || 'text'; } inp.id = `field-${o.name}`; inp.name = o.name; if (o.value != null) inp.value = o.value; if (o.placeholder) inp.placeholder = o.placeholder; if (o.required) inp.required = true; g.appendChild(inp); f.appendChild(g); return inp; }
  function addEmojiField(f, v) { const g = document.createElement('div'); g.className = 'form-group'; const l = document.createElement('label'); l.className = 'form-label'; l.textContent = '絵文字'; g.appendChild(l); const r = document.createElement('div'); r.className = 'emoji-input-row'; const inp = document.createElement('input'); inp.className = 'form-input'; inp.id = 'field-emoji'; inp.name = 'emoji'; inp.placeholder = 'タップで選択 →'; inp.value = v || ''; const b = document.createElement('button'); b.type = 'button'; b.className = 'emoji-pick-btn'; b.textContent = '😀'; b.addEventListener('click', () => openEP(inp)); r.appendChild(inp); r.appendChild(b); g.appendChild(r); f.appendChild(g); }
  function addRow(f, fields) { const r = document.createElement('div'); r.className = fields.length === 3 ? 'form-row-3' : 'form-row'; fields.forEach(o => { const g = document.createElement('div'); g.className = 'form-group'; const l = document.createElement('label'); l.className = 'form-label'; l.textContent = o.label; l.htmlFor = `field-${o.name}`; g.appendChild(l); let inp; if (o.type === 'select') { inp = document.createElement('select'); inp.className = 'form-select'; (o.options || []).forEach(op => { const opt = document.createElement('option'); opt.value = op.value; opt.textContent = op.label; inp.appendChild(opt); }); } else { inp = document.createElement('input'); inp.className = 'form-input'; inp.type = o.type || 'text'; } inp.id = `field-${o.name}`; inp.name = o.name; if (o.value != null) inp.value = o.value; if (o.placeholder) inp.placeholder = o.placeholder; g.appendChild(inp); r.appendChild(g); }); f.appendChild(r); }
  function addCategorySelect(f, v) {
    const r = document.createElement('div'); r.className = 'form-category-row';
    const g = document.createElement('div'); g.className = 'form-group';
    const l = document.createElement('label'); l.className = 'form-label'; l.textContent = 'カテゴリ'; l.htmlFor = 'field-category'; g.appendChild(l);
    const sel = document.createElement('select'); sel.className = 'form-select'; sel.id = 'field-category'; sel.name = 'category';
    const no = document.createElement('option'); no.value = ''; no.textContent = 'なし'; sel.appendChild(no);
    state.categories.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o); });
    if (v) sel.value = v;
    g.appendChild(sel); r.appendChild(g);
    // Add new btn
    const ab = document.createElement('button'); ab.type = 'button'; ab.className = 'form-category-add-btn'; ab.textContent = '＋'; ab.title = 'カテゴリ追加';
    ab.addEventListener('click', () => openCatModal(cat => { const o = document.createElement('option'); o.value = cat.id; o.textContent = cat.name; sel.appendChild(o); sel.value = cat.id; }));
    r.appendChild(ab);
    // Edit btn
    const eb = document.createElement('button'); eb.type = 'button'; eb.className = 'form-category-add-btn'; eb.innerHTML = ICONS.edit; eb.title = 'カテゴリ編集';
    eb.addEventListener('click', () => { const cid = sel.value; if (!cid) return; openCatModal(null, cid); });
    r.appendChild(eb);
    f.appendChild(r);
  }
  function addCheckboxGroup(f, o) { const g = document.createElement('div'); g.className = 'form-group'; const l = document.createElement('label'); l.className = 'form-label'; l.textContent = o.label; g.appendChild(l); const c = document.createElement('div'); c.className = 'form-checkbox-group'; c.id = `field-${o.name}`; o.options.forEach(opt => { const it = document.createElement('label'); it.className = 'form-checkbox-item' + (o.selected.includes(opt.value) ? ' selected' : ''); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = opt.value; cb.checked = o.selected.includes(opt.value); cb.addEventListener('change', () => it.classList.toggle('selected', cb.checked)); if (opt.color) { const d = document.createElement('span'); d.className = 'form-checkbox-dot'; d.style.background = opt.color; it.appendChild(d); } const sp = document.createElement('span'); sp.className = 'form-checkbox-label'; sp.textContent = opt.label; it.appendChild(cb); it.appendChild(sp); c.appendChild(it); }); g.appendChild(c); f.appendChild(g); }
  function addRadioGroup(f, o) { const g = document.createElement('div'); g.className = 'form-group'; const l = document.createElement('label'); l.className = 'form-label'; l.textContent = o.label; g.appendChild(l); const c = document.createElement('div'); c.className = 'form-radio-group'; c.id = `field-${o.name}`; o.options.forEach(opt => { const it = document.createElement('label'); it.className = 'form-radio-item' + (o.selected === opt.value ? ' selected' : ''); const rb = document.createElement('input'); rb.type = 'radio'; rb.name = o.name; rb.value = opt.value; rb.checked = o.selected === opt.value; rb.addEventListener('change', () => { c.querySelectorAll('.form-radio-item').forEach(i => i.classList.remove('selected')); it.classList.add('selected'); }); if (opt.color) { const d = document.createElement('span'); d.className = 'form-radio-dot'; d.style.background = opt.color; it.appendChild(d); } const sp = document.createElement('span'); sp.className = 'form-radio-label'; sp.textContent = opt.label; it.appendChild(rb); it.appendChild(sp); c.appendChild(it); }); g.appendChild(c); f.appendChild(g); }

  function gv(n) { const e = $(`#field-${n}`); return e ? e.value : ''; }
  function getChecked(n) { const c = $(`#field-${n}`); return c ? Array.from(c.querySelectorAll('input[type=checkbox]:checked')).map(x => x.value) : []; }
  function getRadio(n) { const c = $(`#field-${n}`); if (!c) return ''; const r = c.querySelector('input[type=radio]:checked'); return r ? r.value : ''; }

  // Delete confirm
  let delCb = null;
  function confirmDelete(cb) { delCb = cb; $('#delete-overlay').classList.add('open'); }
  function initDeleteModal() { const cl = () => $('#delete-overlay').classList.remove('open'); $('#delete-confirm').onclick = () => { if (delCb) delCb(); delCb = null; cl(); }; $('#delete-cancel').onclick = cl; $('#delete-close').onclick = cl; $('#delete-overlay').onclick = e => { if (e.target === $('#delete-overlay')) cl(); }; }

  // ══════════════════════════════
  //  SCHEDULE
  // ══════════════════════════════
  function buildSchedForm(f, it = {}) {
    addEmojiField(f, it.emoji || '');
    addField(f, { name: 'title', label: 'タイトル', type: 'text', value: it.title || '', placeholder: '例: 成田空港出発', required: true });
    addCategorySelect(f, it.categoryId || '');
    addSectionLabel(f, '開始');
    addRow(f, [{ name: 'startDate', label: '日付', type: 'date', value: it.startDate || '' }, { name: 'startTz', label: 'タイムゾーン', type: 'select', value: it.startTz || 'JST', options: TZ_OPTIONS }, { name: 'startTime', label: '時間', type: 'time', value: it.startTime || '' }]);
    addSectionLabel(f, '終了');
    addRow(f, [{ name: 'endDate', label: '日付', type: 'date', value: it.endDate || '' }, { name: 'endTz', label: 'タイムゾーン', type: 'select', value: it.endTz || it.startTz || 'JST', options: TZ_OPTIONS }, { name: 'endTime', label: '時間', type: 'time', value: it.endTime || '' }]);
    addField(f, { name: 'note', label: 'メモ', type: 'textarea', value: it.note || '', placeholder: '詳細メモ（任意）' });
  }
  function readSchedForm() { return { emoji: gv('emoji'), title: gv('title'), categoryId: gv('category'), startDate: gv('startDate'), startTz: gv('startTz'), startTime: gv('startTime'), endDate: gv('endDate'), endTz: gv('endTz'), endTime: gv('endTime'), note: gv('note') }; }

  function addSchedule() { openModal('スケジュール追加', f => buildSchedForm(f), () => { const d = readSchedForm(); if (!d.title || !d.startDate) return false; state.schedule.push({ id: uid(), ...d }); sortSched(); save('schedule'); renderSchedule(); }); }
  function editSchedule(id) { const it = state.schedule.find(s => s.id === id); if (!it) return; openModal('スケジュール編集', f => buildSchedForm(f, it), () => { const d = readSchedForm(); if (!d.title || !d.startDate) return false; Object.assign(it, d); sortSched(); save('schedule'); renderSchedule(); }); }
  function deleteSchedule(id) { confirmDelete(() => { state.schedule = state.schedule.filter(s => s.id !== id); save('schedule'); renderSchedule(); }); }
  function sortSched() { state.schedule.sort((a, b) => { const da = toJstDate(a.startDate, a.startTime, a.startTz || 'JST'), db = toJstDate(b.startDate, b.startTime, b.startTz || 'JST'); const c = (da || '').localeCompare(db || ''); return c !== 0 ? c : toJstMin(a) - toJstMin(b); }); }

  function renderSchedule() {
    const c = $('#timeline-container');
    if (!state.schedule.length) { c.innerHTML = ''; c.appendChild(createEmpty(ICONS.calendar, 'スケジュールがまだありません', '「＋追加」ボタンから日程を追加しましょう')); return; }
    // Collect all JST dates for day numbering
    const allJstDates = [];
    state.schedule.forEach(it => {
      const d = toJstDate(it.startDate, it.startTime, it.startTz || 'JST') || it.startDate;
      if (d && !allJstDates.includes(d)) allJstDates.push(d);
    });
    allJstDates.sort();

    const groups = {};
    state.schedule.forEach(it => { const d = toJstDate(it.startDate, it.startTime, it.startTz || 'JST') || it.startDate; if (!groups[d]) groups[d] = []; groups[d].push(it); });
    c.innerHTML = '';
    Object.keys(groups).sort().forEach(date => {
      const day = document.createElement('div'); day.className = 'timeline-day';
      const dayNum = getDayNumber(date, allJstDates);
      const hd = document.createElement('div'); hd.className = 'timeline-day__header';
      const dl = document.createElement('span'); dl.className = 'timeline-day__label'; dl.textContent = `${dayNum}日目`;
      const dd = document.createElement('span'); dd.className = 'timeline-day__date'; dd.textContent = fmtDate(date);
      hd.appendChild(dl); hd.appendChild(dd);
      day.appendChild(hd);

      const ev = document.createElement('div'); ev.className = 'timeline-events';
      groups[date].forEach(it => {
        const cat = state.categories.find(x => x.id === it.categoryId);
        const catColor = cat ? cat.color : '#333';
        const emoji = it.emoji ? `<span class="item-emoji">${esc(it.emoji)}</span>` : '';

        // Time display
        let timeHtml = '';
        if (it.startTime) {
          const sTz = it.startTz || 'JST';
          if (it.endTime) {
            const eTz = it.endTz || sTz;
            if (eTz === sTz && (!it.endDate || it.endDate === it.startDate)) {
              timeHtml = `<span class="sched-card__tz">${sTz} ${it.startTime}–${it.endTime}</span>`;
            } else {
              let endDateStr = ''; if (it.endDate && it.endDate !== it.startDate) endDateStr = fmtDate(it.endDate) + ' ';
              timeHtml = `<span class="sched-card__tz">${sTz} ${it.startTime}</span><span style="color:rgba(255,255,255,.5);font-size:.65rem">→</span><span class="sched-card__tz">${endDateStr}${eTz} ${it.endTime}</span>`;
            }
          } else {
            timeHtml = `<span class="sched-card__tz">${sTz} ${it.startTime}</span>`;
          }
        }
        let catTag = ''; if (cat) catTag = `<span class="sched-card__cat">${esc(cat.name)}</span>`;
        const note = it.note ? `<div class="sched-card__note">${esc(it.note)}</div>` : '';

        const el = document.createElement('div'); el.className = 'timeline-event';
        el.innerHTML = `<div class="sched-card" style="border-left:3px solid ${catColor}">
          <div class="card-actions"><button class="action-btn" data-action="edit-schedule" data-id="${it.id}">${ICONS.edit}</button><button class="action-btn" data-action="delete-schedule" data-id="${it.id}">${ICONS.trash}</button></div>
          <div class="sched-card__title">${emoji}${esc(it.title)}</div>
          <div class="sched-card__meta">${timeHtml}${catTag}</div>
          ${note}
        </div>`;
        ev.appendChild(el);
      });
      day.appendChild(ev); c.appendChild(day);
    });
  }

  // ══════════════════════════════
  //  TASKS
  // ══════════════════════════════
  function addTask() { openModal('タスク追加', f => { addEmojiField(f, ''); addField(f, { name: 'title', label: 'タスク名', type: 'text', placeholder: '例: パスポート更新', required: true }); addField(f, { name: 'deadline', label: '期限', type: 'date' }); addField(f, { name: 'note', label: 'メモ', type: 'textarea', placeholder: '詳細メモ（任意）' }); }, () => { const t = gv('title'); if (!t) return false; state.tasks.push({ id: uid(), done: false, emoji: gv('emoji'), title: t, deadline: gv('deadline'), note: gv('note') }); save('tasks'); renderTasks(); }); }
  function editTask(id) { const it = state.tasks.find(t => t.id === id); if (!it) return; openModal('タスク編集', f => { addEmojiField(f, it.emoji || ''); addField(f, { name: 'title', label: 'タスク名', type: 'text', value: it.title, required: true }); addField(f, { name: 'deadline', label: '期限', type: 'date', value: it.deadline || '' }); addField(f, { name: 'note', label: 'メモ', type: 'textarea', value: it.note || '' }); }, () => { const t = gv('title'); if (!t) return false; it.emoji = gv('emoji'); it.title = t; it.deadline = gv('deadline'); it.note = gv('note'); save('tasks'); renderTasks(); }); }
  function toggleTask(id) { const it = state.tasks.find(t => t.id === id); if (!it) return; it.done = !it.done; save('tasks'); renderTasks(); }
  function deleteTask(id) { confirmDelete(() => { state.tasks = state.tasks.filter(t => t.id !== id); save('tasks'); renderTasks(); }); }

  function renderTasks() {
    const c = $('#task-list'); let items = state.tasks;
    if (taskFilter === 'pending') items = items.filter(t => !t.done); if (taskFilter === 'done') items = items.filter(t => t.done);
    if (!items.length) { c.innerHTML = ''; c.appendChild(createEmpty(ICONS.check, taskFilter === 'all' ? 'タスクがまだありません' : taskFilter === 'pending' ? '未完了のタスクはありません' : '完了したタスクはありません', taskFilter === 'all' ? '旅行までにやることを追加しましょう' : '')); return; }
    const sorted = [...items].sort((a, b) => { if (a.done !== b.done) return a.done ? 1 : -1; if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline); if (a.deadline) return -1; if (b.deadline) return 1; return 0; });
    c.innerHTML = '';
    sorted.forEach(it => {
      const w = document.createElement('div'); w.className = `task-item${it.done ? ' done' : ''}`;
      const em = it.emoji ? `<span class="item-emoji">${esc(it.emoji)}</span>` : '';
      let dl = ''; if (it.deadline) { const td = new Date(); td.setHours(0, 0, 0, 0); const d = new Date(it.deadline + 'T00:00:00'); dl = `<p class="task__deadline${!it.done && d < td ? ' overdue' : ''}">${ICONS.calendarSmall} ${fmtDate(it.deadline)}</p>`; }
      const note = it.note ? `<p class="task__note">${esc(it.note)}</p>` : '';
      w.innerHTML = `<button class="task-checkbox${it.done ? ' checked' : ''}" data-action="toggle-task" data-id="${it.id}">${it.done ? '✓' : ''}</button><div class="card-wrap"><div class="card-actions"><button class="action-btn" data-action="edit-task" data-id="${it.id}">${ICONS.edit}</button><button class="action-btn" data-action="delete-task" data-id="${it.id}">${ICONS.trash}</button></div><div class="card"><p class="task__title">${em}${esc(it.title)}</p>${dl}${note}</div></div>`;
      c.appendChild(w);
    });
  }
  function initTaskFilters() { $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => { taskFilter = btn.dataset.filter; $$('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderTasks(); })); }

  // ══════════════════════════════
  //  AIRBNB
  // ══════════════════════════════
  function addAirbnb() { openModal('宿泊情報追加', f => { addEmojiField(f, ''); addField(f, { name: 'name', label: '物件名', type: 'text', placeholder: '例: Downtown Studio', required: true }); addField(f, { name: 'address', label: '住所', type: 'text', placeholder: '例: 123 Main St' }); addRow(f, [{ name: 'checkin', label: 'チェックイン', type: 'date' }, { name: 'checkout', label: 'チェックアウト', type: 'date' }]); addField(f, { name: 'url', label: 'URL', type: 'url', placeholder: 'https://airbnb.com/rooms/...' }); addField(f, { name: 'note', label: 'メモ', type: 'textarea', placeholder: 'WiFiパスワード等' }); }, () => { const n = gv('name'); if (!n) return false; state.airbnb.push({ id: uid(), emoji: gv('emoji'), name: n, address: gv('address'), checkin: gv('checkin'), checkout: gv('checkout'), url: gv('url'), note: gv('note') }); state.airbnb.sort((a, b) => (a.checkin || '').localeCompare(b.checkin || '')); save('airbnb'); renderAirbnb(); }); }
  function editAirbnb(id) { const it = state.airbnb.find(a => a.id === id); if (!it) return; openModal('宿泊情報編集', f => { addEmojiField(f, it.emoji || ''); addField(f, { name: 'name', label: '物件名', type: 'text', value: it.name, required: true }); addField(f, { name: 'address', label: '住所', type: 'text', value: it.address || '' }); addRow(f, [{ name: 'checkin', label: 'チェックイン', type: 'date', value: it.checkin || '' }, { name: 'checkout', label: 'チェックアウト', type: 'date', value: it.checkout || '' }]); addField(f, { name: 'url', label: 'URL', type: 'url', value: it.url || '' }); addField(f, { name: 'note', label: 'メモ', type: 'textarea', value: it.note || '' }); }, () => { const n = gv('name'); if (!n) return false; Object.assign(it, { emoji: gv('emoji'), name: n, address: gv('address'), checkin: gv('checkin'), checkout: gv('checkout'), url: gv('url'), note: gv('note') }); state.airbnb.sort((a, b) => (a.checkin || '').localeCompare(b.checkin || '')); save('airbnb'); renderAirbnb(); }); }
  function deleteAirbnb(id) { confirmDelete(() => { state.airbnb = state.airbnb.filter(a => a.id !== id); save('airbnb'); renderAirbnb(); }); }
  function renderAirbnb() {
    const c = $('#airbnb-list'); if (!state.airbnb.length) { c.innerHTML = ''; c.appendChild(createEmpty(ICONS.home, '宿泊情報がまだありません', 'Airbnbの情報を追加しましょう')); return; }
    c.innerHTML = '';
    state.airbnb.forEach(it => {
      const w = document.createElement('div'); w.className = 'airbnb-card';
      const em = it.emoji ? `<span class="item-emoji">${esc(it.emoji)}</span>` : '';
      const addr = it.address ? `<div class="airbnb__detail"><span class="airbnb__detail-icon svg-icon">${ICONS.pin}</span><span class="airbnb__detail-text">${esc(it.address)}</span></div>` : '';
      let dates = ''; if (it.checkin || it.checkout) dates = `<div class="airbnb__detail"><span class="airbnb__detail-icon svg-icon">${ICONS.calendarSmall}</span><span class="airbnb__detail-text">${it.checkin ? fmtDate(it.checkin) : '—'} → ${it.checkout ? fmtDate(it.checkout) : '—'}</span></div>`;
      const url = it.url ? `<div class="airbnb__detail"><span class="airbnb__detail-icon svg-icon">${ICONS.link}</span><a href="${esc(it.url)}" target="_blank" rel="noopener" class="airbnb__link">表示 →</a></div>` : '';
      const note = it.note ? `<div class="airbnb__detail"><span class="airbnb__detail-icon svg-icon">${ICONS.note}</span><span class="airbnb__detail-text">${esc(it.note)}</span></div>` : '';
      w.innerHTML = `<div class="card-wrap"><div class="card-actions"><button class="action-btn" data-action="edit-airbnb" data-id="${it.id}">${ICONS.edit}</button><button class="action-btn" data-action="delete-airbnb" data-id="${it.id}">${ICONS.trash}</button></div><div class="card"><p class="airbnb__name">${em}${esc(it.name)}</p>${addr}${dates}${url}${note}</div></div>`;
      c.appendChild(w);
    });
  }

  // ══════════════════════════════
  //  TRAVELERS
  // ══════════════════════════════
  function removeTraveler(id) { confirmDelete(() => { state.travelers = state.travelers.filter(t => t.id !== id); state.expenses.forEach(e => { if (e.splitWith) e.splitWith = e.splitWith.filter(t => t !== id); if (e.payerId === id) e.payerId = ''; }); save('travelers'); save('expenses'); renderTravelers(); renderExpenses(); }); }
  function renderTravelers() {
    const c = $('#traveler-chips'); if (!state.travelers.length) { c.innerHTML = '<span class="traveler-chips-empty">旅行者を追加してください</span>'; return; }
    c.innerHTML = '';
    state.travelers.forEach((t, i) => {
      const col = getTColor(t, i); const ch = document.createElement('span'); ch.className = 'traveler-chip';
      ch.style.cssText = `background:${col}20;border:1px solid ${col}60`;
      ch.innerHTML = `<span class="traveler-chip__dot" style="background:${col}"></span>${esc(t.name)}<button class="traveler-chip__remove" data-action="remove-traveler" data-id="${t.id}" style="color:${col}">✕</button>`;
      // Click chip to edit
      ch.addEventListener('click', (e) => { if (e.target.closest('[data-action="remove-traveler"]')) return; openTravelerModal(t.id); });
      c.appendChild(ch);
    });
  }

  // ══════════════════════════════
  //  EXPENSES
  // ══════════════════════════════
  function addExpense() { openModal('費用追加', f => { addEmojiField(f, ''); addField(f, { name: 'name', label: '項目名', type: 'text', placeholder: '例: 成田→LAX 航空券', required: true }); addField(f, { name: 'amount', label: '金額 (¥)', type: 'number', placeholder: '例: 150000', required: true }); addField(f, { name: 'category', label: 'カテゴリ', type: 'select', value: 'other', options: EXP_CATS }); if (state.travelers.length) { addRadioGroup(f, { name: 'payerId', label: '支払者', options: state.travelers.map((t, i) => ({ value: t.id, label: t.name, color: getTColor(t, i) })), selected: '' }); addCheckboxGroup(f, { name: 'splitWith', label: '割り勘対象者', options: state.travelers.map((t, i) => ({ value: t.id, label: t.name, color: getTColor(t, i) })), selected: state.travelers.map(t => t.id) }); } }, () => { const n = gv('name'), a = gv('amount'); if (!n || !a) return false; state.expenses.push({ id: uid(), emoji: gv('emoji'), name: n, amount: Number(a), payerId: getRadio('payerId'), category: gv('category'), splitWith: state.travelers.length ? getChecked('splitWith') : [] }); save('expenses'); renderExpenses(); }); }
  function editExpense(id) { const it = state.expenses.find(e => e.id === id); if (!it) return; openModal('費用編集', f => { addEmojiField(f, it.emoji || ''); addField(f, { name: 'name', label: '項目名', type: 'text', value: it.name, required: true }); addField(f, { name: 'amount', label: '金額 (¥)', type: 'number', value: it.amount, required: true }); addField(f, { name: 'category', label: 'カテゴリ', type: 'select', value: it.category || 'other', options: EXP_CATS }); if (state.travelers.length) { addRadioGroup(f, { name: 'payerId', label: '支払者', options: state.travelers.map((t, i) => ({ value: t.id, label: t.name, color: getTColor(t, i) })), selected: it.payerId || '' }); addCheckboxGroup(f, { name: 'splitWith', label: '割り勘対象者', options: state.travelers.map((t, i) => ({ value: t.id, label: t.name, color: getTColor(t, i) })), selected: it.splitWith || [] }); } }, () => { const n = gv('name'), a = gv('amount'); if (!n || !a) return false; Object.assign(it, { emoji: gv('emoji'), name: n, amount: Number(a), payerId: getRadio('payerId'), category: gv('category'), splitWith: state.travelers.length ? getChecked('splitWith') : [] }); save('expenses'); renderExpenses(); }); }
  function deleteExpense(id) { confirmDelete(() => { state.expenses = state.expenses.filter(e => e.id !== id); save('expenses'); renderExpenses(); }); }

  // Pairwise settlement
  function calcPairwiseSettlement() {
    if (!state.travelers.length || !state.expenses.length) return [];
    const debts = {}; state.travelers.forEach(t => debts[t.id] = {});
    state.expenses.forEach(e => { if (!e.payerId) return; const targets = e.splitWith && e.splitWith.length ? e.splitWith : state.travelers.map(t => t.id); const share = e.amount / targets.length; targets.forEach(tid => { if (tid === e.payerId) return; if (!debts[tid]) debts[tid] = {}; debts[tid][e.payerId] = (debts[tid][e.payerId] || 0) + share; }); });
    const transfers = [], proc = {};
    state.travelers.forEach(a => { state.travelers.forEach(b => { if (a.id === b.id) return; const k = [a.id, b.id].sort().join('-'); if (proc[k]) return; proc[k] = true; const ab = (debts[a.id] && debts[a.id][b.id]) || 0; const ba = (debts[b.id] && debts[b.id][a.id]) || 0; const net = Math.round(ab - ba); if (net > 0) transfers.push({ from: a.id, to: b.id, amount: net }); else if (net < 0) transfers.push({ from: b.id, to: a.id, amount: -net }); }); });
    return transfers.filter(t => t.amount > 0);
  }
  function calcTravelerTotals() { const totals = {}; state.travelers.forEach(t => totals[t.id] = 0); state.expenses.forEach(e => { const targets = e.splitWith && e.splitWith.length ? e.splitWith : state.travelers.map(t => t.id); const share = targets.length ? Math.ceil(e.amount / targets.length) : 0; targets.forEach(tid => { if (totals[tid] !== undefined) totals[tid] += share; }); }); return totals; }

  // Detail views
  function showSettlementDetail(fromId, toId) {
    const fromT = state.travelers.find(t => t.id === fromId), toT = state.travelers.find(t => t.id === toId); if (!fromT || !toT) return;
    let html = `<div class="detail-section-title">${esc(toT.name)} が立替えた費用</div><div class="detail-list">`;
    let total = 0;
    state.expenses.forEach(e => { if (e.payerId !== toId) return; const t = e.splitWith && e.splitWith.length ? e.splitWith : state.travelers.map(t => t.id); if (!t.includes(fromId)) return; const s = Math.round(e.amount / t.length); total += s; html += `<div class="detail-row"><span class="detail-row__label">${esc(e.name)}</span><span class="detail-row__value">${fmt$(s)}</span></div>`; });
    html += '</div>';
    let revHtml = '', revTotal = 0;
    state.expenses.forEach(e => { if (e.payerId !== fromId) return; const t = e.splitWith && e.splitWith.length ? e.splitWith : state.travelers.map(t => t.id); if (!t.includes(toId)) return; const s = Math.round(e.amount / t.length); revTotal += s; revHtml += `<div class="detail-row"><span class="detail-row__label">${esc(e.name)}</span><span class="detail-row__value">${fmt$(s)}</span></div>`; });
    if (revTotal > 0) html += `<div class="detail-section-title">${esc(fromT.name)} が立替えた費用</div><div class="detail-list">${revHtml}</div>`;
    const net = total - revTotal;
    html += `<div class="detail-section-title">差額</div><div class="detail-list"><div class="detail-row"><span class="detail-row__label">${esc(fromT.name)} → ${esc(toT.name)}</span><span class="detail-row__value">${fmt$(Math.abs(net))}</span></div></div>`;
    openDetail(`${esc(fromT.name)} → ${esc(toT.name)}`, html);
  }
  function showTravelerDetail(travelerId) {
    const t = state.travelers.find(x => x.id === travelerId); if (!t) return; const ti = state.travelers.indexOf(t); const col = getTColor(t, ti);
    let owedHtml = '', owedTotal = 0;
    state.expenses.forEach(e => { const targets = e.splitWith && e.splitWith.length ? e.splitWith : state.travelers.map(x => x.id); if (!targets.includes(travelerId)) return; const s = Math.round(e.amount / targets.length); owedTotal += s; owedHtml += `<div class="detail-row"><span class="detail-row__label">${esc(e.name)}</span><span class="detail-row__value">${fmt$(s)}</span></div>`; });
    let paidHtml = '', paidTotal = 0;
    state.expenses.forEach(e => { if (e.payerId !== travelerId) return; paidTotal += e.amount; paidHtml += `<div class="detail-row"><span class="detail-row__label">${esc(e.name)}</span><span class="detail-row__value">${fmt$(e.amount)}</span></div>`; });
    let html = `<div class="detail-section-title" style="color:${col}">負担額（割り勘分）</div><div class="detail-list">${owedHtml || '<div class="detail-row"><span class="detail-row__label">—</span></div>'}</div>`;
    html += `<div class="detail-row" style="border-top:2px solid var(--border);margin-top:var(--sp-3);padding-top:var(--sp-3)"><span class="detail-row__label" style="font-weight:700">負担合計</span><span class="detail-row__value">${fmt$(owedTotal)}</span></div>`;
    html += `<div class="detail-section-title" style="color:${col}">立替額</div><div class="detail-list">${paidHtml || '<div class="detail-row"><span class="detail-row__label">—</span></div>'}</div>`;
    html += `<div class="detail-row" style="border-top:2px solid var(--border);margin-top:var(--sp-3);padding-top:var(--sp-3)"><span class="detail-row__label" style="font-weight:700">立替合計</span><span class="detail-row__value">${fmt$(paidTotal)}</span></div>`;
    const balance = paidTotal - owedTotal;
    html += `<div class="detail-row" style="margin-top:var(--sp-3)"><span class="detail-row__label" style="font-weight:700">${balance >= 0 ? '受取予定' : '支払予定'}</span><span class="detail-row__value" style="color:${balance >= 0 ? 'var(--secondary)' : 'var(--primary)'}">${fmt$(Math.abs(balance))}</span></div>`;
    openDetail(`${esc(t.name)} の支出詳細`, html);
  }

  function renderExpenses() {
    const total = state.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0); const cnt = state.travelers.length || 1;
    $('#total-expense').textContent = fmt$(total); $('#per-person-expense').textContent = fmt$(Math.ceil(total / cnt));
    // Breakdown
    const bd = $('#traveler-breakdown');
    if (state.travelers.length && state.expenses.length) { const totals = calcTravelerTotals(); bd.innerHTML = ''; state.travelers.forEach((t, i) => { const col = getTColor(t, i); const row = document.createElement('div'); row.className = 'breakdown-row'; row.innerHTML = `<span class="breakdown-row__name"><span class="breakdown-row__dot" style="background:${col}"></span>${esc(t.name)}</span><span class="breakdown-row__amount">${fmt$(totals[t.id] || 0)}</span>`; row.addEventListener('click', () => showTravelerDetail(t.id)); bd.appendChild(row); }); } else bd.innerHTML = '';
    // Settlement
    const sl = $('#settlement-list'); const transfers = calcPairwiseSettlement(); const hasPayer = state.expenses.some(e => e.payerId);
    if (transfers.length && hasPayer) { $('#settlement-section').style.display = ''; sl.innerHTML = ''; transfers.forEach(tr => { const fromT = state.travelers.find(t => t.id === tr.from), toT = state.travelers.find(t => t.id === tr.to); if (!fromT || !toT) return; const fi = state.travelers.indexOf(fromT), ti = state.travelers.indexOf(toT); const row = document.createElement('div'); row.className = 'settlement-row'; row.innerHTML = `<div class="settlement-row__flow"><span style="color:${getTColor(fromT, fi)}">${esc(fromT.name)}</span><span class="settlement-row__arrow">→</span><span style="color:${getTColor(toT, ti)}">${esc(toT.name)}</span></div><span class="settlement-row__amount" style="color:${getTColor(toT, ti)}">${fmt$(tr.amount)}</span>`; row.addEventListener('click', () => showSettlementDetail(tr.from, tr.to)); sl.appendChild(row); }); } else if (state.travelers.length && state.expenses.length && !hasPayer) { $('#settlement-section').style.display = ''; sl.innerHTML = '<div class="settlement-empty">支払者を設定すると清算方法が表示されます</div>'; } else { $('#settlement-section').style.display = 'none'; sl.innerHTML = ''; }
    // List
    const c = $('#expense-list'); if (!state.expenses.length) { c.innerHTML = ''; c.appendChild(createEmpty(ICONS.money, '費用がまだありません', '旅行費用を追加しましょう')); return; }
    c.innerHTML = '';
    state.expenses.forEach(it => {
      const cat = EXP_CATS.find(x => x.value === it.category) || EXP_CATS[5]; const w = document.createElement('div'); w.className = 'expense-card';
      const icon = it.emoji || cat.icon; const payer = state.travelers.find(t => t.id === it.payerId);
      let splitHtml = ''; if (it.splitWith && it.splitWith.length) splitHtml = '<div class="expense__splitees">' + it.splitWith.map(tid => { const t = state.travelers.find(x => x.id === tid); return t ? `<span class="expense__splitee-tag">${esc(t.name)}</span>` : ''; }).join('') + '</div>';
      w.innerHTML = `<div class="card-wrap"><div class="card-actions"><button class="action-btn" data-action="edit-expense" data-id="${it.id}">${ICONS.edit}</button><button class="action-btn" data-action="delete-expense" data-id="${it.id}">${ICONS.trash}</button></div><div class="card" style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp-3);padding-right:70px"><div class="expense__category-icon ${cat.cls}">${icon}</div><div class="expense__info"><p class="expense__name">${esc(it.name)}</p><p class="expense__payer">${payer ? esc(payer.name) : '—'}</p>${splitHtml}</div><div class="expense__amount">${fmt$(it.amount)}</div></div></div>`;
      c.appendChild(w);
    });
  }

  // ── Event delegation ──
  function initActions() { document.addEventListener('click', e => { const btn = e.target.closest('[data-action]'); if (!btn) return; const a = btn.dataset.action, id = btn.dataset.id; switch (a) { case 'edit-schedule': editSchedule(id); break; case 'delete-schedule': deleteSchedule(id); break; case 'edit-task': editTask(id); break; case 'delete-task': deleteTask(id); break; case 'toggle-task': toggleTask(id); break; case 'edit-airbnb': editAirbnb(id); break; case 'delete-airbnb': deleteAirbnb(id); break; case 'edit-expense': editExpense(id); break; case 'delete-expense': deleteExpense(id); break; case 'remove-traveler': removeTraveler(id); break; } }); }

  // Init
  function init() {
    load(); initTabs(); initTaskFilters(); initDeleteModal(); initEmojiPicker(); initCategoryModal(); initTravelerModal(); initDetailModal(); initActions();
    $('#add-schedule').addEventListener('click', addSchedule);
    $('#add-task').addEventListener('click', addTask);
    $('#add-airbnb').addEventListener('click', addAirbnb);
    $('#add-expense').addEventListener('click', addExpense);
    $('#add-traveler').addEventListener('click', () => openTravelerModal());
    renderSchedule(); renderTasks(); renderAirbnb(); renderTravelers(); renderExpenses();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
