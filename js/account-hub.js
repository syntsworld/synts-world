(() => {
  "use strict";

  const KEYS = {
    PROFILE: "synts_user_profile_v1",
    PURCHASES: "synts_user_purchases_v1",
    LISTEN_HIST: "synts_listening_history_v1",
    READ_HIST: "synts_reading_history_v1",
    SAVED_SONGS: "synts_saved_bookmarks_v1",
    UPLOADS: "synts_custom_listings_sec_v2",
    VAULT: "synts_saved_folder_sec_v2"
  };

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = String(msg);
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  function getStore(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function setStore(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  const defaultProfile = {
    role: "artist",
    name: "Synts",
    handle: "@synts_official",
    bio: "Independent Artist, Songwriter & Producer · Hindi / Urdu / English",
    upiId: "apex.santosh.2001@yescred",
    genre: "Hip-Hop · Acoustic Gazal · Dark Drill"
  };

  function ensureSeedData() {
    if (!localStorage.getItem(KEYS.PROFILE)) setStore(KEYS.PROFILE, defaultProfile);
    if (!localStorage.getItem(KEYS.PURCHASES)) {
      setStore(KEYS.PURCHASES, [
        {
          id: "PUR-9081",
          title: "After Hours in BTM — 5-Track Concept EP",
          type: "Commercial EP License",
          price: "₹1,499",
          utr: "4318****5128",
          date: "Today, 10:15 PM",
          status: "Active License · Stems Ready"
        },
        {
          id: "PUR-7742",
          title: "Midnight Cypher (16-Bar Rap & Hook)",
          type: "Standard Vocal & Lyric Rights",
          price: "₹499",
          utr: "4315****8821",
          date: "Yesterday",
          status: "Unlocked in Studio"
        }
      ]);
    }
    if (!localStorage.getItem(KEYS.LISTEN_HIST)) {
      setStore(KEYS.LISTEN_HIST, [
        { title: "Dark_Drill_142BPM.wav", artist: "Synts", duration: "03:18", lang: "Instrumental + Vocal Ref", time: "Just now" },
        { title: "Muntazir & Musafir (Voice Studio Playback)", artist: "Synts", duration: "02:44", lang: "Urdu / Hindi TTS", time: "25 mins ago" },
        { title: "Late_Night_LoFi_Stem.zip (Preview)", artist: "Synts", duration: "01:55", lang: "24-Bit WAV", time: "2 hours ago" }
      ]);
    }
    if (!localStorage.getItem(KEYS.READ_HIST)) {
      setStore(KEYS.READ_HIST, [
        { title: "Midnight_Gazal_Hook.lyr", category: "01_Lyrics_Vault", progress: "100% Read", time: "10 mins ago" },
        { title: "Official_MV_Treatment.pdf", category: "03_Music_Video_&_Visuals", progress: "Scene 01 - 03", time: "1 hour ago" },
        { title: "Album_Concept_Journal.md", category: "04_Stories_&_Lore", progress: "Chapter I Completed", time: "Yesterday" }
      ]);
    }
    if (!localStorage.getItem(KEYS.SAVED_SONGS)) {
      setStore(KEYS.SAVED_SONGS, [
        { title: "BTM_Cypher_16Bars.txt", tag: "Rap Verse · 140 BPM", price: "₹499" },
        { title: "Pop_Hook_TopLine_v2.lyr", tag: "Commercial Chorus", price: "₹599" },
        { title: "Echoes in the Static (Single)", tag: "Indie Topline", price: "₹599" }
      ]);
    }
  }

  let activeTab = "OVERVIEW";
  let drawerOpen = true; // Open by default on desktop

  function injectSidebarStyles() {
    if (document.getElementById("synts-left-dock-css")) return;
    const style = document.createElement("style");
    style.id = "synts-left-dock-css";
    style.textContent = `
      @media (min-width: 1100px) {
        body.synts-dock-expanded main,
        body.synts-dock-expanded footer {
          margin-left: 350px !important;
          width: calc(100% - 350px) !important;
          transition: margin-left 0.25s ease, width 0.25s ease;
        }
        body.synts-dock-collapsed main,
        body.synts-dock-collapsed footer {
          margin-left: 68px !important;
          width: calc(100% - 68px) !important;
          transition: margin-left 0.25s ease, width 0.25s ease;
        }
      }
      #synts-left-sidebar::-webkit-scrollbar { width: 5px; }
      #synts-left-sidebar::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.28); border-radius: 99px; }
    `;
    document.head.appendChild(style);
  }

  function buildLeftPerpendicularSidebar() {
    // Remove old horizontal bottom section if it existed
    const oldBottom = document.getElementById("synts-account-center");
    if (oldBottom) oldBottom.remove();

    let sidebar = document.getElementById("synts-left-sidebar");
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.id = "synts-left-sidebar";
      document.body.appendChild(sidebar);
    }

    if (window.innerWidth < 1100 && !window.__syntsMobileInit) {
      window.__syntsMobileInit = true;
      drawerOpen = false;
    }

    renderSidebar();
  }

  function renderSidebar() {
    const sidebar = document.getElementById("synts-left-sidebar");
    if (!sidebar) return;

    document.body.classList.toggle("synts-dock-expanded", drawerOpen);
    document.body.classList.toggle("synts-dock-collapsed", !drawerOpen);

    const profile = getStore(KEYS.PROFILE, defaultProfile);
    const purchases = getStore(KEYS.PURCHASES, []);
    const listenHist = getStore(KEYS.LISTEN_HIST, []);
    const readHist = getStore(KEYS.READ_HIST, []);
    const savedSongs = getStore(KEYS.SAVED_SONGS, []);
    const customUploads = getStore(KEYS.UPLOADS, []);
    const encryptedVault = getStore(KEYS.VAULT, []);
    const treeDirs = getStore("synts_artist_tree_v3", []);

    const totalUploadedFiles =
      customUploads.length +
      encryptedVault.length +
      treeDirs.reduce((acc, c) => acc + (c.subfolders || []).reduce((s, f) => s + (f.files || []).length, 0), 0);

    const navItems = [
      { id: "OVERVIEW", icon: "⚡", label: "Dashboard", count: "" },
      { id: "UPLOADS", icon: "☁️", label: "Uploads & Vault", count: totalUploadedFiles },
      { id: "PURCHASES", icon: "🛍️", label: "My Purchases", count: purchases.length },
      { id: "LISTENING", icon: "🎧", label: "Listening History", count: listenHist.length },
      { id: "READING", icon: "📖", label: "Reading History", count: readHist.length },
      { id: "SAVED", icon: "❤️", label: "Saved Songs", count: savedSongs.length },
      { id: "SETTINGS", icon: "⚙️", label: "Profile Settings", count: "" }
    ];

    sidebar.style.cssText = `
      position: fixed;
      top: 76px;
      bottom: 84px;
      left: 10px;
      width: ${drawerOpen ? "334px" : "54px"};
      z-index: 950;
      background: linear-gradient(180deg, rgba(12, 17, 25, 0.98), rgba(7, 10, 15, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.32);
      border-radius: 22px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 28px rgba(74, 222, 128, 0.08);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.24s cubic-bezier(0.16, 1, 0.3, 1);
      color: #f3f6fc;
      text-align: left;
    `;

    // Collapsed Narrow Rail View (Perpendicular Icon Rail)
    if (!drawerOpen) {
      sidebar.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:10px;height:100%">
          <button type="button" id="toggle-left-dock" title="Expand Studio Sidebar" style="
            width:38px;height:38px;border-radius:12px;background:#4ade80;color:#041208;
            border:none;font-weight:900;font-size:15px;cursor:pointer;
          ">❯</button>
          <div style="width:28px;height:1px;background:rgba(255,255,255,0.1);margin:2px 0"></div>
          ${navItems
            .map(
              (item) => `
            <button type="button" data-rail-tab="${item.id}" title="${item.label}" style="
              width:38px;height:38px;border-radius:11px;
              border:1px solid ${activeTab === item.id ? "rgba(74,222,128,0.55)" : "transparent"};
              background:${activeTab === item.id ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)"};
              font-size:16px;cursor:pointer;display:grid;place-items:center;
            ">${item.icon}</button>`
            )
            .join("")}
        </div>
      `;

      sidebar.querySelector("#toggle-left-dock").onclick = () => {
        drawerOpen = true;
        renderSidebar();
      };
      sidebar.querySelectorAll("[data-rail-tab]").forEach((btn) => {
        btn.onclick = () => {
          activeTab = btn.getAttribute("data-rail-tab");
          drawerOpen = true;
          renderSidebar();
        };
      });
      return;
    }

    // Active Content Panel inside the Vertical Left Dock
    let panelBodyHtml = "";

    if (activeTab === "OVERVIEW") {
      panelBodyHtml = `
        <!-- 2x2 Compact Vertical Metric Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">UPLOADS & VAULT</div>
            <div style="font-size:20px;font-weight:900;color:#4ade80">${totalUploadedFiles}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">PURCHASES</div>
            <div style="font-size:20px;font-weight:900;color:#38bdf8">${purchases.length}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">SONGS PLAYED</div>
            <div style="font-size:20px;font-weight:900;color:#a78bfa">${listenHist.length}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">LYRICS READ</div>
            <div style="font-size:20px;font-weight:900;color:#facc15">${readHist.length}</div>
          </div>
        </div>

        <div style="font-family:monospace;font-size:10px;color:#4ade80;font-weight:800;margin-bottom:6px">🎧 RECENT LISTENING</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
          ${listenHist
            .slice(0, 3)
            .map(
              (item) => `
            <div style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:9px;border-left:3px solid #38bdf8">
              <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.title}</div>
              <div style="font-size:10px;color:#9ca3af;display:flex;justify-content:space-between">
                <span>${item.lang}</span><span style="color:#38bdf8">${item.time}</span>
              </div>
            </div>`
            )
            .join("")}
        </div>

        <div style="font-family:monospace;font-size:10px;color:#facc15;font-weight:800;margin-bottom:6px">📖 RECENT READING</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${readHist
            .slice(0, 3)
            .map(
              (item) => `
            <div style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:9px;border-left:3px solid #facc15">
              <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.title}</div>
              <div style="font-size:10px;color:#9ca3af;display:flex;justify-content:space-between">
                <span>${item.progress}</span><span style="color:#facc15">${item.time}</span>
              </div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    if (activeTab === "UPLOADS") {
      const allTreeFiles = [];
      treeDirs.forEach((cat) => {
        (cat.subfolders || []).forEach((sub) => {
          (sub.files || []).forEach((f) => {
            allTreeFiles.push({ name: f.name, meta: f.meta, folder: sub.name });
          });
        });
      });

      panelBodyHtml = `
        <div style="font-family:monospace;font-size:10px;color:#4ade80;font-weight:800;margin-bottom:8px">☁️ UPLOADED FILES & VAULT (${allTreeFiles.length})</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          ${allTreeFiles
            .map(
              (f) => `
            <div style="padding:9px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px">
              <div style="font-size:10px;font-family:monospace;color:#4ade80">📁 ${f.folder}</div>
              <div style="font-size:12px;font-weight:800;color:#fff;font-family:monospace">${f.name}</div>
              <div style="font-size:10px;color:#9ca3af">${f.meta}</div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    if (activeTab === "PURCHASES") {
      panelBodyHtml = `
        <div style="font-family:monospace;font-size:10px;color:#38bdf8;font-weight:800;margin-bottom:8px">🛍️ PURCHASED LICENSES (${purchases.length})</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${purchases
            .map(
              (p) => `
            <div style="padding:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(74,222,128,0.28);border-radius:12px">
              <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:10px;color:#4ade80">
                <span>${p.id}</span><strong>${p.price}</strong>
              </div>
              <div style="font-size:13px;font-weight:800;color:#fff;margin:4px 0">${p.title}</div>
              <div style="font-size:10px;color:#9ca3af;font-family:monospace">UTR: ${p.utr} ·${p.status}</div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    if (activeTab === "LISTENING") {
      panelBodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-family:monospace;font-size:10px;color:#38bdf8;font-weight:800">🎧 LISTENING HISTORY</span>
          <button type="button" id="clear-listen-btn" style="font-size:10px;color:#f87171;background:none;border:none;cursor:pointer;font-family:monospace">CLEAR</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:7px">
          ${listenHist
            .map(
              (item) => `
            <div style="padding:9px 10px;background:rgba(255,255,255,0.03);border-left:3px solid #38bdf8;border-radius:9px">
              <div style="font-size:12px;font-weight:800;color:#fff">${item.title}</div>
              <div style="font-size:10px;color:#9ca3af">${item.artist} · ${item.lang} (${item.time})</div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    if (activeTab === "READING") {
      panelBodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-family:monospace;font-size:10px;color:#facc15;font-weight:800">📖 READING HISTORY</span>
          <button type="button" id="clear-read-btn" style="font-size:10px;color:#f87171;background:none;border:none;cursor:pointer;font-family:monospace">CLEAR</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:7px">
          ${readHist
            .map(
              (item) => `
            <div style="padding:9px 10px;background:rgba(255,255,255,0.03);border-left:3px solid #facc15;border-radius:9px">
              <div style="font-size:12px;
