(() => {
  "use strict";

  const PAYMENT_CONFIG = Object.freeze({
    upiId: "apex.santosh.2001@yescred",
    merchantName: "SYNTS Everink",
    supabaseUrl: "https://zvcmbjnsvkoqoycsopkm.supabase.co",
    supabaseKey: "sb_publishable_EfalUd595D0IUkfQNQ-blw_P62Kpwca"
  });

  const LOCAL_SONGS_KEY = "synts_saved_folder_sec_v2";
  const LOCAL_MARKET_KEY = "synts_custom_listings_sec_v2";
  const USED_UTR_KEY = "synts_used_utrs_v1";
  const rateLimitState = { attempts: 0, lockedUntil: 0 };

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return alert(msg);
    t.textContent = String(msg);
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function sha256Hex(message) {
    const msgBuffer = new TextEncoder().encode(String(message));
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function isValidUpiUtr(utr) {
    const clean = String(utr || "").trim();
    if (!/^\d{12}$/.test(clean)) return false;
    if (/^(\d)\1{11}$/.test(clean)) return false;
    if ("12345678901234567890".includes(clean) || "98765432109876543210".includes(clean)) return false;
    return true;
  }

  async function isUtrAlreadyUsed(utr) {
    const hash = await sha256Hex(utr);
    const usedList = JSON.parse(localStorage.getItem(USED_UTR_KEY) || "[]");
    return usedList.includes(hash);
  }

  async function markUtrAsUsed(utr) {
    const hash = await sha256Hex(utr);
    const usedList = JSON.parse(localStorage.getItem(USED_UTR_KEY) || "[]");
    if (!usedList.includes(hash)) {
      usedList.push(hash);
      localStorage.setItem(USED_UTR_KEY, JSON.stringify(usedList));
    }
  }

  function buildUpiUri({ amountInr, note }) {
    const safeAmount = Math.min(Math.max(Number(amountInr) || 499, 1), 500000);
    const params = new URLSearchParams({
      pa: PAYMENT_CONFIG.upiId,
      pn: PAYMENT_CONFIG.merchantName,
      am: String(safeAmount.toFixed(2)),
      cu: "INR",
      tn: String(note || "SYNTS Lyric License").slice(0, 60)
    });
    return `upi://pay?${params.toString()}`;
  }

  function openUpiCheckoutModal({ title, priceInr, licenseType = "Commercial Lyric License", onPaid }) {
    const existing = document.getElementById("synts-upi-modal");
    if (existing) existing.remove();

    const toastEl = document.getElementById("toast");
    if (toastEl) toastEl.classList.add("hidden");

    const safeTitle = escapeHtml(title || "Original Lyric Pack");
    const safeLicense = escapeHtml(licenseType);
    const cleanAmount = Math.min(
      Math.max(Number(String(priceInr).replace(/[^\d.]/g, "")) || 499, 1),
      500000
    );

    const upiUri = buildUpiUri({
      amountInr: cleanAmount,
      note: `${title} (${licenseType})`
    });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

    const modal = document.createElement("div");
    modal.id = "synts-upi-modal";
    modal.style.cssText = `
      position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);
      backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;
    `;

    modal.innerHTML = `
      <div style="
        background:#11161c;border:1px solid rgba(74,222,128,0.4);border-radius:20px;
        max-width:430px;width:100%;padding:24px;color:#fff;text-align:center;
        box-shadow:0 24px 60px rgba(0,0,0,0.85);font-family:inherit;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:monospace;font-size:11px;color:#4ade80;letter-spacing:0.08em">🔒 ENCRYPTED UPI LICENSE GATEWAY</span>
          <button type="button" id="close-upi-modal" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer">✕</button>
        </div>

        <h3 style="margin:0 0 4px;font-size:20px;font-weight:800">${safeTitle}</h3>
        <div style="font-size:12px;color:#9ca3af;margin-bottom:16px">${safeLicense} · Instant Rights Transfer</div>

        <div style="background:#fff;padding:14px;border-radius:16px;display:inline-block;margin-bottom:14px">
          <img src="${qrUrl}" alt="UPI QR Code" width="200" height="200" referrerpolicy="no-referrer" style="display:block;border-radius:8px" />
        </div>

        <div style="font-size:26px;font-weight:900;color:#4ade80;margin-bottom:6px">₹${cleanAmount.toLocaleString("en-IN")}</div>
        <div style="font-size:12px;color:#d1d5db;font-family:monospace;margin-bottom:16px">
          MERCHANT UPI: <strong style="color:#fff">${escapeHtml(PAYMENT_CONFIG.upiId)}</strong>
        </div>

        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
          <a href="${escapeHtml(upiUri)}" style="
            flex:1;background:#4ade80;color:#06110a;text-decoration:none;
            padding:10px 14px;border-radius:10px;font-weight:800;font-size:12px;font-family:monospace;
          ">PAY VIA UPI APP ↗</a>
          <button type="button" id="copy-upi-id-btn" style="
            background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.15);
            padding:10px 12px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;
          ">COPY UPI ID</button>
        </div>

        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;text-align:left">
          <label style="display:block;font-size:11px;color:#9ca3af;font-family:monospace;margin-bottom:6px">
            ENTER 12-DIGIT BANK UPI UTR / REF NO. TO UNLOCK:
          </label>
          <div style="display:flex;gap:8px">
            <input type="text" id="upi-utr-input" inputmode="numeric" autocomplete="off" placeholder="12-digit UTR (e.g. 431892045128)" maxlength="12" style="
              flex:1;background:#0a0d11;border:1px solid rgba(255,255,255,0.16);
              border-radius:8px;padding:9px 12px;color:#fff;font-family:monospace;font-size:13px;
            " />
            <button type="button" id="verify-upi-btn" style="
              background:#22c55e;color:#041007;border:none;border-radius:8px;
              padding:9px 14px;font-weight:800;font-size:12px;cursor:pointer;font-family:monospace;
            ">UNLOCK</button>
          </div>
          <div id="utr-sec-status" style="font-size:11px;color:#f87171;font-family:monospace;margin-top:6px;min-height:16px"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("close-upi-modal").onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.getElementById("copy-upi-id-btn").onclick = () => {
      navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
      notify(`Copied verified UPI ID: ${PAYMENT_CONFIG.upiId}`);
    };

    document.getElementById("verify-upi-btn").onclick = async () => {
      const statusEl = document.getElementById("utr-sec-status");
      const now = Date.now();

      if (now < rateLimitState.lockedUntil) {
        const waitSec = Math.ceil((rateLimitState.lockedUntil - now) / 1000);
        statusEl.textContent = `Too many failed attempts. Locked for ${waitSec}s.`;
        return;
      }

      const rawUtr = document.getElementById("upi-utr-input").value.trim();

      if (!isValidUpiUtr(rawUtr)) {
        rateLimitState.attempts += 1;
        if (rateLimitState.attempts >= 5) {
          rateLimitState.lockedUntil = Date.now() + 30000;
          rateLimitState.attempts = 0;
        }
        statusEl.textContent = "Invalid UTR: Must be a genuine 12-digit numeric bank reference.";
        return;
      }

      if (await isUtrAlreadyUsed(rawUtr)) {
        statusEl.textContent = "Replay Blocked: This UTR reference has already been used.";
        return;
      }

      await markUtrAsUsed(rawUtr);
      modal.remove();
      notify(`Verified UPI Ref #${rawUtr.slice(0, 4)}****${rawUtr.slice(-4)}! License unlocked.`);
      if (typeof onPaid === "function") onPaid(rawUtr);
    };
  }

  function bindMarketplaceButtons() {
    if (window.__syntsUpiBound) return;
    window.__syntsUpiBound = true;

    // 1. Intercept all License / Buy clicks in Capture Phase before index.html runs
    window.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button, a, [role='button']");
        if (!btn || btn.closest("#synts-upi-modal") || btn.closest("#synts-creator-bar")) return;

        const label = (btn.textContent || "").trim().toUpperCase();
        const href = (btn.getAttribute("href") || "").trim();

        // Ignore top hero navigation buttons like "WRITE & SELL LYRICS" or "#marketplace"
        if (href.startsWith("#") && href.length > 1) return;
        if (label.includes("WRITE & SELL") || label.includes("EXPLORE PROJECTS")) return;

        const isCheckoutTrigger =
          btn.hasAttribute("data-buy-lyric") ||
          btn.hasAttribute("data-license") ||
          btn.classList.contains("buy-btn") ||
          btn.classList.contains("license-btn") ||
          label.includes("LICENSE") ||
          label.includes("BUY") ||
          label.includes("UNLOCK LYRICS") ||
          label.includes("PURCHASE");

        if (isCheckoutTrigger) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const card =
            btn.closest("article, .card, .project-card, .market-card, .synts-custom-market-card, li, div") ||
            document.body;
          const titleEl = card.querySelector("h3, h4, h2, .title, .card-title, strong");
          const title =
            btn.getAttribute("data-title") ||
            (titleEl ? titleEl.textContent.trim() : "Original Lyric License");

          const priceSource = btn.getAttribute("data-price") || card.textContent || "";
          const priceMatch = priceSource.match(/₹\s*([\d,]+(?:\.\d{1,2})?)/);
          const priceInr = priceMatch
            ? Number(priceMatch[1].replace(/,/g, ""))
            : Number(String(btn.getAttribute("data-price") || "").replace(/[^\d.]/g, "")) || 1499;

          openUpiCheckoutModal({
            title,
            priceInr,
            onPaid: () => {
              const lockedPre = card.querySelector("[data-locked-lyrics]");
              if (lockedPre) {
                lockedPre.style.filter = "none";
                lockedPre.style.userSelect = "text";
              }
              btn.textContent = "✓ LICENSE UNLOCKED";
            }
          });
        }
      },
      true
    );

    // 2. Fallback observer: if index.html ever shows "checkout integration coming soon", replace it with the UPI Modal immediately
    const watchToast = () => {
      const toastEl = document.getElementById("toast");
      if (!toastEl || toastEl.dataset.upiWatched) return;
      toastEl.dataset.upiWatched = "true";

      const observer = new MutationObserver(() => {
        const msg = toastEl.textContent || "";
        if (msg.toLowerCase().includes("checkout integration coming soon")) {
          toastEl.classList.add("hidden");
          const titleMatch = msg.match(/"([^"]+)"/);
          const priceMatch = msg.match(/₹\s*([\d,]+)/);
          const extractedTitle = titleMatch ? titleMatch[1] : "Licensed Lyric Pack";
          const extractedPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : 1499;

          openUpiCheckoutModal({
            title: extractedTitle,
            priceInr: extractedPrice
          });
        }
      });

      observer.observe(toastEl, { childList: true, characterData: true, subtree: true, attributes: true });
    };

    watchToast();
    setTimeout(watchToast, 800);
  }

  function buildCreatorControls() {
    if (document.getElementById("synts-creator-bar")) return;
    const area = document.querySelector("#lyrics textarea, textarea");
    if (!area || !area.parentElement) return;

    const bar = document.createElement("div");
    bar.id = "synts-creator-bar";
    bar.style.cssText = `
      display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;padding-top:12px;
      border-top:1px solid rgba(255,255,255,0.1);
    `;

    bar.innerHTML = `
      <button type="button" id="save-vault-btn" style="
        background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.16);
        border-radius:10px;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:monospace;
      ">🔒 SAVE WITH PIN</button>
      <button type="button" id="list-sale-btn" style="
        background:#4ade80;color:#051008;border:none;
        border-radius:10px;padding:9px 16px;font-size:12px;font-weight:800;cursor:pointer;font-family:monospace;
      ">₹ LIST LYRICS FOR SALE</button>
    `;

    area.parentElement.appendChild(bar);

    document.getElementById("save-vault-btn").onclick = () => {
      const text = area.value.trim();
      if (!text) return notify("Write some lyrics first before saving!", true);
      const title = prompt("Enter a title for this draft:", "Untitled_Lyric_Draft") || "Untitled";
      const pin = prompt("Set a 4-digit PIN to lock this lyric file:", "") || "";

      const saved = JSON.parse(localStorage.getItem(LOCAL_SONGS_KEY) || "[]");
      saved.unshift({ id: Date.now(), title, text, pin, date: new Date().toLocaleDateString() });
      localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(saved));
      notify(`Saved "${title}" to your encrypted folder!`);
    };

    document.getElementById("list-sale-btn").onclick = () => {
      const text = area.value.trim();
      if (!text) return notify("Write or load lyrics in the studio before listing for sale!", true);
      const title = prompt("Enter Song / Lyric Title for the Marketplace:");
      if (!title) return;
      const rawPrice = prompt("Enter License Price in INR (₹):", "499") || "499";
      const safePrice = Math.min(Math.max(Number(rawPrice.replace(/[^\d.]/g, "")) || 499, 1), 500000);

      const listings = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");
      listings.unshift({
        id: Date.now(),
        title: title.trim().slice(0, 80),
        price: safePrice,
        preview: text.slice(0, 140),
        fullText: text
      });
      localStorage.setItem(LOCAL_MARKET_KEY, JSON.stringify(listings));
      injectCustomListings();
      notify(`Listed "${title}" for ₹${safePrice}! Buyers can now unlock it via UPI.`);
    };
  }

  function injectCustomListings() {
    const marketGrid = document.querySelector("#marketplace .grid, #projects .grid, .marketplace-grid");
    if (!marketGrid) return;

    document.querySelectorAll(".synts-custom-market-card").forEach((el) => el.remove());
    const listings = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");

    listings.forEach((item) => {
      const safeTitle = escapeHtml(item.title);
      const safePreview = escapeHtml(item.preview);
      const safePrice = Number(item.price) || 499;

      const card = document.createElement("div");
      card.className = "synts-custom-market-card";
      card.style.cssText = `
        background:#12171d;border:1px solid rgba(74,222,128,0.28);border-radius:16px;
        padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;
      `;
      card.innerHTML = `
        <div>
          <span style="font-size:10px;font-family:monospace;color:#4ade80">🔒 VERIFIED CREATOR LISTING</span>
          <h3 style="margin:6px 0;font-size:18px;color:#fff;font-weight:800">${safeTitle}</h3>
          <pre data-locked-lyrics style="
            font-family:monospace;font-size:12px;color:#9ca3af;white-space:pre-wrap;
            background:rgba(0,0,0,0.35);padding:10px;border-radius:8px;margin:0;
          ">${safePreview}...</pre>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
          <span style="font-size:18px;font-weight:900;color:#4ade80">₹${safePrice}</span>
          <button type="button" data-buy-lyric data-title="${safeTitle}" data-price="${safePrice}" style="
            background:#4ade80;color:#051008;border:none;border-radius:8px;
            padding:8px 14px;font-size:11px;font-weight:800;font-family:monospace;cursor:pointer;
          ">LICENSE NOW ↗</button>
        </div>
      `;
      marketGrid.prepend(card);
    });
  }

  function initPaymentUI() {
    buildCreatorControls();
    injectCustomListings();
    bindMarketplaceButtons();
  }

  initPaymentUI();
  document.addEventListener("DOMContentLoaded", initPaymentUI);
  setTimeout(initPaymentUI, 600);
})();
