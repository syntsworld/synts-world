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

  const STORY_BLUEPRINTS = [
    { label: "🎵 Standard Song Structure (Verse - Chorus - Bridge)", type: "song", content: "[VERSE 1 - Setting the Scene & Story]\n1. \n2. \n\n[PRE-CHORUS - Rising Tension]\n1. \n\n[CHORUS - Core Hook / Message]\n1. \n2. \n\n[VERSE 2 - Continuing the Story]\n1. \n\n[BRIDGE - Emotional Shift]\n1. \n\n[OUTRO - Resolution]" },
    { label: "🎤 Rap / Hip-Hop 16-Bar Story Arc", type: "rap", content: "[INTRO - Ambient Setup / 4 Bars]\n\n[VERSE 1 - The Inciting Incident / 16 Bars]\n1. \n2. \n3. \n4. \n\n[HOOK - Chorus Hook / 8 Bars]\n\n[VERSE 2 - The Climax & Consequence / 16 Bars]\n\n[OUTRO - Final Word]" },
    { label: "📖 Concept Story / Lore Narrative", type: "lore", content: "[ACT I: THE WORLD & SETTING]\n(Establish the mood, character, and central conflict)\n\n[ACT II: THE TURNING POINT]\n(What changes the character's path forever?)\n\n[ACT III: THE RESOLUTION / CLIMAX]\n(Emotional realization or final punchline)" },
    { label: "✒️ Urdu / Hindi Gazal (Matla & Shers)", type: "gazal", content: "[MATLA - Opening Couplet (Both lines rhyme)]\nMisra 1: \nMisra 2: \n\n[SHER 01 - Developing the Theme]\nMisra 1: \nMisra 2: \n\n[MAQTA - Closing Signature (Include pen name)]\nMisra 1: \nMisra 2: " }
  ];

  function initSongStructureAssistant() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    // Place right below the translator or notepad area
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
          <span style="font-size:16px">📐</span>
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">SONG STRUCTURE &amp; STORYTELLING BLUEPRINTS</strong>
        </div>
        <div style="font-size:11px;color:#9ca3af;font-family:monospace">Click a structure to insert into your workspace:</div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${STORY_BLUEPRINTS.map(
          (b, idx) => `
          <button type="button" data-blueprint-idx="${idx}" style="
            background: rgba(74, 222, 128, 0.12);
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.35);
            border-radius: 8px;
            padding: 8px 12px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.15s ease;
          ">${b.label}</button>`
        ).join("")}
      </div>

      <div id="blueprint-preview-box" style="
        display: none; padding: 12px; border-radius: 10px; background: #06090f;
        border-left: 3px solid #4ade80; font-family: monospace; font-size: 12px; color: #e2e8f0; white-space: pre-wrap;
      "></div>
    `;

    targetEl.appendChild(box);
    const previewBox = document.getElementById("blueprint-preview-box");
    const notepadArea = document.getElementById("lyrics-text");

    box.querySelectorAll("[data-blueprint-idx]").forEach((btn) => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute("data-blueprint-idx"));
        const blueprint = STORY_BLUEPRINTS[idx];

        previewBox.style.display = "block";
        previewBox.textContent = `📝 Loaded Blueprint:\n\n${blueprint.content}`;

        if (notepadArea) {
          const current = notepadArea.value.trim();
          notepadArea.value = current ? `${current}\n\n${blueprint.content}` : blueprint.content;
          notepadArea.dispatchEvent(new Event("input", { bubbles: true }));
          notepadArea.focus();
        }

        notify(`Loaded "${blueprint.label}" into your workspace!`);
      };
    });
  }

  function boot() {
    initSongStructureAssistant();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
