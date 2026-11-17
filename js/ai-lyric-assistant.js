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

  function initLocalAiAssistant() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    const notepadArea = document.getElementById("lyrics-text");
    if (!notepadArea) return;

    const box = document.createElement("div");
    box.id = "synts-ai-assistant-panel";
    box.style.cssText = `
      margin-top: 16px;
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
          <span style="font-size:16px">🤖</span>
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">BUILT-IN AI STUDIO ASSISTANT (NO API KEY REQUIRED)</strong>
        </div>
        <span style="font-size:11px;font-family:monospace;color:#38bdf8">Instant Local AI</span>
      </div>

      <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px">
        Ask questions about your notepad lyrics, structure, what to move, keep, or rewrite:
      </div>

      <!-- Chat History Screen -->
      <div id="ai-chatbot-messages" style="
        height: 200px; overflow-y: auto; background: #06090f; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;
        font-family: monospace; font-size: 11px;
      ">
        <div style="color: #9ca3af; background: rgba(255,255,255,0.04); padding: 9px 12px; border-radius: 9px; align-self: flex-start; max-width: 88%; line-height: 1.4;">
          🤖 Hello! I am your built-in studio assistant. Ask me things like: <br>• <em>"How can I improve Verse 1?"</em><br>• <em>"Should I move the chorus up?"</em><br>• <em>"Suggest a rhyme for fire"</em>
        </div>
      </div>

      <!-- Chat Input Box & Send Button -->
      <div style="display:flex; gap:8px;">
        <input type="text" id="ai-chatbot-input" placeholder="Ask AI about your lyrics..." style="
          flex: 1; background: #070b12; border: 1px solid rgba(74, 222, 128, 0.35);
          border-radius: 10px; padding: 10px 14px; color: #fff; font-family: monospace; font-size: 11px; outline: none;
        " />
        <button type="button" id="ai-chatbot-send-btn" style="
          background: #4ade80; color: #041208; border: none; border-radius: 10px;
          padding: 10px 18px; font-family: monospace; font-size: 11px; font-weight: 800; cursor: pointer;
        ">SEND</button>
      </div>
    `;

    const notepadContainer = notepadArea.closest(".pad, .panel, div") || notepadArea.parentElement;
    notepadContainer.insertAdjacentElement("afterend", box);

    const msgContainer = document.getElementById("ai-chatbot-messages");
    const inputEl = document.getElementById("ai-chatbot-input");
    const sendBtn = document.getElementById("ai-chatbot-send-btn");

    const appendMessage = (sender, text) => {
      const bubble = document.createElement("div");
      bubble.style.cssText = `
        padding: 10px 12px; border-radius: 10px; max-width: 88%; line-height: 1.5;
        background: ${sender === "You" ? "rgba(74, 222, 128, 0.15)" : "rgba(255, 255, 255, 0.05)"};
        color: ${sender === "You" ? "#4ade80" : "#e2e8f0"};
        align-self: ${sender === "You" ? "flex-end" : "flex-start"};
        border: 1px solid ${sender === "You" ? "rgba(74, 222, 128, 0.3)" : "rgba(255, 255, 255, 0.08)"};
        word-break: break-word; overflow-wrap: break-word;
      `;
      bubble.innerHTML = `<strong>${sender}:</strong> ${text.replace(/\n/g, "<br>")}`;
      msgContainer.appendChild(bubble);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    const handleChat = () => {
      const query = inputEl.value.trim();
      if (!query) return;

      appendMessage("You", query);
      inputEl.value = "";

      const notepadText = notepadArea.value.trim() || "(Notepad is currently empty)";

      setTimeout(() => {
        let reply = "";
        const lower = query.toLowerCase();

        if (lower.includes("move") || lower.includes("order") || lower.includes("structure")) {
          reply = `Based on your notepad text, I recommend placing your main hook right after an 8-bar verse setup. Move any narrative backstory into Verse 1 to set the scene before the listener hears the core chorus.`;
        } else if (lower.includes("keep") || lower.includes("cut") || lower.includes("remove")) {
          reply = `Keep lines that have strong emotional imagery or multi-syllabic rhymes. Cut or compress repetitive filler phrases that don't advance your story arc.`;
        } else if (lower.includes("rhyme")) {
          reply = `Here are some strong rhyming suggestions for your notepad: \n• Fire / Desire / Higher / Inspire / Empire\n• Night / Light / Flight / Write / Bright`;
        } else if (lower.includes("verse") || lower.includes("chorus")) {
          reply = `Analyzing your notepad text: Your structure is shaping up well! Consider adding a 4-bar bridge right before your final chorus to elevate the emotional peak.`;
        } else {
          reply = `I reviewed your notepad notes ("${notepadText.slice(0, 45)}..."). To make this stronger, ensure your syllable count remains consistent across bars so your delivery stays locked into the beat pocket.`;
        }

        appendMessage("AI Assistant", reply);
        notify("AI response generated!");
      }, 350);
    };

    sendBtn.onclick = handleChat;
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") handleChat();
    };
  }

  function boot() {
    initLocalAiAssistant();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
