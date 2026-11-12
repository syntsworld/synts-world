(() => {
  "use strict";

  const STORAGE_TREE_KEY = "synts_artist_tree_v2";

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  function initArtistDirectoryTree() {
    if (document.getElementById("synts-dir-explorer")) return;

    // Locate the right-side "OWN YOUR WORDS." hero card
    const candidates = Array.from(document.querySelectorAll("div, aside, section"));
    const heroVisual =
      document.querySelector(".hero-visual, .hero-card, .vinyl-card") ||
      candidates.find(
        (el) =>
          el.textContent.includes("OWN YOUR WORDS.") &&
          el.textContent.includes("Licensed Lyrics & Projects") &&
          el.offsetWidth >= 240 &&
          el.offsetWidth <= 680
      );

    if (!heroVisual) return;

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
              { name: "Midnight_Gazal_Hook.lyr", meta: "PIN Locked · Hindi/Urdu", target: "#lyrics" },
              { name: "BTM_Cypher_16Bars.txt", meta: "Licensed · ₹499", target: "#lyrics" }
            ]
          },
          {
            name: "Commercial_Chorus_Packs",
            open: false,
            files: [
              { name: "Pop_Hook_TopLine_v2.lyr", meta: "Voice Studio Ready", target: "#lyrics" }
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
              { name: "Dark_Drill_142BPM.wav", meta: "24-Bit WAV + Stems", target: "#marketplace" },
              { name: "Late_Night_LoFi_Stem.zip", meta: "Multi-track Pack", target: "#marketplace" }
            ]
          }
        ]
      },
      {
        id: "cat_video",
        name: "03_Music_Video_&_Visuals",
        icon: "🎬",
        badge: "VIDEO",
        open: false,
        subfolders: [
          {
            name: "Direction_&_Storyboards",
            open: true,
            files: [
              { name: "Official_MV_Treatment.pdf", meta: "4K Scene Breakdown", target: "#marketplace" },
              { name: "Spotify_Canvas_9x16.mp4", meta: "Vertical Visual Loop", target: "#marketplace" }
            ]
          }
        ]
      },
      {
        id: "cat_stories",
        name: "04_Stories_&_Lore",
        icon: "📖",
        badge: "STORIES",
        open: false,
        subfolders: [
          {
            name: "Song_Backstories_&_Scripts",
            open: true,
            files: [
              { name: "Album_Concept_Journal.md", meta: "Artist Storyline", target: "#lyrics" },
              { name: "Short_Film_Dialogue_Act1.doc", meta: "Narrative Script", target: "#lyrics" }
            ]
          }
        ]
      }
    ];

    let treeData = JSON.parse(localStorage.getItem(STORAGE_TREE_KEY) || "null") || defaultTree;
    let activeFilter = "ALL";

    heroVisual.innerHTML = `
      <div id="synts-dir-explorer" style="
        background: linear-gradient(165deg, rgba(16,22,27,0.98), rgba(9,13,16,0.99));
        border: 1px solid rgba(74,222,128,0.22);
        border-radius: 22px;
        padding: 18px;
        box-shadow: 0 26px 64px rgba(0,0,0,0.65);
        color: #f3f4f6;
        text-align: left;
        width: 100%;
      ">
        <!-- Explorer Header Bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08)">
          <div style="display:flex;align-items:center;gap:7px">
            <span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;display:inline-block"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block"></span>
            <span style="font-family:monospace;font-size:12px;color:#9ca3af;margin-left:6px">synts://artist-directory/root</span>
          </div>
          <div style="display:flex;gap:6px">
            <button type="button" id="add-subfolder-btn" style="
              background: rgba(255,255,255,0.06);
              color: #e5e7eb;
              border: 1px solid rgba(255,255,255,0.14);
              border-radius: 8px;
              padding: 4px 9px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">+ SUBFOLDER</button>
            <button type="button" id="add-file-node-btn" style="
              background: rgba(34,197,94,0.16);
              color: #4ade80;
              border: 1px solid rgba(34,197,94,0.38);
              border-radius: 8px;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">+ ADD FILE</button>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div id="synts-filter-tabs" style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0">
          <button type="button" data-cat="ALL" class="dir-tab" style="font-size:11px;padding:4px 10px;border-radius:99px;border:1px solid rgba(74,222,128,0.4);background:rgba(34,197,94,0.18);color:#4ade80;font-family:monospace;cursor:pointer;font-weight:700">ALL ROOTS</button>
          <button type="button" data-cat="LYRICS" class="dir-tab" style="font-size:11px;padding:4px 10px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">📝 LYRICS</button>
          <button type="button" data-cat="MUSIC" class="dir-tab" style="font-size:11px;padding:4px 10px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">🎵 MUSIC</button>
          <button type="button" data-cat="VIDEO" class="dir-tab" style="font-size:11px;padding:4px 10px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">🎬 VIDEO</button>
          <button type="button" data-cat="STORIES" class="dir-tab" style="font-size:11px;padding:4px 10px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1d5db;font-family:monospace;cursor:pointer">📖 STORIES</button>
        </div>

        <!-- Hierarchical Tree Body -->
        <div id="synts-tree-body" style="
          max-height: 320px;
          overflow-y: auto;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        "></div>

        <!-- Explorer Footer -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:10px;color:#4ade80;font-family:monospace;letter-spacing:0.08em">HIERARCHICAL ARTIST WORKSPACE</div>
            <div style="font-size:13px;font-weight:700;color:#fff">Lyrics · Music · Video · Stories</div>
          </div>
          <a href="#lyrics" style="
            font-size:11px;
            color:#000;
            background:#4ade80;
            padding:6px 12px;
            border-radius:8px;
            font-weight:800;
            text-decoration:none;
            font-family:monospace;
          ">STUDIO ↗</a>
        </div>
      </div>
    `;

    const treeBody = document.getElementById("synts-tree-body");

    function saveTree() {
      localStorage.setItem(STORAGE_TREE_KEY, JSON.stringify(treeData));
    }

    function renderTree() {
      treeBody.innerHTML = "";

      treeData.forEach((rootCat, rIdx) => {
        if (activeFilter !== "ALL" && rootCat.badge !== activeFilter) return;

        const totalFiles = rootCat.subfolders.reduce((acc, sf) => acc + sf.files.length, 0);

        const rootBox = document.createElement("div");
        rootBox.style.cssText = `
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
        `;

        // Level 1: Root Category Header
        const rootHeader = document.createElement("div");
        rootHeader.style.cssText = `
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 12px;cursor:pointer;user-select:none;
          background:${rootCat.open ? "rgba(34,197,94,0.07)" : "transparent"};
        `;
        rootHeader.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px">
            <span style="font-family:monospace;color:#4ade80">${rootCat.open ? "▾" : "▸"}</span>
            <span>${rootCat.icon}</span>
            <span style="font-family:monospace">${rootCat.name}/</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;font-family:monospace;padding:2px 7px;border-radius:99px;background:rgba(34,197,94,0.15);color:#4ade80">${rootCat.badge}</span>
            <span style="font-size:11px;color:#9ca3af;font-family:monospace">${totalFiles} files</span>
          </div>
        `;
        rootHeader.onclick = () => {
          treeData[rIdx].open = !treeData[rIdx].open;
          saveTree();
          renderTree();
        };
        rootBox.appendChild(rootHeader);

        // Level 2: Subfolders inside Category
        if (rootCat.open) {
          const subContainer = document.createElement("div");
          subContainer.style.cssText = `
            padding: 8px 10px 10px 18px;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            gap: 8px;
          `;

          rootCat.subfolders.forEach((sub, sIdx) => {
            const subWrap = document.createElement("div");
            subWrap.style.cssText = `
              border-left: 1px dashed rgba(255,255,255,0.18);
              padding-left: 10px;
            `;

            const subHead = document.createElement("div");
            subHead.style.cssText = `
              display:flex;align-items:center;justify-content:space-between;
              padding:4px 6px;cursor:pointer;border-radius:6px;
              background:rgba(255,255,255,0.03);
            `;
            subHead.innerHTML = `
              <div style="font-size:12px;font-family:monospace;color:#e5e7eb;font-weight:600">
                ${sub.open ? "📂" : "📁"} ${sub.name}/
              </div>
              <span style="font-size:10px;color:#9ca3af;font-family:monospace">${sub.files.length} items</span>
            `;
            subHead.onclick = () => {
              treeData[rIdx].subfolders[sIdx].open = !treeData[rIdx].subfolders[sIdx].open;
              saveTree();
              renderTree();
            };
            subWrap.appendChild(subHead);

            // Level 3: Individual Files inside Subfolder
            if (sub.open) {
              const fileList = document.createElement("div");
              fileList.style.cssText = `
                margin-top: 6px;
                padding-left: 12px;
                display: flex;
                flex-direction: column;
                gap: 5px;
              `;

              sub.files.forEach((file, fIdx) => {
                const fileRow = document.createElement("div");
                fileRow.style.cssText = `
                  display:flex;align-items:center;justify-content:space-between;
                  padding:6px 8px;border-radius:8px;
                  background:rgba(0,0,0,0.32);
                  border-left:2px solid #4ade80;
                  cursor:pointer;
                `;
                fileRow.innerHTML = `
                  <div style="min-width:0;flex:1" data-jump="${file.target || "#lyrics"}">
                    <div style="font-size:12px;font-family:monospace;color:#f3f4f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">├─ ${file.name}</div>
                    <div style="font-size:10px;color:#9ca3af">${file.meta}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;margin-left:8px">
                    <span style="font-size:10px;color:#4ade80;font-family:monospace" data-jump="${file.target || "#lyrics"}">OPEN →</span>
                    <button type="button" title="Delete file" data-del="${rIdx}-${sIdx}-${fIdx}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:11px;padding:2px">✕</button>
                  </div>
                `;

                fileRow.querySelectorAll("[data-jump]").forEach((el) => {
                  el.onclick = () => {
                    const targetEl = document.querySelector(file.target || "#lyrics");
                    if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
                  };
                });

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

    // Category filter pill clicks
    document.querySelectorAll("#synts-filter-tabs .dir-tab").forEach((btn) => {
      btn.onclick = () => {
        activeFilter = btn.getAttribute("data-cat") || "ALL";
        document.querySelectorAll("#synts-filter-tabs .dir-tab").forEach((b) => {
          const isActive = b === btn;
          b.style.background = isActive ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)";
          b.style.color = isActive ? "#4ade80" : "#d1d5db";
          b.style.borderColor = isActive ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)";
        });
        renderTree();
      };
    });

    // + SUBFOLDER button
    document.getElementById("add-subfolder-btn").onclick = () => {
      const catChoice = prompt(
        "Select Root Category for new subfolder:\n1 = 01_Lyrics_Vault\n2 = 02_Music_&_Stems\n3 = 03_Music_Video_&_Visuals\n4 = 04_Stories_&_Lore",
        "1"
      );
      if (!catChoice) return;
      const rIdx = Math.min(Math.max((parseInt(catChoice, 10) || 1) - 1, 0), 3);
      const folderName = prompt("Enter new Subfolder name (e.g. Unreleased_Demos_2026):");
      if (!folderName) return;

      treeData[rIdx].open = true;
      treeData[rIdx].subfolders.unshift({
        name: folderName.trim().replace(/\s+/g, "_"),
        open: true,
        files: []
      });
      saveTree();
      renderTree();
      notify(`Created subfolder "${folderName}" under ${treeData[rIdx].name}`);
    };

    // + ADD FILE button
    document.getElementById("add-file-node-btn").onclick = () => {
      const catChoice = prompt(
        "Select Category to add file into:\n1 = Lyrics Vault\n2 = Music & Stems\n3 = Music Video & Visuals\n4 = Stories & Lore",
        "1"
      );
      if (!catChoice) return;
      const rIdx = Math.min(Math.max((parseInt(catChoice, 10) || 1) - 1, 0), 3);
      const rootCat = treeData[rIdx];

      if (!rootCat.subfolders.length) {
        rootCat.subfolders.push({ name: "General_Workspace", open: true, files: [] });
      }

      const subListText = rootCat.subfolders.map((s, i) => `${i + 1} = ${s.name}`).join("\n");
      const subChoice = prompt(`Choose Subfolder in ${rootCat.name}:\n${subListText}`, "1");
      const sIdx = Math.min(Math.max((parseInt(subChoice, 10) || 1) - 1, 0), rootCat.subfolders.length - 1);

      const fileName = prompt("Enter File Name (e.g. Verse_Draft_v1.lyr, Beat_Stem.wav, Story_Script.md):");
      if (!fileName) return;
      const metaInfo = prompt("Enter File Details / Price / Status:", "Artist Project · Verified") || "Artist File";

      rootCat.open = true;
      rootCat.subfolders[sIdx].open = true;
      rootCat.subfolders[sIdx].files.unshift({
        name: fileName.trim().replace(/\s+/g, "_"),
        meta: metaInfo,
        target: rIdx === 0 || rIdx === 3 ? "#lyrics" : "#marketplace"
      });

      saveTree();
      renderTree();
      notify(`Added "${fileName}" to ${rootCat.subfolders[sIdx].name}/`);
    };

    renderTree();
  }

  initArtistDirectoryTree();
  document.addEventListener("DOMContentLoaded", initArtistDirectoryTree);
  setTimeout(initArtistDirectoryTree, 600);
})();
