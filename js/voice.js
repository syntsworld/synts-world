(() => {
  "use strict";

  const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi (हिन्दी)" },
    { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
    { code: "ta", name: "Tamil (தமிழ்)" },
    { code: "te", name: "Telugu (తెలుగు)" },
    { code: "mr", name: "Marathi (मराठी)" },
    { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
    { code: "bn", name: "Bengali (বাংলা)" },
    { code: "gu", name: "Gujarati (ગુજરાતી)" },
    { code: "ml", name: "Malayalam (മലയാളം)" },
    { code: "ur", name: "Urdu (اردو)" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "ko", name: "Korean (한국어)" },
    { code: "ar", name: "Arabic (العربية)" },
    { code: "pt", name: "Portuguese (Português)" },
    { code: "ru", name: "Russian (Русский)" }
  ];

  // 1. POPULATE LANGUAGE DROPDOWNS IF EMPTY
  function ensureLanguagesPopulated() {
    const fromSelect = document.getElementById("tr-from");
    const toSelect = document.getElementById("tr-to");

    if (fromSelect && fromSelect.options.length === 0) {
      const autoOpt = document.createElement("option");
      autoOpt.value = "auto";
      autoOpt.textContent = "Auto Detect";
      fromSelect.appendChild(autoOpt);

      LANGUAGES.forEach((lang) => {
        const opt = document.createElement("option");
        opt.value = lang.code;
        opt.textContent = lang.name;
        fromSelect.appendChild(opt);
      });
      fromSelect.value = "auto";
    }

    if (toSelect && toSelect.options.length === 0) {
      LANGUAGES.forEach((lang) => {
        const opt = document.createElement("option");
        opt.value = lang.code;
        opt.textContent = lang.name;
        toSelect.appendChild(opt);
      });
      toSelect.value = "hi"; // Default to Hindi
    }
  }

  // 2. TRANSLATE FUNCTION (Fallback if main script crashed)
  async function runTranslation() {
    const inBox = document.getElementById("tr-input");
    const outBox = document.getElementById("tr-output");
    const fromSelect = document.getElementById("tr-from");
    const toSelect = document.getElementById("tr-to");

    if (!inBox || !outBox) return;
    const text = inBox.value.trim();
    if (!text) {
      outBox.textContent = "Please enter some lyrics to translate first.";
      return;
    }

    const sl = fromSelect && fromSelect.value ? fromSelect.value : "auto";
    const tl = toSelect && toSelect.value ? toSelect.value : "hi";

    outBox.textContent = "Translating...";

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
        sl
      )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      const translated = data[0].map((item) => item[0]).join("");
      outBox.textContent = translated || "Could not translate text.";
    } catch (err) {
      console.error("Translation error:", err);
      outBox.textContent = "Translation error. Please check your connection.";
    }
  }

  // 3. VOICE MODULE (Listen in selected language)
  function speakTranslation() {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const outBox = document.getElementById("tr-output");
    const inBox = document.getElementById("tr-input");
    let text = outBox ? outBox.innerText.trim() : "";

    if (
      !text ||
      text === "Translation will appear here." ||
      text === "Translating..." ||
      text === "Please enter some lyrics to translate first."
    ) {
      text = inBox ? inBox.value.trim() : "";
    }

    if (!text) {
      alert("Please enter or translate some lyrics first!");
      return;
    }

    const langSelect = document.getElementById("tr-to");
    const langCode = langSelect && langSelect.value ? langSelect.value : "en";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );
    if (matchedVoice) utterance.voice = matchedVoice;
// B. Update Top Navigation bar
    const nav = document.querySelector(".nav");
    if (nav) {
      nav.innerHTML = `
        <a href="#marketplace">LYRICS DIRECTORY</a>
        <a href="#lyrics">WRITE & TRANSLATE</a>
        <a href="#how">LICENSING</a>
      `;
    }

    // A. Remove old Creator Studio / Upload a Release section
    document.querySelectorAll("section").forEach((sec) => {
      if (sec.id === "studio" || sec.textContent.includes("UPLOAD A RELEASE")) {
        sec.remove();
      }
    });

    // B. Update Top Navigation bar
    const nav = document.querySelector(".nav");
    if (nav) {
      nav.innerHTML = `
        <a href="#marketplace">LYRICS DIRECTORY</a>
        <a href="#lyrics">WRITE & TRANSLATE</a>
        <a href="#how">LICENSING</a>
      `;
    }

    // C. Update Hero Section
    const heroSection = document.getElementById("home");
    if (heroSection) {
      const pill = heroSection.querySelector(".pill");
      if (pill) pill.innerHTML = `<span class="dot"></span> FOR CREATORS & SONGWRITERS`;

      const h1 = heroSection.querySelector("h1");
      if (h1) {
        h1.innerHTML = `SHOW YOUR CREATIVITY.<br><span class="gradient-text">MAKE YOUR ART REACH MILLIONS.</span>`;
      }

      const lead = heroSection.querySelector(".lead");
      if (lead) {
        lead.textContent =
          "Write original song lyrics, translate across languages with voice playback, and sell lyric licenses with transparent pricing in one systematic creator directory.";
      }

      const btns = heroSection.querySelector(".row.mt");
      if (btns) {
        btns.innerHTML = `
          <a href="#marketplace" class="btn btn-primary btn-lg">EXPLORE PROJECTS</a>
          <a href="#lyrics" class="btn btn-ghost btn-lg">WRITE & SELL LYRICS ↗</a>
        `;
      }

      const perks = heroSection.querySelector(".hero-perks");
      if (perks) {
        perks.innerHTML = `
          <span>✦ Systematic Creator Directory</span>
          <span>✦ Sell Lyric Licenses</span>
          <span>✦ Multi-Language Voice Studio</span>
        `;
      }

      const artText = heroSection.querySelector(".art-text");
      if (artText) artText.innerHTML = `OWN YOUR<br>WORDS.`;

      const heroCardTitle = heroSection.querySelector(".hero-art .row.between div div:nth-child(2)");
      if (heroCardTitle) heroCardTitle.textContent = "Licensed Lyrics & Projects";
    }

    // D. Update Marketplace into a Systematic Lyrics & Projects Directory
    const marketHead = document.querySelector("#marketplace .market-head div");
    if (marketHead) {
      marketHead.innerHTML = `
        <span class="eyebrow">// SYSTEMATIC CREATOR DIRECTORY</span>
        <h2 class="h2">PROJECTS & <span class="gradient-text">LYRIC LICENSES.</span></h2>
        <p class="lead">Browse ready-to-license song lyrics, hooks, and full songwriting projects with set prices.</p>
      `;
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.placeholder = "Search lyrics, projects, or writers...";
    }

    // E. Ensure 🔊 LISTEN & ⏹ STOP buttons exist inside the Translator
    const copyBtn = document.querySelector('#lyrics [data-action="tr-copy"]');
    if (copyBtn && !document.querySelector('#lyrics [data-action="tr-speak"]')) {
      const listenBtn = document.createElement("button");
      listenBtn.type = "button";
      listenBtn.className = "btn btn-primary btn-sm";
      listenBtn.setAttribute("data-action", "tr-speak");
      listenBtn.textContent = "🔊 LISTEN";

      const stopBtn = document.createElement("button");
      stopBtn.type = "button";
      stopBtn.className = "btn btn-soft btn-sm";
      stopBtn.setAttribute("data-action", "tr-stop");
      stopBtn.textContent = "⏹ STOP";

      copyBtn.parentNode.appendChild(listenBtn);
      copyBtn.parentNode.appendChild(stopBtn);
    }
  }

  // Bind click events once
  document.addEventListener("click", (e) => {
    const speakBtn = e.target.closest('[data-action="tr-speak"]');
    if (speakBtn) {
      e.preventDefault();
      speakTranslation();
    }

    const stopBtn = e.target.closest('[data-action="tr-stop"]');
    if (stopBtn) {
      e.preventDefault();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }

    const runBtn = e.target.closest('[data-action="tr-run"]');
    if (runBtn) {
      // Check after a tiny delay if the main script didn't handle translation
      setTimeout(() => {
        const outBox = document.getElementById("tr-output");
        if (outBox && outBox.textContent.trim() === "Translation will appear here.") {
          runTranslation();
        }
      }, 150);
    }

    const swapBtn = e.target.closest('[data-action="tr-swap"]');
    if (swapBtn) {
      const fromSelect = document.getElementById("tr-from");
      const toSelect = document.getElementById("tr-to");
      if (fromSelect && toSelect && fromSelect.value !== "auto") {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
      }
    }
  });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // Run at every lifecycle stage so dropdowns and text are always populated
  customizeCreatorSite();
  document.addEventListener("DOMContentLoaded", customizeCreatorSite);
  window.addEventListener("load", () => {
    customizeCreatorSite();
    setTimeout(customizeCreatorSite, 400);
  });
})();
