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

  // Default Profile State
  const defaultProfile = {
    role: "artist", // "artist" | "listener"
    name: "Synts",
    handle: "@synts_official",
    bio: "Independent Artist, Songwriter & Producer · Hindi / Urdu / English",
    upiId: "apex.santosh.2001@yescred",
    language: "Hindi / Urdu / English",
    genre: "Hip-Hop · Acoustic Gazal · Dark Drill",
    verified: true
  };

  // Seed initial demo data if empty so the dashboard looks rich immediately
  function ensureSeedData() {
    if (!localStorage.getItem(KEYS.PROFILE)) {
      setStore(KEYS.PROFILE, defaultProfile);
    }
    if (!localStorage.getItem(KEYS.PURCHASES)) {
      setStore(KEYS.PURCHASES, [
        {
          id: "PUR-9081",
          title: "After Hours in BTM — 5-Track Concept EP",
          type: "Commercial EP License",
          price: "₹1,499",
          utr: "4318****5128",
          date: "Today, 10:15 PM",
          status: "Active License · PDF & Stems Ready"
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

  // Automatically log reading & listening actions across the page
  function bindActivityTrackers() {
    document.body.addEventListener("click", (e) => {
      const el = e.target.closest("button, a, [data-open-file], [data-open-rel]");
      if (!el) return;
      const txt = (el.textContent || "").toUpperCase();

      // Track Voice / Audio Listening
      if (txt.includes("PLAY") || txt.includes("LISTEN") || txt.includes("VOICE") || txt.includes("SPEAK")) {
        const area = document.querySelector("#lyrics textarea, textarea");
        const snippetTitle =
          document.querySelector("#lyrics-title")?.value ||
          (area && area.value ? area.value.split("\n")[0].replace(/\/\/|#/g, "").trim().slice(0, 40) : "Voice Studio Session");

        const hist = getStore(KEYS.LISTEN_HIST, []);
        hist.unshift({
          title: snippetTitle || "Studio Audio Playback",
          artist: getStore(KEYS.PROFILE, defaultProfile).name,
          duration: "Live Voice Synth",
          lang: "Multi-Language Studio",
          time: "Just now"
        });
        setStore(KEYS.LISTEN_HIST, hist.slice(0, 20));
        renderHubContent();
      }

      // Track Reading History when opening files/templates in studio
      if (txt.includes("STUDIO") || txt.includes("EXPAND") || txt.includes("USE IN NOTEPAD")) {
        const card = el.closest("div");
        const heading = card?.querySelector("h3, h4, strong")?.textContent?.trim();
        if (heading) {
          const rHist = getStore(KEYS.READ_HIST, []);
          if (!rHist.some((r) => r.title === heading)) {
            rHist.unshift({
              title: heading,
              category: "Studio Reader",
              progress: "Opened in Workspace",
              time: "Just now"
            });
            setStore(KEYS.READ_HIST, rHist.slice(0, 25));
            renderHubContent();
          }
        }
      }
    });
  }

  // Inject Top Navbar Quick Button ("👤 MY ACCOUNT & STUDIO")
  function injectNavbarTrigger() {
    if (document.getElementById("synts-nav-account-btn")) return;
    const nav = document.querySelector("header nav, .navbar, header .wrap, header");
    if (!nav) return;

    const btn = document.createElement("a");
    btn.id = "synts-nav-account-btn";
    btn.href = "#synts-account-center";
    btn.style.cssText = `
      background: rgba(74, 222, 128, 0.16);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.4);
      border-radius: 99px;
      padding: 7px 14px;
      font-family: monospace;
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
      margin-left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    `;
    btn.innerHTML = `👤 MY STUDIO &amp; HISTORY`;
    nav.appendChild(btn);
  }

  let activeTab = "OVERVIEW";

  function buildAccountHubSection() {
    if (document.getElementById("synts-account-center")) return;

    const hubSection = document.createElement("section");
    hubSection.id = "synts-account-center";
    hubSection.style.cssText = `
      max-width: 1260px;
      margin: 32px auto;
      padding: 30px 26px;
      background: linear-gradient(170deg, rgba(13, 19, 28, 0.96), rgba(7, 10, 16, 0.99));
      border: 1px solid rgba(74, 222, 128, 0.32);
      border-radius: 26px;
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.85);
      color: #f3f6fc;
      text-align: left;
    `;

    // Insert right above the footer (or at the bottom of main)
    const footer = document.querySelector("footer");
    if (footer && footer.parentElement) {
      footer.parentElement.insertBefore(hubSection, footer);
    } else {
      document.body.appendChild(hubSection);
    }

    renderHubContent();
  }

  function renderHubContent() {
    const container = document.getElementById("synts-account-center");
    if (!container) return;

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

    const tabs = [
      { id: "OVERVIEW", label: "⚡ DASHBOARD" },
      { id: "UPLOADS", label: `☁️ MY UPLOADS & VAULT (${totalUploadedFiles})` },
      { id: "PURCHASES", label: `🛍️ MY PURCHASES (${purchases.length})` },
      { id: "LISTENING", label: `🎧 LISTENING HISTORY (${listenHist.length})` },
      { id: "READING", label: `📖 READING HISTORY (${readHist.length})` },
      { id: "SAVED", label: `❤️ SAVED SONGS (${savedSongs.length})` },
      { id: "SETTINGS", label: "⚙️ PROFILE & SETTINGS" }
    ];

    const tabsHtml = tabs
      .map((t) => {
        const isAct = activeTab === t.id;
        return `<button type="button" data-hub-tab="${t.id}" style="
          padding: 9px 14px;
          border-radius: 12px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          border: 1px solid ${isAct ? "rgba(74,222,128,0.55)" : "rgba(255,255,255,0.1)"};
          background: ${isAct ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)"};
          color: ${isAct ? "#4ade80" : "#cbd5e1"};
        ">${t.label}</button>`;
      })
      .join("");

    let bodyHtml = "";

    // TAB 1: OVERVIEW (COMBINED ARTIST + LISTENER SUMMARY)
    if (activeTab === "OVERVIEW") {
      bodyHtml = `
        <!-- Quick Metric Bento Row -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px">
            <div style="font-size:11px;font-family:monospace;color:#9ca3af">UPLOADED PROJECTS &amp; FILES</div>
            <div style="font-size:28px;font-weight:900;color:#4ade80;margin-top:4px">${totalUploadedFiles}</div>
            <div style="font-size:11px;color:#64748b">Lyrics, Stems, Videos &amp; Vault</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px">
            <div style="font-size:11px;font-family:monospace;color:#9ca3af">PURCHASED LICENSES</div>
            <div style="font-size:28px;font-weight:900;color:#38bdf8;margin-top:4px">${purchases.length}</div>
            <div style="font-size:11px;color:#64748b">Instant UPI Verified Rights</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px">
            <div style="font-size:11px;font-family:monospace;color:#9ca3af">SONGS PLAYED / LISTENED</div>
            <div style="font-size:28px;font-weight:900;color:#a78bfa;margin-top:4px">${listenHist.length}</div>
            <div style="font-size:11px;color:#64748b">Audio Stems &amp; Voice Synth</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px">
            <div style="font-size:11px;font-family:monospace;color:#9ca3af">LYRICS &amp; STORIES READ</div>
            <div style="font-size:28px;font-weight:900;color:#facc15;margin-top:4px">${readHist.length}</div>
            <div style="font-size:11px;color:#64748b">Reading History &amp; Scripts</div>
          </div>
        </div>

        <!-- 2-Column Split: Recent Listening + Recent Reading & Purchases -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px">
          <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <span style="font-family:monospace;font-size:12px;color:#4ade80;font-weight:800">🎧 RECENT LISTENING HISTORY</span>
              <button type="button" data-jump-tab="LISTENING" style="background:none;border:none;color:#9ca3af;font-family:monospace;font-size:11px;cursor:pointer">VIEW ALL →</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${listenHist
                .slice(0, 3)
                .map(
                  (item) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:10px;border-left:3px solid #38bdf8">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:#fff">${item.title}</div>
                    <div style="font-size:11px;color:#9ca3af">${item.artist} · ${item.lang}</div>
                  </div>
                  <span style="font-family:monospace;font-size:11px;color:#38bdf8">${item.time}</span>
                </div>`
                )
                .join("")}
            </div>
          </div>

          <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <span style="font-family:monospace;font-size:12px;color:#facc15;font-weight:800">📖 RECENT READING HISTORY</span>
              <button type="button" data-jump-tab="READING" style="background:none;border:none;color:#9ca3af;font-family:monospace;font-size:11px;cursor:pointer">VIEW ALL →</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${readHist
                .slice(0, 3)
                .map(
                  (item) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:10px;border-left:3px solid #facc15">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:#fff">${item.title}</div>
                    <div style="font-size:11px;color:#9ca3af">${item.category} · ${item.progress}</div>
                  </div>
                  <span style="font-family:monospace;font-size:11px;color:#facc15">${item.time}</span>
                </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
    }

    // TAB 2: ARTIST UPLOADS & ENCRYPTED VAULT
    if (activeTab === "UPLOADS") {
      const allTreeFiles = [];
      treeDirs.forEach((cat) => {
        (cat.subfolders || []).forEach((sub) => {
          (sub.files || []).forEach((f) => {
            allTreeFiles.push({ name: f.name, meta: f.meta, folder: `${cat.name}/${sub.name}` });
          });
        });
      });

      bodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
          <div>
            <h3 style="margin:0;font-size:18px;color:#fff">☁️ Uploaded Projects, Marketplace Listings &amp; Encrypted Vault</h3>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Manage all your uploaded lyrics, audio stems, video scripts, and PIN-encrypted drafts.</p>
          </div>
          <a href="#lyrics" style="background:#4ade80;color:#041208;padding:9px 14px;border-radius:10px;font-family:monospace;font-size:11px;font-weight:800;text-decoration:none">+ UPLOAD / WRITE NEW PROJECT</a>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
          ${allTreeFiles
            .map(
              (f) => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px">
              <div style="font-family:monospace;font-size:10px;color:#4ade80;margin-bottom:4px">📁 ${f.folder}</div>
              <div style="font-size:15px;font-weight:800;color:#fff;font-family:monospace">${f.name}</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:4px">${f.meta}</div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    // TAB 3: PURCHASES & LICENSES (FOR BOTH ARTISTS & NORMAL USERS)
    if (activeTab === "PURCHASES") {
      bodyHtml = `
        <div style="margin-bottom:16px">
          <h3 style="margin:0;font-size:18px;color:#fff">🛍️ Your Purchased Licenses &amp; Unlocked Projects</h3>
          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">All lyrics, EPs, and stems you have unlocked via UPI checkout.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${purchases
            .map(
              (p) => `
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(74,222,128,0.28);border-radius:16px">
              <div>
                <span style="font-family:monospace;font-size:10px;color:#4ade80;background:rgba(74,222,128,0.14);padding:3px 8px;border-radius:99px">${p.id} · ${p.type}</span>
                <h4 style="margin:8px 0 4px;font-size:16px;color:#fff">${p.title}</h4>
                <div style="font-size:12px;color:#9ca3af;font-family:monospace">UTR Ref: ${p.utr} · ${p.date} · <strong style="color:#4ade80">${p.status}</strong></div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:18px;font-weight:900;color:#4ade80;font-family:monospace">${p.price}</span>
                <a href="#lyrics" style="background:rgba(255,255,255,0.08);color:#fff;padding:8px 12px;border-radius:8px;font-family:monospace;font-size:11px;text-decoration:none;font-weight:700">OPEN IN STUDIO ↗</a>
              </div>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    // TAB 4: LISTENING HISTORY
    if (activeTab === "LISTENING") {
      bodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h3 style="margin:0;font-size:18px;color:#fff">🎧 Listening History &amp; Voice Studio Playback</h3>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Every audio stem, demo track, and multi-language Voice Studio session you played.</p>
          </div>
          <button type="button" id="clear-listen-btn" style="background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3);border-radius:8px;padding:7px 12px;font-family:monospace;font-size:11px;cursor:pointer">CLEAR HISTORY</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${listenHist
            .map(
              (item) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-left:4px solid #38bdf8;border-radius:12px">
              <div>
                <div style="font-size:15px;font-weight:800;color:#fff">${item.title}</div>
                <div style="font-size:12px;color:#9ca3af">${item.artist} · ${item.lang} · Duration: ${item.duration}</div>
              </div>
              <span style="font-family:monospace;font-size:11px;color:#38bdf8">${item.time}</span>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    // TAB 5: READING HISTORY
    if (activeTab === "READING") {
      bodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h3 style="margin:0;font-size:18px;color:#fff">📖 Lyric, Story &amp; Script Reading History</h3>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Track every songbook, Urdu/Hindi gazal, video script, and story lore you explored.</p>
          </div>
          <button type="button" id="clear-read-btn" style="background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3);border-radius:8px;padding:7px 12px;font-family:monospace;font-size:11px;cursor:pointer">CLEAR HISTORY</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${readHist
            .map(
              (item) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-left:4px solid #facc15;border-radius:12px">
              <div>
                <div style="font-size:15px;font-weight:800;color:#fff">${item.title}</div>
                <div style="font-size:12px;color:#9ca3af">Directory: ${item.category} · Status: ${item.progress}</div>
              </div>
              <span style="font-family:monospace;font-size:11px;color:#facc15">${item.time}</span>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    // TAB 6: SAVED SONGS & BOOKMARKS
    if (activeTab === "SAVED") {
      bodyHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h3 style="margin:0;font-size:18px;color:#fff">❤️ Saved Songs, Favorite Lyrics &amp; Watchlist</h3>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Quickly jump back to your bookmarked tracks, hooks, and EPs.</p>
          </div>
          <button type="button" id="add-bookmark-btn" style="background:#4ade80;color:#041208;border:none;border-radius:8px;padding:8px 14px;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer">+ BOOKMARK SONG</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">
          ${savedSongs
            .map(
              (s) => `
            <div style="padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:14px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:15px;font-weight:800;color:#fff">${s.title}</div>
                <div style="font-size:11px;color:#9ca3af;font-family:monospace;margin-top:4px">${s.tag} · ${s.price}</div>
              </div>
              <a href="#marketplace" style="color:#4ade80;font-family:monospace;font-size:11px;font-weight:800;text-decoration:none">VIEW ↗</a>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    // TAB 7: PROFILE SETTINGS (ARTIST & LISTENER SETTINGS)
    if (activeTab === "SETTINGS") {
      bodyHtml = `
        <div style="max-width:760px">
          <h3 style="margin:0 0 6px;font-size:18px;color:#fff">⚙️ Artist &amp; Listener Profile Settings</h3>
          <p style="margin:0 0 18px;font-size:12px;color:#9ca3af">Update your stage name, account mode, payout UPI ID, and preferred languages.</p>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:11px;font-family:monospace;color:#9ca3af;margin-bottom:6px">STAGE NAME / DISPLAY NAME</label>
              <input type="text" id="prof-name" value="${profile.name}" style="width:100%" />
            </div>
            <div>
              <label style="display:block;font-size:11px;font-family:monospace;color:#9ca3af;margin-bottom:6px">ARTIST HANDLE</label>
              <input type="text" id="prof-handle" value="${profile.handle}" style="width:100%" />
            </div>
            <div>
              <label style="display:block;font-size:11px;font-family:monospace;color:#9ca3af;margin-bottom:6px">PAYOUT UPI ID (FOR SELLING LYRICS)</label>
              <input type="text" id="prof-upi" value="${profile.upiId}" style="width:100%" />
            </div>
            <div>
              <label style="display:block;font-size:11px;font-family:monospace;color:#9ca3af;margin-bottom:6px">PRIMARY GENRES &amp; LANGUAGES</label>
              <input type="text" id="prof-genre" value="${profile.genre}" style="width:100%" />
            </div>
          </div>

          <div style="margin-bottom:16px">
            <label style="display:block;font-size:11px;font-family:monospace;color:#9ca3af;margin-bottom:6px">ARTIST BIO &amp; CREDITS</label>
            <input type="text" id="prof-bio" value="${profile.bio}" style="width:100%" />
          </div>

          <button type="button" id="save-prof-btn" style="background:#4ade80;color:#041208;border:none;border-radius:10px;padding:11px 20px;font-family:monospace;font-size:12px;font-weight:800;cursor:pointer">
            ✓ SAVE PROFILE SETTINGS
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Top Profile Header Banner -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.09)">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#4ade80,#38bdf8);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#041208">
            ${(profile.name || "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <h2 style="margin:0;font-size:22px;font-weight:900;color:#fff">${profile.name}</h2>
              <span style="font-family:monospace;font-size:11px;color:#4ade80;background:rgba(74,222,128,0.14);padding:3px 9px;border-radius:99px;font-weight:700">✓ VERIFIED ${profile.role.toUpperCase()}</span>
            </div>
            <div style="font-size:12px;color:#9ca3af;margin-top:3px">${profile.handle} · ${profile.bio}</div>
          </div>
        </div>

        <!-- Role Mode Switcher (Artist Mode vs Normal User / Listener Mode) -->
        <div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.45);padding:6px;border-radius:12px;border:1px solid rgba(255,255,255,0.1)">
          <button type="button" data-role-switch="artist" style="
            padding:7px 12px;border-radius:8px;border:none;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;
            background:${profile.role === "artist" ? "#4ade80" : "transparent"};
            color:${profile.role === "artist" ? "#041208" : "#9ca3af"};
          ">🎨 ARTIST MODE</button>
          <button type="button" data-role-switch="listener" style="
            padding:7px 12px;border-radius:8px;border:none;font-family:monospace;font-size:11px;font-weight:800;cursor:pointer;
            background:${profile.role === "listener" ? "#38bdf8" : "transparent"};
            color:${profile.role === "listener" ? "#041208" : "#9ca3af"};
          ">🎧 LISTENER / USER MODE</button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 22px">
        ${tabsHtml}
      </div>

      <!-- Active Tab Body -->
      <div>${bodyHtml}</div>
    `;

    // Wire Tab Clicks
    container.querySelectorAll("[data-hub-tab]").forEach((btn) => {
      btn.onclick = () => {
        activeTab = btn.getAttribute("data-hub-tab");
        renderHubContent();
      };
    });

    container.querySelectorAll("[data-jump-tab]").forEach((btn) => {
      btn.onclick = () => {
        activeTab = btn.getAttribute("data-jump-tab");
        renderHubContent();
      };
    });

    // Wire Role Switcher
    container.querySelectorAll("[data-role-switch]").forEach((btn) => {
      btn.onclick = () => {
        const p = getStore(KEYS.PROFILE, defaultProfile);
        p.role = btn.getAttribute("data-role-switch");
        setStore(KEYS.PROFILE, p);
        renderHubContent();
        notify(`Switched to ${p.role.toUpperCase()} view!`);
      };
    });

    // Wire Settings Save
    const saveBtn = document.getElementById("save-prof-btn");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const p = getStore(KEYS.PROFILE, defaultProfile);
        p.name = document.getElementById("prof-name").value.trim() || p.name;
        p.handle = document.getElementById("prof-handle").value.trim() || p.handle;
        p.upiId = document.getElementById("prof-upi").value.trim() || p.upiId;
        p.genre = document.getElementById("prof-genre").value.trim() || p.genre;
        p.bio = document.getElementById("prof-bio").value.trim() || p.bio;
        setStore(KEYS.PROFILE, p);
        renderHubContent();
        notify("Profile settings updated!");
      };
    }

    // Wire History Clear & Bookmark Add
    const clearListen = document.getElementById("clear-listen-btn");
    if (clearListen) {
      clearListen.onclick = () => {
        setStore(KEYS.LISTEN_HIST, []);
        renderHubContent();
        notify("Listening history cleared.");
      };
    }

    const clearRead = document.getElementById("clear-read-btn");
    if (clearRead) {
      clearRead.onclick = () => {
        setStore(KEYS.READ_HIST, []);
        renderHubContent();
        notify("Reading history cleared.");
      };
    }

    const addBm = document.getElementById("add-bookmark-btn");
    if (addBm) {
      addBm.onclick = () => {
        const title = prompt("Enter Song or Lyric Title to bookmark:");
        if (!title) return;
        const list = getStore(KEYS.SAVED_SONGS, []);
        list.unshift({ title: title.trim(), tag: "Saved Track", price: "₹499" });
        setStore(KEYS.SAVED_SONGS, list);
        renderHubContent();
        notify(`Bookmarked "${title}"!`);
      };
    }
  }

  function initAccountHub() {
    ensureSeedData();
    injectNavbarTrigger();
    buildAccountHubSection();
    bindActivityTrackers();
  }

  initAccountHub();
  document.addEventListener("DOMContentLoaded", initAccountHub);
  setTimeout(initAccountHub, 500);
})();
