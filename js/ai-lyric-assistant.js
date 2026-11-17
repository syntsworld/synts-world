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

  function initNotepadAiChatbot() {
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
          <span style="font-size:16px">💬</span>
          <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.06em">AI LYRIC CHATBOT ASSISTANT</strong>
        </div>
        <span style="font-size:11px;font-family:monospace;color:#9ca3af">Ask questions about your lyrics</span>
      </div>

      <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px">
        Chat with your AI assistant about what to move, keep, rewrite, or structure next in your notepad:
      </div>

      <!-- Chat History Screen -->
      <div id="ai-chatbot-messages" style="
        height: 180px; overflow-y: auto; background: #06090f; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;
        font-family: monospace; font-size: 11px;
      ">
        <div style="color: #9ca3af; background: rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 8px; align-self: flex-start; max-width: 85%;">
          🤖 Hi! I'm your AI lyric assistant. Type your questions below. For example: <br>• <em>"Should I move Verse 2 before the chorus?"</em><br>• <em>"What lines should I keep or cut?"</em>
        </div>
      </div>

      <!-- Chat Input Box & Send Button -->
      <div style="display:flex; gap:8px;">
        <input type="text" id="ai-chatbot-input" placeholder="Ask AI about your lyrics (e.g., how to improve verse 1)..." style="
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
        padding: 9px 12px; border-radius: 9px; max-width: 88%; line-height: 1.5;
        background: ${sender === "You" ? "rgba(74, 222, 128, 0.15)" : "rgba(255, 255, 255, 0.05)"};
        color: ${sender === "You" ? "#4ade80" : "#e2e8f0"};
        align-self: ${sender === "You" ? "flex-end" : "flex-start"};
        border: 1px solid ${sender === "You" ? "rgba(74, 222, 128, 0.3)" : "rgba(255, 255, 255, 0.08)"};
      `;
      bubble.innerHTML = `<strong>${sender}:</strong> ${text}`;
      msgContainer.appendChild(bubble);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    const handleChat = () => {
      const query = inputEl.value.trim();
      if (!query) return;

      appendMessage("You", query);
      inputEl.value = "";

      const notepadText = notepadArea.value.trim();

      setTimeout(() => {
        let reply = "";
        const lower = query.toLowerCase();

        if (lower.includes("move") || lower.includes("order")) {
          reply = `Looking at your notepad, I recommend moving your main hook right after your 8-bar setup. Keep your storytelling details in Verse 1 to build the mood first.`;
        } else if (lower.includes("keep") || lower.includes("cut")) {
          reply = `Keep any lines that carry strong imagery or emotional weight. Cut repetitive filler words that don't push your story forward.`;
        } else if (lower.includes("verse") || lower.includes("chorus")) {
          reply = `Your notepad text ("${notepadText.slice(0, 30)}...") has good flow. Try adding a short 2-line pre-chorus before your hook to elevate the energy!`;
        } else {
          reply = `I read your notepad text. To improve it, try tightening your rhymes and matching your syllable counts so it fits smoothly into a standard 4/4 rhythm pocket.`;
        }

        appendMessage("AI Assistant", reply);
        notify("AI responded!");
      }, 400);
    };

    sendBtn.onclick = handleChat;
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") handleChat();
    };
  }

  function boot() {
    initNotepadAiChatbot();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
