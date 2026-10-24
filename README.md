# ProofReceipt Checkout — PayPal AI Hackathon entry (scaffold)

**Live demo:** https://proofreceipt-checkout.netlify.app — **Repo:** https://github.com/Nenzy10/proofreceipt-checkout

**One-line pitch:** Payment rails are solved; proof of delivery isn't. ProofReceipt
Checkout binds a client-side SHA-256 receipt of the deliverable into the PayPal
checkout itself — the buyer sees the receipt hash, verifies it against the file
they received, and only then does payment unlock. Delivery proof and payment,
one flow, built for the age of AI agents selling work to other agents' owners.

> **Status — read first.** This is a working local prototype/scaffold prepared
> for the PayPal AI Hackathon on Devpost. It runs in PayPal **sandbox mode
> only**: the PayPal JS SDK is loaded with the project's real PayPal sandbox
> app client-id (app "ProofReceipt checkout", sandbox, created 2026-10-24;
> client-ids are public by design in JS SDK integrations). The app **Secret
> is not** in this project. There are **no live credentials, no real
> payments, and no real transactions** anywhere in this project. It extends the
> founder's live product [ProofReceipt](https://proofreceipt.netlify.app)
> (client-side SHA-256 delivery receipts for freelancers and AI agents); the
> significant new work for this hackathon is the PayPal checkout integration
> and the verification-gated payment flow described below.

## Prize categories targeted

Verified against https://paypalaihackathon.devpost.com/ on 2026-10-24 (see
"Facts verified" at the bottom):

- **Best Use of Agentic Commerce — $5,000 (primary target).** The flow is an
  agent-commerce loop: a producing agent delivers work, a receipt is generated
  automatically, the buying side verifies the hash, then pays via PayPal.
- **Best Use of PayPal + AI — $5,000.** PayPal checkout is not bolted on; the
  receipt lives inside the order (`custom_id` = receipt ID) and gates it.
- **Overall 1st ($12,000) / 2nd ($8,000) / 3rd ($5,000)** — every entry is
  automatically in the running.
- Secondary angles: **Most Impactful ($5,000)** — "I never received it" /
  "that's not what I sent" disputes are a real freelancer/agent-economy pain;
  **Best Demo Delivery ($5,000)** — the demo is a tight, verifiable story.

## Judging criteria (as published) and how this entry answers them

1. **Technological Implementation** — real SHA-256 via Web Crypto, a receipt
   fingerprint that detects metadata tampering, verification-gated PayPal
   Buttons (Orders flow), receipt ID carried in the order's `custom_id`.
2. **Design** — a coherent 3-step product flow (Deliver → Verify & pay →
   Verify a receipt), not a single tech demo page.
3. **Potential Impact** — freelancers and AI agents get paid on proof, buyers
   pay only for byte-identical delivery; disputes get evidence, not opinions.
4. **Innovation/Idea** — receipts exist and checkouts exist; a checkout that
   refuses to unlock until delivery proof matches is the new part.
5. **Presentation** — sub-3-minute demo script below; the tamper test is the
   memorable beat.

## Architecture

Everything in `app/` is static, client-side, and dependency-free:

```
app/
  index.html     Step 1 — Deliverable intake + receipt generation
  checkout.html  Step 2 — Receipt presentation, verification gate, PayPal buttons
  verify.html    Step 3 — Independent re-hash & compare (anyone, any time)
  receipt.js     Shared logic: SHA-256 (Web Crypto), receipt build/fingerprint,
                 localStorage hand-off, demo delivery-agent summary
  styles.css     Shared styling
  test.html      In-browser self-test (known SHA-256 vector, tamper, match/mismatch)
```

Flow:

1. **Intake & receipt (index.html).** The producer (AI agent or freelancer)
   pastes or selects the deliverable. The browser hashes the exact bytes with
   SHA-256 (`crypto.subtle.digest`) — nothing is uploaded. A receipt JSON is
   built: title, producer, agreed USD amount, content hash, size, timestamp,
   a receipt ID (`PRC-` + first 12 hex chars of the hash), and a *fingerprint*:
   a second SHA-256 over the receipt's own canonical fields, so editing the
   amount or title later invalidates the receipt. The receipt is stored in
   `localStorage` and can be copied/downloaded.
2. **Verify & pay (checkout.html).** The buyer's checkout page presents the
   receipt — title, producer, amount, and the full SHA-256 — *before* payment,
   and validates the receipt fingerprint (a tampered receipt disables
   payment). The PayPal buttons stay locked until the buyer ticks "I verified
   the SHA-256 hash matches the deliverable I received." Buttons are rendered
   by the PayPal JS SDK (sandbox mode, real sandbox app) and create an order whose
   `custom_id` is the receipt ID — the payment record itself carries the proof.
3. **Verify (verify.html).** Anyone can paste a receipt, re-hash a deliverable,
   and get a MATCH / MISMATCH verdict plus the receipt-fingerprint check. This
   is the dispute-resolution surface.

**The AI element, honestly stated.** The producing side is an AI agent in the
concept (an agent completes the deliverable and the receipt is generated as
part of its delivery step); the demo includes a "delivery agent" summary panel.
In this scaffold that panel is a **rule-based stub** (`summarizeDelivery()` in
`receipt.js`) that only formats facts already in the receipt — the documented
integration point where the full build calls a real LLM, and where an agent
framework would drive the loop end-to-end. No AI model is claimed to be wired
in yet; see NOTES.md §2 for the build-window plan to close this gap.

**Full-build path (build window).** Done 2026-10-24: the real PayPal
**sandbox** app client-id is wired into `checkout.html` (one line) and the
PayPal SDK endpoint was verified serving the SDK for this client-id in
sandbox mode; the receipt engine checks re-ran green the same day. Still to
add: a small server to create/capture orders via the Orders v2 API with the
secret kept server-side, server-side receipt persistence, a full end-to-end
sandbox order with the dashboard's sandbox buyer/seller accounts, and the
LLM/agent loop. Details: NOTES.md.

## How to run

No build step, no dependencies:

```bash
cd app
python3 -m http.server 8000
# then open http://localhost:8000
```

(Equivalently `npx serve app` or any static file server. Open `index.html`
via a server rather than `file://` so `localStorage` hand-off between pages
behaves consistently.)

Walk the flow: Step 1 (pre-filled sample deliverable) → *Generate SHA-256
receipt* → *Proceed to checkout* → tick the verification box → PayPal sandbox
buttons. Then Step 3: paste the same text back for a MATCH; change one word
for a MISMATCH. `app/test.html` runs the automated self-test in the browser.

**Verification performed on this scaffold (2026-10-24):** all six app files
served HTTP 200 from the local server above; the exact production
`receipt.js` was executed headlessly in Node 24 (same Web Crypto API) with 8/8
checks passing — published SHA-256 test vector for `"abc"`
(`ba7816bf…f20015ad`, also matching `sha256sum`), receipt-ID derivation,
fingerprint validation, tamper detection, content match/mismatch, storage
round-trip, and agent-summary contents. Headless Chromium in this sandbox VM
produces no rendered DOM output (environment limitation), so visual rendering
was not machine-verified here — open the pages in any real browser to see them.

## Demo script outline (target 2:30, hard limit 3:00)

- **0:00–0:20 — Problem.** "Agents and freelancers deliver files; buyers pay
  on trust. 'I never got it' and 'that's not what I sent' have no evidence."
- **0:20–0:50 — Deliver.** Step 1: the agent's deliverable is hashed live;
  receipt appears — hash, amount, receipt ID. "The receipt is generated where
  the work is delivered. Nothing is uploaded."
- **0:50–1:20 — Tamper test.** Step 3: change one word in the deliverable →
  MISMATCH. Change the amount in the receipt JSON → fingerprint INVALID.
  "Proof you can't quietly edit."
- **1:20–2:10 — Verify & pay.** Step 2: checkout presents the hash *before*
  money; buttons locked until the buyer confirms the match; PayPal sandbox
  approval completes; confirmation shows the receipt ID bound to the order.
- **2:10–2:30 — Close.** "ProofReceipt Checkout: delivery proof inside the
  payment itself — for freelancers today, for agent-to-agent commerce next."

## Submission checklist (Devpost)

- [ ] Devpost account + hackathon registration (account-holder step, handled
      outside this scaffold)
- [x] PayPal developer account + sandbox app created ("ProofReceipt
      checkout", 2026-10-24); sandbox client-id wired into `checkout.html`
- [ ] Full sandbox order tested end-to-end with sandbox buyer/seller
      accounts (see NOTES.md §1)
- [ ] Real LLM/agent loop connected, or agent framing finalized (NOTES.md §2)
- [x] Public repo (GitHub/GitLab/Bitbucket) containing this code + run
      instructions: https://github.com/Nenzy10/proofreceipt-checkout —
      MIT `LICENSE` included (rules require a license visible at the top of
      the repo)
- [x] Hosted demo URL: https://proofreceipt-checkout.netlify.app
      (deployed 2026-10-24; keep it up through the judging period)
- [ ] Devpost project description: features, how it works, Tools field naming
      the AI tool/model and PayPal tech used
- [ ] "Significant update" explanation for building on ProofReceipt (rules
      require it for pre-existing projects)
- [ ] Demo video < 3 min, public on YouTube, link on the submission form,
      no third-party trademarks/copyrighted music
- [ ] All materials in English; project left available for testing through
      the judging period (Dec 1–15, 2026)
- [ ] Submit before **Nov 12, 2026, 12:00 PM Pacific**

## Facts verified on the Devpost pages (2026-10-24)

From https://paypalaihackathon.devpost.com/ and its Official Rules:

- **Prizes:** page banner says "$67,500+ in prizes"; the "Why Join" section
  says "$69,750 in total prizes". The itemized list reconciles both: $67,500
  in cash (Overall $12,000/$8,000/$5,000; five $5,000 category awards —
  Most Creative, Most Impactful, Best Demo Delivery, Best Use of PayPal + AI,
  **Best Use of Agentic Commerce**; AG Grid $5,000/$2,000/$1,000×3; APIMatic
  $1,000×3; Bryntum $1,000×3; Channel3 $1,500) plus Render credits
  ($1,000/$750/$500 = $2,250) = $69,750 total prize value.
- **Deadline:** Submission Period Oct 1, 2026 – **Nov 12, 2026, 12:00 PM
  Pacific** (event listing shows the same close as 3:00 PM Eastern).
- **Solo entries:** allowed — "Projects can be built individually or as a
  team"; individuals, teams, and organizations may enter.
- **Sandbox:** projects integrate the PayPal developer platform "using the
  free sandbox environment"; sandbox access comes with a free PayPal
  developer account.
- **Core requirement:** the project must *meaningfully use both PayPal and
  AI*; working prototype required — mockups/static prototypes don't count.
- **Judging criteria:** Technological Implementation, Design, Potential
  Impact, Innovation/Idea, Presentation.
- **Judging/winners:** Judging Dec 1–15, 2026; winners announced on or
  around Dec 21, 2026.
- **Eligibility:** age of majority where the entrant resides; NOT open to
  residents of Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, or
  OFAC-sanctioned countries. (UAE and Cameroon are not on that list.)

**Not verified / not found on the pages fetched:** how cash prizes are paid
out (rail, timing, any PayPal-account requirement for receiving a prize);
any per-country PayPal account limitations. Flagged in NOTES.md §6.

## License

MIT — see `LICENSE`. Built by Nenzy Brown as an extension of ProofReceipt.
