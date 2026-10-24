# NOTES — what the build window still needs

Status: local scaffold/prototype only. Nothing has been submitted anywhere; no
Devpost signup or hackathon registration has been done from this workspace
(entry mechanics are handled separately). **Update 2026-10-24 (later):** the
founder created the PayPal sandbox app "ProofReceipt checkout" from his phone
and relayed its Client ID as copied text; it is now wired into
`app/checkout.html` (see the correction at the bottom of this file). The app
Secret was never shared and is not in this project.

## 1. PayPal sandbox app — founder/account-holder steps (developer.paypal.com)

These must be done by the account holder personally (they create credentials
tied to his PayPal account). All free, all sandbox:

1. Go to https://developer.paypal.com and log in with the PayPal account (or
   create a free account). Confirm sandbox access under Dashboard → Sandbox.
2. Dashboard → My Apps & Credentials → **Sandbox** tab → "Create App".
   Name it e.g. "ProofReceipt Checkout". This generates a sandbox
   **Client ID** and Secret. Only the Client ID goes into the web page; the
   Secret must never be committed to the repo or put in client-side code.
3. In `app/checkout.html`, replace the placeholder in the SDK URL —
   `client-id=sb` → `client-id=<SANDBOX_CLIENT_ID>` (single line, marked with
   a comment). `sb` is PayPal's documented demo placeholder only.
4. Sandbox test accounts: developer dashboard → Sandbox → Accounts. Use the
   auto-provided personal (buyer) and business (seller) sandbox accounts to
   run a full test order: approve as the sandbox buyer, then check the order
   in the sandbox seller view. Sandbox money only — no real funds exist there.
5. Full-build upgrade (recommended before submitting): move order
   create/capture server-side using the Orders v2 API (create order → buyer
   approves via JS SDK → server captures), storing the receipt ID in the
   order's `custom_id` and the receipt hash in the order metadata/notes, so
   the payment record itself carries the delivery proof. Keep the secret
   server-side only. A tiny Node server is enough; Render is a named sponsor
   tool for this hackathon and the founder already deploys there.
6. After any real sandbox client-id is pasted locally for testing, do NOT
   commit it if the repo is meant to stay credential-free — or commit only
   the sandbox *client* ID (public by design in JS SDK integrations) and keep
   the Secret out. Decide once, document in the repo README.

## 2. AI component — closing the judging gap

The hackathon requires the project to *meaningfully* use AI, and the scaffold's
in-product "delivery agent" is an honestly-labeled rule-based stub. Before
submitting, strengthen this:

- Wire `summarizeDelivery()` in `app/receipt.js` to a real LLM call (any
  model/tool is allowed; keep $0 — use a free tier) so the agent genuinely
  drafts the delivery note from the deliverable.
- Stronger framing for "Best Use of Agentic Commerce": an agent completes a
  task → receipt is generated automatically by the agent → the buyer's agent
  re-hashes and verifies → payment releases. Even a scripted end-to-end agent
  loop (agent produces deliverable file → hashes → buyer-side check → sandbox
  payment) demonstrates the category better than three manual pages alone.
- Devpost submission has a "Tools" field: list the AI tool/model used and
  exactly how. Also disclose AI-assisted development honestly if asked.

## 3. Demo video plan (< 3 minutes, hard requirement)

- Host: public YouTube video, link on the Devpost form. No third-party
  trademarks or copyrighted music (rules) — use no music or self-made audio.
- Record the actual app running (browser screen capture) following the script
  in README.md ("Demo script outline"). Target 2:30 to leave margin.
- Show: problem line → generate receipt → tamper test fails on Verify page →
  checkout hash gate → sandbox PayPal approval → receipt-bound confirmation.
- The founder's face/voice is not required by the rules; a screen recording
  with voiceover or captions works. English (rules require English materials).

## 4. Hosting / repo tasks

- Create the public repo (GitHub/GitLab/Bitbucket) from this folder during
  the build window; the MIT `LICENSE` file is already included (rules require
  a license detectable at the top of the repo page).
- Optionally host `app/` on static hosting (e.g. Netlify, like ProofReceipt)
  so judges get a hosted demo URL in addition to repo run instructions.
- Keep the hosted demo on sandbox/demo mode only — no real client-id with
  live credentials, ever.

## 5. Rules-driven notes (from the Official Rules, verified 2026-10-24)

- Existing projects are allowed only if "significantly updated" during the
  Submission Period (Oct 1 – Nov 12, 2026), and entrants should explain the
  update. ProofReceipt pre-exists; the significant update here is the new
  PayPal checkout integration + verification-gated payment flow — say exactly
  that on the submission form.
- Project must be available free for testing until the Judging Period ends
  (Judging: Dec 1–15, 2026; winners on/around Dec 21, 2026). Keep the demo up.
- Submission materials must be in English. They are.
- Multiple submissions per entrant are allowed if substantially different —
  not needed here.

## 6. Risks / open questions

- **Prize payout mechanics unverified**: the rules pages fetched do not state
  how cash prizes are paid or any PayPal-account country requirements for
  receiving them. Check the full rules / ask on the Devpost discussion board
  before counting on payout rails.
- **Eligibility**: rules exclude residents of Brazil, Quebec, Russia, Crimea,
  Cuba, Iran, North Korea and OFAC-sanctioned countries. The founder resides
  in the UAE (not excluded). Entrants must be at least the age of majority
  where they reside.
- **SDK needs network**: the PayPal JS SDK loads from paypal.com. Offline
  judging environments will hit the built-in fallback panel instead of live
  buttons — the video must therefore show the real sandbox flow, and the repo
  instructions should note the internet requirement.
- **Demo-mode honesty**: with `client-id=sb` the PayPal popup is PayPal's
  demo experience and may not complete a full order in every environment.
  The scaffold labels this everywhere; the full sandbox flow (step 1 above)
  is what the video should show.
- **Deadline pressure**: submission closes Nov 12, 2026, 12:00 PM Pacific.
  The sandbox app creation + video are the two long poles; both are
  founder-scheduled items, so start them early in the window.

## Update 2026-10-24: own Sandbox app blocked — US-only gate
The founder's PayPal account is non-US; PayPal's Create App flow shows the Developer Agreement as "(US accounts only)" and refuses app creation. The VM browser is separately blocked by PayPal verification (service_error), so neither route yields a Client ID. The build therefore stays on PayPal's documented sandbox demo mode (client-id=sb) in checkout.html, which runs the full JS SDK flow in sandbox. Do NOT create a US account with invented details. If a future judging phase demands a named app, options: request an exception via PayPal developer support, or present the demo-mode flow with this constraint stated in the submission notes.

## CORRECTION 2026-10-24 ~20:50 Dubai — sandbox app EXISTS; the US-only note above is superseded
The "US-only gate" update above was overtaken within minutes: the founder completed the Create App flow on his phone (Merchant type, Sandbox Business Account), in sandbox mode, under the app name "ProofReceipt checkout" (screenshot-verified: sandbox banner, app name, Client ID field). He then pasted the Client ID as exact copied text — 82 chars, [A-Za-z0-9_-], starting "BAAZvTMXSz" — and it is now wired into app/checkout.html in place of client-id=sb, exactly once; the placeholder is gone. Verification the same evening: (1) PayPal's SDK endpoint (https://www.paypal.com/sdk/js?client-id=<id>&currency=USD) serves the full SDK bundle for this ID with env:"sandbox" in its payload builder — the ID is recognised as a sandbox app; a full end-to-end sandbox ORDER has NOT yet been run (needs the dashboard sandbox buyer account; still open in §1 step 4). (2) receipt.js re-ran headlessly in Node: hash matches Node's own crypto, receipt-ID derivation, fingerprint validation, tamper detection, storage round-trip and agent summary all PASS. Two strings the founder pasted earlier were NOT the Client ID and were not used: a 14-char account-style ID ("WVD9…") and a 56-char dotted string ("A2nZ…AAT") — neither is recorded here in full and neither belongs in the build. The VM browser remains unable to sign in to PayPal (verification service_error), which no longer matters: account-side actions happen on the founder's phone.
