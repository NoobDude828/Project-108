/**
 * Tests for the pure payment logic — money maths, idempotency inputs, the DK
 * error mapping, the pre-launch grant, and rate limiting.
 *
 * Deliberately no DB or network here: these are the parts where a silent error
 * costs money or lets a duplicate charge through, and they are all pure
 * functions, so they can be pinned down exactly.
 *
 * Uses Node's built-in runner with type stripping, so this adds no dependencies:
 *   npm test
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import nodeCrypto from "node:crypto";

// The grant module reads PAYMENT_ACCESS_TOKEN at call time, so set it before import.
process.env.PAYMENT_ACCESS_TOKEN = "test-secret-for-grants";

const { computeFees, makeApplicationNo, dkErrorStatus, FEE_FORMULA_VERSION } =
  await import("../dk.ts");
const { mintGrant, verifyGrant } = await import("../paymentGrant.ts");
const { rateLimit, clientIp } = await import("../rateLimit.ts");

describe("computeFees — money maths", () => {
  test("matches DK's own worked example from the spec ($100 -> $105.45)", () => {
    // Stripe 4.15% + DK 0.7% + $0.60 fixed. This is the vendor's documented
    // figure, so it is the one number that must never drift.
    const f = computeFees(100);
    assert.equal(f.feeTotal, 5.45);
    assert.equal(f.customerPays, 105.45);
    assert.equal(f.netToProject, 100);
  });

  test("matches the figure Stripe actually charged in the UAT test ($108 -> $113.84)", () => {
    const f = computeFees(108);
    assert.equal(f.feeTotal, 5.84);
    assert.equal(f.customerPays, 113.84);
  });

  test("rounds half up rather than to even ($10 fee is 1.085 -> 1.09)", () => {
    // 10 * 0.0485 = 0.485, + 0.60 = 1.085. Banker's rounding would give 1.08 and
    // put us a cent out against DK on every such amount.
    const f = computeFees(10);
    assert.equal(f.feeTotal, 1.09);
    assert.equal(f.customerPays, 11.09);
  });

  test("handles the $1 minimum DK allows", () => {
    const f = computeFees(1);
    assert.equal(f.feeTotal, 0.65);
    assert.equal(f.customerPays, 1.65);
  });

  test("never returns more than two decimal places", () => {
    for (const amount of [1, 3.33, 7.77, 19.99, 108, 1234.56, 999999]) {
      for (const v of Object.values(computeFees(amount))) {
        // Compare via toFixed rather than v*100: 19.99 * 100 is
        // 1998.9999999999998 in IEEE-754, so the naive check fails on a value
        // that is in fact exactly two decimal places.
        assert.equal(
          Number(v.toFixed(2)),
          v,
          `${v} from amount ${amount} has sub-cent precision`,
        );
      }
    }
  });

  test("net to project equals the base amount (fees are added on top)", () => {
    for (const amount of [1, 50, 108, 200000]) {
      assert.equal(computeFees(amount).netToProject, amount);
    }
  });

  test("fee formula version is recorded, so a DK change cannot rewrite history", () => {
    assert.match(FEE_FORMULA_VERSION, /4\.85/);
  });
});

describe("makeApplicationNo — DK transaction id", () => {
  test("is numeric only: DK rejects anything else with 4001", () => {
    for (let i = 0; i < 50; i++) {
      assert.match(makeApplicationNo(), /^\d+$/);
    }
  });

  test("is unique across rapid successive calls", () => {
    // Same-millisecond calls must not collide: application_no is DK's
    // idempotency key and is UNIQUE in our schema, so a collision is an outage.
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i++) seen.add(makeApplicationNo());
    assert.equal(seen.size, 5000);
  });
});

describe("dkErrorStatus — response code mapping", () => {
  test("maps DK codes to the right HTTP status", () => {
    assert.equal(dkErrorStatus("4004"), 404); // merchant/application not found
    assert.equal(dkErrorStatus("4003"), 409); // duplicate
    assert.equal(dkErrorStatus("4029"), 429); // rate limited
    assert.equal(dkErrorStatus("4001"), 400); // validation
    assert.equal(dkErrorStatus(undefined), 400);
  });

  test("treats every 5xxx code as a gateway fault, not the caller's fault", () => {
    for (const c of ["5000", "5001", "5002", "5003", "5004", "5005", "5006"]) {
      assert.equal(dkErrorStatus(c), 502, `code ${c}`);
    }
  });
});

describe("payment grant — gate on the live checkout endpoint", () => {
  test("a freshly minted grant verifies", () => {
    assert.equal(verifyGrant(mintGrant()), true);
  });

  test("rejects a tampered signature", () => {
    const g = mintGrant();
    const [exp, sig] = g.split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("a") ? "b" : "a");
    assert.equal(verifyGrant(`${exp}.${flipped}`), false);
  });

  test("rejects an extended expiry — the expiry is signed, not just carried", () => {
    const g = mintGrant();
    const sig = g.split(".")[1];
    const future = String(Date.now() + 999_999_999);
    assert.equal(verifyGrant(`${future}.${sig}`), false);
  });

  test("rejects an already-expired grant", () => {
    // Sign a past expiry with the real secret: signature valid, time is not.
    const past = String(Date.now() - 1000);
    const sig = nodeCrypto
      .createHmac("sha256", process.env.PAYMENT_ACCESS_TOKEN)
      .update(past)
      .digest("hex");
    assert.equal(verifyGrant(`${past}.${sig}`), false);
  });

  test("rejects malformed input rather than throwing", () => {
    for (const bad of ["", ".", "abc", "abc.def", "123", ".sig", "12x.abc"]) {
      assert.equal(verifyGrant(bad), false, `input ${JSON.stringify(bad)}`);
    }
  });
});

describe("rateLimit", () => {
  test("allows up to the limit, then blocks", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      assert.equal(rateLimit(key, 5, 60_000), null, `call ${i + 1} should pass`);
    }
    const blocked = rateLimit(key, 5, 60_000);
    assert.ok(blocked, "6th call should be blocked");
    assert.equal(blocked!.status, 429);
    assert.ok(blocked!.headers.get("Retry-After"), "must tell the caller when to retry");
  });

  test("keys are isolated, so one caller cannot lock out another", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(a, 5, 60_000);
    assert.ok(rateLimit(a, 5, 60_000), "a is exhausted");
    assert.equal(rateLimit(b, 5, 60_000), null, "b is unaffected");
  });

  test("the window resets", () => {
    const key = `w-${Math.random()}`;
    assert.equal(rateLimit(key, 1, 1), null);
    assert.ok(rateLimit(key, 1, 1), "blocked inside the window");
    const until = Date.now() + 5;
    while (Date.now() < until) {
      /* let the 1ms window lapse */
    }
    assert.equal(rateLimit(key, 1, 1), null, "allowed again after the window");
  });

  test("clientIp prefers the first X-Forwarded-For hop", () => {
    const req = new Request("https://example.test", {
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
    });
    assert.equal(clientIp(req), "203.0.113.9");
  });

  test("clientIp falls back rather than throwing when unproxied", () => {
    assert.equal(clientIp(new Request("https://example.test")), "unknown");
  });
});
