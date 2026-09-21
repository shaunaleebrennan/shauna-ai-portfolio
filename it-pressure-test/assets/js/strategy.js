export const STRATEGY_FIELDS = [
  ['category-claim','Category claim','What category should you own, for whom, and why now?'],
  ['competitor-challenge','Strongest competitor argument','Why would a credible alternative reject your category or differentiation?'],
  ['analyst-challenge','Sceptical analyst argument','Is this a distinct category, a feature, or a relabelled existing market?'],
  ['customer-challenge','Sceptical customer argument','Why change from the current workflow? What would make switching not worth it?'],
  ['claim-response','Your response and trade-off','Defend the claim, narrow it, or explain why you would abandon it.'],
  ['claim-evidence','Evidence and remaining gaps','Name the sources and dates. Separate observed evidence from assumptions.'],
  ['disconfirming-test','What would change your mind?','Specify the audience, test, and result that would weaken or overturn the position.'],
  ['decision-owner','Accountable decision owner','Who is responsible for reviewing this decision?'],
];
export function strategyRecord(metadata,sourceMessaging,fields) {
  const errors=STRATEGY_FIELDS.filter(([id])=>!fields[id]?.trim()).map(([,label])=>`${label} is required.`);
  if (!sourceMessaging.trim() || !metadata.assetName.trim()) errors.push('Add an asset name and source messaging first.');
  if(errors.length) throw new Error(errors.join('\n'));
  return {type:'category-stress-test',version:'1.0.0',createdAt:new Date().toISOString(),status:'draft-for-human-decision',assetName:metadata.assetName,assetVersion:metadata.assetVersion,sourceMessaging,context:{awarenessStage:metadata.journeyStage,audience:metadata.audience,alternatives:metadata.alternatives,buyingTrigger:metadata.buyingTrigger},fields:Object.fromEntries(STRATEGY_FIELDS.map(([id])=>[id,fields[id].trim()]))};
}
export function strategyMarkdown(record) {
  return `# Category stress test: ${record.assetName}\n\nStatus: draft for human decision. This record does not grant publication approval.\n\nAsset version: ${record.assetVersion || 'Not supplied'}\nCreated: ${record.createdAt}\nAwareness stage: ${record.context.awarenessStage || 'Not supplied'}\nAudience: ${record.context.audience}\nAlternatives: ${record.context.alternatives}\nBuying trigger: ${record.context.buyingTrigger}\n\n## Source snapshot\n\n> ${record.sourceMessaging.replace(/\n/g,'\n> ')}\n\n${STRATEGY_FIELDS.map(([id,label])=>`## ${label}\n\n${record.fields[id]}`).join('\n\n')}\n`;
}
