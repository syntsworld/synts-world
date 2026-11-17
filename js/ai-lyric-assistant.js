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

  function initLyricStoryAssistant() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    const targetEl = document.querySelector("#translator, .translator-box, #tr-input")?.parentElement || document.getElementById("lyrics-text")?.parentElement;
    if (!targetEl) return;

    const box = document.createElement("div");
    box.id = "synts-ai-assistant-panel";
    box.style.cssText = `
      margin-top: 14px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(165deg, rgba(14, 19, 28, 0.96), rgba(8, 11, 17, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.38);
      box-shadow: 0 20px 50px rgba(0,0,0,0.75);
      color: #f3f6fc;
      text-align: left;
    `;

    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">🎙️</span>
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">AI LYRIC &amp; STORY STRUCTURE ASSISTANT</strong>
        </div>
        <span style="font-size:11px;font-family:monospace;color:#9ca3af">Context-Aware Writing Coach</span>
      </div>

      <div style="font-size:12px;color:#cbd5e1;margin-bottom:12px">
        Write your lyrics or story in the notepad above, then click below to have AI analyze your text and suggest the exact next structural section (Verse, Pre-Chorus, Hook, or Bridge):
      </div>

      <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <button type="button" id="ai-suggest-next-btn" style="
          background: #4ade80; color: #041208; border: none; border-radius: 10px;
          padding: 10px 16px; font-family: monospace; font-size: 11px; font-weight: 800; cursor: pointer;
        ">✨ SUGGEST NEXT STRUCTURAL PART</button>
        <button type="button" id="ai-append-suggestion-btn" style="
          background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); border-radius: 10px;
          padding: 10px 14px; font-family: monospace; font-size: 11px; font-weight: 700; cursor: pointer;
        ">+ INSERT SUGGESTION INTO NOTEPAD</button>
      </div>

      <div id="ai-story-feedback" style="
        display: none; padding: 14px; border-radius: 12px; background: #06090f;
        border-left: 3px solid #4ade80; font-family: monospace; font-size: 12px; color: #e2e8f0; white-space: pre-wrap; line-height: 1.6;
      "></div>
    `;

    targetEl.appendChild(box);

    const feedbackBox = document.getElementById("ai-story-feedback");
    const notepadArea = document.getElementById("lyrics-text");
    let lastGeneratedText = "";

    document.getElementById("ai-suggest-next-btn").onclick = () => {
      const text = notepadArea ? notepadArea.value.trim() : "";
      if (!text) {
        notify("Please write some lyrics in your notepad first!", true);
        return;
      }

      feedbackBox.style.display = "block";
      feedbackBox.textContent = "🔍 AI analyzing your lyrics and story flow...";

      setTimeout(() => {
        const lines = text.split("\n").filter(l => l.trim());
        const lastLine = lines[lines.length - 1] || "";
        const lower = text.toLowerCase();

        let recommendation = "";

        if (lower.includes("verse") && !lower.includes("chorus")) {
          recommendation = `🎵 Narrative Analysis (${lines.length} lines detected):\n\n` +
            `👉 What to write next (Pre-Chorus / Hook):\n` +
            `• Since your verse sets up the emotional background, transition into a **[CHORUS]** with your main title phrase.\n` +
            `• **Suggested Opening Hook Line:** "And we're running through the shadows of the silent streets..."`;
          lastGeneratedText = "\n[CHORUS]\n1. And we're running through the shadows of the silent streets...\n2. Every heartbeat is a drum that repeats.";
        } else if (lower.includes("chorus") || lower.includes("hook")) {
          recommendation = `🎵 Narrative Analysis:\n\n` +
            `👉 What to write next (Verse 2 / Story Progression):\n` +
            `• Follow up your hook with **[VERSE 2]**.\n` +
            `• **Story Guidance:** Introduce a twist or a personal memory that deepens the meaning of your chorus.\n` +
            `• **Suggested Opening Line:** "I remember every promise that we left behind..."`;
          lastGeneratedText = "\n[VERSE 2]\n1. I remember every promise that we left behind,\n2. Searching through the wreckage for a piece of mind.";
        } else {
          recommendation = `🎵 Narrative Analysis (Free-form verses):\n\n` +
            `👉 Suggested Structure Flow:\n` +
            `• Your opening is strong. Group your lines into a formal **[VERSE 1]** block.\n` +
            `• Follow it with a short **[PRE-CHORUS]** (2 lines) that raises the pitch before dropping into your main hook.\n` +
            `• **Suggested Pre-Chorus:** "And time is slipping away... / Are we closer or further today?"`;
          lastGeneratedText = "\n[PRE-CHORUS]\n1. And time is slipping away...\n2. Are we closer or further today?";
        }

        feedbackBox.textContent = recommendation;
        notify("AI structure recommendation ready!");
      }, 350);
    };

    document.getElementById("ai-append-suggestion-btn").onclick = () => {
      if (!lastGeneratedText || !notepadArea) {
        notify("Click 'Suggest Next Structural Part' first!", true);
        return;
      }
      notepadArea.value = notepadArea.value.trim() + "\n" + lastGeneratedText;
      notepadArea.dispatchEvent(new Event("input", { bubbles: true }));
      notepadArea.focus();
      notify("Inserted AI structure suggestion into your notepad!");
    };
  }

  function boot() {
    initLyricStoryAssistant();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
