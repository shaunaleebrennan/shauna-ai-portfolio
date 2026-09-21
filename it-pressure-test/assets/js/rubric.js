export const SCORE_VALUES = Object.freeze([1, 2, 3, 4, 5]);

export const CONFIDENCE_VALUES = Object.freeze([
  "low",
  "medium",
  "high",
  "not-applicable",
]);

export const DIMENSIONS = Object.freeze([
  {
    id: "icp-specificity",
    name: "ICP specificity",
    weight: 15,
    question: "Is it clear who the product is for and in what situation it becomes valuable?",
    anchors: {
      1: "No recognizable audience or use context.",
      3: "A broad audience is named, but role, situation, or priority is unclear.",
      5: "The buyer or user, relevant context, and important trigger are immediately recognizable.",
    },
  },
  {
    id: "problem-relevance",
    name: "Problem relevance",
    weight: 15,
    question: "Does the message express an important problem in customer terms?",
    anchors: {
      1: "Leads with the company or technology and identifies no customer problem.",
      3: "Names a plausible pain but not its consequence, urgency, or trigger.",
      5: "Connects a recognizable problem to a meaningful consequence and buying moment.",
    },
  },
  {
    id: "differentiation",
    name: "Differentiation",
    weight: 15,
    question: "Is it clear why this choice is meaningfully different from the alternatives?",
    anchors: {
      1: "Interchangeable with category competitors or generic AI claims.",
      3: "Names distinctive capabilities but does not connect them to a valued advantage.",
      5: "Establishes a relevant, defensible contrast with the alternatives customers actually consider.",
    },
  },
  {
    id: "value-articulation",
    name: "Value articulation",
    weight: 15,
    question: "Are product capabilities translated into outcomes the audience values?",
    anchors: {
      1: "Feature inventory with no meaningful outcome.",
      3: "Benefits are stated but remain broad or detached from the workflow.",
      5: "Connects capability to outcome, explains the mechanism, and reflects buyer priorities.",
    },
  },
  {
    id: "clarity",
    name: "Clarity",
    weight: 15,
    question: "Can the intended audience understand the offer quickly and accurately?",
    anchors: {
      1: "Ambiguous category, heavy jargon, or contradictory claims.",
      3: "Understandable after effort, but contains abstractions or overloaded sentences.",
      5: "The product, audience, value, and relevant context are readily understood.",
    },
  },
  {
    id: "evidence-and-credibility",
    name: "Evidence and credibility",
    weight: 10,
    question: "Are important claims supported, supportable, and proportionate?",
    anchors: {
      1: "Relies on fabricated, unverifiable, or implausible claims.",
      3: "Includes plausible claims but weak proof, qualification, or attribution.",
      5: "Material claims are backed by relevant evidence and appropriately bounded.",
    },
  },
  {
    id: "narrative-consistency",
    name: "Narrative consistency",
    weight: 5,
    question: "Do the message elements reinforce the same positioning?",
    anchors: {
      1: "Audience, problem, promise, and proof conflict.",
      3: "Mostly aligned, with some drift in terminology or emphasis.",
      5: "Each element reinforces a coherent audience, problem, value, and reason to believe.",
    },
  },
  {
    id: "responsible-ai-claims",
    name: "Responsible AI claims",
    weight: 10,
    question: "If AI is mentioned, are its role and limitations communicated responsibly?",
    anchors: {
      1: "Deceptive anthropomorphism, guaranteed outcomes, or concealed material limitations.",
      3: "AI capability is plausible but vague about mechanism, oversight, data, or limits.",
      5: "Claims are specific and proportionate, with appropriate human control and material limitations made clear.",
    },
  },
]);

export const DIMENSION_IDS = Object.freeze(DIMENSIONS.map(({ id }) => id));

export function getDimension(id) {
  return DIMENSIONS.find((dimension) => dimension.id === id);
}
