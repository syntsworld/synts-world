(() => {
  "use strict";

  // ================= CONFIGURATION =================
  const PAYMENT_CONFIG = {
    upiId: "yourname@okaxis", // <-- Replace with your actual UPI ID (GPay / PhonePe / Paytm)
    merchantName: "SYNTS Everink",
    supabaseUrl: "https://zvcmbjnsvkoqoycsopkm.supabase.co",
    supabaseKey: "sb_publishable_EfalUd595D0IUkfQNQ-blw_P62Kpwca"
  };

  function notify(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) {
      alert(msg);
      return;
    }
    t.textContent = msg;
    t.classList.toggle("error", isError);
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 4500);
  }

  // 1. Add "💰 LIST FOR SALE" button inside the Encrypted Vault bar
  function injectSellButton() {
    const vaultRow = document.querySelector("#vault-open .row");
    if (vaultRow && !document.getElementById("sell-lyric-btn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "sell-lyric-btn";
      btn.className = "btn btn-primary btn-sm";
      btn.textContent = "💰 LIST FOR SALE";
      btn.addEventListener("click", publishLyricForSale);
      vaultRow.appendChild(btn);
    }
  }

  // 2. Publish lyrics from Notepad to the public Directory with a set INR price
  async function publishLyricForSale() {
    const title = document.getElementById("lyrics-title")?.value.trim();
    const fullLyrics = document.getElementById("lyrics-text")?.value.trim();

    if (!title || !fullLyrics) {
      return notify("Write a song title and lyrics in the Notepad first!", true);
    }

    const priceInput = prompt(`Set License Price in INR (₹) for "${title}":`, "499");
    if (!priceInput) return;
    const price = Number(priceInput);
    if (!Number.isFinite(price) || price < 1) {
      return notify("Please enter a valid price in INR.", true);
    }

    const genre = prompt(
      "Enter Genre / Category (e.g. Hindi Rap, Urdu Drill, Commercial Hook):",
      "Original Lyrics"
    ) || "Original Lyrics";

    const previewSnippet = fullLyrics
      .replace(/\[[^\]]*\]/g, "")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(" / ");

    try {
      if (!window.supabase) throw new Error("Supabase client not loaded.");
      const sb = window.supabase.createClient(PAYMENT_CONFIG.supabaseUrl, PAYMENT_CONFIG.supabaseKey);

      const { error } = await sb.from("releases").insert({
        title,
        artist_name: "Synts",
        release_type: "track",
        genre,
        price_inr: price,
        description: previewSnippet,
        full_lyrics: fullLyrics,
        status: "published"
      });

      if (error) throw error;
      notify(`"${title}" is now listed for sale at ₹${price}!`);
      setTimeout(() => location.reload(), 1200);
    } catch (err) {
      notify("Could not list lyric: " + (err.message || err), true);
    }
  }

  // 3. Open Direct UPI Checkout Modal (QR Code + Mobile Deep Link + UTR Verification)
  function openUpiModal(title, price, fullLyrics) {
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
        <span class="eyebrow">// DIRECT UPI LICENSE CHECKOUT</span>
        <h3 class="modal-title" style="margin-top:6px;font-size:24px">${title}</h3>
        <div class="accent-text" style="font-size:30px;font-weight:900;margin:6px 0">₹${cleanPrice}</div>

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
          <label class="label">ENTER 12-DIGIT UPI UTR / REF NO. TO UNLOCK
            <input id="upi-utr-field" class="input" type="text" maxlength="16" placeholder="e.g. 431512345678" />
          </label>
          <button type="button" id="upi-confirm-btn" class="btn btn-primary w-full mt">VERIFY &amp; DOWNLOAD LICENSE</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("upi-modal-close").onclick = () => modal.remove();
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById("upi-copy-btn").onclick = () => {
      navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
      notify("UPI ID copied: " + PAYMENT_CONFIG.upiId);
    };

    document.getElementById("upi-confirm-btn").onclick = () => {
      const utr = document.getElementById("upi-utr-field").value.trim();
      if (!/^\d{12}$/.test(utr)) {
        return notify("Please enter a valid 12-digit numeric UPI UTR / Reference ID.", true);
      }

      downloadLicenseFile(title, cleanPrice, utr, fullLyrics);
      modal.remove();
      notify("License unlocked & downloaded!");
    };
  }

  // 4. Generate and download the buyer's official Lyric License Certificate (.txt)
  function downloadLicenseFile(title, price, utr, fullLyrics) {
    const certificate = [
      "======================================================",
      "        SYNTS EVERINK - OFFICIAL LYRIC LICENSE        ",
      "======================================================",
      "Project Title     : " + title,
      "Songwriter/Artist : Synts",
      "License Fee Paid  : ₹" + price,
      "Paid To UPI ID    : " + PAYMENT_CONFIG.upiId,
      "UPI UTR Reference : " + utr,
      "Issued Date       : " + new Date().toLocaleString(),
      "======================================================",
      "",
      "LICENSE TERMS:",
      "This certificate grants non-exclusive commercial recording",
      "and performance rights for the licensed lyrics listed below,",
      "subject to verification of UPI UTR #" + utr + ".",
      "",
      "------------------------------------------------------",
      "LYRICS / PROJECT CONTENT:",
      "------------------------------------------------------",
      fullLyrics || "Please share your UTR number (" + utr + ") with Synts for full studio lyric sheet & vocal guide delivery.",
      "======================================================"
    ].join("\n");

    const blob = new Blob([certificate], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = title.replace(/[^a-z0-9]+/gi, "_") + "_License_" + utr + ".txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // 5. Listen for clicks on any "LICENSE" / "UNLOCK" card button in the Directory
  document.addEventListener("click", (e) => {
    const buyBtn = e.target.closest('[data-action="buy"]');
    if (!buyBtn) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const card = buyBtn.closest(".card");
    const title = card?.querySelector(".card-title")?.textContent?.trim() || "Lyric Project";
    const priceText = card?.querySelector(".price")?.textContent?.replace(/[^\d]/g, "") || "499";

    openUpiModal(title, priceText, "");
  }, true);

  // Keep checking so the "💰 LIST FOR SALE" button appears as soon as the Vault is unlocked
  setInterval(injectSellButton, 1000);
})();
