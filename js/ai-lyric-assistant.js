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

  function initLiveContextualCoach() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    const targetEl = document.querySelector("#translator, .translator-box, #tr-input")?.parentElement || document.getElementById("lyrics-text")?.parentElement;
    if (!targetEl) return;

    const box = document.createElement("div");
    box.id = "synts-ai-assistant-panel";
    box.style.cssText = `
      margin-top: 14px;
      padding: 16px;
      border-radius: 16px;
      background: linear-gradient(165deg, rgba(16, 22, 32, 0.95), rgba(8, 12, 18, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.38);
      box-shadow: 0 16px 40px rgba(0,0,0,0.65);
      color: #f3f6fc;
      text-align: left;
    `;

    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">🧠</span>
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">LIVE CONTEXTUAL STORY &amp; STRUCTURE COACH</strong>
        </div>
        <div style="font-size:11px;color:#9ca3af;font-family:monospace">Reads your notepad text and suggests what structure comes next:</div>
      </div>

      <div style="margin-bottom:10px">
        <button type="button" id="analyze-notepad-btn" style="
          background: #4ade80; color: #041208; border: none; border-radius: 9px;
          padding: 9px 16px; font-family: monospace; font-size: 11px; font-weight: 800; cursor: pointer;
        ">⚡ SUGGEST NEXT STRUCTURE BASED ON MY TEXT</button>
      </div>

      <div id="ai-dynamic-output" style="
        display: none; padding: 14px; border-radius: 10px; background: #06090f;
        border-left: 3px solid #4ade80; font-family: monospace; font-size: 12px; color: #e2e8f0; white-space: pre-wrap; line-height: 1.5;
      "></div>
    `;

    targetEl.appendChild(box);
    const outputBox = document.getElementById("ai-dynamic-output");
    const notepadArea = document.getElementById("lyrics-text");

    document.getElementById("analyze-notepad-btn").onclick = () => {
      const userText = notepadArea ? notepadArea.value.trim() : "";
      
      if (!userText) {
        notify("Please write something in your notepad first!", true);
        return;
      }

      outputBox.style.display = "block";
      outputBox.textContent = "🧠 Analyzing your writing context and story flow...";

      setTimeout(() => {
        const lineCount = userText.split("\n").filter(l => l.trim()).length;
        const lower = userText.toLowerCase();

        let suggestion = "";

        if (lower.includes("verse") || lineCount <= 6) {
          suggestion = `📊 Analysis: You have written ${lineCount} lines (Verse setup phase).\n\n` +
            `👉 Suggested Next Structure:\n` +
            `• Move into a **Pre-Chorus** to build emotional tension or speed up the rhythm.\n` +
            `• **Story Tip:** Introduce a conflict or internal question that the upcoming Chorus will answer.`;
        } else if (lower.includes("chorus") || lower.includes("hook")) {
          suggestion = `📊 Analysis: Your text contains a Chorus/Hook.\n\n` +
            `👉 Suggested Next Structure:\n` +
            `• Follow up with **Verse 2**, exploring the consequence or aftermath of your Chorus message.\n` +
            `• **Rhyme Tip:** Keep your end-rhymes open and resonant to match the hook's energy.`;
        } else if (lower.includes("bridge") || lower.includes("climax")) {
          suggestion = `📊 Analysis: You are near the Bridge / Climax phase.\n\n` +
            `👉 Suggested Next Structure:\n` +
            `• Shift your perspective or chord progression here.\n` +
            `• Lead smoothly into a **Final Double Chorus** and an atmospheric **Outro** to close your story.`;
        } else {
          suggestion = `📊 Analysis: Active free-form text (${lineCount} lines detected).\n\n` +
            `👉 Suggested Structure Integration:\n` +
            `• Group your lines into 4-bar or 8-bar blocks.\n` +
            `• Add a **[CHORUS]** tag above your main catchy phrase to anchor your story.`;
        }

        outputBox.textContent = suggestion;
        notify("Generated structure suggestions based on your text!");
      }, 350);
    };
  }

  function boot() {
    initLiveContextualCoach();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
