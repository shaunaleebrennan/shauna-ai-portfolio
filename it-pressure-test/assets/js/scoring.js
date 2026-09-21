import { DIMENSIONS, SCORE_VALUES } from "./rubric.js";

export class ScoringError extends Error {
  constructor(message, code = "INVALID_SCORE_INPUT") {
    super(message);
    this.name = "ScoringError";
    this.code = code;
  }
}

function round(value, places = 1) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function assertDimensionRecords(records) {
  if (!Array.isArray(records)) {
    throw new ScoringError("Dimension scores must be supplied as an array.");
  }

  const expectedIds = new Set(DIMENSIONS.map(({ id }) => id));
  const seenIds = new Set();

  for (const record of records) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new ScoringError("Every dimension score must be an object.");
    }
    if (!expectedIds.has(record.id)) {
      throw new ScoringError(`Unknown dimension: ${String(record.id)}.`);
    }
    if (seenIds.has(record.id)) {
      throw new ScoringError(`Duplicate dimension: ${record.id}.`);
    }
    seenIds.add(record.id);

    if (record.score !== null && !SCORE_VALUES.includes(record.score)) {
      throw new ScoringError(`${record.id} must have a score from 1 to 5, or null for N/A.`);
    }
  }

  if (seenIds.size !== DIMENSIONS.length) {
    const missing = DIMENSIONS.filter(({ id }) => !seenIds.has(id)).map(({ name }) => name);
    throw new ScoringError(`Missing dimension scores: ${missing.join(", ")}.`);
  }
}

/**
 * Calculate a normalized 0–100 score. A null score means not applicable.
 * Remaining weights are normalized against their combined applicable weight.
 */
export function calculateScore(records) {
  assertDimensionRecords(records);

  const recordById = new Map(records.map((record) => [record.id, record]));
  const applicable = DIMENSIONS.filter(({ id }) => recordById.get(id).score !== null);

  if (applicable.length === 0) {
    throw new ScoringError(
      "At least one rubric dimension must be applicable before a score can be calculated.",
      "ALL_DIMENSIONS_NOT_APPLICABLE",
    );
  }

  const applicableWeight = applicable.reduce((total, dimension) => total + dimension.weight, 0);
  const weightedPoints = applicable.reduce((total, dimension) => {
    const { score } = recordById.get(dimension.id);
    return total + (score / 5) * dimension.weight;
  }, 0);

  const score = round((weightedPoints / applicableWeight) * 100);
  const excludedDimensions = DIMENSIONS.filter(({ id }) => recordById.get(id).score === null).map(
    ({ id, name, weight }) => ({ id, name, weight }),
  );

  const criticalFlags = [];
  if (recordById.get("evidence-and-credibility").score === 1) {
    criticalFlags.push({
      code: "CRITICAL_EVIDENCE_RISK",
      dimensionId: "evidence-and-credibility",
      message: "Evidence and credibility scored 1/5. Do not publish material claims before human review.",
    });
  }
  if (recordById.get("responsible-ai-claims").score === 1) {
    criticalFlags.push({
      code: "CRITICAL_RESPONSIBLE_AI_RISK",
      dimensionId: "responsible-ai-claims",
      message: "Responsible AI claims scored 1/5. Review claims, oversight, and limitations before publication.",
    });
  }

  return {
    score,
    applicableWeight,
    weightedPoints: round(weightedPoints, 2),
    excludedDimensions,
    criticalFlags,
  };
}
