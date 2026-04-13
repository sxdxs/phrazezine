const Validate = {
  timers: {},

  async check(text, lang) {
    if (text.trim().length < 3) return null;
    const langCode = lang === 'fr' ? 'fr' : 'en-US';
    const body = new URLSearchParams({ text, language: langCode, enabledOnly: 'false' });
    const res = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', body });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.matches || data.matches.length === 0) return { ok: true };

    let corrected = text;
    const sorted = [...data.matches].filter(m => m.replacements.length > 0).sort((a,b) => b.offset - a.offset);
    for (const m of sorted) {
      corrected = corrected.slice(0, m.offset) + m.replacements[0].value + corrected.slice(m.offset + m.length);
    }
    const explanation = data.matches.map(m => m.message).join(' · ');
    return { ok: false, corrected: corrected !== text ? corrected : null, explanation };
  },

  debounce(key, text, lang, callback) {
    clearTimeout(this.timers[key]);
    if (text.trim().length < 3) { callback(null); return; }
    this.timers[key] = setTimeout(async () => {
      const result = await this.check(text, lang);
      callback(result);
    }, 900);
  }
};
