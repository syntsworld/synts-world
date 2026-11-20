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
    TREE: "synts_artist_custom_tree_v1",
    UI_STATE: "synts_hub_ui_state_v1"
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
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function setStore(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  const defaultProfile = {
    role: "listener",
    name: "Synts",
    handle: "@synts_official",
    upiId: "apex.santosh.2001@yescred",
    signedIn: false
  };

  const savedUi = getStore(KEYS.UI_STATE, { activeTab: "OVERVIEW", drawerOpen: false });
  let activeTab = savedUi.activeTab || "OVERVIEW";
  let drawerOpen = Boolean(savedUi.drawerOpen);
  let globalSearchQuery = "";

  function persistUiState() {
    setStore(KEYS.UI_STATE, { activeTab, drawerOpen });
  }

  function cleanHeaderAndNav() {
    const headerNav = document.querySelector("header nav, .navbar, header .wrap, header");
    if (!headerNav) return;

    const duplicateAuthBtn = document.getElementById("synts-top-auth-btn");
    if (duplicateAuthBtn) {
      duplicateAuthBtn.remove();
    }

    const links = headerNav.querySelectorAll("a, button");
    links.forEach((l) => {
      const txt = (l.textContent || "").trim().toLowerCase();
      if (
        txt === "lyrics directory" ||
        txt === "write & translate" ||
        txt === "licensing" ||
        txt === "sign in / profile" ||
        txt.includes("sign in / profile")
      ) {
        l.remove();
      }
    });
  }

  function injectSidebarStyles() {
    if (document.getElementById("synts-left-dock-css")) return;
    const style = document.createElement("style");
    style.id = "synts-left-dock-css";
    style.textContent = `
      @media (min-width: 1100px) {
        body.synts-dock-expanded main,
        body.synts-dock-expanded footer {
          margin-left: 340px !important;
          width: calc(100% - 340px) !important;
          transition: margin-left 0.22s ease, width 0.22s ease;
        }
        body.synts-dock-collapsed main,
        body.synts-dock-collapsed footer {
          margin-left: 68px !important;
          width: calc(100% - 68px) !important;
          transition: margin-left 0.22s ease, width 0.22s ease;
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

  function collectCatalogItems() {
    const customUploads = getStore(KEYS.UPLOADS, []);
    const treeDirs = getStore(KEYS.TREE, []);
    const savedSongs = getStore(KEYS.SAVED_SONGS, []);

    const items = [
      { title: "Musafir (Urdu Drill Lyrics)", album: "Studio Vault", genre: "Hip-Hop / Drill", price: "₹499" },
      { title: "Mukhtalif (Lo-Fi Verse & Hook)", album: "Midnight Notes", genre: "Lo-Fi / Bilingual", price: "₹399" },
      { title: "After Hours (5-Song Pack)", album: "EP / Pack", genre: "Full Pack", price: "₹1,499" }
    ];

    customUploads.forEach((c) => {
      items.push({
        title: c.title || "Untitled Listing",
        album: c.album || c.pack || "Custom Upload",
        genre: c.genre || "Lyrics / Project",
        price: c.price ? `₹${String(c.price).replace(/^₹/, "")}` : "₹499"
      });
    });

    treeDirs.forEach((dir) => {
      const dirName = dir.name || "Directory";
      (dir.subfolders || []).forEach((sub) => {
        const subName = sub.name || "Folder";
        (sub.files || []).forEach((f) => {
          items.push({
            title: f.title || f.name || "Untitled File",
            album: `${dirName} / ${subName}`,
            genre: f.genre || "Directory Track",
            price: f.price ? `₹${String(f.price).replace(/^₹/, "")}` : "Directory"
          });
        });
      });
    });

    savedSongs.forEach((s) => {
      const title = s.title || "Saved Track";
      if (!items.some((existing) => existing.title.toLowerCase() === title.toLowerCase())) {
        items.push({
          title,
          album: s.album || "Saved",
          genre: s.genre || "Saved Song",
          price: s.price || ""
        });
      }
    });

    return items;
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
      treeDirs.reduce(
        (acc, c) => acc + (c.subfolders || []).reduce((s, f) => s + (f.files || []).length, 0),
        0
      );

    const navItems = [
      { id: "OVERVIEW", icon: "⚡", label: "Overview", count: "" },
      { id: "MARKETPLACE", icon: "🎵", label: "Songs, Albums & Directory", count: "" },
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
      position: fixed;
      top: 80px;
      bottom: 88px;
      left: 10px;
      width: ${drawerOpen ? "340px" : "54px"};
      z-index: 950;
      background: linear-gradient(180deg, rgba(12, 17, 25, 0.98), rgba(7, 10, 15, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.32);
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.22s ease;
      color: #f3f6fc;
      text-align: left;
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
        persistUiState();
        renderSidebar();
      };
      sidebar.querySelectorAll("[data-rail-tab]").forEach((btn) => {
        btn.onclick = () => {
          activeTab = btn.getAttribute("data-rail-tab");
          drawerOpen = true;
          persistUiState();
          renderSidebar();
        };
      });
      return;
    }

    let panelHtml = "";

    if (activeTab === "OVERVIEW") {
      panelHtml = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">PURCHASES</div>
            <div style="font-size:22px;font-weight:900;color:#38bdf8;margin-top:2px">${purchases.length}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">SONGS PLAYED</div>
            <div style="font-size:22px;font-weight:900;color:#a78bfa;margin-top:2px">${listenHist.length}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">SAVED SONGS</div>
            <div style="font-size:22px;font-weight:900;color:#4ade80;margin-top:2px">${savedSongs.length}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
            <div style="font-size:9px;font-family:monospace;color:#9ca3af">DIRECTORY ITEMS</div>
            <div style="font-size:22px;font-weight:900;color:#facc15;margin-top:2px">${totalUploadedFiles}</div>
          </div>
        </div>
      `;
    }

    if (activeTab === "MARKETPLACE") {
      const q = globalSearchQuery.trim().toLowerCase();
      const filtered = collectCatalogItems().filter(
        (r) =>
          !q ||
          (r.title || "").toLowerCase().includes(q) ||
          (r.album || "").toLowerCase().includes(q) ||
          (r.genre || "").toLowerCase().includes(q)
      );

      panelHtml = `
        <div style="margin-bottom:12px">
          <input type="text" id="sidebar-song-search" placeholder="🔍 Search song, album, or directory..." value="${globalSearchQuery.replace(/"/g, "&quot;")}" style="
            width:100%;background:#070b12;border:1px solid rgba(74,222,128,0.4);border-radius:10px;
            padding:9px 12px;color:#fff;font-family:monospace;font-size:11px;outline:none;
          " />
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${
            filtered.length
              ? filtered
                  .map(
                    (r) => `
            <div style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:12px">
              <div style="font-size:13px;font-weight:800;color:#fff">${r.title}</div>
              <div style="font-size:10px;color:#38bdf8;font-family:monospace;margin-top:2px">${r.album}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                <span style="font-size:10px;color:#9ca3af">${r.genre}</span>
                <strong style="font-size:12px;color:#4ade80">${r.price}</strong>
              </div>
            </div>`
                  )
                  .join("")
              : `<div style="font-size:12px;color:#64748b">No matching songs, albums, or directory items found.</div>`
          }
        </div>
      `;
    }

    if (activeTab === "CUSTOMIZE") {
      panelHtml = `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="font-family:monospace;font-size:10px;color:#4ade80;font-weight:800">🛠️ BUILDER &amp; DIRECTORIES</div>
          <div style="font-size:11px;color:#9ca3af;line-height:1.45">
            Custom listings: ${customUploads.length} · Directory files: ${totalUploadedFiles}
          </div>
          <a href="#marketplace" style="background:#4ade80;color:#041208;padding:10px;border-radius:8px;font-family:monospace;font-size:11px;font-weight:800;text-align:center;text-decoration:none">
            JUMP TO DIRECTORY ↗
          </a>
        </div>
      `;
    }

    if (activeTab === "PURCHASES") {
      panelHtml = purchases.length
        ? purchases
            .map(
              (p) => `
          <div style="padding:11px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(74,222,128,0.28);border-radius:12px;margin-bottom:8px">
            <div style="font-size:13px;font-weight:800;color:#fff">${p.title}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:10px;font-family:monospace">
              <span style="color:#9ca3af">${p.status || "Completed"}</span>
              <strong style="color:#4ade80">${p.price || ""}</strong>
            </div>
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
          <div style="padding:10px 12px;background:rgba(255,255,255,0.03);border-left:3px solid #38bdf8;border-radius:10px;margin-bottom:8px">
            <div style="font-size:13px;font-weight:700;color:#fff">${item.title}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:2px">${item.time || ""}</div>
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
          <div style="padding:10px 12px;background:rgba(255,255,255,0.03);border-left:3px solid #facc15;border-radius:10px;margin-bottom:8px">
            <div style="font-size:13px;font-weight:700;color:#fff">${item.title}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:2px">${item.time || ""}</div>
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
          <div style="padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:13px;color:#fff;font-weight:700">${s.title}</span>
            <span style="font-size:11px;color:#4ade80;font-family:monospace">${s.price || ""}</span>
          </div>`
            )
            .join("")
        : `<div style="font-size:12px;color:#64748b">No saved songs.</div>`;
    }

    if (activeTab === "SETTINGS") {
      panelHtml = `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="font-family:monospace;font-size:11px;color:#4ade80;font-weight:800;margin-bottom:2px">⚙️ PROFILE &amp; UPI SETTINGS</div>
          <label style="font-size:10px;font-family:monospace;color:#9ca3af">YOUR NAME</label>
          <input type="text" id="prof-name" value="${(profile.name || "").replace(/"/g, "&quot;")}" style="width:100%;font-size:12px;padding:9px;background:#070b12;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:8px;outline:none" />
          <label style="font-size:10px;font-family:monospace;color:#9ca3af">HANDLE</label>
          <input type="text" id="prof-handle" value="${(profile.handle || "").replace(/"/g, "&quot;")}" style="width:100%;font-size:12px;padding:9px;background:#070b12;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:8px;outline:none" />
          <label style="font-size:10px;font-family:monospace;color:#9ca3af">PAYOUT UPI ID</label>
          <input type="text" id="prof-upi" value="${(profile.upiId || "").replace(/"/g, "&quot;")}" style="width:100%;font-size:12px;padding:9px;background:#070b12;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:8px;outline:none" />
          <button type="button" id="save-prof-btn" style="background:#4ade80;color:#041208;border:none;border-radius:9px;padding:10px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;margin-top:4px">
            ✓ SAVE SETTINGS
          </button>
        </div>
      `;
    }

    sidebar.innerHTML = `
      <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <strong style="font-size:16px;color:#fff;display:block">${profile.name || "Synts"}</strong>
            <span style="font-size:10px;color:#4ade80;font-family:monospace">Studio Hub</span>
          </div>
          <button type="button" id="collapse-dock-btn" style="background:rgba(255,255,255,0.06);color:#9ca3af;border:none;border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:12px">❮</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;background:rgba(0,0,0,0.45);padding:4px;border-radius:10px;margin-top:10px">
          <button type="button" data-role-switch="listener" style="
            padding:6px;border-radius:7px;border:none;font-family:monospace;font-size:10px;font-weight:800;cursor:pointer;
            background:${!isArtist ? "#38bdf8" : "transparent"};
            color:${!isArtist ? "#041208" : "#9ca3af"};
          ">🎧 EXPLORE</button>
          <button type="button" data-role-switch="artist" style="
            padding:6px;border-radius:7px;border:none;font-family:monospace;font-size:10px;font-weight:800;cursor:pointer;
            background:${isArtist ? "#4ade80" : "transparent"};
            color:${isArtist ? "#041208" : "#9ca3af"};
          ">🛠️ CUSTOMIZE</button>
        </div>
      </div>

      <div style="padding:10px 12px;display:flex;flex-direction:column;gap:5px;border-bottom:1px solid rgba(255,255,255,0.08)">
        ${navItems
          .map((item) => {
            const act = activeTab === item.id;
            return `
            <button type="button" data-hub-tab="${item.id}" style="
              display:flex;align-items:center;justify-content:space-between;width:100%;
              padding:9px 11px;border-radius:10px;cursor:pointer;
              border:1px solid ${act ? "rgba(74,222,128,0.45)" : "transparent"};
              background:${act ? "rgba(34,197,94,0.16)" : "transparent"};
              color:${act ? "#4ade80" : "#d1d5db"};
              font-family:monospace;font-size:11px;font-weight:700;text-align:left;
            ">
              <span>${item.icon} ${item.label}</span>
              ${item.count !== "" ? `<span style="font-size:10px;padding:2px 7px;border-radius:99px;background:rgba(255,255,255,0.06);color:#9ca3af">${item.count}</span>` : ""}
            </button>`;
          })
          .join("")}
      </div>

      <div style="flex:1;overflow-y:auto;padding:16px">
        ${panelHtml}
      </div>
    `;

    sidebar.querySelector("#collapse-dock-btn").onclick = () => {
      drawerOpen = false;
      persistUiState();
      renderSidebar();
    };

    sidebar.querySelectorAll("[data-hub-tab]").forEach((btn) => {
      btn.onclick = () => {
        activeTab = btn.getAttribute("data-hub-tab");
        drawerOpen = true;
        persistUiState();
        renderSidebar();
      };
    });

    sidebar.querySelectorAll("[data-role-switch]").forEach((btn) => {
      btn.onclick = () => {
        const p = getStore(KEYS.PROFILE, defaultProfile);
        p.role = btn.getAttribute("data-role-switch");
        setStore(KEYS.PROFILE, p);
        if (p.role !== "artist" && activeTab === "CUSTOMIZE") {
          activeTab = "OVERVIEW";
        }
        persistUiState();
        renderSidebar();
        window.dispatchEvent(new Event("synts-role-changed"));
        notify(p.role === "artist" ? "Customize mode active" : "Explore mode active");
      };
    });

    const searchInput = sidebar.querySelector("#sidebar-song-search");
    if (searchInput) {
      searchInput.oninput = (e) => {
        globalSearchQuery = e.target.value;
        renderSidebar();
        const newInp = sidebar.querySelector("#sidebar-song-search");
        if (newInp) {
          newInp.focus();
          newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
        }
      };
    }

    const realSaveBtn = sidebar.querySelector("#save-prof-btn");
    if (realSaveBtn) {
      realSaveBtn.onclick = () => {
        const p = getStore(KEYS.PROFILE, defaultProfile);
        p.name = (sidebar.querySelector("#prof-name")?.value || "").trim() || p.name;
        p.handle = (sidebar.querySelector("#prof-handle")?.value || "").trim() || p.handle;
        p.upiId = (sidebar.querySelector("#prof-upi")?.value || "").trim() || p.upiId;
        p.signedIn = true;
        setStore(KEYS.PROFILE, p);
        cleanHeaderAndNav();
        renderSidebar();
        notify("Profile & UPI settings saved");
      };
    }
  }

  function init() {
    cleanHeaderAndNav();
    injectSidebarStyles();
    buildLeftSidebar();
  }

  init();
  document.addEventListener("DOMContentLoaded", init);
  setTimeout(init, 400);
})();
