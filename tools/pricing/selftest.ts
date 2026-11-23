/** Quick self-test and scenario table for the pricing formula. Run: npm run test:pricing */
import assert from "node:assert/strict";
import { estimate, PLACEHOLDER_CONFIG, PricingInputError, type SiteInputs } from "../../src/lib/pricing/estimate";

const scenarios: [string, SiteInputs][] = [
  ["Small real estate agency, 3x/wk", { businessType: "real_estate", floorAreaSqm: 120, washrooms: 1, kitchens: 1, cleansPerWeek: 3 }],
  ["Accounting office, 5x/wk", { businessType: "office", floorAreaSqm: 400, washrooms: 4, kitchens: 1, cleansPerWeek: 5 }],
  ["Bank branch, 5x/wk", { businessType: "office", floorAreaSqm: 250, washrooms: 2, kitchens: 1, cleansPerWeek: 5, hardFloorShare: 0.5 }],
  ["Medical centre, 5x/wk", { businessType: "medical", floorAreaSqm: 350, washrooms: 4, kitchens: 1, cleansPerWeek: 5, hardFloorShare: 0.8 }],
  ["Dental clinic, 3x/wk", { businessType: "dental", floorAreaSqm: 180, washrooms: 2, kitchens: 1, cleansPerWeek: 3, hardFloorShare: 0.9 }],
  ["Large office, 2x/wk", { businessType: "office", floorAreaSqm: 1200, washrooms: 8, kitchens: 2, cleansPerWeek: 2 }],
];

console.log(`Config confirmed by owner: ${PLACEHOLDER_CONFIG.confirmedByOwner} (placeholder rates: $${PLACEHOLDER_CONFIG.hourlyRate}/hr ex GST)\n`);
console.log("Scenario".padEnd(36), "hrs/clean", "  per clean", "        per month (ex GST)");
for (const [name, s] of scenarios) {
  const e = estimate(s);
  console.log(
    name.padEnd(36),
    String(e.hoursPerClean).padStart(9),
    `  $${e.perClean.low}-$${e.perClean.high}`.padEnd(14),
    `     $${e.perMonth.low.toLocaleString()}-$${e.perMonth.high.toLocaleString()}`,
  );
}

// invariants
const base: SiteInputs = { businessType: "office", floorAreaSqm: 300, washrooms: 2, kitchens: 1, cleansPerWeek: 3 };
const e = estimate(base);
assert.ok(e.perClean.low < e.perClean.mid && e.perClean.mid < e.perClean.high, "range ordered");
assert.ok(estimate({ ...base, floorAreaSqm: 600 }).hoursPerClean > e.hoursPerClean, "bigger site takes longer");
assert.ok(estimate({ ...base, washrooms: 6 }).hoursPerClean > e.hoursPerClean, "more washrooms take longer");
assert.ok(estimate({ ...base, businessType: "medical" }).hoursPerClean >= e.hoursPerClean, "medical is slower than office");
assert.ok(estimate({ ...base, cleansPerWeek: 5 }).perWeek.mid > e.perWeek.mid, "more cleans cost more per week");
assert.ok(estimate({ ...base, floorAreaSqm: 25, washrooms: 0, kitchens: 0 }).hoursPerClean === PLACEHOLDER_CONFIG.minimumHoursPerClean, "minimum hours apply");
assert.equal(e.gstIncluded, false);
for (const bad of [{ floorAreaSqm: 5 }, { cleansPerWeek: 7 }, { washrooms: -1 }, { hardFloorShare: 2 }]) {
  assert.throws(() => estimate({ ...base, ...bad }), PricingInputError);
}
console.log("\nAll pricing checks passed.");
