import { calculateScore } from './scoring.js';
import { DIMENSIONS } from './rubric.js';

/** Signals for a human reviewer, not a probability or publication approval. */
export function diagnoseReview(review) {
  const result = calculateScore(review.dimensions);
  const applicable = review.dimensions.filter(d => d.score !== null);
  const excludedCore = result.excludedDimensions.filter(d => d.id !== 'responsible-ai-claims');
  const lowConfidence = applicable.filter(d => d.confidence === 'low');
  const missingContext = applicable.filter(d => d.missingContext.trim());
  const warnings = result.criticalFlags.map(f => f.message);
  if (excludedCore.length) warnings.push(`Core dimensions excluded: ${excludedCore.map(d => d.name).join(', ')}. The total is a partial diagnostic and is not comparable with a full review.`);
  if (lowConfidence.length) warnings.push(`${lowConfidence.length} dimension(s) have low confidence. Treat these scores as hypotheses to investigate.`);
  if (missingContext.length) warnings.push(`${missingContext.length} dimension(s) contain context notes. Check which describe unresolved gaps and which record no material gap.`);
  if (!review.metadata.suppliedEvidence.trim()) warnings.push('No supporting evidence supplied. Exact quotations show what the copy says, not whether its claims are true.');
  if (review.summary.riskyClaims.length) warnings.push(`${review.summary.riskyClaims.length} risky claim(s) recorded. Review the supporting proof and qualifications.`);
  const credibility = review.dimensions.find(d => d.id === 'evidence-and-credibility');
  if (credibility.score >= 4 && !review.metadata.suppliedEvidence.trim()) warnings.push('High credibility score without supplied proof: explain the basis or reduce the score.');
  const sensitivity = applicable.reduce((range,d) => {
    const weight = DIMENSIONS.find(x => x.id === d.id).weight;
    range.min += (Math.max(1,d.score-1)/5)*weight;
    range.max += (Math.min(5,d.score+1)/5)*weight;
    return range;
  }, {min:0,max:0});
  const status = result.criticalFlags.length ? 'Resolve critical claims' : excludedCore.length ? 'Partial review — revisit exclusions' : warnings.length ? 'Investigate evidence gaps' : review.manualReview.status !== 'reviewed' ? 'Awaiting human review' : 'Human review recorded';
  return {status,warnings,coverage:result.applicableWeight,lowConfidenceCount:lowConfidence.length,
    sensitivity:{min:Math.round(sensitivity.min/result.applicableWeight*1000)/10,max:Math.round(sensitivity.max/result.applicableWeight*1000)/10}};
}

export function prepareImportedReview(review) {
  const copy = structuredClone(review);
  copy.manualReview.status = 'pending';
  // Historical notes are preserved, but a file cannot attest to a new human review.
  return copy;
}

export function importContextErrors(review, current) {
  if (!current.sourceMessaging.trim()) return [];
  const errors=[];
  if (review.sourceMessaging !== current.sourceMessaging) errors.push('Imported source differs from the current source. Restore the exact source or clear the current review to open a different saved review.');
  for (const key of ['assetName','assetVersion','audience','journeyStage','buyingTrigger','alternatives','suppliedEvidence']) {
    if (current.metadata[key] !== review.metadata[key]) errors.push(`Imported context differs: ${key}. Use the prompt for the current context, or clear the review before restoring another record.`);
  }
  return errors;
}
