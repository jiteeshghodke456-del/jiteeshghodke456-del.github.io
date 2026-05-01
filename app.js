// ─── State ───────────────────────────────────────────────
let STATE = loadState();
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ─── CF API ──────────────────────────────────────────────
const CF_API = 'https://codeforces.com/api';
async function cfFetch(method, params = {}) {
  const qs = Object.entries(params).map(([k,v]) => `${k}=${v}`).join('&');
  const url = `${CF_API}/${method}?${qs}`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.status === 'OK') return j.result;
  throw new Error(j.comment || 'CF API error');
}

async function syncCF() {
  if (!STATE.cfHandle) return;
  try {
    const [info] = await cfFetch('user.info', { handles: STATE.cfHandle });
    STATE.currentRating = info.rating || 800;
    STATE.cfRank = info.rank || 'newbie';
    STATE.cfMaxRating = info.maxRating || 800;

    const ratings = await cfFetch('user.rating', { handle: STATE.cfHandle });
    STATE.contests = ratings.map(r => ({
      date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0,10),
      name: r.contestName,
      rank: r.rank,
      ratingChange: r.newRating - r.oldRating,
      newRating: r.newRating
    }));

    const subs = await cfFetch('user.status', { handle: STATE.cfHandle, count: 500 });
    STATE.cfSubmissions = subs.filter(s => s.verdict === 'OK').length;
    STATE.cfTotalSubs = subs.length;
    
    // Count unique solved problems and daily solves
    const solved = new Set();
    const dailySolved = {};
    
    subs.forEach(s => {
      if (s.verdict === 'OK') {
        const probId = `${s.problem.contestId}-${s.problem.index}`;
        solved.add(probId);
        
        const d = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0,10);
        if (!dailySolved[d]) dailySolved[d] = new Set();
        dailySolved[d].add(probId);
      }
    });
    
    STATE.cfSolved = solved.size;
    
    // Update dailyLog with fetched data
    Object.keys(dailySolved).forEach(d => {
      if (!STATE.dailyLog[d]) STATE.dailyLog[d] = { solved: 0, contest: false };
      STATE.dailyLog[d].solved = Math.max(STATE.dailyLog[d].solved, dailySolved[d].size);
    });
    
    // Mark contest days
    STATE.contests.forEach(c => {
      if (!STATE.dailyLog[c.date]) STATE.dailyLog[c.date] = { solved: 0, contest: false };
      STATE.dailyLog[c.date].contest = true;
    });

    STATE.lastSync = new Date().toISOString();
    STATE.currentPhase = getPhaseForRating(STATE.currentRating);
    saveState(STATE);
    renderAll();
  } catch(e) {
    console.error('CF sync failed:', e);
  }
}

function getPhaseForRating(r) {
  if (r < 1000) return 0;
  if (r < 1300) return 1;
  if (r < 1600) return 2;
  if (r < 1800) return 3;
  return 4;
}

// ─── Navigation ──────────────────────────────────────────
function initNav() {
  $$('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.tab-panel').forEach(t => t.classList.remove('active'));
      $(`#tab-${btn.dataset.tab}`).classList.add('active');
      // Close mobile sidebar
      $('#sidebar').classList.remove('open');
      const ov = $('.sidebar-overlay');
      if (ov) ov.classList.remove('show');
    });
  });
  // Mobile
  $('#hamburgerBtn').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    let ov = $('.sidebar-overlay');
    if (!ov) { ov = document.createElement('div'); ov.className = 'sidebar-overlay'; document.body.appendChild(ov); ov.addEventListener('click', () => { $('#sidebar').classList.remove('open'); ov.classList.remove('show'); }); }
    ov.classList.toggle('show');
  });
  // Reset
  $('#resetBtn').addEventListener('click', () => {
    if (confirm('Reset all data? This cannot be undone.')) {
      localStorage.removeItem('cf_tracker_state');
      STATE = { ...DEFAULT_STATE };
      renderAll();
    }
  });
}

// ─── Streak Calc ─────────────────────────────────────────
function calcStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    if (STATE.dailyLog[key] && STATE.dailyLog[key].solved > 0) streak++;
    else if (i > 0) break;
  }
  STATE.currentStreak = streak;
  STATE.longestStreak = Math.max(STATE.longestStreak, streak);
}

// ─── XP System ───────────────────────────────────────────
// 10 XP per problem, 50 XP per contest, 5 XP per streak day bonus
function calcXP() {
  let xp = 0;
  Object.values(STATE.dailyLog).forEach(log => {
    xp += (log.solved || 0) * 10;
    if (log.contest) xp += 50;
  });
  xp += STATE.currentStreak * 5; // streak bonus
  xp += (STATE.contests?.length || 0) * 50;
  return xp;
}
function getLevel(xp) {
  // Each level needs progressively more XP: level N needs N*100 XP
  let level = 1, needed = 100;
  while (xp >= needed) { xp -= needed; level++; needed = level * 100; }
  return { level, currentXP: xp, neededXP: needed };
}
const LEVEL_TITLES = ['Newbie','Learner','Solver','Thinker','Builder','Grinder','Strategist','Expert','Master','Legend'];
function getLevelTitle(level) { return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]; }

function showXPToast(amount, reason) {
  const existing = document.querySelector('.xp-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.innerHTML = `+${amount} XP · ${reason}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ─── Dashboard ───────────────────────────────────────────
function renderDashboard() {
  calcStreak();
  const phase = PHASES[STATE.currentPhase];
  const progress = Math.min(100, Math.max(0, ((STATE.currentRating - 800) / 1200) * 100));
  const totalXP = calcXP();
  const { level, currentXP, neededXP } = getLevel(totalXP);
  const xpPct = Math.round((currentXP / neededXP) * 100);
  const isStreakAlive = STATE.currentStreak > 0;

  let handleSection = '';
  if (!STATE.cfHandle) {
    handleSection = `<div class="card"><div class="card-title" style="margin-bottom:12px">Link Codeforces Account</div>
      <div style="display:flex;gap:8px"><input id="cfHandleInput" placeholder="Your CF handle" style="flex:1;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:var(--font);font-size:14px;padding:10px 14px;outline:none">
      <button class="btn btn-primary" onclick="linkCF()">Link</button></div></div>`;
  } else {
    handleSection = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <span style="font-size:13px;color:var(--text-muted)">Linked:</span>
      <a href="https://codeforces.com/profile/${STATE.cfHandle}" target="_blank" style="color:var(--accent);font-weight:600;text-decoration:none">${STATE.cfHandle}</a>
      <button class="btn btn-ghost btn-sm" onclick="syncCF()" title="Sync now">↻ Sync</button>
      <span style="font-size:11px;color:var(--text-muted)">${STATE.lastSync ? 'Last: ' + new Date(STATE.lastSync).toLocaleTimeString() : ''}</span>
    </div>`;
  }

  $('#tab-dashboard').innerHTML = `
    <h1 class="page-title">Dashboard</h1>
    ${handleSection}

    <div class="streak-display">
      <div class="streak-fire${isStreakAlive ? '' : ' dead'}"><span class="fire-emoji">🔥</span></div>
      <div class="streak-info">
        <div class="streak-count">${STATE.currentStreak} day${STATE.currentStreak !== 1 ? 's' : ''}</div>
        <div class="streak-label">${isStreakAlive ? 'Keep it going!' : 'Solve a problem to start your streak!'}</div>
      </div>
      <div class="streak-best">
        <div class="streak-best-val">${STATE.longestStreak}</div>
        <div class="streak-best-label">Best streak</div>
      </div>
    </div>

    <div class="xp-display">
      <div class="level-badge">${level}</div>
      <div class="xp-info">
        <div class="xp-top">
          <span class="xp-level-text">Lvl ${level} · ${getLevelTitle(level)}</span>
          <span class="xp-amount">${currentXP} / ${neededXP} XP</span>
        </div>
        <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${xpPct}%"></div></div>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:13px;color:var(--text-muted)">800</span>
        <span style="font-size:13px;color:var(--text-muted)">2000</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
      <div style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-muted)">${Math.round(progress)}% · Phase ${STATE.currentPhase + 1}/5 — ${phase.title}</div>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value" style="color:var(--accent)">${STATE.currentRating}</div><div class="stat-label">Rating</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--green)">${totalXP}</div><div class="stat-label">Total XP</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--blue)">${STATE.cfSolved || 0}</div><div class="stat-label">Solved</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--amber)">${STATE.contests?.length || 0}</div><div class="stat-label">Contests</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title" style="margin-bottom:10px">Last 28 Days</div>
      <div class="heatmap" style="margin-bottom:4px">
        ${['M','T','W','T','F','S','S'].map(d => `<div class="heatmap-label">${d}</div>`).join('')}
      </div>
      <div class="heatmap" id="heatmap"></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title" style="margin-bottom:10px">Phase ${STATE.currentPhase + 1}: ${phase.label}</div>
      <div class="chip-wrap">${phase.coreTopics.map(t => `<span class="chip core">${t}</span>`).join('')}</div>
      <div style="margin-top:10px">
        <div class="practice-grid">
          <div class="practice-card"><div class="practice-card-title">Weekday</div><div class="practice-card-text">${phase.weekday}</div></div>
          <div class="practice-card"><div class="practice-card-title">Weekend</div><div class="practice-card-text">${phase.weekend}</div></div>
        </div>
      </div>
    </div>`;
  renderHeatmap();
}

function renderHeatmap() {
  const grid = $('#heatmap');
  if (!grid) return;
  const today = new Date();
  // Align to start of week (Monday)
  const startOffset = (today.getDay() + 6) % 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - startOffset - 21);
  let html = '';
  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0,10);
    const todayKey = today.toISOString().slice(0,10);
    const log = STATE.dailyLog[key];
    const solved = log?.solved || 0;
    let cls = 'heatmap-day';
    if (key === todayKey) cls += ' today';
    if (d > today) cls += ' future';
    else if (solved >= 5) cls += ' filled-3';
    else if (solved >= 2) cls += ' filled-2';
    else if (solved >= 1) cls += ' filled-1';
    html += `<div class="${cls}" title="${key}: ${solved} solved"></div>`;
  }
  grid.innerHTML = html;
}

window.linkCF = async function() {
  const handle = $('#cfHandleInput')?.value?.trim();
  if (!handle) return;
  STATE.cfHandle = handle;
  saveState(STATE);
  await syncCF();
  renderDashboard();
};

// ─── Roadmap ─────────────────────────────────────────────
function renderRoadmap() {
  $('#tab-roadmap').innerHTML = `<h1 class="page-title">Roadmap</h1><div id="phaseList"></div>`;
  const list = $('#phaseList');
  PHASES.forEach((p, i) => {
    const isCurrent = i === STATE.currentPhase;
    const div = document.createElement('div');
    div.className = `phase-card${isCurrent ? ' current-phase' : ''}${i === 0 ? ' expanded' : ''}`;
    div.innerHTML = `
      <div class="phase-head">
        <span class="phase-badge" style="background:${p.color}22;color:${p.color};border:1px solid ${p.color}44">${p.label}</span>
        <div class="phase-info"><div class="phase-name">${p.title}${isCurrent ? ' ← You are here' : ''}</div><div class="phase-dur">${p.duration}</div></div>
        <span class="phase-chevron">▼</span>
      </div>
      <div class="phase-body">
        ${p.switchNote ? `<div class="switch-banner">⚡ ${p.switchNote}</div>` : ''}
        <div class="phase-section-label">Core Topics</div>
        <div class="chip-wrap">${p.coreTopics.map(t => { const link = p.topicLinks?.find(l => l.topic === t); return link ? `<a href="${link.url}" target="_blank" class="chip core linked">${t} ↗</a>` : `<span class="chip core">${t}</span>`; }).join('')}</div>
        <div class="phase-section-label">Supporting</div>
        <div class="chip-wrap">${p.supportTopics.map(t => { const link = p.topicLinks?.find(l => l.topic === t); return link ? `<a href="${link.url}" target="_blank" class="chip linked">${t} ↗</a>` : `<span class="chip">${t}</span>`; }).join('')}</div>
        <div class="phase-section-label">Daily Rhythm</div>
        <div class="practice-grid">
          <div class="practice-card"><div class="practice-card-title">Weekday</div><div class="practice-card-text">${p.weekday}</div></div>
          <div class="practice-card"><div class="practice-card-title">Weekend</div><div class="practice-card-text">${p.weekend}</div></div>
        </div>
        <div class="phase-section-label">Tips</div>
        <ul class="tip-list">${p.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="phase-section-label">Videos</div>
        <div class="resource-list">${p.videos.map(v => `<a href="${v.url}" target="_blank" class="resource-link video-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12l-10.5-6v12L23 12zM1 18h9V6H1v12z"/></svg>${v.text}</a>`).join('')}</div>
        <div class="phase-section-label">Resources</div>
        <div class="resource-list">${p.resources.map(r => `<a href="${r.url}" target="_blank" class="resource-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>${r.text}</a>`).join('')}</div>
      </div>`;
    div.querySelector('.phase-head').addEventListener('click', () => {
      const wasExpanded = div.classList.contains('expanded');
      div.classList.toggle('expanded', !wasExpanded);
    });
    list.appendChild(div);
  });
}

// ─── Tracker ─────────────────────────────────────────────
function renderTracker() {
  const todayKey = new Date().toISOString().slice(0,10);
  const todayLog = STATE.dailyLog[todayKey] || { solved: 0, contest: false };
  const contests = (STATE.contests || []).slice(-10).reverse();

  $('#tab-tracker').innerHTML = `
    <h1 class="page-title">Consistency Tracker</h1>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Log Today (${todayKey})</div>
      <div class="tracker-input-row">
        <div class="input-group"><label>Problems Solved</label><input type="number" id="logSolved" min="0" value="${todayLog.solved}"></div>
        <div class="input-group"><label>Contest?</label><select id="logContest"><option value="0" ${!todayLog.contest?'selected':''}>No</option><option value="1" ${todayLog.contest?'selected':''}>Yes</option></select></div>
        <button class="btn btn-primary" onclick="saveLog()">Save</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Update Rating</div>
      <div class="tracker-input-row">
        <div class="input-group"><label>Current Rating</label><input type="number" id="ratingInput" value="${STATE.currentRating}"></div>
        <button class="btn btn-primary" onclick="updateRating()">Update</button>
        ${STATE.cfHandle ? '<button class="btn btn-ghost" onclick="syncCF()">↻ Sync from CF</button>' : ''}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Contest History</div></div>
      ${contests.length ? `<table class="contest-table"><thead><tr><th>Date</th><th>Contest</th><th>Rank</th><th>Δ</th><th>Rating</th></tr></thead><tbody>
        ${contests.map(c => `<tr><td>${c.date}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</td><td>${c.rank}</td><td class="${c.ratingChange >= 0 ? 'rating-up' : 'rating-down'}">${c.ratingChange >= 0 ? '+' : ''}${c.ratingChange}</td><td>${c.newRating}</td></tr>`).join('')}
      </tbody></table>` : '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">No contests yet. Link your CF account or log manually.</div></div>'}
    </div>`;
}

window.saveLog = function() {
  const todayKey = new Date().toISOString().slice(0,10);
  const oldLog = STATE.dailyLog[todayKey] || { solved: 0, contest: false };
  const newSolved = parseInt($('#logSolved').value) || 0;
  const newContest = $('#logContest').value === '1';
  const addedProblems = Math.max(0, newSolved - (oldLog.solved || 0));
  STATE.dailyLog[todayKey] = { solved: newSolved, contest: newContest };
  saveState(STATE);
  if (addedProblems > 0) showXPToast(addedProblems * 10, `${addedProblems} problem${addedProblems > 1 ? 's' : ''} solved`);
  else if (newContest && !oldLog.contest) showXPToast(50, 'Contest logged');
  renderTracker();
  renderDashboard();
};

window.updateRating = function() {
  const r = parseInt($('#ratingInput').value);
  if (r >= 0 && r <= 4000) {
    STATE.currentRating = r;
    STATE.currentPhase = getPhaseForRating(r);
    saveState(STATE);
    renderAll();
  }
};

// ─── This Week ───────────────────────────────────────────
function renderThisWeek() {
  const phase = PHASES[STATE.currentPhase];
  const goals = STATE.weeklyGoals || [];
  const doneCount = goals.filter(g => g.done).length;

  $('#tab-thisweek').innerHTML = `
    <h1 class="page-title">This Week</h1>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="card-title">Weekly Goals</div>
        <span style="font-size:12px;color:var(--text-muted)">${doneCount}/${goals.length} done</span>
      </div>
      ${goals.length ? `<div class="progress-bar-wrap" style="margin-bottom:14px"><div class="progress-bar-fill" style="width:${goals.length ? (doneCount/goals.length*100) : 0}%"></div></div>` : ''}
      <div id="goalList">${goals.map((g,i) => `
        <div class="goal-item${g.done ? ' done' : ''}">
          <div class="goal-check${g.done ? ' checked' : ''}" onclick="toggleGoal(${i})"></div>
          <span class="goal-text">${esc(g.text)}</span>
          <button class="goal-delete" onclick="deleteGoal(${i})">×</button>
        </div>`).join('')}</div>
      ${!goals.length ? '<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-text">Add your goals for this week</div></div>' : ''}
      <div class="add-goal-row">
        <input id="newGoalInput" placeholder="Add a goal..." onkeydown="if(event.key==='Enter')addGoal()">
        <button class="btn btn-primary btn-sm" onclick="addGoal()">Add</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:10px">Suggested for Phase ${STATE.currentPhase + 1}: ${phase.label}</div>
      <ul class="tip-list">
        ${phase.tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
      <div style="margin-top:12px">
        <div class="practice-grid">
          <div class="practice-card"><div class="practice-card-title">Weekday Plan</div><div class="practice-card-text">${phase.weekday}</div></div>
          <div class="practice-card"><div class="practice-card-title">Weekend Plan</div><div class="practice-card-text">${phase.weekend}</div></div>
        </div>
      </div>
    </div>`;
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

window.addGoal = function() {
  const input = $('#newGoalInput');
  const text = input.value.trim();
  if (!text) return;
  if (!STATE.weeklyGoals) STATE.weeklyGoals = [];
  STATE.weeklyGoals.push({ text, done: false });
  saveState(STATE);
  input.value = '';
  renderThisWeek();
};

window.toggleGoal = function(i) {
  STATE.weeklyGoals[i].done = !STATE.weeklyGoals[i].done;
  saveState(STATE);
  renderThisWeek();
};

window.deleteGoal = function(i) {
  STATE.weeklyGoals.splice(i, 1);
  saveState(STATE);
  renderThisWeek();
};

// ─── Notes ───────────────────────────────────────────────
function renderNotes() {
  const notes = (STATE.notes || []).slice().reverse();
  $('#tab-notes').innerHTML = `
    <h1 class="page-title">Notes</h1>
    <div class="card">
      <div class="note-editor">
        <input id="noteTitle" placeholder="Title (e.g., Binary Search pattern)">
        <textarea id="noteContent" placeholder="Write your notes..."></textarea>
        <div style="display:flex;gap:8px">
          <select id="notePhase" style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:var(--font);font-size:13px;padding:8px 12px">
            <option value="-1">General</option>
            ${PHASES.map((p,i) => `<option value="${i}">Phase ${i+1}: ${p.label}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="saveNote()">Save Note</button>
        </div>
      </div>
    </div>
    ${notes.length ? notes.map(n => `
      <div class="note-card">
        <div class="note-card-head">
          <div class="note-card-title">${esc(n.title)}</div>
          <div class="note-card-date">${n.date}${n.phase >= 0 ? ` · Phase ${n.phase+1}` : ''}</div>
        </div>
        <div class="note-card-content">${esc(n.content)}</div>
        <div class="note-card-actions"><button class="note-delete-btn" onclick="deleteNote('${n.id}')">Delete</button></div>
      </div>`).join('') : '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">No notes yet</div></div>'}`;
}

window.saveNote = function() {
  const title = $('#noteTitle').value.trim();
  const content = $('#noteContent').value.trim();
  if (!title && !content) return;
  if (!STATE.notes) STATE.notes = [];
  STATE.notes.push({
    id: Date.now().toString(36),
    date: new Date().toISOString().slice(0,10),
    title: title || 'Untitled',
    content,
    phase: parseInt($('#notePhase').value)
  });
  saveState(STATE);
  renderNotes();
};

window.deleteNote = function(id) {
  STATE.notes = STATE.notes.filter(n => n.id !== id);
  saveState(STATE);
  renderNotes();
};

// ─── Resources ───────────────────────────────────────────
function renderResources() {
  let html = '<h1 class="page-title">Resources & Videos</h1>';
  PHASES.forEach((p, i) => {
    html += `<div class="resource-phase-section">
      <div class="resource-phase-title"><span class="resource-phase-dot" style="background:${p.color}"></span>Phase ${i+1}: ${p.label} — ${p.title}</div>
      <div class="card">
        <div class="phase-section-label">Videos</div>
        <div class="resource-list">${p.videos.map(v => `<a href="${v.url}" target="_blank" class="resource-link video-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>${v.text}</a>`).join('')}</div>
        <div class="phase-section-label" style="margin-top:14px">Links</div>
        <div class="resource-list">${p.resources.map(r => `<a href="${r.url}" target="_blank" class="resource-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>${r.text}</a>`).join('')}</div>
        ${p.topicLinks?.length ? `<div class="phase-section-label" style="margin-top:14px">Topic Deep-dives</div><div class="chip-wrap">${p.topicLinks.map(l => `<a href="${l.url}" target="_blank" class="chip linked">${l.topic} ↗</a>`).join('')}</div>` : ''}
      </div>
    </div>`;
  });
  $('#tab-resources').innerHTML = html;
}

// ─── Render All ──────────────────────────────────────────
function renderAll() {
  renderDashboard();
  renderRoadmap();
  renderTracker();
  renderThisWeek();
  renderNotes();
  renderResources();
}

// ─── Init ────────────────────────────────────────────────
initNav();
renderAll();
if (STATE.cfHandle) syncCF();
