/* IT Pressure Test 4.0: human-rated review with an optional, validated AI draft.
   The local rules only suggest passages and flag claims. They never set a score. */
import { ITRubric } from "./it-rubric.js?v=4.0";

export const VERSION = "4.0";
export const CRITERIA = ["relevance", "value", "fit", "trust", "proof", "clarity"];
export const NAMES = {
  relevance: "Recognisable pressure",
  value: "Business value",
  fit: "Stack fit",
  trust: "Trust and governance",
  proof: "Credibility and proof",
  clarity: "Clarity and repeatability",
};
export const ANCHORS = ITRubric.anchors;
export const NEEDS = ITRubric.needs;
export const MAX_IMPORT = 50000;

const squash = (text) => String(text || "").replace(/\s+/g, " ").trim();

/** Weights for this purchase stage and format, plus rule-based suggestions and claim flags. */
export function prepare(context) {
  const audit = ITRubric.assess(context);
  const suggestions = Object.fromEntries(CRITERIA.map((id) => [id, audit.rows[id]?.quote || ""]));
  return {
    weights: audit.weights,
    format: audit.format,
    stage: ITRubric.stages[context.goal]?.label || context.goal,
    passages: ITRubric.passages(String(context.message || "").trim()),
    suggestions,
    claims: audit.claims,
    criticalClaims: audit.criticalClaims,
  };
}

/** True when the quotation appears in the message (whitespace-insensitive). */
export function quoteInMessage(quote, message) {
  const q = squash(quote);
  return q.length > 0 && squash(message).includes(q);
}

/** A rating counts once it has a level, and any level above 0 is tied to a passage from the copy. */
export function ratingComplete(rating, message) {
  if (!rating || !Number.isInteger(rating.level) || rating.level < 0 || rating.level > 4) return false;
  return rating.level === 0 || quoteInMessage(rating.quote, message);
}

/** Score from human (or confirmed AI-drafted) ratings: sum(level / 4 × weight), rounded once. */
export function score(weights, ratings, message) {
  const required = CRITERIA.filter((id) => weights[id] > 0);
  const rated = required.filter((id) => ratingComplete(ratings[id], message));
  const raw = rated.reduce((sum, id) => sum + (ratings[id].level / 4) * weights[id], 0);
  const drafts = rated.filter((id) => ratings[id].source === "ai");
  return {
    total: Math.round(raw),
    raw,
    required,
    rated,
    complete: rated.length === required.length && required.length > 0,
    drafts,
  };
}

export function band(total) {
  if (total >= 80) return "Strong structure";
  if (total >= 60) return "Promising";
  if (total >= 40) return "Needs work";
  return "Reframe the message";
}

/** Biggest unearned weight first; a weak basic message (clarity, then relevance, then value below 2) comes first. */
export function priorities(weights, ratings, message) {
  const open = CRITERIA.filter((id) => weights[id] > 0 && ratingComplete(ratings[id], message) && ratings[id].level < 4);
  const basics = ["clarity", "relevance", "value"].filter((id) => open.includes(id) && ratings[id].level < 2);
  const rest = open
    .filter((id) => !basics.includes(id))
    .sort((a, b) => weights[b] * (1 - ratings[b].level / 4) - weights[a] * (1 - ratings[a].level / 4));
  return [...basics, ...rest];
}

/** The prompt a reviewer can paste into an AI tool their organisation has approved. */
export function buildPrompt(context, profile, prepared) {
  const required = CRITERIA.filter((id) => prepared.weights[id] > 0);
  const rubric = required
    .map((id) => {
      const levels = ANCHORS[id].map((anchor, level) => `    ${level}: ${anchor}`).join("\n");
      return `- ${id} (${NAMES[id]}, weight ${prepared.weights[id]})\n  Buyer question: ${profile.questions[id]}\n  Levels (cumulative; a level requires the ones below it):\n${levels}`;
    })
    .join("\n");
  const example = Object.fromEntries(required.map((id) => [id, { level: 0, quote: "", reason: "" }]));
  return `You are reviewing B2B technology messaging for an IT buyer. Rate the copy against each criterion below.

Rules:
- Judge only the words in the copy. Do not use outside knowledge about the vendor or product.
- For every level above 0, "quote" must be an exact, continuous passage copied from the copy that earns that level. Do not paraphrase.
- Use level 0 with an empty quote when the copy does not earn level 1.
- Keywords alone do not earn credit: a passage earns a level only if a buyer would read it that way.
- Keep "reason" to one sentence.
- Reply with JSON only, in exactly this shape, with no other text.

Context:
- IT audience: ${profile.name}
- Purchase stage: ${prepared.stage}
- Asset format: ${prepared.format}
${context.alternatives ? `- Alternatives the buyer will compare with: ${context.alternatives}\n` : ""}
Criteria:
${rubric}

Copy:
"""
${context.message}
"""

JSON shape:
${JSON.stringify({ version: VERSION, ratings: example }, null, 2)}`;
}

/** Validate an AI reply. Nothing is applied unless every check passes. */
export function parseAIReview(text, message, weights) {
  const errors = [];
  const raw = String(text || "").trim();
  if (!raw) return { ok: false, errors: ["Paste the AI tool’s JSON reply first."] };
  if (raw.length > MAX_IMPORT) return { ok: false, errors: ["The reply is too long to be a review of this copy."] };
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  let data;
  try {
    data = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw);
  } catch {
    return { ok: false, errors: ["The reply is not valid JSON. Ask the AI tool to reply with JSON only."] };
  }
  const given = data && typeof data === "object" ? data.ratings : null;
  if (!given || typeof given !== "object" || Array.isArray(given)) {
    return { ok: false, errors: ["The reply needs a \"ratings\" object."] };
  }
  const ratings = {};
  for (const id of CRITERIA.filter((key) => weights[key] > 0)) {
    const entry = given[id];
    if (!entry || typeof entry !== "object") {
      errors.push(`${NAMES[id]} is missing.`);
      continue;
    }
    const level = entry.level;
    if (!Number.isInteger(level) || level < 0 || level > 4) {
      errors.push(`${NAMES[id]}: the level must be a whole number from 0 to 4.`);
      continue;
    }
    const quote = typeof entry.quote === "string" ? entry.quote.trim() : "";
    if (level > 0 && !quoteInMessage(quote, message)) {
      errors.push(`${NAMES[id]}: the quoted passage is not in the copy, so level ${level} can’t be checked.`);
      continue;
    }
    const reason = typeof entry.reason === "string" ? entry.reason.trim().slice(0, 400) : "";
    ratings[id] = { level, quote: level > 0 ? quote : "", note: reason, source: "ai" };
  }
  return errors.length ? { ok: false, errors } : { ok: true, ratings };
}

/** Markdown record of the review. */
export function summary({ context, profile, role, prepared, ratings, result }) {
  const rows = CRITERIA.map((id) => {
    const weight = prepared.weights[id];
    if (!weight) return `- **${NAMES[id]}:** not needed for this stage and format.`;
    const rating = ratings[id];
    if (!ratingComplete(rating, context.message)) return `- **${NAMES[id]}** (${weight} pts): not yet rated.`;
    const pts = Number(((rating.level / 4) * weight).toFixed(2));
    return `- **${NAMES[id]}** (${weight} pts): level ${rating.level}/4, ${pts} pts — ${ANCHORS[id][rating.level]}${rating.source === "ai" ? " *(AI draft, not confirmed)*" : ""}${rating.quote ? `\n  Passage: “${rating.quote}”` : ""}${rating.note ? `\n  Note: ${rating.note}` : ""}`;
  }).join("\n");
  const flags = prepared.claims.length
    ? prepared.claims.map((claim) => `- “${claim.quote}” — ${claim.need}`).join("\n")
    : "- None flagged by the local rules. Still check every claim against an approved source.";
  const next = priorities(prepared.weights, ratings, context.message)
    .slice(0, 3)
    .map((id) => `- **${NAMES[id]}:** ${NEEDS[id][Math.min(3, ratings[id].level)]}`)
    .join("\n") || "- No gaps in the rated criteria.";
  return `# IT Pressure Test review

**Score:** ${result.complete ? `${result.total}/100 — ${band(result.total)}` : `Incomplete (${result.rated.length} of ${result.required.length} criteria rated)`}
**Method:** IT Pressure Test ${VERSION}. Human-rated against the published rubric; weights are editorial, not calibrated against buyer outcomes.${result.drafts.length ? `\n**AI-drafted ratings not yet confirmed:** ${result.drafts.map((id) => NAMES[id]).join(", ")}` : ""}

**IT audience:** ${profile.name}
**Buying role:** ${role.name}
**Purchase stage:** ${prepared.stage}
**Asset format:** ${prepared.format}
**Alternatives:** ${context.alternatives || "Not supplied"}
**Supplied proof (unverified):** ${context.proof || "Not supplied"}

## Ratings

${rows}

## What to change first

${next}

## Claims to check before publishing

${flags}

## Source copy

${context.message}
`;
}
