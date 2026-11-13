(() => {
  "use strict";

  const STORAGE_TREE_KEY = "synts_artist_custom_tree_v1";
  const STORAGE_RELEASES_KEY = "synts_artist_custom_releases_v1";
  const PROFILE_KEY = "synts_user_profile_v1";

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = String(msg);
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") || { role: "listener", artistBuilderOpen: false };
    } catch (_) {
      return { role: "listener", artistBuilderOpen: false };
    }
  }

  function isArtistCustomizationEnabled() {
    const p = getProfile();
    return p.role === "artist";
  }

  function loadIntoStudio(title, bodyText) {
    const notepadSection = document.querySelector("#lyrics");
    const titleInput = document.getElementById("lyrics-title");
    const area = document.getElementById("lyrics-text");

    if (titleInput) {
      titleInput.value = title;
      titleInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (area) {
      area.value = bodyText;
      area.dispatchEvent(new Event("input", { bubbles: true }));
      area.focus();
    }
    if (notepadSection) notepadSection.scrollIntoView({ behavior: "smooth" });
    notify(`Loaded "${title}" into Notepad!`);
  }

  // Clean up extra promotional sections so only Exploration (#marketplace) & Notepad (#lyrics) remain for normal users
  function cleanPublicLayout() {
    const howSec = document.getElementById("how");
    if (howSec) howSec.style.display = "none";

    const ctaSec = document.querySelector("section.cta");
    if (ctaSec && !ctaSec.querySelector("#synts-releases-hub")) {
      ctaSec.style.display = "none";
    }
  }

  // =========================================================================
  // 1. HERO SECTION: CLEAN EXPLORATION FOR USERS, CUSTOM DIRECTORY BUILDER FOR ARTISTS
  // =========================================================================
  function renderHeroByRole() {
    const heroSection = document.getElementById("home");
    const heroGrid = document.querySelector("#home .hero-grid");
    const heroVisual = document.querySelector(".hero-art");
    if (!heroSection || !heroVisual) return;

    const isArtist = isArtistCustomizationEnabled();

    // NORMAL USER / LISTENER VIEW: Hide the directory builder completely; jump straight to Exploration & Notepad
    if (!isArtist) {
      heroSection.style.display = "none";
      return;
    }

    // ARTIST CUSTOMIZATION VIEW: Show the Blank-Slate Directory Builder
    heroSection.style.display = "block";
    heroSection.style.paddingTop = "calc(var(--header-h, 72px) + 24px)";
    heroSection.style.paddingBottom = "28px";

    if (heroGrid) {
      Array.from(heroGrid.children).forEach((child) => {
        if (!child.classList.contains("hero-art")) child.style.display = "none";
      });
      heroGrid.style.display = "block";
      heroGrid.style.maxWidth = "1160px";
      heroGrid.style.margin = "0 auto";
    }

    heroVisual.style.maxWidth = "1160px";
    heroVisual.style.width = "100%";
    heroVisual.style.margin = "0 auto";

    // Empty Root Structure by default (No pre-filled dummy files!)
    const emptyDefaultTree = [
      { id: "cat_lyrics", name: "01_Lyrics_Vault", icon: "📝", badge: "LYRICS", open: true, subfolders: [] },
      { id: "cat_music", name: "02_Music_&_Stems", icon: "🎵", badge: "MUSIC", open: false, subfolders: [] },
      { id: "cat_video", name: "03_Music_Video_&_Visuals", icon: "🎬", badge: "VIDEO", open: false, subfolders: [] },
      { id: "cat_stories", name: "04_Stories_&_Lore", icon: "📖", badge: "STORIES", open: false, subfolders: [] }
    ];

    let treeData = JSON.parse(localStorage.getItem(STORAGE_TREE_KEY) || "null") || emptyDefaultTree;
    let activeFilter = "ALL";

    const saveTree = () => localStorage.setItem(STORAGE_TREE_KEY, JSON.stringify(treeData));

    heroVisual.innerHTML = `
      <div id="synts-dir-explorer" style="
        background: linear-gradient(160deg, rgba(14, 19, 26, 0.97), rgba(7, 10, 15, 0.99));
        border: 1px solid rgba(74, 222, 128, 0.35);
        border-radius: 24px;
        padding: 22px;
        box-shadow: 0 28px 70px rgba(0,0,0,0.8);
        color: #f3f6fa;
        text-align: left;
      ">
        <!-- Builder Top Bar -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08)">
          <div>
            <span style="font-family:monospace;font-size:11px;color:#4ade80;letter-spacing:0.1em">🎨 ARTIST CUSTOMIZATION STUDIO (PRIVATE BUILDER)</span>
            <h3 style="margin:4px 0 0;font-size:20px;color:#fff">Build Your Custom Artist Directories</h3>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" id="add-root-cat-btn" style="background:rgba(255,255,255,0.06);color:#e2e8f0;border:1px solid rgba(255,255,255,0.16);border-radius:10px;padding:8px 12px;font-size:11px;font-weight:700;font-family:monospace;cursor:pointer">+ NEW CATEGORY</button>
            <button type="button" id="add-subfolder-btn" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:8px 12px;font-size:11px;font-weight:700;font-family:monospace;cursor:pointer">+ NEW SUBFOLDER</button>
            <button type="button" id="add-file-node-btn" style="background:#4ade80;color:#041208;border:none;border-radius:10px;padding:8px 14px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer">+ ADD PROJECT FILE</button>
            <button type="button" id="reset-empty-tree-btn" style="background:rgba(248,113,113,0.12);color:#f87171;border:1px solid rgba(248,113,113,0.3);border-radius:10px;padding:8px 12px;font-size:11px;font-weight:700;font-family:monospace;cursor:pointer">CLEAR ALL</button>
          </div>
        </div>

        <!-- Directory Grid -->
        <div id="synts-tree-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:16px"></div>
      </div>
    `;

    const treeBody = document.getElementById("synts-tree-body");

    function renderTree() {
      treeBody.innerHTML = "";

      treeData.forEach((rootCat, rIdx) => {
        if (activeFilter !== "ALL" && rootCat.badge !== activeFilter) return;
        const totalFiles = (rootCat.subfolders || []).reduce((acc, sf) => acc + (sf.files || []).length, 0);

        const rootBox = document.createElement("div");
        rootBox.style.cssText = "background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.09);border-radius:14px;overflow:hidden;";

        const rootHeader = document.createElement("div");
        rootHeader.style.cssText = `display:flex;align-items:center;justify-content:space-between;padding:11px 13px;cursor:pointer;background:${rootCat.open ? "rgba(74,222,128,0.08)" : "transparent"};`;
        rootHeader.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:13px">
            <span style="font-family:monospace;color:#4ade80">${rootCat.open ? "▾" : "▸"}</span>
            <span>${rootCat.icon || "📁"}</span>
            <span style="font-family:monospace">${rootCat.name}/</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:10px;font-family:monospace;padding:2px 8px;border-radius:99px;background:rgba(74,222,128,0.16);color:#4ade80">${totalFiles} files</span>
            <button type="button" data-del-cat="${rIdx}" title="Remove Category" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:11px">✕</button>
          </div>
        `;

        rootHeader.onclick = (e) => {
          if (e.target.hasAttribute("data-del-cat")) return;
          treeData[rIdx].open = !treeData[rIdx].open;
          saveTree();
          renderTree();
        };

        rootHeader.querySelector("[data-del-cat]").onclick = (e) => {
          e.stopPropagation();
          if (!confirm(`Delete category "${rootCat.name}"?`)) return;
          treeData.splice(rIdx, 1);
          saveTree();
          renderTree();
        };

        rootBox.appendChild(rootHeader);

        if (rootCat.open) {
          const subContainer = document.createElement("div");
          subContainer.style.cssText = "padding:10px 12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;gap:8px";

          if (!rootCat.subfolders || rootCat.subfolders.length === 0) {
            subContainer.innerHTML = `<div style="font-size:11px;color:#64748b;font-family:monospace;padding:4px 0">Empty category. Click "+ NEW SUBFOLDER" or "+ ADD PROJECT FILE" to build.</div>`;
          } else {
            rootCat.subfolders.forEach((sub, sIdx) => {
              const subWrap = document.createElement("div");
              subWrap.style.cssText = "border-left:1px dashed rgba(255,255,255,0.2);padding-left:10px";

              const subHead = document.createElement("div");
              subHead.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:4px 6px;cursor:pointer;border-radius:6px;background:rgba(255,255,255,0.03)";
              subHead.innerHTML = `
                <div style="font-size:12px;font-family:monospace;color:#e5e7eb;font-weight:700">${sub.open ? "📂" : "📁"} ${sub.name}/</div>
                <span style="font-size:10px;color:#9ca3af;font-family:monospace">${(sub.files || []).length}</span>
              `;
              subHead.onclick = () => {
                treeData[rIdx].subfolders[sIdx].open = !treeData[rIdx].subfolders[sIdx].open;
                saveTree();
                renderTree();
              };
              subWrap.appendChild(subHead);

              if (sub.open && sub.files && sub.files.length) {
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
                      <span style="font-size:10px;color:#4ade80;font-family:monospace;font-weight:700" data-open-file>OPEN ↗</span>
                      <button type="button" data-del style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:11px">✕</button>
                    </div>
                  `;
                  fileRow.querySelector("[data-open-file]").onclick = (e) => {
                    e.stopPropagation();
                    loadIntoStudio(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "), file.snippet || "");
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
          }
          rootBox.appendChild(subContainer);
        }
        treeBody.appendChild(rootBox);
      });
    }

    // + NEW ROOT CATEGORY
    document.getElementById("add-root-cat-btn").onclick = () => {
      const name = prompt("Enter New Root Category Name (e.g. 05_Unreleased_Albums):");
      if (!name) return;
      const badge = prompt("Short Category Badge (e.g. ALBUM, LYRICS, AUDIO):", "CUSTOM") || "CUSTOM";
      treeData.push({
        id: "cat_" + Date.now(),
        name: name.trim().replace(/\s+/g, "_"),
        icon: "📁",
        badge: badge.toUpperCase(),
        open: true,
        subfolders: []
      });
      saveTree();
      renderTree();
      notify(`Created category "${name}"`);
    };

    // + NEW SUBFOLDER
    document.getElementById("add-subfolder-btn").onclick = () => {
      if (!treeData.length) return notify("Create a root category first!", true);
      const list = treeData.map((c, i) => `${i + 1} = ${c.name}`).join("\n");
      const choice = prompt(`Choose Category to add a subfolder into:\n${list}`, "1");
      if (!choice) return;
      const rIdx = Math.min(Math.max((parseInt(choice, 10) || 1) - 1, 0), treeData.length - 1);
      const subName = prompt("Enter Subfolder Name (e.g. Acoustic_Sessions):");
      if (!subName) return;
      treeData[rIdx].open = true;
      treeData[rIdx].subfolders.push({
        name: subName.trim().replace(/\s+/g, "_"),
        open: true,
        files: []
      });
      saveTree();
      renderTree();
      notify(`Added subfolder "${subName}"`);
    };

    // + ADD PROJECT FILE
    document.getElementById("add-file-node-btn").onclick = () => {
      if (!treeData.length) return notify("Create a category first!", true);
      const list = treeData.map((c, i) => `${i + 1} = ${c.name}`).join("\n");
      const choice = prompt(`Select Category:\n${list}`, "1");
      if (!choice) return;
      const rIdx = Math.min(Math.max((parseInt(choice, 10) || 1) - 1, 0), treeData.length - 1);
      const rootCat = treeData[rIdx];

      if (!rootCat.subfolders.length) {
        const defaultSub = prompt("Enter a Subfolder name for this file:", "Main_Projects");
        if (!defaultSub) return;
        rootCat.subfolders.push({ name: defaultSub.trim().replace(/\s+/g, "_"), open: true, files: [] });
      }

      const subList = rootCat.subfolders.map((s, i) => `${i + 1} = ${s.name}`).join("\n");
      const subChoice = prompt(`Choose Subfolder:\n${subList}`, "1");
      const sIdx = Math.min(Math.max((parseInt(subChoice, 10) || 1) - 1, 0), rootCat.subfolders.length - 1);

      const fileName = prompt("Enter File Name (e.g. My_Song_Lyrics.lyr):");
      if (!fileName) return;
      const meta = prompt("Enter Price or Status Tag (e.g. ₹499 · Original Lyrics):", "Artist Project") || "Artist Project";
      const snippet = document.getElementById("lyrics-text")?.value || "";

      rootCat.open = true;
      rootCat.subfolders[sIdx].open = true;
      rootCat.subfolders[sIdx].files.unshift({
        name: fileName.trim().replace(/\s+/g, "_"),
        meta,
        snippet
      });
      saveTree();
      renderTree();
      notify(`Added "${fileName}" to your custom directory!`);
    };

    // CLEAR ALL
    document.getElementById("reset-empty-tree-btn").onclick = () => {
      if (!confirm("Reset all folders to an empty slate?")) return;
      treeData = emptyDefaultTree;
      saveTree();
      renderTree();
      notify("Directory reset to blank slate.");
    };

    renderTree();
  }

  // Listen for Role / Customization changes from Account Hub
  window.addEventListener("synts-role-changed", () => {
    cleanPublicLayout();
    renderHeroByRole();
  });

  function boot() {
    cleanPublicLayout();
    renderHeroByRole();
  }

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 400);
})();
