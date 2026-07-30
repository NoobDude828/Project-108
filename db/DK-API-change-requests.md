# DK Bank — API change requests (Project 108 payment integration)

Against **"Stripe Payment Processing API" v2.0.0**. These are the gaps that Project 108 **cannot** close on its own — the current API (two endpoints, boolean status) does not expose the data a standard, reconcilable payment module needs. Each item maps to a concrete gap.

## Blocking go-live (escalate first)
1. **Numeric UAT merchant credentials.** The doc's sample `submerchant_id`/`dk_account` = `MERCHANT_001` is **rejected by the live UAT gateway** as non-numeric (`4001 "Merchant ID and transaction ID must be numeric values"`); numeric guesses return `4004 "Merchant not found"`. Please issue the real **numeric** `submerchant_id` and `dk_account` registered for Project 108, and confirm `application_no` must be numeric on live. *Nothing can be completed end-to-end without this.*
2. **Written confirmation of the net-amount model.** The doc states both *"fees added on top"* **and** *"the merchant receives the base amount minus processing costs."* On a $108 base these differ by $5.84 (project nets **$108.00** vs **$102.16**). Confirm authoritatively which applies. (Contractual/financial, not technical.)

## Needed for standard reconciliation & receipts
3. **Return the Stripe `payment_intent` id and `charge` id** (in `/check-application-status` or a new detail endpoint) — the canonical reconciliation keys. Without them we cannot correlate to Stripe at any level.
4. **Return the confirmed settled amount and actual fee breakdown** (amount, fee, net) — today our figures are *computed, never confirmed*.
5. **Return payment-method metadata** — card brand + last4 (PCI-safe, display only) and 3DS status if available.
6. **Return `receipt_url`** (or the Stripe-collected customer email) so we can issue an authoritative receipt rather than a self-computed one.
7. **Provide a real webhook / server-to-server callback** to Project 108 for the full lifecycle (succeeded, async success/failure, refund, dispute) with signature verification. **Highest-value ask** — replaces unreliable boolean polling.
8. **Provide a settlement / statement / payout export** (per-transaction fee + net + payout batch) so books can be machine-reconciled.
9. **Provide a refund API and dispute visibility** — both are currently out-of-band/invisible.
10. **Enrich `/check-application-status` beyond a boolean** — a real status enum (pending / succeeded / failed / refunded / disputed).

## What we already handle on our side (no DK change needed)
- Our transaction id / idempotency key (`application_no`, DB-unique), the Stripe `session_id` (persisted at creation), donor + billing details, full status lifecycle with per-transition timestamps, computed fee/total/net (flagged `computed_unconfirmed`), immutable audit log, and a self-generated receipt.
- Columns for every "null-until-DK" field above already exist (migration `002`) so we can populate them the moment DK returns them — no further migration required on delivery of items 3–6/8.
