(() => {
  "use strict";

  const PAYMENT_CONFIG = {
    upiId: "apex.santosh.2001@yescred", // Your GPay / PhonePe / Paytm UPI ID
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

  function buildUpiUri({ amountInr, note }) {
    const params = new URLSearchParams({
      pa: PAYMENT_CONFIG.upiId,
      pn: PAYMENT_CONFIG.merchantName,
      am: String(Number(amountInr).toFixed(2)),
      cu: "INR",
      tn: note || "SYNTS Lyric License"
    });
    return `upi://pay?${params.toString()}`;
  }

  // Open UPI QR + GPay / PhonePe / Paytm Modal
  function openUpiCheckoutModal({ title, priceInr, licenseType = "Standard License", onPaid }) {
    const existing = document.getElementById("synts-upi-modal");
    if (existing) existing.remove();

    const cleanAmount = Math.max(Number(String(priceInr).replace(/[^\d.]/g, "")) || 499, 1);
    const upiUri = buildUpiUri({
      amountInr: cleanAmount,
      note: `${title} (${licenseType})`
    });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

    const modal = document.createElement("div");
    modal.id = "synts-upi-modal";
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.82);
      backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;
    `;

    modal.innerHTML = `
      <div style="
        background:#11161c;border:1px solid rgba(74,222,128,0.35);border-radius:20px;
        max-width:420px;width:100%;padding:24px;color:#fff;text-align:center;
        box-shadow:0 24px 60px rgba(0,0,0,0.75);font-family:inherit;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:monospace;font-size:11px;color:#4ade80;letter-spacing:0.08em">INSTANT UPI LICENSE CHECKOUT</span>
          <button type="button" id="close-upi-modal" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer">✕</button>
        </div>

        <h3 style="margin:0 0 4px;font-size:20px;font-weight:800">${title}</h3>
        <div style="font-size:12px;color:#9ca3af;margin-bottom:16px">${licenseType} · Instant Rights Transfer</div>

        <div style="background:#fff;padding:14px;border-radius:16px;display:inline-block;margin-bottom:14px">
          <img src="${qrUrl}" alt="UPI QR Code" width="200" height="200" style="display:block;border-radius:8px" />
        </div>

        <div style="font-size:26px;font-weight:900;color:#4ade80;margin-bottom:6px">₹${cleanAmount}</div>
        <div style="font-size:12px;color:#d1d5db;font-family:monospace;margin-bottom:16px">
          UPI ID: <strong style="color:#fff">${PAYMENT_CONFIG.upiId}</strong>
        </div>

        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
          <a href="${upiUri}" style="
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
            ENTER 12-DIGIT UPI UTR / REF NO. TO UNLOCK LYRICS:
          </label>
          <div style="display:flex;gap:8px">
            <input type="text" id="upi-utr-input" placeholder="e.g. 431289451209" maxlength="18" style="
              flex:1;background:#0a0d11;border:1px solid rgba(255,255,255,0.16);
              border-radius:8px;padding:9px 12px;color:#fff;font-family:monospace;font-size:13px;
            " />
            <button type="button" id="verify-upi-btn" style="
              background:#22c55e;color:#041007;border:none;border-radius:8px;
              padding:9px 14px;font-weight:800;font-size:12px;cursor:pointer;font-family:monospace;
            ">UNLOCK</button>
          </div>
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
      notify(`Copied UPI ID: ${PAYMENT_CONFIG.upiId}`);
    };

    document.getElementById("verify-upi-btn").onclick = () => {
      const utr = document.getElementById("upi-utr-input").value.trim();
      if (utr.length < 6) {
        notify("Please enter a valid UPI Reference / UTR number after payment.", true);
        return;
      }
      modal.remove();
      notify(`Payment Reference #${utr} recorded! License unlocked.`);
      if (typeof onPaid === "function") onPaid(utr);
    };
  }

  // Wire up any "Buy", "License", or "Unlock" buttons on the page
  function bindMarketplaceButtons() {
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("button, a");
      if (!btn) return;

      const label = (btn.textContent || "").trim().toUpperCase();
      if (
        label.includes("LICENSE NOW") ||
        label.includes("BUY LICENSE") ||
        label.includes("UNLOCK LYRICS") ||
        btn.hasAttribute("data-buy-lyric")
      ) {
        e.preventDefault();
        const card = btn.closest("article, .card, .project-card, div") || document.body;
        const titleEl = card.querySelector("h3, h4, .title");
        const title = btn.getAttribute("data-title") || (titleEl ? titleEl.textContent.trim() : "Original Lyric License");

        const priceMatch = (card.textContent || "").match(/₹\s*(\d+)/);
        const priceInr = btn.getAttribute("data-price") || (priceMatch ? priceMatch[1] : 499);

        openUpiCheckoutModal({
          title,
          priceInr,
          onPaid: () => {
            const lockedPre = card.querySelector("[data-locked-lyrics]");
            if (lockedPre) {
              lockedPre.style.filter = "none";
              lockedPre.style.userSelect = "text";
            }
          }
        });
      }
    });
  }

  // Add Creator Save / PIN Lock / List for Sale controls in the Studio
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
      const pin = prompt("Set a 4-digit PIN to lock this lyric file (optional):", "") || "";

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
      const price = prompt("Enter License Price in INR (₹):", "499") || "499";

      const listings = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");
      listings.unshift({ id: Date.now(), title, price: Number(price) || 499, preview: text.slice(0, 140), fullText: text });
      localStorage.setItem(LOCAL_MARKET_KEY, JSON.stringify(listings));
      injectCustomListings();
      notify(`Listed "${title}" for ₹${price}! Buyers can now unlock it via UPI.`);
    };
  }

  function injectCustomListings() {
    const marketGrid = document.querySelector("#marketplace .grid, #projects .grid, .marketplace-grid");
    if (!marketGrid) return;

    document.querySelectorAll(".synts-custom-market-card").forEach((el) => el.remove());
    const listings = JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY) || "[]");

    listings.forEach((item) => {
      const card = document.createElement("div");
      card.className = "synts-custom-market-card";
      card.style.cssText = `
        background:#12171d;border:1px solid rgba(74,222,128,0.28);border-radius:16px;
        padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;
      `;
      card.innerHTML = `
        <div>
          <span style="font-size:10px;font-family:monospace;color:#4ade80">VERIFIED CREATOR LISTING</span>
          <h3 style="margin:6px 0;font-size:18px;color:#fff;font-weight:800">${item.title}</h3>
          <pre data-locked-lyrics style="
            font-family:monospace;font-size:12px;color:#9ca3af;white-space:pre-wrap;
            background:rgba(0,0,0,0.35);padding:10px;border-radius:8px;margin:0;
          ">${item.preview}...</pre>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
          <span style="font-size:18px;font-weight:900;color:#4ade80">₹${item.price}</span>
          <button type="button" data-buy-lyric data-title="${item.title}" data-price="${item.price}" style="
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
