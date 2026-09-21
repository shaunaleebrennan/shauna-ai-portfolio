// Kept as an ES module so the static GitHub Pages app can load an example
// without fetching data or relying on a server.
export const SIGNALSDESK_EXAMPLE = Object.freeze({
  schemaVersion: "1.0.0",
  appVersion: "1.0.0",
  rubricVersion: "1.0.0",
  metadata: {
    assetName: "SignalsDesk homepage hero",
    assetVersion: "Worked example",
    reviewerType: "human",
    reviewedAt: "2026-09-19T00:00:00.000Z",
    audience: "Product managers at growing B2B software companies",
    journeyStage: "Problem aware",
    buyingTrigger: "Customer evidence is scattered before a roadmap or positioning decision",
    alternatives: "Spreadsheets, general-purpose note tools, manual synthesis, research repositories",
    suppliedEvidence: "No customer or product evidence was supplied; SignalsDesk is fictional.",
  },
  sourceMessaging:
    "The future of customer intelligence is here.\n\nSignalsDesk is an innovative AI-powered platform that transforms your customer data into actionable insights, helping modern teams move faster and make smarter decisions.",
  dimensions: [
    {
      id: "icp-specificity",
      score: 1,
      confidence: "high",
      evidenceQuote: "modern teams",
      rationale: "The phrase does not identify the intended product-management audience or its use context.",
      missingContext: "Role, company maturity, workflow, and trigger.",
    },
    {
      id: "problem-relevance",
      score: 2,
      confidence: "medium",
      evidenceQuote: "customer data",
      rationale: "A possible input is named, but the workflow problem, consequence, and urgency are absent.",
      missingContext: "The evidence problem and the decision it obstructs.",
    },
    {
      id: "differentiation",
      score: 1,
      confidence: "high",
      evidenceQuote: "innovative AI-powered platform",
      rationale: "The description is interchangeable with many products and contains no relevant contrast.",
      missingContext: "Alternative-specific advantage and defensible product mechanism.",
    },
    {
      id: "value-articulation",
      score: 2,
      confidence: "high",
      evidenceQuote: "move faster and make smarter decisions",
      rationale: "The outcomes are broad and no product mechanism connects them to a real workflow.",
      missingContext: "A specific outcome, mechanism, and buyer priority.",
    },
    {
      id: "clarity",
      score: 3,
      confidence: "high",
      evidenceQuote: "customer intelligence",
      rationale: "The broad category is understandable, but the input, output, and workflow remain unclear.",
      missingContext: "What the product does with which evidence for whom.",
    },
    {
      id: "evidence-and-credibility",
      score: 2,
      confidence: "medium",
      evidenceQuote: "transforms your customer data into actionable insights",
      rationale: "The transformation claim is unsupported and unbounded.",
      missingContext: "Product behavior, methodology, customer proof, or transparent qualification.",
    },
    {
      id: "narrative-consistency",
      score: 4,
      confidence: "medium",
      evidenceQuote: "customer data into actionable insights",
      rationale: "The short asset consistently discusses customer intelligence and decisions despite being generic.",
      missingContext: "A specific audience and problem would make the narrative more coherent.",
    },
    {
      id: "responsible-ai-claims",
      score: 2,
      confidence: "high",
      evidenceQuote: "AI-powered",
      rationale: "AI is presented as a capability without explaining its role, oversight, data, or limitations.",
      missingContext: "AI mechanism, source traceability, human control, and limitations.",
    },
  ],
  summary: {
    priorityFindings: [
      "Identify the product-management workflow and decision moment.",
      "Explain what the product does with customer evidence instead of relying on AI-powered.",
      "Replace the unsupported transformation promise with a specific, testable benefit.",
    ],
    riskyClaims: [
      "Transforms your customer data into actionable insights is unsupported and unbounded.",
      "Make smarter decisions implies an outcome without evidence or qualification.",
    ],
    nextTest:
      "Compare this message with a workflow-specific alternative in five interviews with product managers who recently synthesized customer evidence.",
    humanNotes: "SignalsDesk is fictional. This is a worked example, not validated positioning.",
  },
  manualReview: { status: "reviewed" },
  calculation: {
    score: 39,
    applicableWeight: 100,
    excludedDimensionIds: [],
    criticalFlagCodes: [],
  },
});

export function cloneSignalsDeskExample() {
  return JSON.parse(JSON.stringify(SIGNALSDESK_EXAMPLE));
}

export function cloneReleaseGuardExample() {
  return {
    "schemaVersion": "1.0.0",
    "appVersion": "1.0.0",
    "rubricVersion": "1.0.0",
    "metadata": {
      "assetName": "ReleaseGuard homepage hero",
      "assetVersion": "Test fixture v1",
      "reviewerType": "human",
      "reviewedAt": "2026-09-19T00:00:00.000Z",
      "audience": "Platform engineering leaders at regulated B2B software companies",
      "journeyStage": "Solution aware",
      "buyingTrigger": "A release is delayed while teams assemble compliance evidence by hand",
      "alternatives": "Manual release checklists, spreadsheets, internal scripts, or delaying the release",
      "suppliedEvidence": "Fictional product behavior and pilot evidence created only for testing this evaluator."
    },
    "sourceMessaging": "Ship regulated software without rebuilding the audit trail by hand.\n\nReleaseGuard gives platform engineering leaders one review queue for deployment evidence, policy checks, and named approvals. AI-assisted checks flag missing evidence against policies your team configures; your release owner makes the final decision. In a 12-team pilot, audit-packet preparation fell from a median of four hours to 45 minutes. Results will vary by workflow and policy complexity.",
    "dimensions": [
      {
        "id": "icp-specificity",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "platform engineering leaders",
        "rationale": "The role and regulated delivery context are immediately recognizable.",
        "missingContext": "Company-size boundaries could be tested."
      },
      {
        "id": "problem-relevance",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "without rebuilding the audit trail by hand",
        "rationale": "The copy names a concrete workflow problem at the release decision point.",
        "missingContext": "The cost of delayed releases could add commercial context."
      },
      {
        "id": "differentiation",
        "score": 4,
        "confidence": "medium",
        "evidenceQuote": "one review queue for deployment evidence, policy checks, and named approvals",
        "rationale": "The integrated review mechanism is distinct, though no direct competitive proof is supplied.",
        "missingContext": "A validated contrast with manual workflows and internal tools."
      },
      {
        "id": "value-articulation",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "audit-packet preparation fell from a median of four hours to 45 minutes",
        "rationale": "A specific mechanism is tied to a bounded workflow result.",
        "missingContext": "Longer-term deployment or audit outcomes."
      },
      {
        "id": "clarity",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "AI-assisted checks flag missing evidence against policies your team configures; your release owner makes the final decision.",
        "rationale": "The system action and human decision boundary are clear.",
        "missingContext": "No material clarity gap in this short asset."
      },
      {
        "id": "evidence-and-credibility",
        "score": 4,
        "confidence": "medium",
        "evidenceQuote": "In a 12-team pilot",
        "rationale": "The claim is scoped and qualified, but study design and sample details are absent.",
        "missingContext": "Pilot method, participants, and measurement definition."
      },
      {
        "id": "narrative-consistency",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "deployment evidence, policy checks, and named approvals",
        "rationale": "Audience, problem, mechanism, proof, and oversight reinforce one positioning.",
        "missingContext": "No material narrative gap in this short asset."
      },
      {
        "id": "responsible-ai-claims",
        "score": 4,
        "confidence": "high",
        "evidenceQuote": "your release owner makes the final decision",
        "rationale": "AI is bounded to configured-policy checks and human accountability is explicit.",
        "missingContext": "The data used by the checks and known failure modes are not explained."
      }
    ],
    "summary": {
      "priorityFindings": [
        "Preserve the clear human decision boundary.",
        "Substantiate the pilot result with a short methodology note.",
        "Test the one-review-queue contrast against internal scripts and manual checklists."
      ],
      "riskyClaims": [
        "The pilot result needs an accessible definition and methodology before public use."
      ],
      "nextTest": "Run message comprehension and alternative-comparison interviews with six platform engineering leaders in regulated software companies.",
      "humanNotes": "Fictional fixture used to test a strong but not perfect review."
    },
    "manualReview": {
      "status": "reviewed"
    },
    "calculation": {
      "score": 93,
      "applicableWeight": 100,
      "excludedDimensionIds": [],
      "criticalFlagCodes": []
    }
  };
}

export function cloneRelayboardExample() {
  return {
    "schemaVersion": "1.0.0",
    "appVersion": "1.0.0",
    "rubricVersion": "1.0.0",
    "metadata": {
      "assetName": "RelayBoard campaign brief hero",
      "assetVersion": "Test fixture v1",
      "reviewerType": "human",
      "reviewedAt": "2026-09-19T00:00:00.000Z",
      "audience": "Campaign operations managers at multi-region B2B companies",
      "journeyStage": "Problem aware",
      "buyingTrigger": "A launch is at risk because regional approvals are spread across email and spreadsheets",
      "alternatives": "Email threads, shared spreadsheets, project-management boards, or manual status meetings",
      "suppliedEvidence": "Fictional non-AI example created only to test N/A normalization."
    },
    "sourceMessaging": "Move every regional campaign approval into one accountable launch board.\n\nRelayBoard shows campaign operations managers which market, owner, and approval is blocking a launch. Replace status-chasing across email and spreadsheets with a shared decision trail before your next multi-region campaign goes live.",
    "dimensions": [
      {
        "id": "icp-specificity",
        "score": 4,
        "confidence": "high",
        "evidenceQuote": "campaign operations managers",
        "rationale": "The operating role and multi-region launch context are specific.",
        "missingContext": "Company maturity and campaign volume."
      },
      {
        "id": "problem-relevance",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "which market, owner, and approval is blocking a launch",
        "rationale": "The problem and its consequence are expressed in workflow terms.",
        "missingContext": "Evidence of how often this blocks launch."
      },
      {
        "id": "differentiation",
        "score": 4,
        "confidence": "medium",
        "evidenceQuote": "a shared decision trail",
        "rationale": "The decision trail distinguishes the offer from fragmented status tools, but the contrast is not proven.",
        "missingContext": "Direct comparison with project-management boards."
      },
      {
        "id": "value-articulation",
        "score": 4,
        "confidence": "high",
        "evidenceQuote": "Replace status-chasing across email and spreadsheets",
        "rationale": "The workflow mechanism and operational benefit are connected.",
        "missingContext": "A validated outcome beyond reduced status-chasing."
      },
      {
        "id": "clarity",
        "score": 5,
        "confidence": "high",
        "evidenceQuote": "one accountable launch board",
        "rationale": "The category, workflow, and value can be understood quickly.",
        "missingContext": "No material clarity gap in this short asset."
      },
      {
        "id": "evidence-and-credibility",
        "score": 3,
        "confidence": "medium",
        "evidenceQuote": "before your next multi-region campaign goes live",
        "rationale": "The message is proportionate but offers no customer or product evidence.",
        "missingContext": "Customer proof or demonstrated product behavior."
      },
      {
        "id": "narrative-consistency",
        "score": 4,
        "confidence": "high",
        "evidenceQuote": "regional campaign approval",
        "rationale": "The audience, approval problem, and launch-board mechanism remain aligned.",
        "missingContext": "A sharper reason to believe could reinforce the narrative."
      },
      {
        "id": "responsible-ai-claims",
        "score": null,
        "confidence": "not-applicable",
        "evidenceQuote": "",
        "rationale": "The asset makes no AI claim, so this dimension is not applicable.",
        "missingContext": ""
      }
    ],
    "summary": {
      "priorityFindings": [
        "Keep the role, launch moment, and approval blockage explicit.",
        "Prove the shared-decision-trail advantage against project-management boards.",
        "Add one bounded customer or product proof point."
      ],
      "riskyClaims": [],
      "nextTest": "Ask six campaign operations managers to compare this message with their current launch-control process and name what they believe RelayBoard replaces.",
      "humanNotes": "Fictional non-AI fixture used to test N/A normalization."
    },
    "manualReview": {
      "status": "reviewed"
    },
    "calculation": {
      "score": 84.4,
      "applicableWeight": 90,
      "excludedDimensionIds": [
        "responsible-ai-claims"
      ],
      "criticalFlagCodes": []
    }
  };
}
