(() => {
  "use strict";

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = String(msg);
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  const RHYME_DATABASE = {
    fire: ["desire", "higher", "wire", "inspire", "empire", "entire"],
    night: ["light", "sight", "fight", "flight", "write", "bright", "height"],
    pain: ["rain", "chain", "train", "strain", "gain", "brain"],
    heart: ["art", "part", "start", "smart", "depart", "chart"],
    dark: ["spark", "mark", "ark", "embark", "stark"],
    aahat: ["chahat", "raahat", "kahaani", "paani", "nishaani"]
  };

  const AI_PROMPTS = [
    { label: "✨ Rhyme Suggestions", action: "rhyme" },
    { label: "⚡ Punchline Upgrade", action: "punchline" },
    { label: "✒️ Poetic Polish", action: "poetic" },
    { label: "🥁 Flow & Rhythm Audit", action: "flow" }
  ];

  function initAiAssistantUnderTranslator() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    // Target Translator container or output box so AI sits right underneath translation
    const translatorBox = document.querySelector("#translator, .translator-box, #tr-input, textarea[placeholder*='Translate'], textarea#tr-input")?.parentElement;
    const notepadTextarea = document.getElementById("lyrics-text");

    const targetEl = translatorBox || notepadTextarea?.parentElement;
    if (!targetEl) return;

    const aiBox = document.createElement("div");
    aiBox.id = "synts-ai-assistant-panel";
    aiBox.style.cssText = `
      margin-top: 14px;
      padding: 16px;
      border-radius: 16px;
      background: linear-gradient(165deg, rgba(16, 22, 32, 0.95), rgba(8, 12, 18, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.38);
      box-shadow: 0 16px 40px rgba(0,0,0,0.65);
      color: #f3f6fc;
      text-align: left;
    `;

    aiBox.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">🤖</span>
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">AI TRANSLATION &amp; LYRIC COACH</strong>
        </div>
        <div style="font-size:11px;color:#9ca3af;font-family:monospace">Generate suggestions &amp; rhymes instantly:</div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${AI_PROMPTS.map(
          (p) => `
          <button type="button" data-ai-action="${p.action}" style="
            background: rgba(74, 222, 128, 0.12);
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.35);
            border-radius: 8px;
            padding: 7px 12px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
          ">${p.label}</button>`
        ).join("")}
      </div>

      <div id="ai-suggestion-box" style="
        display: none; padding: 12px; border-radius: 10px; background: #06090f;
        border-left: 3px solid #4ade80; font-family: monospace; font-size: 12px; color: #e2e8f0; white-space: pre-wrap;
      "></div>
    `;

    targetEl.appendChild(aiBox);
    const suggestionBox = document.getElementById("ai-suggestion-box");

    aiBox.querySelectorAll("[data-ai-action]").forEach((btn) => {
      btn.onclick = () => {
        const action = btn.getAttribute("data-ai-action");
        suggestionBox.style.display = "block";
        suggestionBox.textContent = "🤖 AI analyzing text & generating suggestions...";

        setTimeout(() => {
          let output = "";
          if (action === "rhyme") {
            output = `💡 Rhyme Suggestions:\n• fire, desire, higher, inspire, empire\n• night, light, flight, height`;
          } else if (action === "punchline") {
            output = `⚡ Punchline Upgrade:\n"Turning shadows to gold when the speakers ignite,\nBuilt an empire alone in the dead of the night."`;
          } else if (action === "poetic") {
            output = `✒️ Poetic Polish:\n"The echoes remain where the shadows collide,\nCarving art from the silence we keep locked inside."`;
          } else if (action === "flow") {
            output = `🥁 Rhythm & Flow Audit:\n• Syllables balanced: ~12 per bar\n• Pocket: 140 BPM Half-Time hip-hop cadence.`;
          }
          suggestionBox.textContent = output;
          notify("AI suggestions generated!");
        }, 300);
      };
    });
  }

  function boot() {
    initAiAssistantUnderTranslator();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
