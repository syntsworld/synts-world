(() => {
  "use strict";

  const STORAGE_TREE_KEY = "synts_artist_tree_v3";
  const STORAGE_WRITING_KEY = "synts_writing_explorer_v1";
  const STORAGE_RELEASES_KEY = "synts_releases_catalog_v1";

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  function loadIntoStudio(title, bodyText) {
    const notepadSection = document.querySelector("#lyrics, #studio, textarea");
    const titleInput = document.querySelector("#lyrics-title, input[placeholder*='Song']");
    const area = document.querySelector("#lyrics-text, #lyrics textarea, textarea");

    if (titleInput) {
      titleInput.value = title;
      titleInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (area) {
      area.value = bodyText;
      area.dispatchEvent(new Event("input", { bubbles: true }));
      area.focus();
    }
    if (notepadSection) {
      notepadSection.scrollIntoView({ behavior: "smooth" });
    }
    notify(`Loaded "${title}" into Writing Studio!`);
  }

  // 1. FULL-WIDTH HERO STUDIO DIRECTORY (REMOVES LEFT TEXT CLUTTER)
  function initArtistDirectoryTree() {
    if (document.getElementById("synts-dir-explorer")) return;

    const heroGrid = document.querySelector("#home .hero-grid, .hero-grid");
    const heroSection = document.querySelector("#home, .hero");
    const heroVisual = document.querySelector(".hero-art") || heroGrid;
    if (!heroVisual) return;

    if (heroGrid) {
      Array.from(heroGrid.children).forEach((child) => {
        if (!child.classList.contains("hero-art")) {
          child.style.display = "none";
        }
      });
      heroGrid.style.display = "block";
      heroGrid.style.maxWidth = "1160px";
      heroGrid.style.margin = "0 auto";
    }

    if (heroSection) {
      heroSection.style.paddingTop = "calc(var(--header-h, 72px) + 28px)";
      heroSection.style.paddingBottom = "36px";
    }

    heroVisual.style.maxWidth = "1160px";
    heroVisual.style.width = "100%";
    heroVisual.style.margin = "0 auto";

    const defaultTree = [
      {
        id: "cat_lyrics",
        name: "01_Lyrics_Vault",
        icon: "📝",
        badge: "LYRICS",
        open: true,
        subfolders: [
          {
            name: "Hindi_&_Urdu_Verses",
            open: true,
            files: [
              {
                name: "Midnight_Gazal_Hook.lyr",
                meta: "PIN Locked · Hindi/Urdu",
                target: "#lyrics",
                snippet: "[MATLA]\nHum muntazir rahe kisi aahat ke waaste,\nMusafir nikal pade nayi chahat ke waaste..."
              },
              {
                name: "BTM_Cypher_16Bars.txt",
                meta: "Licensed · ₹499",
                target: "#lyrics",
                snippet: "[16-BAR VERSE]\nRaat ke saaye mein likhe har lafz,\nDil ki awaaz ab rukti nahi..."
              }
            ]
          },
          {
            name: "Commercial_Chorus_Packs",
            open: true,
            files: [
              {
                name: "Pop_Hook_TopLine_v2.lyr",
                meta: "Voice Studio Ready",
                target: "#lyrics",
                snippet: "[CHORUS]\nWe are louder than the echoes in the dark,\nTurning every broken whisper to a spark."
              }
            ]
          }
        ]
      },
      {
        id: "cat_music",
        name: "02_Music_&_Stems",
        icon: "🎵",
        badge: "MUSIC",
        open: true,
        subfolders: [
          {
            name: "Mastered_Beats_WAV",
            open: true,
            files: [
              {
                name: "Dark_Drill_142BPM.wav",
                meta: "24-Bit WAV + Stems · ₹1,499",
                target: "#marketplace",
                snippet: "Audio Stem Pack: 808 Sub Bass, Crisp Drill Hats, Ambient Bell Loop (142 BPM)."
              },
              {
                name: "Late_Night_LoFi_Stem.zip",
                meta: "Multi-track Pack · ₹799",
                target: "#marketplace",
                snippet: "Warm Rhodes chords + vinyl crackle + boom-bap drum bus stems."
              }
            ]
          }
        ]
      },
      {
        id: "cat_video",
        name: "03_Music_Video_&_Visuals",
        icon: "🎬",
        badge: "VIDEO",
        open: true,
        subfolders: [
          {
            name: "Direction_&_Storyboards",
            open: true,
            files: [
              {
                name: "Official_MV_Treatment.pdf",
                meta: "4K Scene Breakdown",
                target: "#lyrics",
                snippet: "[SCENE 01 | 00:00 - 00:18 | EXT. ROOFTOP NIGHT]\nAnamorphic 35mm slow push-in under neon rain."
              },
              {
                name: "Spotify_Canvas_9x16.mp4",
                meta: "Vertical Visual Loop",
                target: "#marketplace",
                snippet: "8-second seamless loop graded in dark emerald & tungsten."
              }
            ]
          }
        ]
      },
      {
        id: "cat_stories",
        name: "04_Stories_&_Lore",
        icon: "📖",
        badge: "STORIES",
        open: true,
        subfolders: [
          {
            name: "Song_Backstories_&_Scripts",
            open: true,
            files: [
              {
                name: "Album_Concept_Journal.md",
                meta: "Artist Storyline",
                target: "#lyrics",
                snippet: "[CHAPTER I: THE ORIGIN]\nEvery record starts in silence before the studio mic turns on..."
              },
              {
                name: "Short_Film_Dialogue_Act1.doc",
                meta: "Narrative Script",
                target: "#lyrics",
                snippet: "[VOICEOVER INTRO]\nHar gaane ke peeche ek aisi kahaani hoti hai jo stage par nahi sunayi jaati..."
              }
            ]
          }
        ]
      }
    ];

    let treeData = JSON.parse(localStorage.getItem(STORAGE_TREE_KEY) || "null") || defaultTree;
    let activeFilter = "ALL";
    let selectedFile = treeData[0].subfolders[0].files[0];

    heroVisual.innerHTML = `
      <div id="synts-dir-explorer" style="
        background: linear-gradient(160deg, rgba(14, 19, 26, 0.97), rgba(7, 10, 15, 0.99));
        border: 1px solid rgba(74, 222, 128, 0.32);
        border-radius: 24px;
        padding: 22px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(74,222,128,0.1);
        color: #f3f6fa;
        text-align: left;
        width: 100%;
      ">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.09)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="display:flex;gap:7px">
              <span style="width:11px;height:11px;border-radius:50%;background:#ef4444;display:inline-block"></span>
              <span style="width:11px;height:11px;border-radius:50%;background:#f59e0b;display:inline-block"></span>
              <span style="width:11px;height:11px;border-radius:50%;background:#22c55e;display:inline-block"></span>
            </div>
            <span style="font-family:var(--mono,monospace);font-size:13px;font-weight:700;color:#e2e8f0;background:rgba(255,255,255,0.05);padding:5px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.08)">
              synts://creator-workspace/root
            </span>
          </div>

          <div id="synts-filter-tabs" style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" data-cat="ALL" class="dir-tab" style="font-size:11px;padding:6px 12px;border-radius:99px;border:1px solid rgba(74,222,128,0.45);background:rgba(34,197,94,0.18);color:#4ade80;font-family:monospace;cursor:pointer;font-weight:700">ALL DIRECTORIES</button>
            <button type="button" data-cat="LYRICS" class="dir-tab" style="font-size:11px;padding:6px 12px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">📝 LYRICS</button>
            <button type="button" data-cat="MUSIC" class="dir-tab" style="font-size:11px;padding:6px 12px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">🎵 MUSIC</button>
            <button type="button" data-cat="VIDEO" class="dir-tab" style="font-size:11px;padding:6px 12px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">🎬 VIDEO</button>
            <button type="button" data-cat="STORIES" class="dir-tab" style="font-size:11px;padding:6px 12px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">📖 STORIES</button>
          </div>

          <div style="display:flex;gap:8px">
            <button type="button" id="add-subfolder-btn" style="background:rgba(255,255,255,0.06);color:#f3f4f6;border:1px solid rgba(255,255,255,0.16);border-radius:10px;padding:7px 12px;font-size:11px;font-weight:700;font-family:monospace;cursor:pointer">+ NEW FOLDER</button>
            <button type="button" id="add-file-node-btn" style="background:#4ade80;color:#041208;border:none;border-radius:10px;padding:7px 14px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer">+ NEW FILE</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;margin-top:18px;align-items:start">
          <div id="synts-tree-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;"></div>

          <div id="synts-file-inspector" style="
            background:rgba(0,0,0,0.45);
            border:1px solid rgba(74,222,128,0.28);
            border-radius:18px;
            padding:18px;
            display:flex;
            flex-direction:column;
            justify-content:space-between;
            gap:14px;
          ">
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-family:monospace;font-size:11px;color:#4ade80;letter-spacing:0.08em">⚡ ACTIVE FILE INSPECTOR</span>
                <span style="font-family:monospace;font-size:10px;padding:2px 8px;border-radius:99px;background:rgba(74,222,128,0.16);color:#4ade80">READY</span>
              </div>
              <h3 id="insp-title" style="font-size:18px;font-weight:800;color:#fff;margin:0 0 4px;font-family:monospace">Midnight_Gazal_Hook.lyr</h3>
              <div id="insp-meta" style="font-size:12px;color:#9ca3af;margin-bottom:12px">PIN Locked · Hindi/Urdu</div>
              <pre id="insp-snippet" style="
                margin:0;padding:14px;border-radius:12px;background:#06090e;
                border-left:3px solid #4ade80;color:#e2e8f0;font-family:monospace;
                font-size:12px;line-height:1.6;white-space:pre-wrap;min-height:110px;
              "></pre>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
              <button type="button" id="insp-open-studio" style="
                flex:1;background:#4ade80;color:#041208;border:none;border-radius:10px;
                padding:10px 14px;font-size:12px;font-weight:800;font-family:monospace;cursor:pointer;
              ">OPEN IN NOTEPAD STUDIO ↗</button>
              <a href="#marketplace" style="
                background:rgba(255,255,255,0.07);color:#fff;border:1px solid rgba(255,255,255,0.14);
                border-radius:10px;padding:10px 14px;font-size:12px;font-weight:700;font-family:monospace;text-decoration:none;
              ">MARKETPLACE</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const treeBody = document.getElementById("synts-tree-body");
    const saveTree = () => localStorage.setItem(STORAGE_TREE_KEY, JSON.stringify(treeData));

    function updateInspector(file) {
      if (!file) return;
      selectedFile = file;
      document.getElementById("insp-title").textContent = file.name;
      document.getElementById("insp-meta").textContent = file.meta || "Artist Workspace File";
      document.getElementById("insp-snippet").textContent =
        file.snippet || `// FILE: ${file.name}\n// INFO: ${file.meta}\n\nClick "OPEN IN NOTEPAD STUDIO" below to edit or license this file.`;
    }

    document.getElementById("insp-open-studio").onclick = () => {
      if (!selectedFile) return;
      loadIntoStudio(
        selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        selectedFile.snippet || `// ${selectedFile.name}\n\n`
      );
    };

    function renderTree() {
      treeBody.innerHTML = "";
      treeData.forEach((rootCat, rIdx) => {
        if (activeFilter !== "ALL" && rootCat.badge !== activeFilter) return;
        const totalFiles = rootCat.subfolders.reduce((acc, sf) => acc + sf.files.length, 0);

        const rootBox = document.createElement("div");
        rootBox.style.cssText = "background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:14px;overflow:hidden;";

        const rootHeader = document.createElement("div");
        rootHeader.style.cssText = `display:flex;align-items:center;justify-content:space-between;padding:11px 13px;cursor:pointer;user-select:none;background:${rootCat.open ? "rgba(74,222,128,0.08)" : "transparent"};`;
        rootHeader.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:13px">
            <span style="font-family:monospace;color:#4ade80">${rootCat.open ? "▾" : "▸"}</span>
            <span>${rootCat.icon}</span>
            <span style="font-family:monospace">${rootCat.name}/</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;font-family:monospace;padding:2px 8px;border-radius:99px;background:rgba(74,222,128,0.16);color:#4ade80">${rootCat.badge}</span>
            <span style="font-size:11px;color:#9ca3af;font-family:monospace">${totalFiles}</span>
          </div>
        `;
        rootHeader.onclick = () => {
          treeData[rIdx].open = !treeData[rIdx].open;
          saveTree();
          renderTree();
        };
        rootBox.appendChild(rootHeader);

        if (rootCat.open) {
          const subContainer = document.createElement("div");
          subContainer.style.cssText = "padding:8px 10px 10px 14px;border-top:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;gap:8px";

          rootCat.subfolders.forEach((sub, sIdx) => {
            const subWrap = document.createElement("div");
            subWrap.style.cssText = "border-left:1px dashed rgba(255,255,255,0.2);padding-left:9px";

            const subHead = document.createElement("div");
            subHead.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:4px 6px;cursor:pointer;border-radius:6px;background:rgba(255,255,255,0.03)";
            subHead.innerHTML = `
              <div style="font-size:12px;font-family:monospace;color:#e5e7eb;font-weight:700">${sub.open ? "📂" : "📁"} ${sub.name}/</div>
              <span style="font-size:10px;color:#9ca3af;font-family:monospace">${sub.files.length}</span>
            `;
            subHead.onclick = () => {
              treeData[rIdx].subfolders[sIdx].open = !treeData[rIdx].subfolders[sIdx].open;
              saveTree();
              renderTree();
            };
            subWrap.appendChild(subHead);

            if (sub.open) {
              const fileList = document.createElement("div");
              fileList.style.cssText = "margin-top:6px;padding-left:8px;display:flex;flex-direction:column;gap:5px";

              sub.files.forEach((file, fIdx) => {
                const fileRow = document.createElement("div");
                fileRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,0.4);border-left:2px solid #4ade80;cursor:pointer";
                fileRow.innerHTML = `
                  <div style="min-width:0;flex:1">
                    <div style="font-size:12px;font-family:monospace;color:#f3f4f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">├─ ${file.name}</div>
                    <div style="font-size:10px;color:#9ca3af">${file.meta}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;margin-left:6px">
                    <span style="font-size:10px;color:#4ade80;font-family:monospace;font-weight:700" data-open-file>STUDIO ↗</span>
                    <button type="button" title="Delete file" data-del style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:11px;padding:2px">✕</button>
                  </div>
                `;
                fileRow.onclick = () => updateInspector(file);
                fileRow.querySelector("[data-open-file]").onclick = (e) => {
                  e.stopPropagation();
                  updateInspector(file);
                  loadIntoStudio(
                    file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
                    file.snippet || `// ${file.name}\n\n`
                  );
                };
                fileRow.querySelector("[data-del]").onclick = (e) => {
                  e.stopPropagation();
                  treeData[rIdx].subfolders[sIdx].files.splice(fIdx, 1);
                  saveTree();
                  renderTree();
                };
                fileList.appendChild(fileRow);
              });
              subWrap.appendChild(fileList);
            }
            subContainer.appendChild(subWrap);
          });
          rootBox.appendChild(subContainer);
        }
        treeBody.appendChild(rootBox);
      });
    }

    document.querySelectorAll("#synts-filter-tabs .dir-tab").forEach((btn) => {
      btn.onclick = () => {
        activeFilter = btn.getAttribute("data-cat") || "ALL";
        document.querySelectorAll("#synts-filter-tabs .dir-tab").forEach((b) => {
          const isActive = b === btn;
          b.style.background = isActive ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)";
          b.style.color = isActive ? "#4ade80" : "#d1d5db";
          b.style.borderColor = isActive ? "rgba(74,222,128,0.45)" : "rgba(255,255,255,0.1)";
        });
        renderTree();
      };
    });

    document.getElementById("add-subfolder-btn").onclick = () => {
      const catChoice = prompt("Select Root Category:\n1 = 01_Lyrics_Vault\n2 = 02_Music_&_Stems\n3 = 03_Music_Video_&_Visuals\n4 = 04_Stories_&_Lore", "1");
      if (!catChoice) return;
      const rIdx = Math.min(Math.max((parseInt(catChoice, 10) || 1) - 1, 0), 3);
      const folderName = prompt("Enter Subfolder Name (e.g. Unreleased_Hooks_2026):");
      if (!folderName) return;
      treeData[rIdx].open = true;
      treeData[rIdx].subfolders.unshift({ name: folderName.trim().replace(/\s+/g, "_"), open: true, files: [] });
      saveTree();
      renderTree();
      notify(`Created folder "${folderName}"`);
    };

    document.getElementById("add-file-node-btn").onclick = () => {
      const catChoice = prompt("Select Category:\n1 = Lyrics Vault\n2 = Music & Stems\n3 = Music Video & Visuals\n4 = Stories & Lore", "1");
      if (!catChoice) return;
      const rIdx = Math.min(Math.max((parseInt(catChoice, 10) || 1) - 1, 0), 3);
      const rootCat = treeData[rIdx];
      if (!rootCat.subfolders.length) rootCat.subfolders.push({ name: "General_Workspace", open: true, files: [] });
      const subListText = rootCat.subfolders.map((s, i) => `${i + 1} = ${s.name}`).join("\n");
      const subChoice = prompt(`Choose Subfolder:\n${subListText}`, "1");
      const sIdx = Math.min(Math.max((parseInt(subChoice, 10) || 1) - 1, 0), rootCat.subfolders.length - 1);
      const fileName = prompt("Enter File Name (e.g. New_Hook_Verse.lyr):");
      if (!fileName) return;
      const metaInfo = prompt("Enter Price / Tag (e.g. Licensed · ₹499):", "Artist File · Verified") || "Artist File";
      const snippet = prompt("Enter opening lines or notes for this file:", "// New Artist Draft") || "";
      const newFile = { name: fileName.trim().replace(/\s+/g, "_"), meta: metaInfo, snippet, target: "#lyrics" };
      rootCat.open = true;
      rootCat.subfolders[sIdx].open = true;
      rootCat.subfolders[sIdx].files.unshift(newFile);
      saveTree();
      renderTree();
      updateInspector(newFile);
      notify(`Added "${newFile.name}"`);
    };

    updateInspector(selectedFile);
    renderTree();
  }

  // 2. REPLACE "LICENSING THAT PAYS WRITERS." WITH WRITING TEMPLATES
  function initWritingExplorerSection() {
    if (document.getElementById("synts-writing-hub")) return;
    const targetSection =
      document.getElementById("how") ||
      Array.from(document.querySelectorAll("section")).find((s) =>
        (s.textContent || "").toUpperCase().includes("PAYS WRITERS")
      );
    if (!targetSection) return;

    const defaultWritingLibrary = [
      {
        tag: "01 / RAP & MELODIC HOOKS",
        title: "16-Bar Rap Verse + Chorus Blueprint",
        meta: "140 BPM · Intro → Hook → 16-Bar Verse",
        preview: "[HOOK]\nRaat ke saaye mein likhe har lafz,\nDil ki awaaz ab rukti nahi..."
      },
      {
        tag: "02 / URDU & HINDI GAZAL",
        title: "Muntazir & Musafir — Shayari Vault",
        meta: "Radif & Qafiya Structure · Voice Ready",
        preview: "Hum muntazir rahe kisi aahat ke waaste,\nMusafir nikal pade nayi chahat ke waaste..."
      },
      {
        tag: "03 / MUSIC VIDEO SCRIPT",
        title: "Director's Scene & Visual Cue Sheet",
        meta: "Timecode + Camera Angle + Lyric Sync",
        preview: "SCENE 01 [00:00 - 00:18] — EXT. NIGHT ROOFTOP\n35mm slow push-in on vocal intro..."
      },
      {
        tag: "04 / TRACK LORE & MONOLOGUE",
        title: "Song Backstory & Voiceover Script",
        meta: "Spoken Word Intro + Narrative Arc",
        preview: "\"Har gaane ke peeche ek aisi kahaani hoti hai jo stage par nahi sunayi jaati...\""
      }
    ];

    let writingItems = JSON.parse(localStorage.getItem(STORAGE_WRITING_KEY) || "null") || defaultWritingLibrary;

    targetSection.innerHTML = `
      <div id="synts-writing-hub" class="wrap" style="text-align:left">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-bottom:20px">
          <div>
            <span class="eyebrow">// STRUCTURED CREATOR TEMPLATES</span>
            <h2 style="font-size:clamp(22px,3.2vw,32px);font-weight:900;margin:4px 0 0;color:#fff">WRITING TEMPLATES &amp; SCRIPTS</h2>
          </div>
          <button type="button" id="create-writing-entry-btn" style="background:#4ade80;color:#051209;border:none;border-radius:10px;padding:9px 16px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer">+ ADD TEMPLATE</button>
        </div>
        <div id="writing-cards-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px"></div>
      </div>
    `;

    const gridEl = document.getElementById("writing-cards-grid");

    function renderCards() {
      gridEl.innerHTML = "";
      writingItems.forEach((item) => {
        const card = document.createElement("div");
        card.style.cssText = "background:rgba(16,22,30,0.95);border:1px solid rgba(255,255,255,0.09);border-radius:16px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;";
        card.innerHTML = `
          <div>
            <div style="font-family:monospace;font-size:10px;color:#4ade80;margin-bottom:6px">${item.tag}</div>
            <h3 style="font-size:16px;font-weight:800;color:#fff;margin:0 0 4px">${item.title}</h3>
            <div style="font-size:11px;color:#9ca3af;font-family:monospace;margin-bottom:10px">${item.meta}</div>
            <pre style="margin:0;padding:10px;border-radius:8px;background:rgba(0,0,0,0.4);border-left:2px solid #4ade80;color:#d1d5db;font-family:monospace;font-size:11px;white-space:pre-wrap">${item.preview}</pre>
          </div>
          <button type="button" style="width:100%;background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.35);border-radius:8px;padding:8px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer">USE IN NOTEPAD ↗</button>
        `;
        card.querySelector("button").onclick = () => loadIntoStudio(item.title, item.preview);
        gridEl.appendChild(card);
      });
    }

    document.getElementById("create-writing-entry-btn").onclick = () => {
      const title = prompt("Template Title:");
      if (!title) return;
      const preview = prompt("Paste template lines:");
      if (!preview) return;
      writingItems.unshift({ tag: "CUSTOM TEMPLATE", title: title.trim(), meta: "Artist Saved Blueprint", preview: preview.trim() });
      localStorage.setItem(STORAGE_WRITING_KEY, JSON.stringify(writingItems));
      renderCards();
    };

    renderCards();
  }

  // 3. REPLACE "YOUR CREATIVITY DESERVES MILLIONS." WITH LYRICAL PLAYLISTS, PROJECT EPs & SINGLES
  function initReleasesAndPlaylistsSection() {
    if (document.getElementById("synts-releases-hub")) return;

    // Case-insensitive search so it matches regardless of CSS uppercase
    const candidates = Array.from(document.querySelectorAll(".cta-banner, .cta-box, .cta-card, section, div"));
    const ctaTarget = candidates
      .reverse()
      .find((el) => {
        const up = (el.textContent || "").toUpperCase();
        return (
          up.includes("YOUR CREATIVITY") &&
          up.includes("DESERVES MILLIONS") &&
          el.tagName !== "BODY" &&
          el.tagName !== "HTML" &&
          el.tagName !== "MAIN"
        );
      });

    if (!ctaTarget) return;

    const defaultCatalog = [
      {
        type: "PLAYLIST",
        badge: "🎧 LYRICAL PLAYLIST",
        title: "Late Night Urdu & Hindi Acoustic Sessions",
        sub: "Curated Lyrical Playlist · 6 Original Songbooks",
        price: "₹1,299",
        tracks: [
          "01. Muntazir & Musafir (Acoustic Gazal)",
          "02. Khamoshiyan_Verse_Draft.lyr",
          "03. Raat Ke Saaye (Unplugged Hook)",
          "04. Safar-e-Zindagi (Spoken Word Outro)"
        ]
      },
      {
        type: "EP",
        badge: "💿 PROJECT EP",
        title: "After Hours in BTM — 5-Track Concept EP",
        sub: "Full Project EP · Stems + Locked Lyric Vault",
        price: "₹1,499",
        tracks: [
          "01. Intro: 2 AM Traffic (Spoken Lore)",
          "02. Dark Drill Cypher (142 BPM)",
          "03. Neon Rain Rooftop (Melodic Hook)",
          "04. Broken Signals (Bilingual Verse)",
          "05. Epilogue: Dawn Over Silk Board"
        ]
      },
      {
        type: "SINGLE",
        badge: "🎵 SINGLE RELEASE",
        title: "Midnight Cypher (16-Bar Rap & Hook Single)",
        sub: "Lead Single · Commercial Vocal + Lyric License",
        price: "₹499",
        tracks: [
          "01. Midnight Cypher — Main Lyrical Sheet",
          "02. Midnight Cypher — 8-Bar Melodic Chorus",
          "03. Voice Studio Reference Track (Hindi/Eng)"
        ]
      },
      {
        type: "SINGLE",
        badge: "🎵 SINGLE RELEASE",
        title: "Echoes in the Static (Indie Pop Topline)",
        sub: "Radio-Ready Single · Pre-Chorus + Main Hook",
        price: "₹599",
        tracks: [
          "01. Echoes in the Static — Full Lyric Sheet",
          "02. Vocal Harmony & Ad-lib Guide"
        ]
      }
    ];

    let catalog = JSON.parse(localStorage.getItem(STORAGE_RELEASES_KEY) || "null") || defaultCatalog;
    let activeTab = "ALL";

    ctaTarget.innerHTML = `
      <div id="synts-releases-hub" style="max-width:1180px;margin:0 auto;padding:12px 6px;text-align:left">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.09)">
          <div>
            <div style="font-family:monospace;font-size:11px;color:#4ade80;letter-spacing:0.12em;margin-bottom:4px">
              // ARTIST CATALOG &amp; DISCOGRAPHY VAULT
            </div>
            <h2 style="font-size:clamp(22px,3.2vw,34px);font-weight:900;margin:0;color:#fff">
              LYRICAL PLAYLISTS, PROJECT EPs &amp; SINGLES
            </h2>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            <div id="release-filter-pills" style="display:flex;gap:6px;flex-wrap:wrap">
              <button type="button" data-rtype="ALL" class="rel-pill" style="padding:7px 13px;border-radius:99px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;border:1px solid rgba(74,222,128,0.45);background:rgba(34,197,94,0.18);color:#4ade80">ALL RELEASES</button>
              <button type="button" data-rtype="PLAYLIST" class="rel-pill" style="padding:7px 13px;border-radius:99px;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#d1d5db">🎧 LYRICAL PLAYLISTS</button>
              <button type="button" data-rtype="EP" class="rel-pill" style="padding:7px 13px;border-radius:99px;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#d1d5db">💿 PROJECT EPs</button>
              <button type="button" data-rtype="SINGLE" class="rel-pill" style="padding:7px 13px;border-radius:99px;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#d1d5db">🎵 SINGLES</button>
            </div>

            <button type="button" id="add-release-item-btn" style="
              background:#4ade80;color:#041208;border:none;border-radius:10px;
              padding:8px 14px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer;
            ">+ NEW RELEASE</button>
          </div>
        </div>

        <div id="synts-releases-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px"></div>
      </div>
    `;

    const grid = document.getElementById("synts-releases-grid");

    function renderReleases() {
      grid.innerHTML = "";
      catalog.forEach((item) => {
        if (activeTab !== "ALL" && item.type !== activeTab) return;

        const card = document.createElement("div");
        card.style.cssText = `
          background:linear-gradient(165deg,rgba(16,22,31,0.96),rgba(9,13,19,0.99));
          border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:18px;
          display:flex;flex-direction:column;justify-content:space-between;gap:14px;
        `;

        const trackListHtml = (item.tracks || [])
          .map(
            (t) => `
            <div style="font-family:monospace;font-size:11px;color:#d1d5db;padding:5px 8px;border-radius:6px;background:rgba(0,0,0,0.38);border-left:2px solid #4ade80">
              ${t}
            </div>`
          )
          .join("");

        card.innerHTML = `
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-family:monospace;font-size:10px;padding:3px 9px;border-radius:99px;background:rgba(74,222,128,0.15);color:#4ade80;font-weight:700">${item.badge}</span>
              <span style="font-family:monospace;font-size:15px;font-weight:900;color:#4ade80">${item.price}</span>
            </div>

            <h3 style="font-size:17px;font-weight:800;color:#fff;margin:0 0 4px">${item.title}</h3>
            <div style="font-size:11px;color:#9ca3af;margin-bottom:12px">${item.sub}</div>

            <div style="display:flex;flex-direction:column;gap:5px">
              ${trackListHtml}
            </div>
          </div>

          <div style="display:flex;gap:8px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
            <button type="button" data-open-rel style="
              flex:1;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.14);
              border-radius:9px;padding:8px 10px;font-size:11px;font-weight:700;font-family:monospace;cursor:pointer;
            ">OPEN IN STUDIO</button>
            <button type="button" data-buy-lyric data-title="${item.title}" data-price="${item.price.replace(/[^\d]/g, "")}" style="
              flex:1;background:#4ade80;color:#041208;border:none;
              border-radius:9px;padding:8px 10px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer;
            ">LICENSE NOW ↗</button>
          </div>
        `;

        card.querySelector("[data-open-rel]").onclick = () => {
          loadIntoStudio(item.title, `// ${item.badge}: ${item.title}\n// ${item.sub}\n\n` + (item.tracks || []).join("\n"));
        };

        grid.appendChild(card);
      });
    }

    document.querySelectorAll("#release-filter-pills .rel-pill").forEach((btn) => {
      btn.onclick = () => {
        activeTab = btn.getAttribute("data-rtype") || "ALL";
        document.querySelectorAll("#release-filter-pills .rel-pill").forEach((b) => {
          const active = b === btn;
          b.style.background = active ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)";
          b.style.color = active ? "#4ade80" : "#d1d5db";
          b.style.borderColor = active ? "rgba(74,222,128,0.45)" : "rgba(255,255,255,0.12)";
        });
        renderReleases();
      };
    });

    document.getElementById("add-release-item-btn").onclick = () => {
      const typeChoice = prompt("Select Release Format:\n1 = LYRICAL PLAYLIST\n2 = PROJECT EP\n3 = SINGLE", "2");
      if (!typeChoice) return;
      const typeMap = [
        { type: "PLAYLIST", badge: "🎧 LYRICAL PLAYLIST" },
        { type: "EP", badge: "💿 PROJECT EP" },
        { type: "SINGLE", badge: "🎵 SINGLE RELEASE" }
      ];
      const chosen = typeMap[Math.min(Math.max((parseInt(typeChoice, 10) || 2) - 1, 0), 2)];

      const title = prompt("Enter Playlist / EP / Single Title:");
      if (!title) return;
      const price = prompt("Enter License Price in INR (e.g. ₹999):", "₹999") || "₹999";
      const tracksRaw = prompt("Enter Track Names separated by commas:", "01. Intro Verse, 02. Main Chorus Hook") || "01. Main Track";

      catalog.unshift({
        type: chosen.type,
        badge: chosen.badge,
        title: title.trim(),
        sub: `Artist ${chosen.type} · Verified Studio Release`,
        price: price.startsWith("₹") ? price : `₹${price}`,
        tracks: tracksRaw.split(",").map((s) => s.trim()).filter(Boolean)
      });

      localStorage.setItem(STORAGE_RELEASES_KEY, JSON.stringify(catalog));
      renderReleases();
      notify(`Published "${title}" to your Catalog!`);
    };

    renderReleases();
  }

  function bootAll() {
    initArtistDirectoryTree();
    initWritingExplorerSection();
    initReleasesAndPlaylistsSection();
  }

  bootAll();
  document.addEventListener("DOMContentLoaded", bootAll);
  setTimeout(bootAll, 400);
  setTimeout(bootAll, 1200);
})();
