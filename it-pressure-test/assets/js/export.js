import { diagnoseReview } from "./diagnostics.js";
import { getDimension } from "./rubric.js";
import { validateReview } from "./validation.js";

function assertValid(review) {
  const result = validateReview(review);
  if (!result.valid) {
    throw new Error(`Review cannot be exported:\n${result.errors.join("\n")}`);
  }
}

function inline(value) {
  return String(value).replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");
}

function list(items, emptyLabel = "None recorded.") {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : emptyLabel;
}

export function reviewToJson(review) {
  assertValid(review);
  return `${JSON.stringify(review, null, 2)}\n`;
}

export function reviewToMarkdown(review) {
  assertValid(review);
  const excluded = review.calculation.excludedDimensionIds;
  const diagnostic = diagnoseReview(review);
  const dimensions = review.dimensions
    .map((item) => {
      const rubric = getDimension(item.id);
      const score = item.score === null ? "N/A" : `${item.score}/5`;
      return `| ${rubric.name} | ${rubric.weight}% | ${score} | ${inline(item.evidenceQuote || "—")} | ${inline(item.rationale)} | ${inline(item.confidence)} |`;
    })
    .join("\n");

  const flags = review.calculation.criticalFlagCodes.length
    ? review.calculation.criticalFlagCodes.map((code) => `- **${code}**`).join("\n")
    : "No critical score flags were triggered.";

  return `# Positioning QA: ${review.metadata.assetName}

## Review context

- **Asset version:** ${review.metadata.assetVersion || "Not supplied"}
- **Reviewer type:** ${review.metadata.reviewerType}
- **Reviewed at:** ${review.metadata.reviewedAt}
- **App version:** ${review.appVersion}
- **Rubric version:** ${review.rubricVersion}
- **Audience:** ${review.metadata.audience}
- **Awareness stage:** ${review.metadata.journeyStage || "Not supplied"}
- **Buying trigger:** ${review.metadata.buyingTrigger || "Not supplied"}
- **Alternatives:** ${review.metadata.alternatives || "Not supplied"}
- **Evidence supplied:** ${review.metadata.suppliedEvidence || "None supplied"}
- **Manual review:** ${review.manualReview.status}

## Source messaging

> ${review.sourceMessaging.replace(/\r?\n/g, "\n> ")}

## Result

- **Normalized score:** ${review.calculation.score}/100
- **Applicable rubric weight:** ${review.calculation.applicableWeight}%
- **Excluded as N/A:** ${excluded.length ? excluded.join(", ") : "None"}

${flags}

## Review reliability

**${diagnostic.status}**

${list(diagnostic.warnings)}

If every applicable score moves by one point, the total ranges from ${diagnostic.sensitivity.min} to ${diagnostic.sensitivity.max}. This is a sensitivity scenario, not a statistical confidence interval.

## Dimension scores

| Dimension | Weight | Score | Exact source evidence | Rationale | Confidence |
|---|---:|---:|---|---|---|
${dimensions}

## Three highest-impact findings

${review.summary.priorityFindings.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Unsupported or risky claims

${list(review.summary.riskyClaims)}

## Recommended next test

${review.summary.nextTest}

## Human review notes

${review.summary.humanNotes || "No human notes recorded."}
`;
}

export function exportFilename(assetName, extension) {
  const stem = String(assetName || "positioning-review")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${stem || "positioning-review"}.${extension}`;
}
