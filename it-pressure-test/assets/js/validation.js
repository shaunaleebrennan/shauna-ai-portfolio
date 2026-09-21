import { calculateScore, ScoringError } from "./scoring.js";
import { CONFIDENCE_VALUES, DIMENSIONS, SCORE_VALUES } from "./rubric.js";
import { APP_VERSION, RUBRIC_VERSION } from "./config.js";

export const SCHEMA_VERSION = "1.0.0";
export const MAX_IMPORT_BYTES = 100_000;

const ROOT_KEYS = [
  "schemaVersion",
  "appVersion",
  "rubricVersion",
  "metadata",
  "sourceMessaging",
  "dimensions",
  "summary",
  "manualReview",
  "calculation",
];
const METADATA_KEYS = [
  "assetName",
  "assetVersion",
  "reviewerType",
  "reviewedAt",
  "audience",
  "journeyStage",
  "buyingTrigger",
  "alternatives",
  "suppliedEvidence",
];
const DIMENSION_KEYS = ["id", "score", "confidence", "evidenceQuote", "rationale", "missingContext"];
const SUMMARY_KEYS = ["priorityFindings", "riskyClaims", "nextTest", "humanNotes"];
const MANUAL_REVIEW_KEYS = ["status"];
const CALCULATION_KEYS = ["score", "applicableWeight", "excludedDimensionIds", "criticalFlagCodes"];

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function checkExactKeys(value, expectedKeys, path, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${path} must be an object.`);
    return false;
  }

  const actualKeys = Object.keys(value);
  for (const key of expectedKeys) {
    if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required.`);
  }
  for (const key of actualKeys) {
    if (!expectedKeys.includes(key)) errors.push(`${path}.${key} is not allowed.`);
  }
  return true;
}

function checkString(value, path, errors, { required = false, max = 5000 } = {}) {
  if (typeof value !== "string") {
    errors.push(`${path} must be a string.`);
    return;
  }
  if (required && value.trim().length === 0) errors.push(`${path} cannot be empty.`);
  if (value.length > max) errors.push(`${path} must be ${max} characters or fewer.`);
}

function checkStringArray(value, path, errors, { exactLength, maxItems = 50, requiredItems = false } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }
  if (exactLength !== undefined && value.length !== exactLength) {
    errors.push(`${path} must contain exactly ${exactLength} items.`);
  }
  if (value.length > maxItems) errors.push(`${path} must contain ${maxItems} items or fewer.`);
  value.forEach((item, index) => checkString(item, `${path}[${index}]`, errors, { required: requiredItems, max: 5000 }));
}

function sameArray(first, second) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function byteLength(value) {
  if (typeof TextEncoder === "function") return new TextEncoder().encode(value).byteLength;
  return value.length;
}

export function calculationFor(dimensions) {
  const result = calculateScore(dimensions);
  return {
    score: result.score,
    applicableWeight: result.applicableWeight,
    excludedDimensionIds: result.excludedDimensions.map(({ id }) => id),
    criticalFlagCodes: result.criticalFlags.map(({ code }) => code),
  };
}

export function validateReview(review) {
  const errors = [];
  if (!checkExactKeys(review, ROOT_KEYS, "review", errors)) return { valid: false, errors };

  if (review.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`review.schemaVersion must be ${SCHEMA_VERSION}.`);
  }
  if (!["1.0.0", APP_VERSION].includes(review.appVersion)) {
    errors.push(`review.appVersion must be ${APP_VERSION}.`);
  }
  if (review.rubricVersion !== RUBRIC_VERSION) {
    errors.push(`review.rubricVersion must be ${RUBRIC_VERSION}.`);
  }

  if (checkExactKeys(review.metadata, METADATA_KEYS, "review.metadata", errors)) {
    checkString(review.metadata.assetName, "review.metadata.assetName", errors, { required: true, max: 200 });
    checkString(review.metadata.assetVersion, "review.metadata.assetVersion", errors, { max: 100 });
    if (!["human", "ai-assisted"].includes(review.metadata.reviewerType)) {
      errors.push("review.metadata.reviewerType must be human or ai-assisted.");
    }
    checkString(review.metadata.reviewedAt, "review.metadata.reviewedAt", errors, { required: true, max: 50 });
    if (
      typeof review.metadata.reviewedAt === "string" &&
      (!review.metadata.reviewedAt.includes("T") || Number.isNaN(Date.parse(review.metadata.reviewedAt)))
    ) {
      errors.push("review.metadata.reviewedAt must be a valid ISO 8601 date-time string.");
    }
    checkString(review.metadata.audience, "review.metadata.audience", errors, { required: true, max: 1000 });
    checkString(review.metadata.journeyStage, "review.metadata.journeyStage", errors, { required: true, max: 200 });
    checkString(review.metadata.buyingTrigger, "review.metadata.buyingTrigger", errors, { required: true, max: 1000 });
    checkString(review.metadata.alternatives, "review.metadata.alternatives", errors, { required: true, max: 1000 });
    checkString(review.metadata.suppliedEvidence, "review.metadata.suppliedEvidence", errors, { max: 5000 });
  }

  checkString(review.sourceMessaging, "review.sourceMessaging", errors, { required: true, max: 50000 });

  if (!Array.isArray(review.dimensions)) {
    errors.push("review.dimensions must be an array.");
  } else {
    if (review.dimensions.length !== DIMENSIONS.length) {
      errors.push(`review.dimensions must contain exactly ${DIMENSIONS.length} items.`);
    }
    const seen = new Set();
    review.dimensions.forEach((dimension, index) => {
      const path = `review.dimensions[${index}]`;
      if (!checkExactKeys(dimension, DIMENSION_KEYS, path, errors)) return;

      const known = DIMENSIONS.some(({ id }) => id === dimension.id);
      if (!known) errors.push(`${path}.id is not a recognized rubric dimension.`);
      if (seen.has(dimension.id)) errors.push(`${path}.id duplicates ${dimension.id}.`);
      seen.add(dimension.id);

      if (dimension.score !== null && !SCORE_VALUES.includes(dimension.score)) {
        errors.push(`${path}.score must be an integer from 1 to 5, or null for N/A.`);
      }
      if (!CONFIDENCE_VALUES.includes(dimension.confidence)) {
        errors.push(`${path}.confidence must be low, medium, high, or not-applicable.`);
      }
      if (dimension.score === null && dimension.confidence !== "not-applicable") {
        errors.push(`${path}.confidence must be not-applicable when score is null.`);
      }
      if (dimension.score !== null && dimension.confidence === "not-applicable") {
        errors.push(`${path}.confidence must be low, medium, or high when a score is supplied.`);
      }

      checkString(dimension.evidenceQuote, `${path}.evidenceQuote`, errors, { max: 5000 });
      checkString(dimension.rationale, `${path}.rationale`, errors, { required: true, max: 5000 });
      checkString(dimension.missingContext, `${path}.missingContext`, errors, { max: 5000 });

      if (typeof dimension.evidenceQuote === "string" && typeof review.sourceMessaging === "string") {
        if (dimension.score !== null && dimension.evidenceQuote.trim().length === 0) {
          errors.push(`${path}.evidenceQuote cannot be empty for an applicable dimension.`);
        } else if (
          dimension.evidenceQuote.length > 0 &&
          !review.sourceMessaging.includes(dimension.evidenceQuote)
        ) {
          errors.push(`${path}.evidenceQuote must be an exact substring of review.sourceMessaging.`);
        }
      }
    });

    for (const { id } of DIMENSIONS) {
      if (!seen.has(id)) errors.push(`review.dimensions is missing ${id}.`);
    }
  }

  if (checkExactKeys(review.summary, SUMMARY_KEYS, "review.summary", errors)) {
    checkStringArray(review.summary.priorityFindings, "review.summary.priorityFindings", errors, {
      exactLength: 3,
      requiredItems: true,
    });
    checkStringArray(review.summary.riskyClaims, "review.summary.riskyClaims", errors, {
      maxItems: 50,
      requiredItems: true,
    });
    checkString(review.summary.nextTest, "review.summary.nextTest", errors, { required: true, max: 5000 });
    checkString(review.summary.humanNotes, "review.summary.humanNotes", errors, { max: 5000 });
  }

  if (checkExactKeys(review.manualReview, MANUAL_REVIEW_KEYS, "review.manualReview", errors)) {
    if (!["pending", "reviewed"].includes(review.manualReview.status)) {
      errors.push("review.manualReview.status must be pending or reviewed.");
    }
    if (
      review.manualReview.status === "reviewed" &&
      isPlainObject(review.summary) &&
      typeof review.summary.humanNotes === "string" &&
      review.summary.humanNotes.trim().length === 0
    ) {
      errors.push("review.summary.humanNotes is required when manual review is marked reviewed.");
    }
  }

  if (checkExactKeys(review.calculation, CALCULATION_KEYS, "review.calculation", errors)) {
    if (typeof review.calculation.score !== "number" || !Number.isFinite(review.calculation.score)) {
      errors.push("review.calculation.score must be a finite number.");
    }
    if (
      typeof review.calculation.applicableWeight !== "number" ||
      !Number.isFinite(review.calculation.applicableWeight)
    ) {
      errors.push("review.calculation.applicableWeight must be a finite number.");
    }
    checkStringArray(review.calculation.excludedDimensionIds, "review.calculation.excludedDimensionIds", errors);
    checkStringArray(review.calculation.criticalFlagCodes, "review.calculation.criticalFlagCodes", errors);
  }

  if (Array.isArray(review.dimensions) && review.dimensions.length === DIMENSIONS.length) {
    try {
      const expected = calculationFor(review.dimensions);
      if (isPlainObject(review.calculation)) {
        if (review.calculation.score !== expected.score) {
          errors.push(`review.calculation.score must equal the deterministic score of ${expected.score}.`);
        }
        if (review.calculation.applicableWeight !== expected.applicableWeight) {
          errors.push(`review.calculation.applicableWeight must equal ${expected.applicableWeight}.`);
        }
        if (
          Array.isArray(review.calculation.excludedDimensionIds) &&
          !sameArray(review.calculation.excludedDimensionIds, expected.excludedDimensionIds)
        ) {
          errors.push("review.calculation.excludedDimensionIds does not match the dimension scores.");
        }
        if (
          Array.isArray(review.calculation.criticalFlagCodes) &&
          !sameArray(review.calculation.criticalFlagCodes, expected.criticalFlagCodes)
        ) {
          errors.push("review.calculation.criticalFlagCodes does not match the dimension scores.");
        }
      }
    } catch (error) {
      if (error instanceof ScoringError) errors.push(error.message);
      else throw error;
    }
  }

  return { valid: errors.length === 0, errors };
}

export function parseReviewJson(jsonText) {
  if (typeof jsonText !== "string") {
    return { valid: false, errors: ["Imported review must be text."] };
  }
  if (byteLength(jsonText) > MAX_IMPORT_BYTES) {
    return {
      valid: false,
      errors: [`Imported review exceeds the ${MAX_IMPORT_BYTES.toLocaleString("en")} byte limit.`],
    };
  }

  let review;
  try {
    review = JSON.parse(jsonText);
  } catch {
    return { valid: false, errors: ["Imported review is not valid JSON."] };
  }

  const result = validateReview(review);
  return result.valid ? { valid: true, errors: [], review } : result;
}
