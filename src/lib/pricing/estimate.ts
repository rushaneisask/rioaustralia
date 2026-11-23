/**
 * RIO Australia pricing formula: deterministic and explainable.
 *
 * The AI estimator (coming next) only turns a client's description into SiteInputs.
 * Every dollar figure comes from this function and the owner's PricingConfig,
 * never from the language model.
 */

export type BusinessType = "office" | "medical" | "dental" | "real_estate" | "other";

export type SiteInputs = {
  businessType: BusinessType;
  /** Total floor area to clean, square metres. */
  floorAreaSqm: number;
  /** Number of toilets/washrooms (each cubicle or single bathroom counts as one). */
  washrooms: number;
  /** Kitchens or kitchenettes. */
  kitchens: number;
  /** 1 to 5 cleans per week. */
  cleansPerWeek: number;
  /** Share of floor that is hard floor needing a mop (0..1). Carpet is vacuumed. */
  hardFloorShare?: number;
};

export type PricingConfig = {
  /** Set to true only once the owner has confirmed every number below. */
  confirmedByOwner: boolean;
  /** Charge-out rate per cleaner hour, AUD ex GST. */
  hourlyRate: number;
  /** Square metres one cleaner covers per hour for a regular maintenance clean. */
  sqmPerHour: Record<BusinessType, number>;
  /** Extra minutes per clean for each washroom and kitchen. */
  minutesPerWashroom: number;
  minutesPerKitchen: number;
  /** Extra minutes per 100 m² of hard floor (mopping is slower than vacuuming). */
  hardFloorMinutesPer100Sqm: number;
  /** Fixed set-up/pack-down minutes per visit. */
  setupMinutesPerVisit: number;
  /** Minimum billable hours per visit. */
  minimumHoursPerClean: number;
  /** ± spread shown to the client because it is an estimate before the site walk (0.15 = ±15%). */
  uncertainty: number;
  /** Discount per visit for higher frequencies (cleaner sites need less time), by cleans per week. */
  frequencyFactor: Record<1 | 2 | 3 | 4 | 5, number>;
  gstRate: number;
};

/**
 * PLACEHOLDER CONFIG. These are generic industry-style starting points so the formula can be built
 * and tested. They are NOT the owner's rates. Replace every value with the owner's real numbers
 * (from past jobs) and set confirmedByOwner: true before any estimate is shown to a client.
 */
export const PLACEHOLDER_CONFIG: PricingConfig = {
  confirmedByOwner: false,
  hourlyRate: 55,
  sqmPerHour: { office: 250, real_estate: 230, other: 220, medical: 170, dental: 160 },
  minutesPerWashroom: 12,
  minutesPerKitchen: 10,
  hardFloorMinutesPer100Sqm: 6,
  setupMinutesPerVisit: 10,
  minimumHoursPerClean: 1.5,
  uncertainty: 0.15,
  frequencyFactor: { 1: 1.15, 2: 1.05, 3: 1, 4: 0.97, 5: 0.95 },
  gstRate: 0.1,
};

export type Estimate = {
  hoursPerClean: number;
  perClean: { low: number; mid: number; high: number };
  perWeek: { low: number; mid: number; high: number };
  perMonth: { low: number; mid: number; high: number };
  gstIncluded: false;
  breakdownMinutes: { area: number; hardFloor: number; washrooms: number; kitchens: number; setup: number };
  assumptions: string[];
  configConfirmed: boolean;
};

const WEEKS_PER_MONTH = 52 / 12;
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export class PricingInputError extends Error {}

export function validateInputs(i: SiteInputs) {
  const problems: string[] = [];
  if (!Number.isFinite(i.floorAreaSqm) || i.floorAreaSqm < 20 || i.floorAreaSqm > 20000) problems.push("floor area must be 20 to 20,000 m²");
  if (!Number.isInteger(i.washrooms) || i.washrooms < 0 || i.washrooms > 100) problems.push("washrooms must be 0 to 100");
  if (!Number.isInteger(i.kitchens) || i.kitchens < 0 || i.kitchens > 50) problems.push("kitchens must be 0 to 50");
  if (!Number.isInteger(i.cleansPerWeek) || i.cleansPerWeek < 1 || i.cleansPerWeek > 5) problems.push("cleans per week must be 1 to 5");
  if (i.hardFloorShare !== undefined && (i.hardFloorShare < 0 || i.hardFloorShare > 1)) problems.push("hard floor share must be 0 to 1");
  if (problems.length) throw new PricingInputError(problems.join("; "));
}

export function estimate(inputs: SiteInputs, config: PricingConfig = PLACEHOLDER_CONFIG): Estimate {
  validateInputs(inputs);
  const hardShare = inputs.hardFloorShare ?? 0.3;

  const area = (inputs.floorAreaSqm / config.sqmPerHour[inputs.businessType]) * 60;
  const hardFloor = ((inputs.floorAreaSqm * hardShare) / 100) * config.hardFloorMinutesPer100Sqm;
  const washrooms = inputs.washrooms * config.minutesPerWashroom;
  const kitchens = inputs.kitchens * config.minutesPerKitchen;
  const setup = config.setupMinutesPerVisit;

  const freq = config.frequencyFactor[inputs.cleansPerWeek as 1 | 2 | 3 | 4 | 5];
  const rawHours = ((area + hardFloor + washrooms + kitchens + setup) / 60) * freq;
  const hoursPerClean = Math.max(config.minimumHoursPerClean, roundTo(rawHours, 0.25));

  const mid = hoursPerClean * config.hourlyRate;
  const band = (v: number) => ({
    low: roundTo(v * (1 - config.uncertainty), 5),
    mid: roundTo(v, 5),
    high: roundTo(v * (1 + config.uncertainty), 5),
  });
  const perClean = band(mid);
  const perWeek = band(mid * inputs.cleansPerWeek);
  const perMonth = band(mid * inputs.cleansPerWeek * WEEKS_PER_MONTH);

  const assumptions = [
    `About ${hoursPerClean} cleaner hours per visit at ${inputs.cleansPerWeek} clean${inputs.cleansPerWeek > 1 ? "s" : ""} a week.`,
    `Roughly ${Math.round(hardShare * 100)}% hard floor (mopped) and the rest carpet (vacuumed).`,
    "Regular maintenance clean: dusting, desks and touch points, bins, washrooms, kitchen, vacuum and mop.",
    "Prices exclude GST. The final price is confirmed after a free on-site walkthrough.",
  ];
  if (rawHours < config.minimumHoursPerClean) assumptions.push(`A minimum of ${config.minimumHoursPerClean} hours per visit applies.`);

  return {
    hoursPerClean,
    perClean,
    perWeek,
    perMonth,
    gstIncluded: false,
    breakdownMinutes: {
      area: Math.round(area),
      hardFloor: Math.round(hardFloor),
      washrooms: Math.round(washrooms),
      kitchens: Math.round(kitchens),
      setup,
    },
    assumptions,
    configConfirmed: config.confirmedByOwner,
  };
}
