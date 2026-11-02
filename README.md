# SYNTS WORLD — Existing code redesign

This is a redesign of the **provided existing HTML**, not a replacement Supabase project.

## Preserved
- Existing Supabase URL and publishable (browser-safe) key.
- Supabase email signup/login, Google OAuth, password reset, auth-state restore/logout.
- Original VIP membership lookup and original Supabase configuration references.
- Existing audio-player infrastructure and public-track configuration.

## Updated
- Responsive artist-first music marketplace and artist earnings messaging.
- Search and filter by track, EP or playlist.
- Creator upload form, creator release list, artist-set INR prices.
- Private file uploads to `creator-uploads` bucket and new `releases` table.
- 30-second **public preview limit in the browser only**. For secure paid releases, preview files must be separate, genuinely short server-generated files. Do NOT set `preview_url` to a complete song.
- Login prompts for creator and purchase actions.

## Setup
1. Back up existing website; then replace the current page HTML with `index.html` or integrate it into existing source control.
2. In the **same** Supabase project, review/run `supabase-marketplace.sql`. It creates only new marketplace objects.
3. In Supabase Authentication configure Site URL and allowed callback URLs (including your Vercel domain), and enable Google OAuth if you intend to support it.
4. Deploy to Vercel / HTTPS. Open as a hosted site, not with `file://`, for OAuth/password reset.
5. Sign in and try a **test upload**. Uploads remain private and unpublished.
6. Publish real music only after you implement audio validation/transcoding, a dedicated preview asset pipeline and copyright/moderation workflow.

## Not production-ready / needs backend work
- **Checkout is intentionally disabled**, not simulated. Clicking Unlock explains that it is not connected. Secure server endpoint must create orders, call a marketplace-capable payment provider, verify payment webhooks, and generate entitlements. Only authenticated, paid users should get short-lived playback access.
- **Earnings and payouts are not fabricated**. Add validated order line items, artist shares, refunds, ledger, connected seller onboarding/KYC, and payout reconciliation before live sales.
- EP/playlist upload selection currently creates a review record and a source file; it does NOT bundle multiple licensed tracks or offer functional multi-track playback. Add release_tracks table, item management, rights checks, and multi-owner allocation.
- Staff must approve releases with trusted server service role; no client-side approval permission is granted.
- Upload file validation is basic in the browser; enforce limits, virus/content scanning, rate limiting and idempotency in a server worker.
- Public releases are read by the existing Supabase client. Initial example cards appear if the database contains no published releases or when the table is not yet configured.
- Legacy VIP/merch and CLI functions remain in JS for compatibility but the redesigned interface intentionally does not surface those pages.
- Existing project configuration values are reused verbatim. No secret keys should be added to browser HTML.

## Recommended next backend modules
- `checkout-session` Edge Function with authenticated buyer and server-calculated price.
- Payment webhook verified with provider signature and idempotent order fulfillment.
- `orders`, `order_items`, `entitlements`, `artist_balances`, and payout ledger tables with appropriate RLS.
- Short-lived signed streaming playback URLs created only after server entitlement check.
- Track/EP/playlist relational structure; asset processing worker; admin dashboard.
