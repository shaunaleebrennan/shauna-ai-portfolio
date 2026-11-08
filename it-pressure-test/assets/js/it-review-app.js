import { profiles, buyingRoles } from "./it-engine.js?v=4.0";
import { VERSION, CRITERIA, NAMES, ANCHORS, NEEDS, prepare, ratingComplete, score, band, priorities, buildPrompt, parseAIReview, summary } from "./review.js?v=4.0";
import { EXAMPLE } from "./it-example.js?v=4.0";

const $ = (selector) => document.querySelector(selector);
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) if (child != null && child !== false) node.append(child);
  return node;
};
const pad = (n) => String(n).padStart(2, "0");

let ratings = {};
let prepared = null;
let reviewing = false;

function context() {
  return {
    persona: $("#persona").value,
    buyingRole: $("#buying-role").value,
    goal: $("#goal").value,
    assetType: $("#asset-type").value,
    region: "global",
    awareness: "Problem aware",
    alternatives: $("#alternatives").value.trim(),
    proof: $("#proof").value.trim(),
    message: $("#message").value.trim(),
  };
}
const profile = () => profiles[$("#persona").value];
const role = () => buyingRoles[$("#buying-role").value];

function lensNote() {
  const p = profile();
  const r = role();
  $("#persona-preview").textContent = `${p.name}: ${p.summary} Looks for ${p.cares}. ${r.name}: ${r.summary}`;
}

function words() {
  const n = ($("#message").value.match(/\b[\w’'-]+\b/g) || []).length;
  $("#word-count").textContent = `${n} word${n === 1 ? "" : "s"}`;
}

function toast(message) {
  const t = $("#toast");
  t.textContent = message;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 2000);
}

async function copy(text, message) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const area = el("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  toast(message);
}

/* ---------- Review ---------- */
function criterionCard(id, index) {
  const ctx = context();
  const weight = prepared.weights[id];
  const rating = ratings[id] || {};
  const levels = el("fieldset", { class: "levels" },
    el("legend", { class: "sr-only", text: `${NAMES[id]}: choose a level` }),
    ANCHORS[id].map((anchor, level) => el("label", { class: "level" },
      el("input", { type: "radio", name: `level-${id}`, value: String(level), checked: rating.level === level }),
      el("span", { class: "lv-num", text: String(level) }),
      el("span", { class: "lv-text", text: anchor }))));

  const select = el("select", { id: `quote-${id}` },
    el("option", { value: "", text: "Choose a passage from the copy…" }),
    prepared.passages.map((passage) => el("option", { value: passage, text: passage.length > 110 ? `${passage.slice(0, 107)}…` : passage })));
  if (rating.quote && !prepared.passages.includes(rating.quote)) select.append(el("option", { value: rating.quote, text: `AI quote: ${rating.quote}` }));
  select.value = rating.quote || "";

  const suggestion = prepared.suggestions[id];
  const suggest = suggestion
    ? el("p", { class: "suggest" }, el("span", { text: "Rules point to: " }), el("q", { text: suggestion }), " ", el("button", { type: "button", class: "link-button", "data-use": id, text: "Use this passage" }))
    : el("p", { class: "suggest", text: "The rules found no obvious passage. That doesn’t mean there isn’t one." });

  const note = el("textarea", { id: `note-${id}`, rows: "2", placeholder: "Why this level? (optional)" });
  note.value = rating.note || "";

  const state = el("span", { class: "crit-state", id: `state-${id}` });
  const card = el("li", { class: "criterion", id: `crit-${id}`, "data-id": id },
    el("div", { class: "crit-head" },
      el("span", { class: "crit-num", text: pad(index + 1) }),
      el("div", {}, el("h3", { text: NAMES[id] }), el("p", { class: "crit-q", text: profile().questions[id] })),
      el("div", { class: "crit-side" }, el("span", { class: "crit-weight", text: `${weight} pts` }), state)),
    levels,
    el("div", { class: "evidence" }, el("label", { for: `quote-${id}`, text: "Passage that earns this level" }), select, suggest,
      el("p", { class: "evidence-error", id: `need-${id}`, hidden: true, text: "Choose the passage that earns this level. Level 0 needs no passage." })),
    el("details", { class: "note" }, el("summary", { text: "Add a note" }), note),
    el("div", { class: "draft-bar", id: `draft-${id}`, hidden: true },
      el("span", { text: "AI draft. Check the level and passage, then confirm or change it." }),
      el("button", { type: "button", class: "button small", "data-confirm": id, text: "Confirm" })));
  return card;
}

function renderReview() {
  const ctx = context();
  prepared = prepare(ctx);
  const required = CRITERIA.filter((id) => prepared.weights[id] > 0);
  for (const id of Object.keys(ratings)) if (!required.includes(id)) delete ratings[id];
  $("#criteria").replaceChildren(...required.map(criterionCard));
  const skipped = CRITERIA.filter((id) => !prepared.weights[id]);
  $("#not-needed").textContent = skipped.length
    ? `Not needed for a ${prepared.format.toLowerCase()} at the ${prepared.stage.split(":")[0]} stage: ${skipped.map((id) => NAMES[id]).join(", ")}.`
    : "";
  required.forEach(updateCriterion);
  updateVerdict();
}

function updateCriterion(id) {
  const rating = ratings[id];
  const done = ratingComplete(rating, context().message);
  const needsQuote = rating && rating.level > 0 && !done;
  const card = $(`#crit-${id}`);
  if (!card) return;
  card.classList.toggle("is-done", done);
  card.classList.toggle("is-draft", done && rating.source === "ai");
  $(`#need-${id}`).hidden = !needsQuote;
  $(`#draft-${id}`).hidden = !(rating && rating.source === "ai");
  $(`#state-${id}`).textContent = !rating || rating.level == null ? "Not rated" : needsQuote ? "Needs a passage" : rating.source === "ai" ? "AI draft" : `Level ${rating.level}`;
}

function updateVerdict() {
  const ctx = context();
  const result = score(prepared.weights, ratings, ctx.message);
  $("#verdict").hidden = false;
  $("#score").textContent = result.complete ? String(result.total) : "–";
  $("#ring").style.setProperty("--score", result.complete ? result.total : Math.round((result.rated.length / result.required.length) * 100));
  $("#ring").classList.toggle("is-partial", !result.complete);
  $("#ring").setAttribute("aria-label", result.complete ? `Score ${result.total} out of 100` : `${result.rated.length} of ${result.required.length} questions rated`);
  $("#verdict-title").textContent = result.complete ? band(result.total) : `${result.rated.length} of ${result.required.length} questions rated`;
  $("#verdict-meta").textContent = `${profile().name} · ${prepared.stage} · ${prepared.format}`;
  $("#verdict-drafts").hidden = !result.drafts.length;
  $("#verdict-drafts").textContent = result.drafts.length ? `Includes ${result.drafts.length} AI-drafted rating${result.drafts.length === 1 ? "" : "s"} you haven’t confirmed yet.` : "";

  const order = priorities(prepared.weights, ratings, ctx.message);
  $("#priorities").replaceChildren(...(order.length
    ? order.slice(0, 3).map((id) => el("li", {}, el("strong", { text: NAMES[id] }), el("span", { text: NEEDS[id][Math.min(3, ratings[id].level)] })))
    : [el("li", { class: "muted", text: result.rated.length ? "No gaps in the questions rated so far." : "Rate the questions above to see what to change first." })]));

  const asks = [...order, ...CRITERIA.filter((id) => prepared.weights[id] > 0)].filter((id, i, all) => all.indexOf(id) === i).slice(0, ctx.alternatives ? 2 : 3);
  $("#questions").replaceChildren(...asks.map((id) => el("li", { text: profile().questions[id] })),
    ...(ctx.alternatives ? [el("li", { text: `Compared with ${ctx.alternatives}, what can you prove is different?` })] : []));

  $("#claims").replaceChildren(...(prepared.claims.length
    ? prepared.claims.map((claim) => el("li", {}, el("q", { text: claim.quote }), el("span", { text: claim.need })))
    : [el("li", { class: "muted", text: "No numbers, absolutes or comparisons flagged. Still check every claim against an approved source." })]));
}

function start() {
  const message = $("#message").value.trim();
  const error = $("#start-error");
  if (!message) {
    error.textContent = "Paste the copy you want to review first.";
    error.hidden = false;
    $("#message").focus();
    return;
  }
  error.hidden = true;
  reviewing = true;
  $("#review").hidden = false;
  renderReview();
  $("#review").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function stopReview() {
  reviewing = false;
  ratings = {};
  prepared = null;
  $("#review").hidden = true;
  $("#verdict").hidden = true;
  $("#ai-errors").hidden = true;
  $("#ai-reply").value = "";
}

/* ---------- Events ---------- */
$("#start").addEventListener("click", start);
$("#clear").addEventListener("click", () => {
  $("#context").reset();
  $("#message").value = "";
  stopReview();
  lensNote();
  words();
});
$("#load-example").addEventListener("click", () => {
  $("#context").reset();
  for (const [id, value] of Object.entries(EXAMPLE.context)) $(`#${id}`).value = value;
  $("#message").value = EXAMPLE.message;
  stopReview();
  lensNote();
  words();
  start();
});
$("#message").addEventListener("input", () => {
  words();
  if (reviewing) {
    stopReview();
    $("#start-error").textContent = "The copy changed, so the review was cleared. Start again when you’re ready.";
    $("#start-error").hidden = false;
  }
});
for (const id of ["persona", "goal", "asset-type", "buying-role"]) {
  $(`#${id}`).addEventListener("change", () => { lensNote(); if (reviewing) renderReview(); });
}
for (const id of ["alternatives", "proof"]) $(`#${id}`).addEventListener("input", () => { if (reviewing) updateVerdict(); });

$("#criteria").addEventListener("change", (event) => {
  const card = event.target.closest(".criterion");
  if (!card) return;
  const id = card.dataset.id;
  const rating = ratings[id] || {};
  if (event.target.name === `level-${id}`) rating.level = Number(event.target.value);
  if (event.target.id === `quote-${id}`) rating.quote = event.target.value;
  rating.source = "human";
  ratings[id] = rating;
  updateCriterion(id);
  updateVerdict();
});
$("#criteria").addEventListener("input", (event) => {
  const card = event.target.closest(".criterion");
  if (!card || event.target.tagName !== "TEXTAREA") return;
  const id = card.dataset.id;
  ratings[id] = { ...(ratings[id] || {}), note: event.target.value };
});
$("#criteria").addEventListener("click", (event) => {
  const use = event.target.closest("[data-use]");
  if (use) {
    const id = use.dataset.use;
    const select = $(`#quote-${id}`);
    const passage = prepared.suggestions[id];
    if (![...select.options].some((option) => option.value === passage)) select.append(el("option", { value: passage, text: passage }));
    select.value = passage;
    ratings[id] = { ...(ratings[id] || {}), quote: passage, source: "human" };
    updateCriterion(id);
    updateVerdict();
  }
  const confirm = event.target.closest("[data-confirm]");
  if (confirm) {
    const id = confirm.dataset.confirm;
    ratings[id] = { ...ratings[id], source: "human" };
    updateCriterion(id);
    updateVerdict();
  }
});

$("#copy-prompt").addEventListener("click", () => {
  if (!prepared) return;
  copy(buildPrompt(context(), profile(), prepared), "Prompt copied");
});
function applyReply(text) {
  const result = parseAIReview(text, context().message, prepared.weights);
  const list = $("#ai-errors");
  if (!result.ok) {
    list.replaceChildren(el("li", { class: "lead", text: "Nothing was applied:" }), ...result.errors.map((message) => el("li", { text: message })));
    list.hidden = false;
    return;
  }
  list.hidden = true;
  ratings = { ...ratings, ...result.ratings };
  renderReview();
  toast("AI draft applied. Confirm or change each rating.");
  $("#criteria").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}
$("#apply-ai").addEventListener("click", () => applyReply($("#ai-reply").value));
$("#example-reply").addEventListener("click", () => {
  if (context().message !== EXAMPLE.message) {
    const list = $("#ai-errors");
    list.replaceChildren(el("li", { text: "The sample reply only matches the example copy. Load the example first." }));
    list.hidden = false;
    return;
  }
  $("#ai-reply").value = JSON.stringify(EXAMPLE.reply, null, 2);
  applyReply($("#ai-reply").value);
});

const record = () => summary({ context: context(), profile: profile(), role: role(), prepared, ratings, result: score(prepared.weights, ratings, context().message) });
$("#copy-summary").addEventListener("click", () => { if (prepared) copy(record(), "Review copied"); });
$("#export").addEventListener("click", () => {
  if (!prepared) return;
  const link = el("a", { download: "it-pressure-test-review.md" });
  const url = URL.createObjectURL(new Blob([record()], { type: "text/markdown" }));
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.documentElement.dataset.version = VERSION;
lensNote();
words();
