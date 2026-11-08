/* A fictional example: the product, pilot and numbers are invented to show how the review works. */
const message = "IT teams already run three tools that can answer an employee’s question, and none of them knows your HR policy. So employees raise tickets, and the service desk answers the same policy questions every week. Workdesk reads the policy library you already keep in SharePoint and answers in Microsoft Teams, citing the paragraph it used. Your HR team stays the owner of every policy; Workdesk only reads what an employee’s existing permissions allow. In a 90-day pilot with 1,200 employees, policy tickets fell by 31% (pilot report, March 2026). Book a 20-minute walkthrough using your own policy library.";

export const EXAMPLE = Object.freeze({
  context: {
    persona: "workplace",
    goal: "shortlist",
    "asset-type": "Homepage / landing page",
    "buying-role": "champion",
    alternatives: "Microsoft Copilot, the service desk's virtual agent, doing nothing",
    proof: "Pilot report (fictional)",
  },
  message,
  reply: {
    version: "4.0",
    ratings: {
      relevance: { level: 4, quote: "IT teams already run three tools that can answer an employee’s question, and none of them knows your HR policy.", reason: "Names the buyer, the gap in tools they already own, and a reason to rethink the current approach." },
      value: { level: 4, quote: "In a 90-day pilot with 1,200 employees, policy tickets fell by 31% (pilot report, March 2026).", reason: "States a measured result with a population and a period." },
      fit: { level: 3, quote: "Workdesk reads the policy library you already keep in SharePoint and answers in Microsoft Teams, citing the paragraph it used.", reason: "Names the systems it works with and makes clear what stays in place." },
      trust: { level: 4, quote: "Your HR team stays the owner of every policy; Workdesk only reads what an employee’s existing permissions allow.", reason: "Gives a specific control, its owner and a boundary." },
      proof: { level: 1, quote: "(pilot report, March 2026)", reason: "Refers to a source, but the report is not linked or identifiable." },
      clarity: { level: 4, quote: "Book a 20-minute walkthrough using your own policy library.", reason: "Plain proposition with a low-risk next step suited to evaluation." },
    },
  },
});
