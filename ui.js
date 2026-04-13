const UI = {
  COLORS: ['#4F46E5','#0EA5E9','#16A34A','#DC2626','#D97706','#9333EA','#EC4899','#0D9488'],

  renderPhraseList(phrases, categories) {
    const list = document.getElementById('phrase-list');
    if (phrases.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>No phrases yet. Tap + to add one!</p></div>`;
      return;
    }
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    list.innerHTML = phrases.map(p => {
      const cat = catMap[p.categoryId];
      const badge = cat ? `<span class="phrase-cat-badge" style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>` : '';
      return `<div class="phrase-item" data-id="${p.id}">
        <div class="phrase-item-text">
          <div class="phrase-en">${this.esc(p.english)}</div>
          <div class="phrase-fr">${this.esc(p.french)}</div>
          ${badge}
        </div>
        <div class="phrase-actions">
          <button class="speak-btn-sm" data-text="${this.esc(p.english)}" data-lang="en" title="Speak English">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
          <button class="speak-btn-sm" data-text="${this.esc(p.french)}" data-lang="fr" title="Speak French">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  },

  renderCategoryFilters(categories, active) {
    const el = document.getElementById('category-filters');
    el.innerHTML = `<button class="pill ${!active ? 'active' : ''}" data-cat="">All</button>` +
      categories.map(c => `<button class="pill ${active === c.id ? 'active' : ''}" data-cat="${c.id}" style="${active===c.id?`background:${c.color};border-color:${c.color};color:#fff`:''}">${this.esc(c.name)}</button>`).join('');
  },

  renderCategoryList(categories, phrases) {
    const list = document.getElementById('category-list');
    if (categories.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>No categories yet. Tap + to create one.</p></div>`;
      return;
    }
    list.innerHTML = categories.map(c => {
      const count = phrases.filter(p => p.categoryId === c.id).length;
      return `<div class="category-item">
        <div class="cat-dot" style="background:${c.color}"></div>
        <div class="cat-name">${this.esc(c.name)}</div>
        <div class="cat-count">${count} phrase${count !== 1 ? 's' : ''}</div>
        <button class="cat-delete" data-id="${c.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
    }).join('');
  },

  renderStats(phrases, sessions) {
    const totalStudy = sessions.reduce((s, x) => s + (x.durationSeconds || 0), 0);
    const totalReviews = phrases.reduce((s, p) => s + (p.studyCount || 0), 0);
    const fmt = s => { const m = Math.floor(s/60), sec = s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; };
    const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
    document.getElementById('stats-content').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Total phrases</div><div class="stat-value">${phrases.length}</div></div>
        <div class="stat-card"><div class="stat-label">Total reviews</div><div class="stat-value">${totalReviews}</div></div>
        <div class="stat-card"><div class="stat-label">Study time</div><div class="stat-value">${fmt(totalStudy)}</div></div>
        <div class="stat-card"><div class="stat-label">Sessions</div><div class="stat-value">${sessions.length}</div></div>
      </div>
      <div class="section-title">Recent sessions</div>
      ${sessions.slice(0,10).map(s => `
        <div class="session-item">
          <div class="session-row">
            <span class="session-date">${fmtDate(s.date)}</span>
            <span class="session-dur">${fmt(s.durationSeconds||0)}</span>
          </div>
          <div class="session-meta">${s.phrasesReviewed} phrases reviewed${s.categoryName ? ' · ' + s.categoryName : ''}</div>
        </div>`).join('') || '<p style="color:var(--text-3);font-size:14px">No sessions yet.</p>'}`;
  },

  populateCategorySelect(selectId, categories, selectedId) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = `<option value="">None</option>` + categories.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.esc(c.name)}</option>`).join('');
  },

  populateFCCategorySelect(categories) {
    const sel = document.getElementById('fc-category-select');
    sel.innerHTML = `<option value="all">All Phrases</option>` + categories.map(c => `<option value="${c.id}">${this.esc(c.name)}</option>`).join('');
  },

  showValidation(elId, result) {
    const el = document.getElementById(elId);
    if (!result || result.ok) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.className = 'validation-banner ' + (result.ok ? 'ok' : 'error');
    el.innerHTML = result.ok
      ? 'Looks correct!'
      : `${this.esc(result.explanation)}${result.corrected ? `<br><span class="correction">Suggestion: ${this.esc(result.corrected)}</span><br><button class="use-correction" data-target="${elId}" data-value="${this.esc(result.corrected)}">Use this</button>` : ''}`;
  },

  renderColorPicker(selectedColor) {
    document.getElementById('color-picker').innerHTML = this.COLORS.map(c =>
      `<div class="color-swatch ${c === selectedColor ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`
    ).join('');
  },

  exportText(phrases, categories) {
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const grouped = {};
    phrases.forEach(p => {
      const key = catMap[p.categoryId]?.name || 'Uncategorized';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    let out = `PhraseZine Export\nGenerated: ${new Date().toLocaleString()}\nTotal: ${phrases.length} phrases\n\n`;
    for (const key of Object.keys(grouped).sort()) {
      out += `[${key.toUpperCase()}]\n\n`;
      grouped[key].forEach(p => { out += `FR: ${p.french}\nEN: ${p.english}\n${p.notes ? `    Note: ${p.notes}\n` : ''}\n`; });
      out += '-'.repeat(50) + '\n\n';
    }
    return out;
  },

  esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
};
