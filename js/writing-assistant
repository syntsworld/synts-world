(() => {
  "use strict";

  const GENRE_TECH_SPECS = {
    RAP_DRILL: {
      label: "🎤 Rap / Drill / Hip-Hop",
      bpm: "138 – 145 BPM (Half-Time Pocket) or 90 – 96 BPM (Boom-Bap)",
      meter: "4/4 Time · 10–14 syllables per bar · Multi-syllabic internal + end rhymes",
      roadmap: ["[INTRO - 4 BARS]", "[HOOK - 8 BARS]", "[VERSE 1 - 16 BARS]", "[HOOK - 8 BARS]", "[VERSE 2 - 16 BARS]", "[BEAT SWITCH - 4 BARS]", "[OUTRO - 4 BARS]"],
      cues: ["(Ad-lib: Yeah!)", "[808 Sub Drop]", "[Flow Switch: Double-Time]", "[Beat Cut - Acapella Line]", "[Low-Pass Filter Intro]"],
      tips: [
        "Bars 1–4: Establish your main cadence and rhyme vowel (AABB or ABAB).",
        "Bars 5–8: Introduce internal double-rhymes and pocket switches.",
        "Bars 9–12: Peak energy / punchline setup + delivery.",
        "Bars 13–16: Build tension leading cleanly back into the 8-bar Hook."
      ],
      blueprint: `// GENRE: Rap / Drill (142 BPM | 4/4 Time)
[INTRO - 4 BARS]
(Low-pass filter fades in · Ad-lib vocal warm-up)

[HOOK - 8 BARS]
1. 
2. 
3. 
4. 

[VERSE 1 - 16 BARS]
// Pocket 1 (Bars 1-4: Set Cadence & Rhyme Scheme)
1. 
2. 
// Pocket 2 (Bars 5-8: Double-Time / Internal Rhymes)
5. 
6. 
// Pocket 3 (Bars 9-12: Main Punchline & Metaphor)
9. 
10. 
// Pocket 4 (Bars 13-16: Hook Transition)
13. 
14. `
    },

    POP_MELODIC: {
      label: "🎵 Commercial Song / Indie / R&B",
      bpm: "100 – 124 BPM · 4/4 Common Time",
      meter: "Verse (Conversational: 7–10 syllables) → Pre-Chorus (Rising tension) → Chorus (Long open vowels)",
      roadmap: ["[INTRO]", "[VERSE 1 - 8 BARS]", "[PRE-CHORUS - 4 BARS]", "[CHORUS - 8 BARS]", "[VERSE 2 - 8 BARS]", "[BRIDGE - 4 BARS]", "[FINAL CHORUS]", "[OUTRO]"],
      cues: ["[Vocal Harmony Stack]", "[Falsetto Lift]", "[Acoustic Guitar Only]", "[Drum Risers]", "[Post-Chorus Vocal Chop]"],
      tips: [
        "Verse 1: Set the visual scene and emotional conflict (who, where, when).",
        "Pre-Chorus: Shorten line lengths or raise melody pitch to build anticipation.",
        "Chorus: Deliver the core title hook on bar 1 and bar 7 using open vowels (Ah, Oh, Ay).",
        "Bridge: Shift perspective or chord progression before the final double chorus."
      ],
      blueprint: `// GENRE: Commercial Pop / R&B Topline (112 BPM)
[VERSE 1 - 8 BARS]
(Intimate close-mic vocal, sparse chords)


[PRE-CHORUS - 4 BARS]
(Rhythmic build, rising vocal melody)


[CHORUS / MAIN HOOK - 8 BARS]
(Full instrumentation + stacked vocal harmonies)


[BRIDGE - 4 BARS]
(Strip drums back, emotional high note)
`
    },

    GAZAL_SHAYARI: {
      label: "✒️ Urdu / Hindi Gazal & Acoustic Poetry",
      bpm: "68 – 88 BPM · Dadra (6 Beats) or Keherwa (8 Beats)",
      meter: "Beher (Meter Consistency) · Qafiya (Rhyme Word) + Radif (Refrain Phrase)",
      roadmap: ["[MATLA - OPENING SHER]", "[SHER 01]", "[SHER 02]", "[SHER 03 - HASIL-E-GAZAL]", "[ANTARA / ACOUSTIC BRIDGE]", "[MAQTA - TAKHALLUS SIGNATURE]"],
      cues: ["[Qafiya + Radif]", "[Sargam / Alaap]", "[Acoustic Strum Pause]", "[Tabla / Cajon Entry]", "[Takhallus: Synts]"],
      tips: [
        "Matla (Opening Couplet): Both lines (Misra-e-Ula & Misra-e-Sani) must end with [Qafiya + Radif].",
        "Intermediate Shers: Only the second line (Misra-e-Sani) ends with [Qafiya + Radif].",
        "Beher (Syllable Weight): Keep syllable count balanced between both lines of each couplet.",
        "Maqta (Final Couplet): Weave your artist pen name ('Synts') naturally into the closing verse."
      ],
      blueprint: `// GENRE: Urdu / Hindi Gazal & Shayari
// RADIF (Repeating End Phrase): "ke waaste"
// QAFIYA (Rhyme Pattern): aahat / chahat / raahat

[MATLA / OPENING SHER (Both lines rhyme: AA)]
Misra 1: 
Misra 2: 

[SHER 01 (Second line rhymes: BA)]
Misra 1: 
Misra 2: 

[SHER 02 - HASIL-E-GAZAL (Peak Couplet: CA)]
Misra 1: 
Misra 2: 

[MAQTA / CLOSING SIGNATURE (Include 'Synts': DA)]
Misra 1: 
Misra 2: `
    },

    STORY_LORE: {
      label: "📖 Story Structure / Album Lore / Spoken Word",
      bpm: "Narrative Pacing · 130 – 150 Words Per Minute (Spoken Word / Voice Studio)",
      meter: "3-Act Narrative Arc: Hook / Inciting Incident → Rising Conflict → Climax → Resolution",
      roadmap: ["[ACT I: THE HOOK & SETTING]", "[INCITING INCIDENT]", "[ACT II: RISING TENSION]", "[THE TURNING POINT]", "[ACT III: CLIMAX]", "[EPILOGUE / MORAL]"],
      cues: ["[Voiceover Narration]", "[SFX: Ambient Rain]", "[Pause - 2 Seconds]", "[Character Dialogue]", "[Flashback Transition]"],
      tips: [
        "Act I (First 20%): Drop the listener straight into a specific sensory moment (time, place, mood).",
        "Act II (Middle 50%): Escalate the internal or external conflict; show stakes through dialogue or action.",
        "Climax (Next 20%): The emotional realization or irreversible decision.",
        "Resolution (Final 10%): Leave a lingering final line that ties back to the opening image."
      ],
      blueprint: `// GENRE: Narrative Story / Spoken Word Script
[ACT I: THE SETTING & OPENING IMAGE]
(Describe the time, room, atmosphere, and opening voiceover line)


[ACT II: THE CONFLICT & TURNING POINT]
(What changed? What is at stake?)


[ACT III: CLIMAX & CLOSING MONOLOGUE]
(The final realization that leads into the song)
`
    },

    MV_SCRIPT: {
      label: "🎬 Music Video Treatment & Scene Script",
      bpm: "24 fps Cinematic Timeline · Timecode Synced",
      meter: "Scene Heading (INT./EXT.) + Camera Movement + Lighting + Audio Lyric Cue",
      roadmap: ["[SCENE 01: 00:00-00:15 INTRO]", "[SCENE 02: 00:15-00:45 HOOK]", "[SCENE 03: 00:45-01:30 VERSE 1]", "[SCENE 04: 01:30-02:00 BRIDGE]", "[SCENE 05: 02:00-END OUTRO]"],
      cues: ["[CAM: 35mm Dolly Push-In]", "[CUT ON BEAT DROP]", "[LIGHT: Neon Emerald & Amber]", "[B-ROLL: Slow-Mo 60fps]", "[VFX: Match Cut]"],
      tips: [
        "Scene Header: Always specify INT. or EXT., Location, and Timecode (e.g., 00:18 - 00:42).",
        "Camera & Lens: Note focal length (24mm wide performance vs 85mm close-up portrait).",
        "Sync Point: Mark the exact lyric line where the visual cut or beat drop happens."
      ],
      blueprint: `// GENRE: Director's Music Video Script & Storyboard
[SCENE 01 | 00:00 - 00:18 | EXT. NIGHT ROOFTOP]
• CAMERA: 35mm Anamorphic slow push-in
• LIGHTING: High-contrast emerald rim light + street haze
• AUDIO SYNC: Intro instrumental & vocal hum

[SCENE 02 | 00:18 - 00:45 | INT. STUDIO PERFORMANCE]
• CAMERA: Low-angle handheld tracking shot on beat drop
• LYRIC CUE: First Hook kicks in
• ACTION: `
    }
  };

  function countSyllablesInLine(line) {
    const clean = line.toLowerCase().replace(/[^a-z\u0900-\u097F\s]/g, "").trim();
    if (!clean) return 0;
    const words = clean.split(/\s+/);
    let total = 0;
    words.forEach((w) => {
      const vowelGroups = w.match(/[aeiouy]+/g);
      total += vowelGroups ? Math.max(1, vowelGroups.length) : Math.max(1, Math.ceil(w.length / 3));
    });
    return total;
  }

  function insertAtCursor(textarea, textToInsert) {
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    textarea.value = `${before}${prefix}${textToInsert}\n${after}`;
    textarea.focus();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function initNotepadStructureAssistant() {
    if (document.getElementById("synts-structure-assistant")) return;

    const area = document.querySelector("#lyrics-text, #lyrics textarea, textarea");
    if (!area || !area.parentElement) return;

    let currentGenreKey = "RAP_DRILL";

    const dock = document.createElement("div");
    dock.id = "synts-structure-assistant";
    dock.style.cssText = `
      margin-top: 14px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(165deg, rgba(13, 19, 28, 0.96), rgba(7, 10, 16, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.32);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      color: #f3f6fc;
      text-align: left;
    `;

    // Place right below the notepad textarea
    area.insertAdjacentElement("afterend", dock);

    function renderAssistant() {
      const spec = GENRE_TECH_SPECS[currentGenreKey];
      const rawText = area.value || "";
      const nonEmptyLines = rawText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("//") && !l.startsWith("["));
      const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;

      // Active line syllable & cadence analyzer
      const cursorPos = area.selectionStart || rawText.length;
      const currentLine = rawText.slice(0, cursorPos).split("\n").pop() || "";
      const activeLineSyllables = countSyllablesInLine(currentLine);
      const estSeconds = Math.round((words / 2.4));

      const genreOptionsHtml = Object.entries(GENRE_TECH_SPECS)
        .map(
          ([k, v]) =>
            `<option value="${k}" ${k === currentGenreKey ? "selected" : ""}>${v.label}</option>`
        )
        .join("");

      const roadmapBtnsHtml = spec.roadmap
        .map(
          (tag) => `
          <button type="button" data-insert-tag="${tag}" style="
            background: rgba(74, 222, 128, 0.14);
            color: #4ade80;
            border: 1px solid rgba(74, 222, 128, 0.35);
            border-radius: 8px;
            padding: 6px 10px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">+ ${tag}</button>`
        )
        .join("");

      const cueBtnsHtml = spec.cues
        .map(
          (cue) => `
          <button type="button" data-insert-tag="${cue}" style="
            background: rgba(56, 189, 248, 0.12);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 8px;
            padding: 5px 9px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">+ ${cue}</button>`
        )
        .join("");

      const tipsHtml = spec.tips
        .map(
          (tip) => `
          <div style="font-size:12px;color:#cbd5e1;padding:6px 10px;background:rgba(255,255,255,0.03);border-left:2px solid #4ade80;border-radius:6px">
            ${tip}
          </div>`
        )
        .join("");

      dock.innerHTML = `
        <!-- Top Header: Genre Selector + Live Technical Telemetry -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08)">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span style="font-family:monospace;font-size:11px;color:#4ade80;font-weight:800;letter-spacing:0.08em">
              🎛️ STRUCTURE &amp; TECHNICAL COACH:
            </span>
            <select id="synts-genre-select" style="
              background:#070b12;color:#4ade80;border:1px solid rgba(74,222,128,0.45);
              border-radius:10px;padding:7px 12px;font-family:monospace;font-size:12px;font-weight:800;cursor:pointer;
            ">
              ${genreOptionsHtml}
            </select>
            <button type="button" id="load-genre-blueprint-btn" style="
              background:#4ade80;color:#041208;border:none;border-radius:9px;
              padding:8px 13px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;
            ">⚡ INSERT FULL ${currentGenreKey.split("_")[0]} BLUEPRINT</button>
          </div>

          <!-- Live Bar, Syllable & Timing Meters -->
          <div style="display:flex;gap:8px;flex-wrap:wrap;font-family:monospace;font-size:11px">
            <span id="stat-bars" style="padding:5px 10px;border-radius:8px;background:rgba(255,255,255,0.05);color:#e2e8f0">
              📏 Bars/Lines: <strong style="color:#4ade80">${nonEmptyLines.length}</strong>
            </span>
            <span id="stat-syllables" style="padding:5px 10px;border-radius:8px;background:rgba(255,255,255,0.05);color:#e2e8f0">
              🗣️ Active Line Syllables: <strong style="color:#38bdf8">${activeLineSyllables}</strong>
            </span>
            <span id="stat-time" style="padding:5px 10px;border-radius:8px;background:rgba(255,255,255,0.05);color:#e2e8f0">
              ⏱️ Est. Delivery: <strong style="color:#facc15">${estSeconds}s</strong>
            </span>
          </div>
        </div>

        <!-- Technical Specs Banner (BPM, Meter, Cadence) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin:12px 0">
          <div style="padding:10px 12px;border-radius:10px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.07)">
            <div style="font-size:10px;font-family:monospace;color:#9ca3af">TEMPO &amp; RHYTHM POCKET</div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-top:2px">${spec.bpm}</div>
          </div>
          <div style="padding:10px 12px;border-radius:10px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.07)">
            <div style="font-size:10px;font-family:monospace;color:#9ca3af">METER, CADENCE &amp; RHYME ARCHITECTURE</div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-top:2px">${spec.meter}</div>
          </div>
        </div>

        <!-- One-Click Structural Blocks -->
        <div style="margin-bottom:10px">
          <div style="font-size:10px;font-family:monospace;color:#9ca3af;margin-bottom:6px">
            1. CLICK TO INSERT STRUCTURE SECTION AT CURSOR:
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${roadmapBtnsHtml}
          </div>
        </div>

        <!-- One-Click Technical Production / Performance Cues -->
        <div style="margin-bottom:12px">
          <div style="font-size:10px;font-family:monospace;color:#9ca3af;margin-bottom:6px">
            2. CLICK TO INSERT TECHNICAL / VOCAL / CAMERA CUES:
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${cueBtnsHtml}
          </div>
        </div>

        <!-- Genre Architecture Coaching Rules -->
        <div>
          <div style="font-size:10px;font-family:monospace;color:#4ade80;margin-bottom:6px">
            📐 LIVE GENRE WRITING &amp; STRUCTURE GUIDE:
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px">
            ${tipsHtml}
          </div>
        </div>
      `;

      dock.querySelector("#synts-genre-select").onchange = (e) => {
        currentGenreKey = e.target.value;
        renderAssistant();
      };

      dock.querySelector("#load-genre-blueprint-btn").onclick = () => {
        if (area.value.trim() && !confirm("Append this genre's full structure blueprint into your Notepad?")) {
          return;
        }
        insertAtCursor(area, spec.blueprint);
      };

      dock.querySelectorAll("[data-insert-tag]").forEach((btn) => {
        btn.onclick = () => {
          const tag = btn.getAttribute("data-insert-tag");
          insertAtCursor(area, tag);
        };
      });
    }

    // Update live bar, syllable, and delivery time counters while typing
    const updateLiveStats = () => {
      const rawText = area.value || "";
      const nonEmptyLines = rawText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("//") && !l.startsWith("["));
      const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
      const cursorPos = area.selectionStart || rawText.length;
      const currentLine = rawText.slice(0, cursorPos).split("\n").pop() || "";
      const activeSyl = countSyllablesInLine(currentLine);

      const bEl = document.getElementById("stat-bars");
      const sEl = document.getElementById("stat-syllables");
      const tEl = document.getElementById("stat-time");

      if (bEl) bEl.innerHTML = `📏 Bars/Lines: <strong style="color:#4ade80">${nonEmptyLines.length}</strong>`;
      if (sEl) sEl.innerHTML = `🗣️ Active Line Syllables: <strong style="color:#38bdf8">${activeSyl}</strong>`;
      if (tEl) tEl.innerHTML = `⏱️ Est. Delivery: <strong style="color:#facc15">${Math.round(words / 2.4)}s</strong>`;
    };

    area.addEventListener("input", updateLiveStats);
    area.addEventListener("keyup", updateLiveStats);
    area.addEventListener("click", updateLiveStats);

    renderAssistant();
  }

  initNotepadStructureAssistant();
  document.addEventListener("DOMContentLoaded", initNotepadStructureAssistant);
  setTimeout(initNotepadStructureAssistant, 600);
})();
