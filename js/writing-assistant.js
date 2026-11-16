(() => {
  "use strict";

  function initCompactNotepadCounter() {
    const dock = document.getElementById("synts-structure-assistant");
    if (dock) dock.remove(); // Removes the bulky coach panel completely

    const area = document.querySelector("#lyrics-text, #lyrics textarea, textarea");
    if (!area || document.getElementById("synts-compact-counter")) return;

    // Create a sleek, minimal live stats bar under the notepad
    const counterBar = document.createElement("div");
    counterBar.id = "synts-compact-counter";
    counterBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding: 10px 14px;
      background: rgba(14, 19, 28, 0.85);
      border: 1px solid rgba(74, 222, 128, 0.22);
      border-radius: 12px;
      font-family: monospace;
      font-size: 11px;
      color: #9ca3af;
    `;

    counterBar.innerHTML = `
      <span>📝 Words: <strong id="c-words" style="color:#fff">0</strong></span>
      <span>📏 Lines: <strong id="c-lines" style="color:#4ade80">0</strong></span>
      <span>⏱️ Est. Time: <strong id="c-time" style="color:#38bdf8">0s</strong></span>
    `;

    area.insertAdjacentElement("afterend", counterBar);

    const updateStats = () => {
      const text = area.value || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text.split("\n").filter(l => l.trim()).length;
      const secs = Math.round(words / 2.4);

      const wEl = document.getElementById("c-words");
      const lEl = document.getElementById("c-lines");
      const tEl = document.getElementById("c-time");

      if (wEl) wEl.textContent = words;
      if (lEl) lEl.textContent = lines;
      if (tEl) tEl.textContent = `${secs}s`;
    };

    area.addEventListener("input", updateStats);
    updateStats();
  }

  initCompactNotepadCounter();
  document.addEventListener("DOMContentLoaded", initCompactNotepadCounter);
  setTimeout(initCompactNotepadCounter, 500);
})();
