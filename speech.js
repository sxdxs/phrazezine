const Speech = {
  speak(text, lang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  },
  stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
};
