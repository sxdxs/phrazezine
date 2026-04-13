const Translate = {
  apiKey: '06b5458d-7db6-4f61-9e56-c66e140829e0:fx',
  baseURL: 'https://api-free.deepl.com/v2/translate',

  async translate(text, targetLang) {
    const res = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`
      },
      body: JSON.stringify({ text: [text], target_lang: targetLang.toUpperCase() })
    });
    if (!res.ok) throw new Error(`DeepL error ${res.status}`);
    const data = await res.json();
    return data.translations?.[0]?.text || '';
  }
};
