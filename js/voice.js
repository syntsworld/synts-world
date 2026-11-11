(() => {
  "use strict";

  // 1. VOICE MODULE (Listen in different translated languages)
  function speakTranslation() {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const outBox = document.getElementById("tr-output");
    const inBox = document.getElementById("tr-input");
    let text = outBox ? outBox.innerText.trim() : "";

    if (!text || text === "Translation will appear here." || text === "Translating...") {
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

    window.speechSynthesis.speak(utterance);
  }

  // 2. REBRAND HERO, DIRECTORY & REMOVE OLD AUDIO UPLOAD STUDIO
  function customizeCreatorSite() {
    // A. Remove old Creator Studio / Upload a Release section
    document.querySelectorAll("section").forEach((sec) => {
      if (sec.id === "studio" || sec.textContent.includes("UPLOAD A RELEASE")) {
        sec.remove();
      }
    });

    // B. Update Top Navigation bar for Lyrics Directory & Licensing
    const nav = document.querySelector(".nav");
    if (nav) {
      nav.innerHTML = `
        <a href="#marketplace">LYRICS DIRECTORY</a>
        <a href="#lyrics">WRITE & TRANSLATE</a>
        <a href="#how">LICENSING</a>
      `;
    }

    // C. Update Hero Section ("Show your creativity and make your art reach millions")
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

    // E. Ensure 🔊 LISTEN & ⏹ STOP buttons are inside the Translator
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

    // Bind click events for LISTEN and STOP
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
    });

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", customizeCreatorSite);
  } else {
    customizeCreatorSite();
  }
})();
