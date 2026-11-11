(() => {
  "use strict";

  function speakTranslation() {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    // Stop any speech currently playing
    window.speechSynthesis.cancel();

    // Find the translated text box or fallback to input text
    const outBox =
      document.getElementById("tr-out") ||
      document.getElementById("tr-result") ||
      document.querySelector("[data-tr-out]") ||
      document.getElementById("tr-in");

    const text = outBox ? (outBox.value || outBox.innerText || "").trim() : "";

    if (!text || text === "Translation will appear here...") {
      alert("Nothing to read yet. Please translate some text first!");
      return;
    }

    // Get the selected target language (e.g., hi, es, fr, en)
    const langSelect =
      document.getElementById("tr-to") ||
      document.getElementById("targetLanguage");
    const langCode = langSelect && langSelect.value && langSelect.value !== "auto"
      ? langSelect.value
      : "en-US";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 1.0;

    // Pick a matching browser voice for the selected language if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
// Automatically remove the Creator Studio / Upload a Release section
    document.querySelectorAll("section, div").forEach((el) => {
      if (
        el.id === "creator" ||
        el.id === "upload" ||
        (el.tagName === "SECTION" && el.textContent.includes("UPLOAD A RELEASE"))
      ) {
        el.remove();
      }
    });

    // Also hide any top navigation link pointing to it
    document.querySelectorAll('a[href="#creator"], a[href="#upload"]').forEach((link) => {
      link.remove();
    });
  function initVoiceModule() {
    // 1. Automatically add the LISTEN button next to COPY if it isn't there yet
    const copyBtn = document.querySelector('[data-action="tr-copy"]');
    if (copyBtn && !document.querySelector('[data-action="tr-speak"]')) {
      const listenBtn = document.createElement("button");
      listenBtn.type = "button";
      listenBtn.className = "btn btn-primary btn-sm";
      listenBtn.setAttribute("data-action", "tr-speak");
      listenBtn.textContent = "🔊 LISTEN";
      copyBtn.parentNode.appendChild(listenBtn);
    }

    // 2. Listen for clicks on the LISTEN button
    document.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-action="tr-speak"], #speakBtn');
      if (btn) {
        e.preventDefault();
        speakTranslation();
      }
    });

    // Pre-load voices in the background for Chrome/Edge
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVoiceModule);
  } else {
    initVoiceModule();
  }
})();
