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

  // Built-in intelligent rhyming & lyric suggestion database across genres
  const RHYME_DATABASE = {
    fire: ["desire", "higher", "wire", "inspire", "empire", "entire", "quagmire", "buyer"],
    night: ["light", "sight", "fight", "flight", "write", "bright", "height", "might", "satellite"],
    pain: ["rain", "chain", "train", "strain", "gain", "brain", "remain", "domain", "hurricane"],
    heart: ["art", "part", "start", "smart", "depart", "restart", "counterpart", "chart"],
    dark: ["spark", "mark", "ark", "embark", "remark", "stark", "nightmare park"],
    aahat: ["chahat", "raahat", "baadshahahat", "kahaani", "paani", "nishaani", "zindagaani"],
    nazar: ["safar", "asar", "jigar", "humsafar", "qamar", "beasar"]
  };

  const AI_PROMPTS = [
    { label: "✨ Suggest Rhyming Ending", action: "rhyme" },
    { label: "⚡ Punchline Upgrade", action: "punchline" },
    { label: "✒️ Make More Poetic / Emotional", action: "poetic" },
    { label: "🥁 Fix Rhythm & Flow (Syllables)", action: "flow" }
  ];

  function initAiAssistant() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    const notepadPanel = document.querySelector("#lyrics .pad, #lyrics");
    const textarea = document.getElementById("lyrics-text");
    if (!notepadPanel || !textarea) return;

    // Create AI Assistant Toolbar Container
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
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">SYNTS AI RHYME &amp; LYRIC COACH</strong>
        </div>
        <div style="font-size:11px;color:#9ca3af;font-family:monospace">Select text or type above, then click an AI tool:</div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px" id="ai-action-buttons">
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
            transition: all 0.15s ease;
          ">${p.label}</button>`
        ).join("")}
      </div>

      <div id="ai-suggestion-box" style="
        display: none;
        padding: 12px;
        border-radius: 10px;
        background: #06090f;
        border-left: 3px solid #4ade80;
        font-family: monospace;
        font-size: 12px;
        color: #e2e8f0;
        white-space: pre-wrap;
        line-height: 1.5;
      "></div>
    `;

    // Place directly below the Notepad action buttons or textarea
    const buttonRow = textarea.parentElement.querySelector(".row.mt");
    if (buttonRow) {
      buttonRow.insertAdjacentElement("afterend", aiBox);
    } else {
      textarea.insertAdjacentElement("afterend", aiBox);
    }

    const suggestionBox = document.getElementById("ai-suggestion-box");

    aiBox.querySelectorAll("[data-ai-action]").forEach((btn) => {
      btn.onclick = () => {
        const action = btn.getAttribute("data-ai-action");
        const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
        const fullText = textarea.value.trim();
        const targetText = selection || fullText.split("\n").pop() || "fire";

        suggestionBox.style.display = "block";
        suggestionBox.textContent = "🤖 AI is thinking of rhymes & cadence...";

        setTimeout(() => {
          let output = "";
          const lastWord = targetText.split(/\s+/).pop().toLowerCase().replace(/[^a-z\u0900-\u097F]/g, "");

          if (action === "rhyme") {
            const matches = RHYME_DATABASE[lastWord] || ["inspire", "fire", "higher", "desire", "empire"];
            output = `💡 Rhymes for "${lastWord}":\n• ${matches.join(", ")}\n\n✨ Suggested Line Completion:\n"${targetText.replace(lastWord, "").trim()} ${matches[0]}"`;
          } else if (action === "punchline") {
            output = `⚡ Punchline Upgrade Ideas for "${targetText}":\n1. Turning shadows to gold when the speakers ignite,\n2. Built an empire alone in the dead of the night,\n3. Every word is a spark, every verse is a blade.`;
          } else if (action === "poetic") {
            output = `✒️ Poetic / Emotional Refinement:\n"The echoes remain where the shadows collide,\nCarving art from the silence we keep locked inside."`;
          } else if (action === "flow") {
            output = `🥁 Rhythm & Flow Audit (140 BPM Pocket):\n• Current Syllables: ~${targetText.split(" ").length * 2}\n• Tip: Group words into steady 4-beat clusters with internal double rhymes on beats 2 and 4.`;
          }

          suggestionBox.textContent = output;
          notify("AI suggestions generated!");
        }, 350);
      };
    });
  }

  function boot() {
    initAiAssistant();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 500);
})();
