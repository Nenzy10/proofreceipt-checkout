/* ProofReceipt Checkout — shared receipt logic.
 * Pure client-side. Uses the Web Crypto API (crypto.subtle) for SHA-256.
 * No network calls, no credentials, no real payments anywhere in this file.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'prc_receipt_v1';

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  async function sha256Hex(data) {
    var buffer;
    if (typeof data === 'string') {
      buffer = new TextEncoder().encode(data);
    } else if (data instanceof ArrayBuffer) {
      buffer = new Uint8Array(data);
    } else {
      buffer = data; // Uint8Array
    }
    var digest = await crypto.subtle.digest('SHA-256', buffer);
    return toHex(digest);
  }

  /* Canonical serialization: fixed key order so the fingerprint is stable
   * regardless of how the receipt object was constructed. */
  function canonicalReceiptString(r) {
    return JSON.stringify({
      app: r.app,
      version: r.version,
      deliverableTitle: r.deliverableTitle,
      producer: r.producer,
      amountUSD: r.amountUSD,
      contentSha256: r.contentSha256,
      sizeBytes: r.sizeBytes,
      createdAt: r.createdAt
    });
  }

  async function buildReceipt(fields) {
    var receipt = {
      app: 'ProofReceipt Checkout',
      version: 1,
      deliverableTitle: fields.deliverableTitle || 'Untitled deliverable',
      producer: fields.producer || 'Unnamed producer',
      amountUSD: fields.amountUSD || '0.00',
      contentSha256: fields.contentSha256,
      sizeBytes: fields.sizeBytes,
      createdAt: fields.createdAt || new Date().toISOString()
    };
    receipt.receiptId = 'PRC-' + receipt.contentSha256.slice(0, 12).toUpperCase();
    receipt.fingerprint = await sha256Hex(canonicalReceiptString(receipt));
    return receipt;
  }

  /* Recompute the fingerprint from the receipt's own fields and compare —
   * detects a receipt whose metadata was edited after generation. */
  async function receiptFingerprintValid(receipt) {
    if (!receipt || !receipt.fingerprint) return false;
    var recomputed = await sha256Hex(canonicalReceiptString(receipt));
    return recomputed === receipt.fingerprint;
  }

  function saveReceipt(receipt) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(receipt)); } catch (e) {}
  }

  function loadReceipt() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* Demo "delivery agent": a transparent, rule-based stub that stands in for
   * the LLM agent in the full build. It only formats facts already in the
   * receipt — it does not invent anything. Integration hook for a real model:
   * replace summarizeDelivery() with an LLM call that receives the same
   * fields (see README "Architecture"). */
  function summarizeDelivery(receipt) {
    return [
      'Delivery summary (demo agent, rule-based stub):',
      '- Deliverable "' + receipt.deliverableTitle + '" produced by ' + receipt.producer + '.',
      '- Content fingerprinted with SHA-256 at ' + receipt.createdAt + ' (' + receipt.sizeBytes + ' bytes).',
      '- Receipt ' + receipt.receiptId + ' binds this exact content to a payment of USD ' + receipt.amountUSD + '.',
      '- Buyer can re-hash the received file on the Verify page; payment is gated on a match.'
    ].join('\n');
  }

  global.PRC = {
    sha256Hex: sha256Hex,
    buildReceipt: buildReceipt,
    receiptFingerprintValid: receiptFingerprintValid,
    saveReceipt: saveReceipt,
    loadReceipt: loadReceipt,
    summarizeDelivery: summarizeDelivery
  };
})(window);
