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
    setTimeout(() => t.classList.add("hidden"), 5000);
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
    return `upi://pay?${params.toString()}`; }  function openUpiCheckoutModal({ title, priceInr, licenseType = "Commercial Lyric License", onPaid }) { const existing = document.getElementById("synts-upi-modal"); if (existing) existing.remove();  const toastEl = document.getElementById("toast"); if (toastEl) toastEl.classList.add("hidden");  const safeTitle = escapeHtml(title \vert{}\vert{} "Original Lyric Pack"); const safeLicense = escapeHtml(licenseType); const cleanAmount = Math.min( Math.max(Number(String(priceInr).replace(/[^\d.]/g, "")) \vert{}\vert{} 499, 1), 500000 );  const upiUri = buildUpiUri({ amountInr: cleanAmount, note: `${title} (${licenseType})` }); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

    const modal = document.createElement("div");
    modal.id = "synts-upi-modal";
    modal.style.cssText = `
      position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);
      backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;
    `;

    modal.innerHTML = `
      <div style="
        background:#11161c;border:1px solid rgba(74,222,128,0.4);border-radius:20px;
        max-width:440px;width:100%;padding:24px;color:#fff;text-align:center;
        box-shadow:0 24px 60px rgba(0,0,0,0.85);font-family:inherit;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-family:monospace;font-size:11px;color:#4ade80;letter-spacing:0.08em">🔒 ENCRYPTED UPI LICENSE GATEWAY</span>
          <button type="button" id="close-upi-modal" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer">✕</button>
        </div>

        <h3 style="margin:0 0 4px;font-size:20px;font-weight:800">${safeTitle}</h3>
        <div style="font-size:12px;color:#9ca3af;margin-bottom:16px">${safeLicense} · Bank-Verified Delivery</div>

        <div style="background:#fff;padding:14px;border-radius:1
