export const AWARENESS_STAGES = [
  ["Unaware", "The prospect does not yet recognise that they have a problem worth solving."],
  ["Problem aware", "The prospect feels a pain and knows they have a problem."],
  ["Solution aware", "The prospect knows that solutions to their problem exist."],
  ["Product aware", "The prospect knows your product or service is one of the available solutions."],
  ["Most aware", "The prospect believes your product or service is the right solution."],
];
export function awarenessIndicator(stage) {
  return AWARENESS_STAGES.find(([name]) => name === stage)?.[1] || (stage ? "Previously saved stage. Select one of the five awareness stages to update this review." : "Choose what the prospect already knows before reading this asset.");
}
