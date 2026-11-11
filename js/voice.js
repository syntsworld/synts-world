(() => {
  "use strict";

  let currentAudio = null;
  let isSpeaking = false;

  const LANG_NAMES = {
    en: "English", hi: "Hindi", kn: "Kannada", ta: "Tamil", te: "Telugu",
    mr: "Marathi", pa: "Punjabi", ur: "Urdu", bn: "Bengali", gu: "Gujarati",
    ml: "Malayalam", ar: "Arabic", fa: "Persian", es: "Spanish", fr: "French",
    de: "German", pt: "Portuguese", it: "Italian", tr: "Turkish", ru: "Russian",
    ja: "Japanese", ko: "Korean", "zh-CN": "Chinese"
  };

  function showToast(msg, isErr = false) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle("error", isErr);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4000);
  }

  function stopAllVoice() {
    isSpeaking = false;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
    const oldFrame = document.getElementById("tts-hidden-frame");
    if (oldFrame) oldFrame.remove();

    const playBtn = document.getElementById("play-btn");
    if (playBtn) playBtn.textContent = "▶";
    const stateEl = document.getElementById("player-state");
    if (stateEl) stateEl.textContent = "VOICE READY";
  }

  function playMultiLangVoice(rawText, langCode) {
    stopAllVoice();

    const cleanText = (rawText || "").replace(/\[[^\]]*\]/g, "").trim();
    if (!cleanText) {
      showToast("Please translate or enter some lyrics first to listen!", true);
      return;
    }

    const lang = (langCode && langCode !== "auto") ? langCode : "en";
    const langLabel = LANG_NAMES[lang] || lang;

    isSpeaking = true;
    const playBtn = document.getElementById("play-btn");
    if (playBtn) playBtn.textContent = "❚❚";
    const titleEl = document.getElementById("player-title");
    if (titleEl) titleEl.textContent = "Speaking (" + langLabel + ")";
    const stateEl = document.getElementById("player-state");
    if (stateEl) stateEl.textContent = "🔊 PLAYING: " + langLabel.toUpperCase();

    showToast("🔊 Playing voice in " + langLabel + "...");

    // Split text into safe 150-character phrases
    const chunks = cleanText.match(/.{1,150}(\s|$)|.{1,150}/g) || [cleanText];
    let idx = 0;

    // Check if the user's OS/browser actually has a native voice for this exact language
    const voices = ("speechSynthesis" in window) ? window.speechSynthesis.getVoices() : [];
    const exactNativeVoice = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace("_", "-");
      const target = lang.toLowerCase();
      return vLang === target || vLang.startsWith(target + "-");
    });

    // Strategy 1: If OS has a real native voice for this exact language (e.g. en, hi), use it
    if (exactNativeVoice && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(cleanText);
      u.voice = exactNativeVoice;
      u.lang = exactNativeVoice.lang;
      u.rate = 0.95;
      u.onend = () => stopAllVoice();
      u.onerror = () => streamCloudChunks();
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(u);
      return;
    }

    // Strategy 2: Stream Cloud TTS Audio for all other languages (Kannada, Tamil, Telugu, Urdu, Punjabi, etc.)
    function streamCloudChunks() {
      if (!isSpeaking || idx >= chunks.length) {
        stopAllVoice();
        return;
      }
      const chunk = chunks[idx++].trim();
      if (!chunk) return streamCloudChunks();

      const ttsUrls = [
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`,
        `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(chunk)}&le=${encodeURIComponent(lang)}`
      ];

      let urlIndex = 0;

      function tryNextUrl() {
        if (!isSpeaking) return;
        if (urlIndex >= ttsUrls.length) {
          // Strategy 3: Sandboxed iframe audio player (bypasses strict Referer blocks)
          playViaIframe(ttsUrls[0], chunk.length);
          return;
        }

        const audio = new Audio();
        currentAudio = audio;
        const volEl = document.getElementById("volume");
        audio.volume = volEl ? Number(volEl.value) : 0.9;
        audio.src = ttsUrls[urlIndex++];

        audio.onended = () => streamCloudChunks();
        audio.onerror = () => tryNextUrl();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => tryNextUrl());
        }
      }

      tryNextUrl();
    }

    function playViaIframe(url, charCount) {
      let frame = document.getElementById("tts-hidden-frame");
      if (frame) frame.remove();
      frame = document.createElement("iframe");
      frame.id = "tts-hidden-frame";
      frame.style.display = "none";
      frame.referrerPolicy = "no-referrer";
      frame.src = url;
      document.body.appendChild(frame);

      const estDurationMs = Math.max(2500, charCount * 95);
      setTimeout(() => {
        if (isSpeaking) streamCloudChunks();
      }, estDurationMs);
    }

    streamCloudChunks();
  }

  // Intercept clicks on 🔊 LISTEN, 🔊 READ LYRICS, and ⏹ STOP in capture phase so voice.js always handles them
  document.addEventListener("click", (e) => {
    const speakBtn = e.target.closest('[data-action="tr-speak"]');
    if (speakBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const outBox = document.getElementById("tr-output");
      const inBox = document.getElementById("tr-input");
      const toSelect = document.getElementById("tr-to");
      const fromSelect = document.getElementById("tr-from");

      let text = outBox ? outBox.innerText.trim() : "";
      let lang = toSelect ? toSelect.value : "hi";

      if (!text || text === "Translation will appear here." || text === "Translating...") {
        text = inBox ? inBox.value.trim() : "";
        if (fromSelect && fromSelect.value !== "auto") lang = fromSelect.value;
      }

      playMultiLangVoice(text, lang);
      return;
    }

    const noteSpeakBtn = e.target.closest('[data-action="speak-notepad"]');
    if (noteSpeakBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const noteText = document.getElementById("lyrics-text")?.value || "";
      const fromSelect = document.getElementById("tr-from");
      const lang = (fromSelect && fromSelect.value !== "auto") ? fromSelect.value : "en";
      playMultiLangVoice(noteText, lang);
      return;
    }

    const stopBtn = e.target.closest('[data-action="tr-stop"]');
    if (stopBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      stopAllVoice();
      showToast("Voice playback stopped.");
    }
  }, true);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
})();
