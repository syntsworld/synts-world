(() => {
  "use strict";

  const PAYMENT_CONFIG = {
    upiId: "apex.santosh.2001@yescred", // <-- Put your actual GPay / PhonePe / Paytm UPI ID here
    merchantName: "SYNTS Everink",
    supabaseUrl: "https://zvcmbjnsvkoqoycsopkm.supabase.co",
    supabaseKey: "sb_publishable_EfalUd595D0IUkfQNQ-blw_P62Kpwca"
  };

  const LOCAL_SONGS_KEY = "synts_saved_folder";
  const LOCAL_MARKET_KEY = "synts_custom_listings";

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  // 1. Inject visible "💾 SAVE TO FOLDER", "💰 SELL LYRICS", and "🛒 CHECKOUT" buttons into Notepad
  function buildCreatorControls() {
    const noteToolbar = document.querySelector('#lyrics .panel .row.between.mt .row');
    if (noteToolbar && !document.getElementById("direct-save-btn")) {
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.id = "direct-save-btn";
      saveBtn.className = "btn btn-primary btn-sm";
      saveBtn.textContent = "💾 SAVE LYRICS";
      saveBtn.onclick = saveToEncryptedFolder;

      const sellBtn = document.createElement("button");
      sellBtn.type = "button";
      sellBtn.id = "direct-sell-btn";
      sellBtn.className = "btn btn-primary btn-sm";
      sellBtn.style.background = "#facc15";
      sellBtn.style.color = "#000";
      sellBtn.textContent = "💰 LIST FOR SALE";
      sellBtn.onclick = listLyricsForSale;

      noteToolbar.prepend(sellBtn);
      noteToolbar.prepend(saveBtn);
    }

    // Create a visible "MY SAVED LYRICS FOLDER" box right inside the Notepad panel
    const vaultBox = document.querySelector("#lyrics .vault");
    if (vaultBox && !document.getElementById("local-folder-box")) {
      const folderDiv = document.createElement("div");
      folderDiv.id = "local-folder-box";
      folderDiv.style.marginBottom = "18px";
      folderDiv.style.paddingBottom = "16px";
      folderDiv.style.borderBottom = "1px solid var(--line)";
      folderDiv.innerHTML = `
        <div class="row between" style="margin-bottom:10px">
          <strong style="font-size:14px;color:var(--accent-text)">📁 MY SAVED LYRICS FOLDER</strong>
          <span class="mono tiny dim">Click any song to open</span>
        </div>
        <div id="saved-folder-list" class="song-list"></div>
      `;
      vaultBox.prepend(folderDiv);
      renderSavedFolder();
    }

    // Rename all "LICENSE" or "UNLOCK" buttons on cards to "🛒 BUY / CHECKOUT" so it's obvious
    document.querySelectorAll('[data-action="buy"]').forEach(btn => {
      if (!btn.textContent.includes("CHECKOUT")) {
        btn.textContent = "🛒 BUY / CHECKOUT";
        btn.className = "btn btn-primary btn-sm";
      }
    });
  }

  // 2. Save lyrics to your Private Folder (plus optional password lock)
  function saveToEncryptedFolder() {
    const title = document.getElementById("lyrics-title")?.value.trim() || "Untitled Song";
    const text = document.getElementById("lyrics-text")?.value.trim() || "";
    if (!text) return notify("Write some lyrics in the Notepad first before saving!", true);

    const pin = prompt("Set a 4-digit PIN or password to lock this lyric (or leave blank for quick save):", "");
    const encodedText = btoa(unescape(encodeURIComponent(text)));

    const list = JSON.parse(localStorage.getItem(LOCAL_SONGS_KEY) || "[]");
    list.unshift({
      id: "song_" + Date.now(),
      title,
      cipher: encodedText,
      pin: pin ? btoa(pin) : "",
      date: new Date().toLocaleString()
    });
    localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(list));
    renderSavedFolder();
    notify(`Saved "${title}" to your Lyrics Folder!`);

    // Also trigger cloud vault save if unlocked
    const cloudBtn = document.getElementById("vault-save-btn");
    if (cloudBtn && !cloudBtn.closest(".hidden")) cloudBtn.click();
  }

  function renderSavedFolder() {
    const box = document.getElementById("saved-folder-list");
    if (!box) return;
    const list = JSON.parse(localStorage.getItem(LOCAL_SONGS_KEY) || "[]");
    if (!list.length) {
      box.innerHTML = `<div class="muted small">No saved lyrics yet. Type above and click <strong>💾 SAVE LYRICS</strong>.</div>`;
      return;
    }
    box.innerHTML = "";
    list.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "song-row";
      row.innerHTML = `
        <div style="min-width:0">
          <div class="song-name truncate">${item.pin ? "🔒 " : "📄 "}${item.title}</div>
          <div class="mono tiny dim">${item.date}</div>
        </div>
        <div class="row" style="flex-wrap:nowrap">
          <button type="button" class="btn btn-soft btn-sm" data-open-idx="${idx}">OPEN</button>
          <button type="button" class="btn btn-danger btn-sm" data-del-idx="${idx}">DELETE</button>
        </div>
      `;
      box.appendChild(row);
    });

    box.querySelectorAll("[data-open-idx]").forEach(btn => {
      btn.onclick = () => {
        const item = list[Number(btn.dataset.openIdx)];
        if (!item) return;
        if (item.pin) {
          const entered = prompt(`Enter PIN/password to unlock "${item.title}":`);
          if (btoa(entered || "") !== item.pin) return notify("Wrong PIN/password!", true);
        }
        document.getElementById("lyrics-title").value = item.title;
        document.getElementById("lyrics-text").value = decodeURIComponent(escape(atob(item.cipher)));
        notify(`Opened "${item.title}"`);
      };
    });

    box.querySelectorAll("[data-del-idx]").forEach(btn => {
      btn.onclick = () => {
        const i = Number(btn.dataset.delIdx);
        list.splice(i, 1);
        localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(list));
        renderSavedFolder();
        notify("Deleted from folder.");
      };
    });
  }

  // 3. List lyrics for sale directly in the Directory
  async function listLyricsForSale() {
    const title = document.getElementById("lyrics-title")?.value.trim();
    const fullLyrics = document.getElementById("lyrics-text")?.value.trim();
    if (!title || !fullLyrics) {
      return notify("Enter a Song Title and Lyrics in the Notepad first, then click 💰 LIST FOR SALE!", true);
    }

    const priceInput = prompt(`Enter selling price in INR (₹) for "${title}":`, "499");
    if (!priceInput) return;
    const price = Number(priceInput);
    if (!price || price < 1) return notify("Please enter a valid price.", true);

    const genre = prompt("Enter Genre (e.g. Hindi Rap, Urdu Drill, Commercial Hook):", "Original Lyrics") || "Original Lyrics";
    const previewSnippet = fullLyrics.split("\n").filter(Boolean).slice(0, 2).join(" / ");

    const newItem = {
      id: "custom_" + Date.now(),
      title,
      artist_name: "Synts",
      release_type: "track",
      genre,
      price_inr: price,
      description: previewSnippet,
      full_lyrics: fullLyrics
    };

    // Save locally so it appears immediately on the page
    const customList = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");
    customList.unshift(newItem);
    localStorage.setItem(LOCAL_MARKET_KEY, JSON.stringify(customList));
    injectCustomListings();

    // Also save to Supabase if table exists
    try {
      if (window.supabase) {
        const sb = window.supabase.createClient(PAYMENT_CONFIG.supabaseUrl, PAYMENT_CONFIG.supabaseKey);
        await sb.from("releases").insert({
          title, artist_name: "Synts", release_type: "track",
          genre, price_inr: price, description: previewSnippet,
          full_lyrics: fullLyrics, status: "published"
        });
      }
    } catch {}

    notify(`"${title}" is now live in the Directory for ₹${price}!`);
    document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
  }

  function injectCustomListings() {
    const grid = document.getElementById("release-grid");
    if (!grid) return;
    const customList = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");
    customList.forEach(item => {
      if (document.getElementById("card-" + item.id)) return;
      const card = document.createElement("article");
      card.className = "card";
      card.id = "card-" + item.id;
      card.innerHTML = `
        <div class="cover">
          <div class="cover-fallback album-gradient-2"><span style="font-weight:900;font-size:22px">LYRICS</span></div>
          <span class="type-badge">LYRIC LICENSE</span>
        </div>
        <div class="card-body">
          <div class="small accent-text">${item.genre}</div>
          <h3 class="card-title" title="${item.title}">${item.title}</h3>
          <p class="muted small truncate">By ${item.artist_name}</p>
          <div class="row between mt">
            <strong class="price">₹${item.price_inr}</strong>
            <button type="button" class="btn btn-primary btn-sm" data-action="buy" data-custom-id="${item.id}">🛒 BUY / CHECKOUT</button>
          </div>
        </div>
      `;
      grid.prepend(card);
    });
  }

  // 4. Open Direct UPI Checkout Modal
  function openUpiCheckoutModal(title, price, fullLyrics) {
    const existing = document.getElementById("upi-checkout-modal");
    if (existing) existing.remove();

    const cleanPrice = String(price).replace(/[^\d.]/g, "") || "499";
    const upiUri =
      `upi://pay?pa=${encodeURIComponent(PAYMENT_CONFIG.upiId)}` +
      `&pn=${encodeURIComponent(PAYMENT_CONFIG.merchantName)}` +
      `&tn=${encodeURIComponent("Lyric License: " + title)}` +
      `&am=${encodeURIComponent(cleanPrice)}&cu=INR`;

    const qrCodeUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

    const modal = document.createElement("div");
    modal.id = "upi-checkout-modal";
    modal.className = "overlay";
    modal.innerHTML = `
      <div class="modal panel center" style="max-width:430px">
        <button class="icon-btn modal-close" type="button" id="upi-modal-close" aria-label="Close">✕</button>
        <span class="eyebrow">// DIRECT UPI CHECKOUT</span>
        <h3 class="modal-title" style="margin-top:6px;font-size:24px">${title}</h3>
        <div class="accent-text" style="font-size:32px;font-weight:900;margin:6px 0">₹${cleanPrice}</div>

        <div style="background:#fff;padding:14px;border-radius:16px;display:inline-block;margin:8px auto">
          <img src="${qrCodeUrl}" alt="UPI QR Code" width="200" height="200" style="display:block" />
        </div>

        <p class="small muted">Scan with <strong>GPay, PhonePe, Paytm</strong> or any UPI App</p>

        <div class="mono small" style="background:var(--soft);padding:10px 12px;border-radius:10px;margin:12px 0;border:1px solid var(--line)">
          UPI ID: <strong>${PAYMENT_CONFIG.upiId}</strong>
          <button type="button" id="upi-copy-btn" class="link" style="margin-left:8px">COPY</button>
        </div>

        <a href="${upiUri}" class="btn btn-soft w-full">📱 PAY VIA UPI APP (MOBILE)</a>

        <div style="text-align:left;margin-top:18px;padding-top:14px;border-top:1px solid var(--line)">
          <label class="label">ENTER 12-DIGIT UPI UTR / REF NO. TO UNLOCK LYRICS
            <input id="upi-utr-field" class="input" type="text" maxlength="16" placeholder="e.g. 431512345678" />
          </label>
          <button type="button" id="upi-confirm-btn" class="btn btn-primary w-full mt">VERIFY &amp; DOWNLOAD LYRICS</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("upi-modal-close").onclick = () => modal.remove();
    document.getElementById("upi-copy-btn").onclick = () => {
      navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
      notify("UPI ID copied!");
    };

    document.getElementById("upi-confirm-btn").onclick = () => {
      const utr = document.getElementById("upi-utr-field").value.trim();
      if (!/^\d{12}$/.test(utr)) {
        return notify("Please enter a valid 12-digit UPI UTR / Reference number.", true);
      }

      const cert = [
        "======================================================",
        "        SYNTS EVERINK - OFFICIAL LYRIC LICENSE        ",
        "======================================================",
        "Project Title     : " + title,
        "Creator / Writer  : Synts",
        "License Fee Paid  : ₹" + cleanPrice,
        "Paid To UPI ID    : " + PAYMENT_CONFIG.upiId,
        "UPI UTR Reference : " + utr,
        "Date              : " + new Date().toLocaleString(),
        "======================================================",
        "",
        "LICENSED LYRICS:",
        fullLyrics || "Thank you for licensing \"" + title + "\". Keep this UTR receipt for full commercial rights.",
        "======================================================"
      ].join("\n");

      const blob = new Blob([cert], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = title.replace(/[^a-z0-9]+/gi, "_") + "_License.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      modal.remove();
      notify("Payment verified! License & Lyrics downloaded.");
    };
  }

  // 5. Intercept clicks on any "🛒 BUY / CHECKOUT" (data-action="buy") button
  document.addEventListener("click", (e) => {
    const buyBtn = e.target.closest('[data-action="buy"]');
    if (!buyBtn) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const customId = buyBtn.getAttribute("data-custom-id");
    if (customId) {
      const customList = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");
      const found = customList.find(x => x.id === customId);
      if (found) {
        openUpiCheckoutModal(found.title, found.price_inr, found.full_lyrics);
        return;
      }
    }

    const card = buyBtn.closest(".card");
    const title = card?.querySelector(".card-title")?.textContent?.trim() || "Lyric License";
    const priceText = card?.querySelector(".price")?.textContent?.replace(/[^\d]/g, "") || "499";
    openUpiCheckoutModal(title, priceText, "");
  }, true);

  function initPaymentUI() {
    buildCreatorControls();
    injectCustomListings();
  }

  initPaymentUI();
  document.addEventListener("DOMContentLoaded", initPaymentUI);
  setInterval(buildCreatorControls, 1000);
})();
