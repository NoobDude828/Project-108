# Database — Project 108 payment module

The payment records live in the **gmc-app** Postgres (Project 108 has no DB of its own — it proxies to
gmc-app). These migrations create the `p108_`-prefixed tables there so gmc-app can own the data.

## Migrations

| File | Creates |
|---|---|
| `migrations/001_p108_payments.sql` | `p108_payments` (system of record), `p108_payment_events` (append-only audit log), `p108_settlements` (reconciliation stub), + `updated_at` trigger |
| `migrations/002_p108_payment_fields.sql` | Money components (`fee_total`, `customer_pays`, `net_to_project`, `net_basis`, `fee_formula_version`), idempotency/audit fields (`request_hash`, `dk_response_description`), per-transition timestamps (`redirected_at`/`failed_at`/`cancelled_at`/`expired_at`/`last_polled_at`/`poll_count`), nullable "null-until-DK" columns (`dk_payment_intent_id`, `dk_charge_id`, `dk_balance_txn_id`, `settled_amount`, `settled_fee`, `card_brand`, `card_last4`, `stripe_receipt_url`, `stripe_customer_email`), + `p108_refunds` and `p108_disputes` tables |
| `migrations/003_idempotency_key.sql` | `idempotency_key` + a partial UNIQUE index, so a retried checkout can never mint a second live gateway session |
| `migrations/004_session_url_and_sweep_runs.sql` | `dk_session_url` (the URL DK actually returned, served verbatim on an idempotent replay) + `p108_sweep_runs` |
| `migrations/005_sweep_lease.sql` | `p108_sweep_lease` — a self-expiring lease row giving the reconciliation sweep mutual exclusion. Replaced `pg_try_advisory_lock`, which silently does nothing over Neon's `-pooler` endpoint because the lock is session-scoped and the pooler hands out a different session per statement |
| `migrations/006_p108_fee_choice_and_consent.sql` | `covers_fee`, `charged_total`, `offered_amount` (the donor's choice on the processing fee) + `consent_updates`/`consent_text`/`consent_version`/`consent_at` (mailing-list permission, stored with the wording it was granted under) |
| `migrations/007_drop_p108_subscribers.sql` | Drops `p108_subscribers`, created in error by 006. Consent lives on the payment row that captured it — see below |

All migrations are **idempotent** (`CREATE TABLE IF NOT EXISTS`, etc.) and **namespaced** (`p108_` prefix),
so they never collide with gmc's own tables and are safe to re-run.

## Consent, and why there is no subscriber table

A donor who ticks the updates box is recorded **on their payment row** — `consent_updates`,
`consent_text`, `consent_version`, `consent_at` (migration 006). That is the whole record. There is no
`p108_subscribers` table (007 drops it) and Project 108 writes to **no** list table, including gmc-app's.

- **Why not a p108 table.** It would be a copy of what `p108_payments` already holds, free to drift from
  its own evidence. `consentedEmails()` in `lib/db.ts` is the send list — one query, always in step with
  the consent that authorised it.
- **Why not gmc-app's `newsletters`.** It lives in this same database, but its list feeds gmc's automated
  stream: news, events, announcements **and job postings**. A donor agreed to the 1 November livestream
  link and to staying connected to Project 108 — not to hearing that GMC is hiring. The wording is the
  permission, so enrolling them there would send mail outside it. gmc-app also owns that schema through
  Drizzle and manages the list at `/dashboard/subscribers`; this app does not write to another app's
  tables.
- **Sending.** Whoever sends the 1 November email queries `consentedEmails()` (optionally pinned to a
  `consent_version`, so a later wording change cannot silently widen who counts as having agreed).
  Project 108 has no mail transport of its own yet — that arrives with the acknowledgement receipt.

## Environments

Two databases, per `INFRA.local.md` (gitignored — has the server access details and where the connection
strings live):

- **Dev / testing** → Neon `neondb` (used by the dev gmc-app, pm2 `gmc-staging`).
- **Prod** → docker `gmcdb` (used by the prod gmc-app, docker `gmc-app-blue`).

## Applying a migration

Run from the server (it has `psql` and reaches both databases). Connection strings are read from the
server, never pasted here.

**Dev (Neon `neondb`):**
```bash
# on the server
NEON_URL=$(grep -E '^DATABASE_URL=' /opt/gmc-staging/app/.env.local | tail -1 | cut -d= -f2- | tr -d "'\"")
psql "$NEON_URL" -v ON_ERROR_STOP=1 -f 001_p108_payments.sql
```

**Prod (docker `gmcdb`)** — only at go-live:
```bash
# on the server; password comes from the gmc-app-blue container env (not echoed)
PW=$(docker exec gmc-app-blue printenv DATABASE_URL | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')
docker exec -i -e PGPASSWORD="$PW" gmc-db \
  psql -U gmc_website -d gmcdb -v ON_ERROR_STOP=1 < 001_p108_payments.sql
```

## Status

- **Neon `neondb` (dev):** applied 2026-07-22 ✓
- **docker `gmcdb` (prod):** not yet applied — deferred to go-live.

## Verify / rollback

```bash
psql "$URL" -c "\dt p108_*"          # list the tables
psql "$URL" -c "\d p108_payments"    # inspect columns / constraints / indexes
```

Rollback is clean because everything is namespaced:
```sql
DROP TABLE IF EXISTS p108_payment_events, p108_payments, p108_settlements CASCADE;
DROP FUNCTION IF EXISTS p108_touch_updated_at();
```

## Note for the gmc-v1 (gmc-app) integration

Tables are currently owned by the connecting superuser role (`neondb_owner` / `gmc_website`). For the
append-only guarantee on `p108_payment_events`, connect gmc-app with a dedicated least-privilege role that
has `UPDATE`/`DELETE` revoked on that table.
