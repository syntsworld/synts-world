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

  const ENDING_RHYMES = {
    ight: ["night", "light", "sight", "fight", "flight", "bright", "height", "write", "tonight"],
    ire: ["fire", "desire", "higher", "wire", "inspire", "empire", "entire", "tire"],
    ain: ["rain", "pain", "chain", "train", "strain", "brain", "remain", "again", "domain"],
    art: ["heart", "art", "part", "start", "smart", "apart", "chart", "depart"],
    ark: ["dark", "spark", "mark", "bark", "stark", "embark", "remark"],
    all: ["fall", "call", "wall", "hall", "small", "tall", "crawl", "recall"],
    ay: ["day", "way", "stay", "play", "say", "away", "grey", "delay", "pray"],
    ime: ["time", "rhyme", "crime", "climb", "prime", "sublime", "dime"],
    o: ["go", "flow", "slow", "know", "show", "glow", "below", "shadow", "echo"],
    ar: ["safar", "nazar", "asar", "jigar", "humsafar", "star", "far", "scar", "war"],
    aat: ["raat", "baat", "saath", "haath", "aahat", "chahat", "raahat", "barsaat"],
    aan: ["jaan", "shaan", "maan", "pehchan", "armaan", "toofan", "aasmaan", "dastaan"]
  };

  const COMMON_WORD_RHYMES = {
    fire: ENDING_RHYMES.ire,
    night: ENDING_RHYMES.ight,
    light: ENDING_RHYMES.ight,
    rain: ENDING_RHYMES.ain,
    pain: ENDING_RHYMES.ain,
    heart: ENDING_RHYMES.art,
    dark: ENDING_RHYMES.ark,
    time: ENDING_RHYMES.ime,
    flow: ENDING_RHYMES.o,
    raat: ENDING_RHYMES.aat,
    baat: ENDING_RHYMES.aat,
    safar: ENDING_RHYMES.ar,
    nazar: ENDING_RHYMES.ar,
    jaan: ENDING_RHYMES.aan
  };

  function cleanWord(raw) {
    return (raw || "")
      .toLowerCase()
      .replace(/[^a-z\u0900-\u097f\u0600-\u06ff]/g, "");
  }

  function findRhymesForWord(word) {
    const w = cleanWord(word);
    if (!w) return [];

    if (COMMON_WORD_RHYMES[w]) {
      return COMMON_WORD_RHYMES[w].filter((r) => r !== w);
    }

    const suffixOrder = ["ight", "ire", "ain", "art", "ark", "all", "ime", "aat", "aan", "ay", "ar", "o"];
    for (const suf of suffixOrder) {
      if (w.endsWith(suf) && w.length > suf.length) {
        return ENDING_RHYMES[suf].filter((r) => r !== w);
      }
    }

    if (w.length >= 3) {
      const tail2 = w.slice(-2);
      const tail3 = w.slice(-3);
      const dynamic = [];
      Object.values(ENDING_RHYMES).forEach((list) => {
        list.forEach((candidate) => {
          if (candidate !== w && (candidate.endsWith(tail3) || candidate.endsWith(tail2))) {
            if (!dynamic.includes(candidate)) dynamic.push(candidate);
          }
        });
      });
      if (dynamic.length) return dynamic.slice(0, 8);
    }

    return ["night", "light", "flow", "time", "fire", "stay"];
  }

  function getActiveLineAndWord(textarea) {
    const full = textarea.value || "";
    const pos = typeof textarea.selectionStart === "number" ? textarea.selectionStart : full.length;
    const beforeCursor = full.slice(0, pos);
    const lines = beforeCursor.split("\n");
    let currentLine = (lines[lines.length - 1] || "").trim();

    if (!currentLine) {
      const nonEmpty = full
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      currentLine = nonEmpty[nonEmpty.length - 1] || "";
    }

    const words = currentLine.split(/\s+/).filter(Boolean);
    const lastWord = words[words.length - 1] || "";
    return { currentLine, lastWord, lineCount: full.split("\n").filter((l) => l.trim()).length };
  }

  function buildSongStructureFromLyrics(text) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const hasVerse = /\[?\s*verse/i.test(text);
    const hasChorus = /\[?\s*chorus|\[?\s*hook/i.test(text);
    const hasBridge = /\[?\s*bridge/i.test(text);

    const firstHookCandidate =
      lines.find((l) => !l.startsWith("[") && l.split(/\s+/).length <= 10) ||
      "Keep your strongest emotional line as the anchor";

    let nextBlockLabel = "[CHORUS / HOOK]";
    let nextPrompt =
      "Distill your opening imagery into a repeatable hook line (6–9 words) that states the core emotion.";

    if (hasVerse && !hasChorus) {
      nextBlockLabel = "[PRE-CHORUS -> CHORUS]";
      nextPrompt =
        "Write 2 rising lines that build tension toward your main hook, then drop your Chorus.";
    } else if (hasChorus && !hasBridge && lines.length >= 10) {
      nextBlockLabel = "[VERSE 2 -> BRIDGE]";
      nextPrompt =
        "Shift the perspective or timeline in Verse 2, then use a short Bridge to break the pattern before the final Chorus.";
    } else if (hasBridge) {
      nextBlockLabel = "[FINAL CHORUS + OUTRO]";
      nextPrompt =
        "Bring back your main Chorus with full energy, then taper off with 1–2 quiet lines for the Outro.";
    } else if (lines.length >= 6) {
      nextBlockLabel = "[CHORUS]";
      nextPrompt =
        "You have a solid verse block—lock in your Chorus now so the song has a clear payoff.";
    }

    const suggestedOutline = [
      `• Detected: ${lines.length} lyric lines | Verse: ${hasVerse ? "Yes" : "Implicit"} | Chorus: ${hasChorus ? "Yes" : "Not marked"} | Bridge: ${hasBridge ? "Yes" : "Not marked"}`,
      `• Hook Anchor Idea: "${firstHookCandidate}"`,
      `• Next Section to Write: ${nextBlockLabel} — ${nextPrompt}`
    ].join("\n");

    const draftSnippet = `${nextBlockLabel}\n${firstHookCandidate} — `;
    return { suggestedOutline, draftSnippet };
  }

  function initLyricRhymeAndStructureEngine() {
    if (document.getElementById("synts-ai-assistant-panel")) return;

    const notepadArea = document.getElementById("lyrics-text");
    if (!notepadArea) return;

    const box = document.createElement("div");
    box.id = "synts-ai-assistant-panel";
    box.style.cssText = `
      margin-top: 14px;
      padding: 16px;
      border-radius: 16px;
      background: linear-gradient(165deg, rgba(14, 19, 28, 0.96), rgba(8, 11, 17, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.35);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.7);
      color: #f3f6fc;
      text-align: left;
    `;

    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <strong style="font-family:monospace;font-size:12px;color:#4ade80;letter-spacing:0.05em">
          🎵 RHYME &amp; SONG STRUCTURE ENGINE
        </strong>
        <span id="rhyme-target-badge" style="font-family:monospace;font-size:11px;color:#9ca3af">
          Type in notepad to rhyme &amp; structure
        </span>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <button type="button" id="btn-suggest-rhymes" style="
          background:#4ade80;color:#041208;border:none;border-radius:9px;
          padding:8px 14px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;
        ">✨ SUGGEST RHYMES</button>
        <button type="button" id="btn-structure-song" style="
          background:rgba(56,189,248,0.14);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);
          border-radius:9px;padding:8px 14px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;
        ">📐 STRUCTURE FROM LYRICS</button>
        <button type="button" id="btn-insert-next-part" style="
          background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.35);
          border-radius:9px;padding:8px 12px;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;
        ">+ ADD NEXT SECTION</button>
      </div>

      <div id="rhyme-chips-row" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"></div>

      <div id="lyric-engine-output" style="
        display:none;padding:12px 14px;border-radius:11px;background:#06090f;
        border-left:3px solid #4ade80;font-family:monospace;font-size:11.5px;
        color:#e2e8f0;white-space:pre-wrap;line-height:1.55;
      "></div>
    `;

    const counterBar = document.getElementById("synts-compact-counter");
    if (counterBar) {
      counterBar.insertAdjacentElement("afterend", box);
    } else {
      notepadArea.insertAdjacentElement("afterend", box);
    }

    const badge = document.getElementById("rhyme-target-badge");
    const chipsRow = document.getElementById("rhyme-chips-row");
    const outputEl = document.getElementById("lyric-engine-output");
    let pendingNextSection = "";

    const insertAtEndOrCursor = (snippet) => {
      const current = notepadArea.value || "";
      const sep = current.endsWith("\n") || current.length === 0 ? "" : "\n\n";
      notepadArea.value = `${current}${sep}${snippet}`;
      notepadArea.dispatchEvent(new Event("input", { bubbles: true }));
      notepadArea.focus();
    };

    const renderRhymes = () => {
      const { currentLine, lastWord } = getActiveLineAndWord(notepadArea);
      if (!lastWord) {
        notify("Write a line in the notepad first so I can rhyme from your words.", true);
        return;
      }

      const rhymes = findRhymesForWord(lastWord);
      badge.textContent = `Target word: "${lastWord}"`;
      chipsRow.innerHTML = rhymes
        .map(
          (r) => `<button type="button" data-rhyme-word="${r}" style="
            background:rgba(255,255,255,0.05);color:#f8fafc;border:1px solid rgba(74,222,128,0.3);
            border-radius:99px;padding:4px 11px;font-family:monospace;font-size:11px;cursor:pointer;
          ">${r}</button>`
        )
        .join("");

      chipsRow.querySelectorAll("[data-rhyme-word]").forEach((chip) => {
        chip.onclick = () => {
          const word = chip.getAttribute("data-rhyme-word");
          insertAtEndOrCursor(`${currentLine} — ${word}`);
          notify(`Added "${word}" to your lyrics`);
        };
      });

      outputEl.style.display = "block";
      outputEl.textContent =
        `Line: "${currentLine}"\n` +
        `Rhymes for "${lastWord}": ${rhymes.join(", ")}\n` +
        `Tip: Click any rhyme pill above to append a matching line starter to your notepad.`;
    };

    const renderStructure = () => {
      const text = (notepadArea.value || "").trim();
      if (!text) {
        notify("Write some lyrics in the notepad first so I can structure them.", true);
        return;
      }

      const { suggestedOutline, draftSnippet } = buildSongStructureFromLyrics(text);
      pendingNextSection = draftSnippet;
      outputEl.style.display = "block";
      outputEl.textContent = `${suggestedOutline}\n\nReady to insert:\n${draftSnippet}`;
      notify("Song structure updated from your lyrics");
    };

    document.getElementById("btn-suggest-rhymes").onclick = renderRhymes;
    document.getElementById("btn-structure-song").onclick = renderStructure;
    document.getElementById("btn-insert-next-part").onclick = () => {
      const text = (notepadArea.value || "").trim();
      if (!text) {
        notify("Write lyrics first to generate the next section.", true);
        return;
      }
      if (!pendingNextSection) {
        pendingNextSection = buildSongStructureFromLyrics(text).draftSnippet;
      }
      insertAtEndOrCursor(pendingNextSection);
      notify("Inserted next structural section into notepad");
    };

    notepadArea.addEventListener("input", () => {
      const { lastWord } = getActiveLineAndWord(notepadArea);
      if (lastWord) {
        badge.textContent = `Last word: "${lastWord}"`;
      }
    });
  }

  function boot() {
    initLyricRhymeAndStructureEngine();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 600);
})();
