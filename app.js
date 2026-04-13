seedIfNeeded();

const App = {
  activeTab: 'library',
  activeCategoryFilter: null,
  searchQuery: '',
  selectedColor: '#4F46E5',
  fcStartLang: 'en',
  session: null,
  sessionTimer: null,
  sessionSeconds: 0,
  touchStartX: 0,
  touchStartY: 0,

  init() {
    this.bindNav();
    this.bindLibrary();
    this.bindCategories();
    this.bindFlashcards();
    this.bindModals();
    this.renderAll();
  },

  renderAll() {
    const phrases = this.filteredPhrases();
    const categories = DB.getCategories();
    const sessions = DB.getSessions();
    UI.renderPhraseList(phrases, categories);
    UI.renderCategoryFilters(categories, this.activeCategoryFilter);
    UI.renderCategoryList(categories, DB.getPhrases());
    UI.renderStats(DB.getPhrases(), sessions);
    UI.populateCategorySelect('input-category', categories, null);
    UI.populateFCCategorySelect(categories);
    this.updateFCCount();
  },

  filteredPhrases() {
    let p = DB.getPhrases();
    if (this.activeCategoryFilter) p = p.filter(x => x.categoryId === this.activeCategoryFilter);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      p = p.filter(x => x.english.toLowerCase().includes(q) || x.french.toLowerCase().includes(q));
    }
    return p;
  },

  bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.activeTab = tab;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === `tab-${tab}`));
        if (tab === 'stats') UI.renderStats(DB.getPhrases(), DB.getSessions());
      });
    });
  },

  bindLibrary() {
    document.getElementById('search-input').addEventListener('input', e => {
      this.searchQuery = e.target.value;
      UI.renderPhraseList(this.filteredPhrases(), DB.getCategories());
    });

    document.getElementById('category-filters').addEventListener('click', e => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      this.activeCategoryFilter = pill.dataset.cat || null;
      UI.renderCategoryFilters(DB.getCategories(), this.activeCategoryFilter);
      UI.renderPhraseList(this.filteredPhrases(), DB.getCategories());
    });

    document.getElementById('phrase-list').addEventListener('click', e => {
      const speakBtn = e.target.closest('.speak-btn-sm');
      if (speakBtn) { e.stopPropagation(); Speech.speak(speakBtn.dataset.text, speakBtn.dataset.lang); return; }
      const item = e.target.closest('.phrase-item');
      if (item) this.openPhraseModal(item.dataset.id);
    });

    document.getElementById('add-phrase-btn').addEventListener('click', () => this.openPhraseModal(null));

    document.getElementById('export-btn').addEventListener('click', () => {
      const text = UI.exportText(DB.getPhrases(), DB.getCategories());
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `PhraseZine_${new Date().toISOString().slice(0,10)}.txt`;
      a.click(); URL.revokeObjectURL(url);
    });
  },

  bindCategories() {
    document.getElementById('add-category-btn').addEventListener('click', () => {
      this.selectedColor = UI.COLORS[0];
      UI.renderColorPicker(this.selectedColor);
      document.getElementById('cat-name').value = '';
      document.getElementById('category-modal').classList.remove('hidden');
    });

    document.getElementById('category-list').addEventListener('click', e => {
      const del = e.target.closest('.cat-delete');
      if (del && confirm('Delete this category?')) {
        DB.deleteCategory(del.dataset.id);
        this.renderAll();
      }
    });

    document.getElementById('color-picker').addEventListener('click', e => {
      const sw = e.target.closest('.color-swatch');
      if (!sw) return;
      this.selectedColor = sw.dataset.color;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === this.selectedColor));
    });

    document.getElementById('save-category-btn').addEventListener('click', () => {
      const name = document.getElementById('cat-name').value.trim();
      if (!name) return;
      DB.addCategory({ name, color: this.selectedColor });
      document.getElementById('category-modal').classList.add('hidden');
      this.renderAll();
    });
  },

  bindFlashcards() {
    document.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.fcStartLang = btn.dataset.lang;
        this.updateFCCount();
      });
    });

    document.getElementById('fc-category-select').addEventListener('change', () => this.updateFCCount());

    document.getElementById('start-session-btn').addEventListener('click', () => this.startSession());
    document.getElementById('end-session-btn').addEventListener('click', () => this.endSession(true));
    document.getElementById('done-session-btn').addEventListener('click', () => this.endSession(false));
    document.getElementById('next-card-btn').addEventListener('click', () => this.nextCard());
    document.getElementById('speak-btn').addEventListener('click', () => this.speakCurrent());

    const card = document.getElementById('flashcard');
    card.addEventListener('click', () => card.classList.toggle('flipped'));

    card.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    card.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        this.nextCard();
      }
    });
  },

  updateFCCount() {
    const catId = document.getElementById('fc-category-select').value;
    const phrases = catId === 'all' ? DB.getPhrases() : DB.getPhrases().filter(p => p.categoryId === catId);
    document.getElementById('fc-count').textContent = `${phrases.length} phrase${phrases.length !== 1 ? 's' : ''} available`;
    document.getElementById('start-session-btn').disabled = phrases.length === 0;
  },

  startSession() {
    const catId = document.getElementById('fc-category-select').value;
    const all = catId === 'all' ? DB.getPhrases() : DB.getPhrases().filter(p => p.categoryId === catId);
    const phrases = [...all].sort(() => Math.random() - 0.5);
    const catName = catId !== 'all' ? DB.getCategories().find(c => c.id === catId)?.name : null;
    this.session = { phrases, index: 0, lang: this.fcStartLang, catName };
    this.sessionSeconds = 0;
    document.getElementById('flashcard-setup').classList.add('hidden');
    document.getElementById('flashcard-session').classList.remove('hidden');
    document.getElementById('session-complete').classList.add('hidden');
    document.getElementById('card-container').style.display = '';
    document.querySelector('.card-actions').style.display = '';
    document.querySelector('.card-hint').style.display = '';
    clearInterval(this.sessionTimer);
    this.sessionTimer = setInterval(() => {
      this.sessionSeconds++;
      const m = String(Math.floor(this.sessionSeconds/60)).padStart(2,'0');
      const s = String(this.sessionSeconds%60).padStart(2,'0');
      document.getElementById('session-timer').textContent = `${m}:${s}`;
    }, 1000);
    this.renderCard();
  },

  renderCard() {
    const { phrases, index, lang } = this.session;
    if (index >= phrases.length) { this.showComplete(); return; }
    const p = phrases[index];
    document.getElementById('session-progress').textContent = `${index + 1} / ${phrases.length}`;
    document.getElementById('progress-fill').style.width = `${(index / phrases.length) * 100}%`;
    document.getElementById('card-front-flag').textContent = lang === 'en' ? '🇬🇧' : '🇫🇷';
    document.getElementById('card-front-text').textContent = lang === 'en' ? p.english : p.french;
    document.getElementById('card-back-flag').textContent = lang === 'en' ? '🇫🇷' : '🇬🇧';
    document.getElementById('card-back-text').textContent = lang === 'en' ? p.french : p.english;
    document.getElementById('flashcard').classList.remove('flipped');
  },

  nextCard() {
    const p = this.session.phrases[this.session.index];
    DB.updatePhrase(p.id, { studyCount: (p.studyCount || 0) + 1, lastStudied: new Date().toISOString() });
    this.session.index++;
    this.renderCard();
  },

  speakCurrent() {
    const { phrases, index, lang } = this.session;
    const p = phrases[index];
    if (!p) return;
    const isFlipped = document.getElementById('flashcard').classList.contains('flipped');
    const speakLang = isFlipped ? (lang === 'en' ? 'fr' : 'en') : lang;
    const text = speakLang === 'en' ? p.english : p.french;
    Speech.speak(text, speakLang);
  },

  showComplete() {
    clearInterval(this.sessionTimer);
    const m = String(Math.floor(this.sessionSeconds/60)).padStart(2,'0');
    const s = String(this.sessionSeconds%60).padStart(2,'0');
    document.getElementById('card-container').style.display = 'none';
    document.querySelector('.card-actions').style.display = 'none';
    document.querySelector('.card-hint').style.display = 'none';
    document.getElementById('session-complete').classList.remove('hidden');
    document.getElementById('complete-summary').textContent = `You reviewed ${this.session.phrases.length} phrases in ${m}:${s}.`;
    DB.addSession({ durationSeconds: this.sessionSeconds, phrasesReviewed: this.session.phrases.length, categoryName: this.session.catName });
  },

  endSession(confirm_end) {
    clearInterval(this.sessionTimer);
    if (confirm_end && this.session && this.session.index > 0) {
      DB.addSession({ durationSeconds: this.sessionSeconds, phrasesReviewed: this.session.index, categoryName: this.session.catName });
    }
    this.session = null;
    document.getElementById('flashcard-session').classList.add('hidden');
    document.getElementById('flashcard-setup').classList.remove('hidden');
    UI.renderStats(DB.getPhrases(), DB.getSessions());
  },

  openPhraseModal(id) {
    const phrase = id ? DB.getPhrases().find(p => p.id === id) : null;
    document.getElementById('phrase-id').value = id || '';
    document.getElementById('modal-title').textContent = phrase ? 'Edit Phrase' : 'New Phrase';
    document.getElementById('input-english').value = phrase?.english || '';
    document.getElementById('input-french').value = phrase?.french || '';
    document.getElementById('input-notes').value = phrase?.notes || '';
    document.getElementById('en-validation').classList.add('hidden');
    document.getElementById('fr-validation').classList.add('hidden');
    UI.populateCategorySelect('input-category', DB.getCategories(), phrase?.categoryId || null);
    document.getElementById('phrase-modal').classList.remove('hidden');
  },

  bindModals() {
    document.querySelectorAll('.modal-backdrop, .modal-close').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
      });
    });

    const enInput = document.getElementById('input-english');
    const frInput = document.getElementById('input-french');

    enInput.addEventListener('input', () => {
      Validate.debounce('en', enInput.value, 'en', result => UI.showValidation('en-validation', result));
    });
    frInput.addEventListener('input', () => {
      Validate.debounce('fr', frInput.value, 'fr', result => UI.showValidation('fr-validation', result));
    });

    document.querySelectorAll('.speak-inline').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        const text = lang === 'en' ? enInput.value : frInput.value;
        if (text) Speech.speak(text, lang);
      });
    });

    document.getElementById('translate-to-fr').addEventListener('click', async () => {
      const text = enInput.value.trim();
      if (!text) return;
      const btn = document.getElementById('translate-to-fr');
      btn.textContent = 'Translating...'; btn.classList.add('loading');
      try { frInput.value = await Translate.translate(text, 'FR'); } catch(e) { alert('Translation failed: ' + e.message); }
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Translate to French (DeepL)`;
      btn.classList.remove('loading');
    });

    document.getElementById('translate-to-en').addEventListener('click', async () => {
      const text = frInput.value.trim();
      if (!text) return;
      const btn = document.getElementById('translate-to-en');
      btn.textContent = 'Translating...'; btn.classList.add('loading');
      try { enInput.value = await Translate.translate(text, 'EN'); } catch(e) { alert('Translation failed: ' + e.message); }
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Translate to English (DeepL)`;
      btn.classList.remove('loading');
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.use-correction');
      if (!btn) return;
      const target = btn.dataset.target;
      const value = btn.dataset.value;
      if (target === 'en-validation') { enInput.value = value; }
      if (target === 'fr-validation') { frInput.value = value; }
      document.getElementById(target).classList.add('hidden');
    });

    document.getElementById('save-phrase-btn').addEventListener('click', () => {
      const english = enInput.value.trim();
      const french = frInput.value.trim();
      if (!english || !french) { alert('Please fill in both English and French.'); return; }
      const id = document.getElementById('phrase-id').value;
      const data = { english, french, notes: document.getElementById('input-notes').value.trim(), categoryId: document.getElementById('input-category').value || null };
      if (id) { DB.updatePhrase(id, data); } else { DB.addPhrase(data); }
      document.getElementById('phrase-modal').classList.add('hidden');
      this.renderAll();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
