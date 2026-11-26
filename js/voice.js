(() => {
  "use strict";

  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let cachedVoices = [];

  const ROMAN_HINDI_URDU_WORDS = new Set([
    "dil", "pyaar", "pyar", "ishq", "yaar", "kya", "hai", "hain",
    "nahi", "nahin", "nhi", "mein", "main", "tum", "tu", "hum",
    "tera", "mera", "waqt", "raat", "subah", "zindagi", "khuda",
    "duniya", "sach", "jhoot", "bas", "ab", "phir", "ka", "ki",
    "ke", "se", "ko", "aur", "par", "pe", "bhi", "jo", "woh", "wo"
  ]);

  function loadVoices() {
    if (!synth) return [];
    const list = synth.getVoices();
    if (Array.isArray(list) && list.length > 0) {
      cachedVoices = list;
    }
    return cachedVoices;
  }

  function detectLyricMode(text, explicitLang = "") {
    const clean = String(text || "").trim();
    const tag = String(explicitLang || "").toLowerCase();

    if (tag.startsWith("ur")) return "urdu";
    if (tag.startsWith("hi-roman") || tag.startsWith("ur-roman") || tag === "hinglish") {
      return "roman-indic";
    }
    if (tag.startsWith("hi")) return "hindi";
    if (tag.startsWith("en")) return "english";

    // 1. Script checks first
    if (/[\u0900-\u097F]/.test(clean)) return "hindi";
    if (/[\u0600-\u06FF]/.test(clean)) return "urdu";

    // 2. Romanized Hindi / Urdu word & phonetic check
    const words = clean
      .toLowerCase()
      .replace(/[^a-z\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    let hits = 0;
    for (const w of words) {
      if (ROMAN_HINDI_URDU_WORDS.has(w)) hits += 1;
    }

    const phoneticMarkers =
      /\b(kh|gh|bh|dh|th|chh)\w*|\w*(aa|ee|oo)\w*/i.test(clean);

    if (hits >= 2 || (hits >= 1 && phoneticMarkers)) {
      return "roman-indic";
    }

    return "english";
  }

  function scoreVoice(voice, preferredLangs) {
    const lang = String(voice.lang || "").toLowerCase();
    const name = String(voice.name || "").toLowerCase();
    let score = 0;

    preferredLangs.forEach((target, idx) => {
      const t = target.toLowerCase();
      if (lang === t) score += (preferredLangs.length - idx) * 30;
      else if (lang.startsWith(t.split("-")[0])) {
        score += (preferredLangs.length - idx) * 15;
      }
    });

    // Favor smoother / non-legacy voices over basic local defaults
    if (!voice.localService) score += 20;
    if (/natural|neural|online|google|india|indian/i.test(name)) score += 12;
    if (/david|zira|espeak|festival|legacy/i.test(name)) score -= 15;

    return score;
  }

  function pickVoiceForMode(mode) {
    const voices = loadVoices();
    if (!voices.length) return null;

    const chains = {
      hindi: ["hi-IN", "hi", "en-IN", "en"],
      urdu: ["ur-PK", "ur-IN", "ur", "hi-IN", "hi", "en-IN", "en"],
      "roman-indic": ["en-IN", "hi-IN", "hi", "en-US", "en-GB", "en"],
      english: ["en-IN", "en-GB", "en-US", "en"]
    };

    const preferred = chains[mode] || chains.english;
    const ranked = [...voices].sort(
      (a, b) => scoreVoice(b, preferred) - scoreVoice(a, preferred)
    );

    return ranked[0] || voices[0];
  }

  function speakText(text, options = {}) {
    if (!synth || !String(text || "").trim()) return;

    synth.cancel();

    const mode = detectLyricMode(text, options.lang);
    const chosenVoice = pickVoiceForMode(mode);

    const utterance = new SpeechSynthesisUtterance(String(text).trim());
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    // Keep rate and pitch in a natural range to avoid robotic clipping
    utterance.rate =
      typeof options.rate === "number"
        ? Math.min(Math.max(options.rate, 0.75), 1.2)
        : mode === "roman-indic"
        ? 0.94
        : 0.97;

    utterance.pitch =
      typeof options.pitch === "number"
        ? Math.min(Math.max(options.pitch, 0.8), 1.2)
        : 1.0;

    if (typeof options.onEnd === "function") {
      utterance.onend = options.onEnd;
    }

    synth.speak(utterance);
  }

  function stopSpeaking() {
    if (synth) synth.cancel();
  }

  loadVoices();
  if (synth && "onvoiceschanged" in synth) {
    synth.onvoiceschanged = loadVoices;
  }

  window.SyntsVoice = {
    speak: speakText,
    stop: stopSpeaking,
    detectMode: detectLyricMode,
    getVoices: loadVoices
  };
})();
