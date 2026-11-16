(() => {
  "use strict";

  const KEYS = {
    PROFILE: "synts_user_profile_v1",
    PURCHASES: "synts_user_purchases_v1",
    LISTEN_HIST: "synts_listening_history_v1",
    READ_HIST: "synts_reading_history_v1",
    SAVED_SONGS: "synts_saved_bookmarks_v1",
    UPLOADS: "synts_custom_listings_sec_v2",
    VAULT: "synts_saved_folder_sec_v2",
    TREE: "synts_artist_custom_tree_v1"
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
    role: "listener",
    name: "Synts",
    handle: "@synts_official",
    upiId: "apex.santosh.2001@yescred"
  };

  let activeTab = "OVERVIEW";
  let drawerOpen = false;

  // Hide the messy marketplace section from the main page and host it in the sidebar menu
  function cleanAndMoveMarketplace() {
    const marketSec = document.getElementById("marketplace");
    if (marketSec) {
      marketSec.style.display = "none"; // Hide from main scroll
    }

    // Top Right Sign In / Profile button
    let rightAuthBtn = document.getElementById("synts-top-auth-btn");
    const nav = document.querySelector("header nav, .navbar, header .wrap, header");
    if (nav && !rightAuthBtn) {
      rightAuthBtn = document.createElement("button");
      rightAuthBtn.id = "synts-top-auth-btn";
      rightAuthBtn.style.cssText = `
        position: absolute; right: 20px; top: 18px;
        background: rgba(74, 222, 128, 0.15); color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.4); border-radius: 99px;
        padding: 6px 14px; font-family: monospace; font-size: 11px; font-weight: 800; cursor: pointer; z-index: 1000;
      `;
      rightAuthBtn.innerHTML = `🔐 SIGN IN / PROFILE`;
      nav.style.position = nav.style.position || "relative";
      nav.appendChild(rightAuthBtn);
    }

    if (rightAuthBtn) {
      rightAuthBtn.onclick = () => {
        drawerOpen = true;
        activeTab = "SETTINGS";
        renderSidebar();
      };
    }
  }

  function injectSidebarStyles() {
    if (document.getElementById("synts-left-dock-css")) return;
    const style = document.createElement("style");
    style.id = "synts-left-dock-css";
    style.textContent = `
      @media (min-width: 1100px) {
        body.synts-dock-expanded main, body.synts-dock-expanded footer {
          margin-left: 340px !important; width: calc(100% - 340px) !important; transition: margin-left 0.22s ease, width 0.22s ease;
        }
        body.synts-dock-collapsed main, body.synts-dock-collapsed footer {
          margin-left: 68px !important; width: calc(100% - 68px) !important; transition: margin-left 0.22s ease, width 0.22s ease;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildLeftSidebar() {
    let sidebar = document.getElementById("synts-left-sidebar");
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.id = "synts-left-sidebar";
      document.body.appendChild(sidebar);
    }
    renderSidebar();
  }

  function renderSidebar() {
    const sidebar = document.getElementById("synts-left-sidebar");
    if (!sidebar) return;

    document.body.classList.toggle("synts-dock-expanded", drawerOpen);
    document.body.classList.toggle("synts-dock-collapsed", !drawerOpen);

    const profile = getStore(KEYS.PROFILE, defaultProfile);
    const isArtist = profile.role === "artist";
    const purchases = getStore(KEYS.PURCHASES, []);
    const listenHist = getStore(KEYS.LISTEN_HIST, []);
    const readHist = getStore(KEYS.READ_HIST, []);
    const savedSongs = getStore(KEYS.SAVED_SONGS, []);
    const customUploads = getStore(KEYS.UPLOADS, []);
    const treeDirs = getStore(KEYS.TREE, []);

    const totalUploadedFiles =
      customUploads.length +
      treeDirs.reduce((acc, c) => acc + (c.subfolders || []).reduce((s, f) => s + (f.files || []).length, 0), 0);

    const navItems = [
      { id: "OVERVIEW", icon: "⚡", label: "Overview", count: "" },
      { id: "MARKETPLACE", icon: "🎵", label: "Projects & Lyric Directory", count: "" },
      ...(isArtist
        ? [{ id: "CUSTOMIZE", icon: "🛠️", label: "Builder & Directories", count: totalUploadedFiles }]
        : []),
      { id: "PURCHASES", icon: "🛍️", label: "My Purchases", count: purchases.length },
      { id: "LISTENING", icon: "🎧", label: "Listening History", count: listenHist.length },
      { id: "READING", icon: "📖", label: "Reading History", count: readHist.length },
      { id: "SAVED", icon: "❤️", label: "Saved Songs", count: savedSongs.length },
      { id: "SETTINGS", icon: "⚙️", label: "Profile & UPI Settings", count: "" }
    ];

    sidebar.style.cssText = `
      position: fixed; top: 80px; bottom: 88px; left: 10px;
      width: ${drawerOpen ? "340px" : "54px"}; z-index: 950;
      background: linear-gradient(180deg, rgba(12, 17, 25, 0.98), rgba(7, 10, 15, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.32); border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85); display: flex;
      flex-direction: column; overflow: hidden; transition: width 0.22s ease;
      color: #f3f6fc; text-align: left;
    `;

    if (!drawerOpen) {
      sidebar.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:10px;height:100%">
          <button type="button" id="expand-dock-btn" title="Open Menu" style="
            width:38px;height:38px;border-radius:11px;background:#4ade80;color:#041208;
            border:none;font-weight:900;font-size:15px;cursor:pointer;
          ">❯</button>
          <div style="width:28px;height:1px;background:rgba(255,255,255,0.1)"></div>
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
      sidebar.querySelector("#expand-dock-btn").onclick = () => {
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

    let panelHtml = "";

    if (activeTab === "OVERVIEW") {
      panelHtml = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">PURCHASES</div>
            <div style="font-size:20px;font-weight:900;color:#38bdf8">${purchases.length}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">SONGS PLAYED</div>
            <div style="font-size:20px;font-weight:900;color:#a78bfa">${listenHist.length}</div>
          </div>
        </div>
      `;
    }

    if (activeTab === "MARKETPLACE") {
      const releases = window.__syntsReleases || [
        { title: "Musafir (Urdu Drill Lyrics)", genre: "Hip-Hop / Drill", price: "₹499" },
        { title: "Mukhtalif (Lo-Fi Verse & Hook)", genre: "Lo-Fi / Bilingual", price: "₹399" },
        { title: "After Hours (5-Song Pack)", genre: "Full Pack", price: "₹1,499" }
      ];

      panelHtml = `
        <div style="font-family:monospace;font-size:11px;color:#4ade80;font-weight:800;margin-bottom:8px">🎵 PROJECTS &amp; LYRIC LICENSES</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${releases
            .map(
              (r) => `
            <div style="padding:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:10px">
              <div style="font-size:13px;font-weight:800;color:#fff">${r.title || r.song_title}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                <span style="font-size:10px;color:#9ca3af">${r.genre || "Original Lyrics"}</span>
                <strong style="font-size:12px;color:#4ade80">${r.price_inr ? "₹" + r.price_inr : r.price}</strong>
              </div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    if (activeTab === "CUSTOMIZE") {
      panelHtml = `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="font-family:monospace;font-size:10px;color:#4ade80;font-weight:800">🛠️ DIRECTORY BUILDER</div>
          <a href="#home" style="background:#4ade80;color:#041208;padding:10px;border-radius:8px;font-family:monospace;font-size:11px;font-weight:800;text-align:center;text-decoration:none">OPEN BUILDER ↗</a>
        </div>
      `;
    }

    if (activeTab === "PURCHASES") {
      panelHtml = purchases.length
        ? purchases
            .map(
              (p) => `
          <div style="padding:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(74,222,128,0.28);border-radius:10px;margin-bottom:8px">
            <div style="font-size:12px;font-weight:800;color:#fff">${p.title}</div>
            <div style="font-size:10px;color:#4ade80;font-family:monospace">${p.price} · ${p.status}</div>
          </div>`
            )
            .join("")
        : `<div style="font-size:12px;color:#64748b">No purchased licenses yet.</div>`;
    }

    if (activeTab === "LISTENING") {
      panelHtml = listenHist.length
        ? listenHist
            .map(
              (item) => `
          <div style="padding:9px 10px;background:rgba(255,255,255,0.03);border-left:3px solid #38bdf8;border-radius:8px;margin-bottom:6px">
            <div style="font-size:12px;font-weight:700;color:#fff">${item.title}</div>
            <div style="font-size:10px;color:#9ca3af">${item.time}</div>
          </div>`
            )
            .join("")
        : `<div style="font-size:12px;color:#64748b">No listening history.</div>`;
    }

    if (activeTab === "READING") {
      panelHtml = readHist.length
        ? readHist
            .map(
              (item) => `
          <div style="padding:9px 10px;background:rgba(255,255,255,0.03);border-left:3px solid #facc15;border-radius:8px;margin-bottom:6px">
            <div style="font-size:12px;font-weight:700;color:#fff">${item.title}</div>
            <div style="font-size:10px;color:#9ca3af">${item.time}</div>
          </div>`
            )
            .join("")
        : `<div style="font-size:12px;color:#64748b">No reading history.</div>`;
    }

    if (activeTab === "SAVED") {
      panelHtml = savedSongs.length
        ? savedSongs
            .map(
              (s) => `
          <div style="padding:9px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between">
            <span style="font-size:12px;color:#fff">${s.title}</span>
            <span style="font-size:11px;color:#4ade80;font-family:monospace">${s.price}</span>
          </div>`
            )
            .join("")
        : `<div style="font-size:12px;color:#64748b">No saved songs.</div>`;
    }

    if (activeTab === "SETTINGS") {
      panelHtml = `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="font-family:monospace;font-size:11px;color:#4ade80;font-weight:800">🔐 SIGN IN / ACCOUNT SETTINGS</div>
          <label style="font-size:10px;font-family:monospace;color:#9ca3af">YOUR NAME</label>
          <input type="text" id="prof-name" value="${profile.name}" style="width:100%;font-size:12px;padding:8px" />
          <label style="font-size:10px;font-family:monospace;color:#9ca3af">PAYOUT UPI ID</label>
          <input type="text" id="prof-upi" value="${profile.upiId}" style="width:100%;font-size:12px;padding:8px" />
          <button type="button" id="save-prof-btn" style="background:#4ade80;color:#041208;border:none;border-radius:8px;padding:9px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;margin-top:4px">
            ✓ SAVE ACCOUNT
          </button>
        </div>
      `;
    }

    sidebar.innerHTML = `
      <div style="padding:14px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <strong style="font-size:16px;color:#fff;display:block">Synts</strong>
            <span style="font-size:10px;color:#4ade80;font-family:monospace">Studio Hub</span>
          </div>
          <button type="button" id="collapse-dock-btn" style="background:rgba(255,255,255,0.06);color:#9ca3af;border:none;border-radius:7px;width:26px;height:26px;cursor:pointer">❮</button>
        </div>
      </div>

      <div style="padding:10px 12px;display:flex;flex-direction:column;gap:4px;border-bottom:1px solid rgba(255,255,255,0.08)">
        ${navItems
          .map((item) => {
            const act = activeTab === item.id;
            return `
            <button type="button" data-hub-tab="${item.id}" style="
              display:flex;align-items:center;justify-content:space-between;width:100%;
              padding:8px 10px;border-radius:9px;cursor:pointer;
              border:1px solid ${act ? "rgba(74,222,128,0.45)" : "transparent"};
              background:${act ? "rgba(34,197,94,0.16)" : "transparent"};
              color:${act ? "#4ade80" : "#d1d5db"};
              font-family:monospace;font-size:11px;font-weight:700;text-align:left;
            ">
              <span>${item.icon} ${item.label}</span>
              ${item.count !== "" ? `<span style="font-size:10px;color:#9ca3af">${item.count}</span>` : ""}
            </button>`;
          })
          .join("")}
      </div>

      <div style="flex:1;overflow-y:auto;padding:14px">
        ${panelHtml}
      </div>
    `;

    sidebar.querySelector("#collapse-dock-btn").onclick = () => {
      drawerOpen = false;
      renderSidebar();
    };

    sidebar.querySelectorAll("[data-hub-tab]").forEach((btn) => {
      btn.onclick = () => {
        activeTab = btn.getAttribute("data-hub-tab");
        renderSidebar();
      };
    });

    const realSaveBtn = sidebar.querySelector("#save-prof-btn");
    if (realSaveBtn) {
      realSaveBtn.onclick = () => {
        const p = getStore(KEYS.PROFILE, defaultProfile);
        p.name = sidebar.querySelector("#prof-name").value.trim() || p.name;
        p.upiId = sidebar.querySelector("#prof-upi").value.trim() || p.upiId;
        setStore(KEYS.PROFILE, p);
        renderSidebar();
        notify("Account settings saved!");
      };
    }
  }

  function init() {
    cleanAndMoveMarketplace();
    injectSidebarStyles();
    buildLeftSidebar();
  }

  init();
  document.addEventListener("DOMContentLoaded", init);
  setTimeout(init, 400);
})();
