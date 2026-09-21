import { awarenessIndicator } from "./awareness.js";
import { diagnoseReview, prepareImportedReview, importContextErrors } from "./diagnostics.js";
import { STRATEGY_FIELDS, strategyRecord, strategyMarkdown } from "./strategy.js";
import { reviewToJson, reviewToMarkdown, exportFilename } from "./export.js";
import { generateEvaluationPrompt } from "./prompt.js";
import { DIMENSIONS } from "./rubric.js";
import { cloneSignalsDeskExample, cloneReleaseGuardExample, cloneRelayboardExample } from "./sample-data.js";
import { calculateScore } from "./scoring.js";
import { calculationFor, parseReviewJson, SCHEMA_VERSION, validateReview } from "./validation.js";
import { APP_VERSION, RUBRIC_VERSION } from "./config.js";

const byId = (id) => document.getElementById(id);
let activeReviewedAt = new Date().toISOString();

function makeElement(tag, { className, text, id } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (id) element.id = id;
  return element;
}

function field(labelText, control) {
  const wrapper = makeElement("div", { className: "field" });
  const label = makeElement("label", { text: labelText });
  label.htmlFor = control.id;
  wrapper.append(label, control);
  return wrapper;
}

function makeSelect(id, options) {
  const select = makeElement("select", { id });
  for (const { value, label } of options) {
    const option = makeElement("option", { text: label });
    option.value = value;
    select.append(option);
  }
  return select;
}

function makeTextarea(id, rows = 3) {
  const textarea = makeElement("textarea", { id });
  textarea.rows = rows;
  return textarea;
}

function markRequired(control) {
  control.required = true;
  control.setAttribute("aria-required", "true");
  return control;
}

function setMessage(element, message, tone = "neutral") {
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
  element.hidden = !message;
}

function showErrors(errors) {
  const summary = byId("error-summary");
  const messages = Array.isArray(errors) ? errors : [String(errors)];
  setMessage(summary, messages.map((message) => `• ${message}`).join("\n"), "error");
  if (summary && !summary.hasAttribute("tabindex")) summary.tabIndex = -1;
  summary?.focus();
}

function clearErrors() {
  setMessage(byId("error-summary"), "");
}

function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
    dialog.hidden = false;
  }
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else {
    dialog.removeAttribute("open");
    dialog.hidden = true;
  }
}

function ensureManualReviewControl() {
  if (byId("manual-review-status")) return;
  const humanNotes = byId("human-notes");
  if (!humanNotes) return;

  const select = makeSelect("manual-review-status", [
    { value: "pending", label: "Pending human review" },
    { value: "reviewed", label: "Reviewed by a human" },
  ]);
  const wrapper = field("Manual review state", select);
  wrapper.classList.add("field-group", "manual-review-control");

  const notesField = humanNotes.closest(".field") || humanNotes.parentElement;
  if (notesField && typeof notesField.after === "function") notesField.after(wrapper);
  else humanNotes.parentElement?.append(wrapper);
}

function renderDimensions(values = []) {
  const container = byId("dimensions");
  if (!container) return;
  container.replaceChildren();
  const valueById = new Map(values.map((value) => [value.id, value]));

  DIMENSIONS.forEach((dimension, index) => {
    const value = valueById.get(dimension.id);
    const card = makeElement("fieldset", { className: "dimension-card" });
    card.dataset.dimensionId = dimension.id;

    const legend = makeElement("legend", { className: "dimension-card__header" });
    const title = makeElement("span", { text: `${index + 1}. ${dimension.name}` });
    const meta = makeElement("span", {
      className: "dimension-card__meta",
      text: `${dimension.weight}%`,
    });
    legend.append(title, meta);

    const question = makeElement("p", { text: dimension.question });
    const grid = makeElement("div", { className: "dimension-grid" });
    const score = markRequired(makeSelect(`score-${dimension.id}`, [
      { value: "", label: "Choose a score" },
      ...[1, 2, 3, 4, 5].map((number) => ({ value: String(number), label: `${number} / 5` })),
      { value: "na", label: "N/A" },
    ]));
    score.dataset.field = "score";
    score.value = value?.score === null ? "na" : value?.score ? String(value.score) : "";

    const confidence = markRequired(makeSelect(`confidence-${dimension.id}`, [
      { value: "", label: "Choose confidence" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "not-applicable", label: "Not applicable" },
    ]));
    confidence.dataset.field = "confidence";
    confidence.value = value?.confidence || "";

    const quote = makeTextarea(`evidence-${dimension.id}`, 2);
    quote.dataset.field = "evidenceQuote";
    quote.value = value?.evidenceQuote || "";
    quote.placeholder = "Paste an exact quote from the source messaging";

    const rationale = markRequired(makeTextarea(`rationale-${dimension.id}`, 3));
    rationale.dataset.field = "rationale";
    rationale.value = value?.rationale || "";

    const missing = makeTextarea(`missing-${dimension.id}`, 2);
    missing.dataset.field = "missingContext";
    missing.value = value?.missingContext || "";

    score.addEventListener("change", () => {
      const isNotApplicable = score.value === "na";
      if (isNotApplicable) {
        confidence.value = "not-applicable";
        quote.value = "";
      } else if (confidence.value === "not-applicable") {
        confidence.value = "";
      }
      quote.disabled = isNotApplicable;
      quote.required = !isNotApplicable;
      quote.setAttribute("aria-required", String(!isNotApplicable));
    });
    quote.disabled = score.value === "na";
    quote.required = score.value !== "na";
    quote.setAttribute("aria-required", String(score.value !== "na"));

    grid.append(
      field("Score *", score),
      field("Confidence *", confidence),
      field("Exact source evidence *", quote),
      field("Rationale *", rationale),
      field("Missing context", missing),
    );

    const anchors = makeElement("details", { className: "anchor-list" });
    const anchorsSummary = makeElement("summary", { text: "Scoring anchors" });
    const anchorList = makeElement("ul");
    for (const anchor of [1, 3, 5]) {
      const item = makeElement("li", { text: `${anchor}: ${dimension.anchors[anchor]}` });
      anchorList.append(item);
    }
    anchors.append(anchorsSummary, anchorList);
    card.append(legend, question, grid, anchors);
    container.append(card);
  });
}

function getValue(id) {
  return byId(id)?.value?.trim() || "";
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value ?? "";
}

function parseLines(value) {
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function collectMetadata() {
  return {
    assetName: getValue("asset-name"),
    assetVersion: getValue("asset-version"),
    reviewerType: getValue("reviewer-type"),
    reviewedAt: activeReviewedAt,
    audience: getValue("audience"),
    journeyStage: getValue("journey-stage"),
    buyingTrigger: getValue("buying-trigger"),
    alternatives: getValue("alternatives"),
    suppliedEvidence: getValue("supplied-evidence"),
  };
}

function requiredContextErrors() {
  const required = [
    ["asset-name", "Asset name"],
    ["reviewer-type", "Review method"],
    ["journey-stage", "Awareness stage"],
    ["audience", "Intended audience"],
    ["buying-trigger", "Buying trigger"],
    ["alternatives", "Alternatives considered"],
    ["source-messaging", "Source messaging"],
  ];
  return required
    .filter(([id]) => getValue(id).length === 0)
    .map(([, label]) => `${label} is required before generating a prompt.`);
}

function collectDimensions() {
  return DIMENSIONS.map(({ id }) => {
    const card = document.querySelector(`[data-dimension-id="${id}"]`);
    const scoreValue = card?.querySelector('[data-field="score"]')?.value ?? "";
    return {
      id,
      score: scoreValue === "na" ? null : scoreValue ? Number(scoreValue) : undefined,
      confidence: card?.querySelector('[data-field="confidence"]')?.value || "",
      evidenceQuote: card?.querySelector('[data-field="evidenceQuote"]')?.value || "",
      rationale: card?.querySelector('[data-field="rationale"]')?.value || "",
      missingContext: card?.querySelector('[data-field="missingContext"]')?.value || "",
    };
  });
}

function collectReview() {
  const dimensions = collectDimensions();
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    rubricVersion: RUBRIC_VERSION,
    metadata: collectMetadata(),
    sourceMessaging: byId("source-messaging")?.value || "",
    dimensions,
    summary: {
      priorityFindings: parseLines(getValue("priority-findings")),
      riskyClaims: parseLines(getValue("risky-claims")),
      nextTest: getValue("next-test"),
      humanNotes: getValue("human-notes"),
    },
    manualReview: {
      status: byId("manual-review-status")?.value || "pending",
    },
    calculation: calculationFor(dimensions),
  };
}

function updateAwarenessIndicator() {
  setMessage(byId("awareness-indicator"), awarenessIndicator(getValue("journey-stage")));
}

function populateReview(review) {
  activeReviewedAt = review.metadata.reviewedAt;
  const stageSelect = byId("journey-stage");
  stageSelect.querySelectorAll("[data-legacy-stage]").forEach(option => option.remove());
  if (![...stageSelect.options].some(option => option.value === review.metadata.journeyStage)) {
    const option = makeElement("option", {text: `Previously saved: ${review.metadata.journeyStage}`});
    option.value = review.metadata.journeyStage;
    option.dataset.legacyStage = "true";
    stageSelect.append(option);
  }
  const map = {
    "asset-name": review.metadata.assetName,
    "asset-version": review.metadata.assetVersion,
    "reviewer-type": review.metadata.reviewerType,
    audience: review.metadata.audience,
    "journey-stage": review.metadata.journeyStage,
    "buying-trigger": review.metadata.buyingTrigger,
    alternatives: review.metadata.alternatives,
    "supplied-evidence": review.metadata.suppliedEvidence,
    "source-messaging": review.sourceMessaging,
    "priority-findings": review.summary.priorityFindings.join("\n"),
    "risky-claims": review.summary.riskyClaims.join("\n"),
    "next-test": review.summary.nextTest,
    "human-notes": review.summary.humanNotes,
    "manual-review-status": review.manualReview.status,
  };
  Object.entries(map).forEach(([id, value]) => setValue(id, value));
  updateAwarenessIndicator();
  renderDimensions(review.dimensions);
  updateProgress();
}

function renderResults(review) {
  const scoreResult = calculateScore(review.dimensions);
  const diagnostic = diagnoseReview(review);
  setMessage(byId('diagnostic-status'), diagnostic.status);
  const warnings = byId('diagnostic-warnings');
  warnings.replaceChildren(...diagnostic.warnings.map(text => makeElement('li', {text})));
  setMessage(byId('score-sensitivity'), `One-point sensitivity: ${diagnostic.sensitivity.min}–${diagnostic.sensitivity.max}/100 if every applicable rating moves down or up by one. This is a scenario, not a statistical confidence interval.`);
  setMessage(byId("overall-score"), String(scoreResult.score));
  setMessage(byId("applicable-weight"), `${scoreResult.applicableWeight}%`);

  const flags = byId("risk-flags");
  if (flags) {
    flags.replaceChildren();
    if (scoreResult.criticalFlags.length === 0) {
        flags.append(makeElement("li", { text: "No critical score flags were triggered." }));
    } else {
      scoreResult.criticalFlags.forEach(({ message }) => {
        flags.append(makeElement("li", { className: "risk-flag", text: message }));
      });
    }
  }

  const bars = byId("score-bars");
  if (bars) {
    bars.replaceChildren();
    const recordById = new Map(review.dimensions.map((record) => [record.id, record]));
    DIMENSIONS.forEach((dimension) => {
      const record = recordById.get(dimension.id);
      const row = makeElement("div", { className: "score-bar" });
      const label = makeElement("div", {
        className: "score-bar__label",
        text: `${dimension.name}: ${record.score === null ? "N/A" : `${record.score}/5`}`,
      });
      const track = makeElement("div", { className: "score-bar__track" });
      const fill = makeElement("div", { className: "score-bar__fill" });
      fill.style.width = record.score === null ? "0%" : `${(record.score / 5) * 100}%`;
      track.append(fill);
      row.append(label, track);
      bars.append(row);
    });
  }

  const results = byId("results");
  if (results) results.hidden = false;
  setExportEnabled(true);
}

function setExportEnabled(enabled) {
  for (const id of ["export-markdown", "export-json"]) {
    const button = byId(id);
    if (button) button.disabled = !enabled;
  }
}

function calculateAndRender() {
  clearErrors();
  try {
    const review = collectReview();
    const validation = validateReview(review);
    if (!validation.valid) {
      showErrors(validation.errors);
      setExportEnabled(false);
      const results = byId("results");
      if (results) results.hidden = true;
      setMessage(byId("status-message"), "");
      return null;
    }
    renderResults(review);
    setMessage(byId("status-message"), "Score calculated locally. Human review is still required.", "success");
    return review;
  } catch (error) {
    showErrors(error.message);
    setExportEnabled(false);
    const results = byId("results");
    if (results) results.hidden = true;
    setMessage(byId("status-message"), "");
    return null;
  }
}

function download(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportReview(format) {
  clearErrors();
  try {
    const review = collectReview();
    if (format === "json") {
      download(reviewToJson(review), exportFilename(review.metadata.assetName, "json"), "application/json");
    } else {
      download(reviewToMarkdown(review), exportFilename(review.metadata.assetName, "md"), "text/markdown");
    }
    setMessage(byId("status-message"), `${format.toUpperCase()} review exported.`, "success");
  } catch (error) {
    showErrors(error.message.split("\n"));
  }
}

function clearReview() {
  activeReviewedAt = new Date().toISOString();
  byId("review-form")?.reset();
  byId("journey-stage").querySelectorAll("[data-legacy-stage]").forEach(option => option.remove());
  updateAwarenessIndicator();
  setValue("generated-prompt", "");
  setValue("import-json", "");
  renderDimensions();
  updateProgress();
  setMessage(byId("strategy-status"), "");
  setValue("priority-findings", "");
  setValue("risky-claims", "");
  setValue("next-test", "");
  setValue("human-notes", "");
  setValue("manual-review-status", "pending");
  const results = byId("results");
  if (results) results.hidden = true;
  setExportEnabled(false);
  byId("risk-flags")?.replaceChildren();
  byId("score-bars")?.replaceChildren();
  clearErrors();
  setMessage(byId("status-message"), "Review cleared. Nothing was saved.", "neutral");
}

function updateProgress() {
  const count = collectDimensions().filter(d => (d.score === null || (d.score >= 1 && d.score <= 5)) && d.rationale.trim() && d.confidence && (d.score === null || d.evidenceQuote.trim())).length;
  setMessage(byId('review-progress'), `${count} of 8 dimensions filled`);
}

function init() {
  const form = byId("review-form");
  if (!form) return;

  for (const [id,label,placeholder] of STRATEGY_FIELDS) {
    const input = makeTextarea(id, 3);
    input.placeholder = placeholder;
    byId('strategy-fields').append(field(label,input));
  }
  byId('export-strategy').addEventListener('click', () => {
    try {
      const record = strategyRecord(collectMetadata(),byId('source-messaging').value,Object.fromEntries(STRATEGY_FIELDS.map(([id])=>[id,getValue(id)])));
      download(strategyMarkdown(record),exportFilename(record.assetName+'-category-stress-test','md'),'text/markdown');
      setMessage(byId('strategy-status'),'Category stress test exported as a draft for human decision.','success');
    } catch (error) {setMessage(byId('strategy-status'),error.message,'error');}
  });
  byId("journey-stage").addEventListener("change", updateAwarenessIndicator);
  ensureManualReviewControl();
  renderDimensions();
  setExportEnabled(false);

  const invalidateRenderedResult = (event) => {
    updateProgress();
    if (event?.target.id !== 'manual-review-status') setValue('manual-review-status','pending');
    setMessage(byId('strategy-status'),'');
    const results = byId("results");
    if (results && !results.hidden) {
      results.hidden = true;
      setExportEnabled(false);
      setMessage(byId("status-message"), "Review changed. Recalculate before exporting.", "neutral");
    }
  };
  form.addEventListener("input", invalidateRenderedResult);
  form.addEventListener("change", invalidateRenderedResult);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateAndRender();
  });

  const calculateButton = byId("calculate");
  calculateButton?.addEventListener("click", (event) => {
    if (calculateButton.type !== "submit") {
      event.preventDefault();
      calculateAndRender();
    }
  });

  byId("load-example")?.addEventListener("click", (event) => {
    event.preventDefault();
    const examples = { signalsdesk: cloneSignalsDeskExample, releaseguard: cloneReleaseGuardExample, relayboard: cloneRelayboardExample };
    const review = prepareImportedReview(examples[byId('example-choice').value]());
    STRATEGY_FIELDS.forEach(([id])=>setValue(id,''));
    setMessage(byId('strategy-status'),'');
    populateReview(review);
    renderResults(review);
    clearErrors();
    setMessage(byId("status-message"), `Loaded fictional example: ${review.metadata.assetName}. ${review.calculation.score}/100. Human review pending.`, "success");
  });

  byId("generate-prompt")?.addEventListener("click", (event) => {
    event.preventDefault();
    const contextErrors = requiredContextErrors();
    if (contextErrors.length > 0) {
      showErrors(contextErrors);
      form.reportValidity?.();
      return;
    }
    clearErrors();
    const prompt = generateEvaluationPrompt({
      metadata: collectMetadata(),
      sourceMessaging: byId("source-messaging")?.value || "",
    });
    setValue("generated-prompt", prompt);
    openDialog(byId("prompt-dialog"));
  });

  byId("copy-prompt")?.addEventListener("click", async (event) => {
    event.preventDefault();
    const prompt = byId("generated-prompt");
    if (!prompt) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(prompt.value);
      setMessage(byId("status-message"), "Prompt copied to the clipboard.", "success");
    } catch {
      prompt.focus();
      prompt.select();
      setMessage(byId("status-message"), "Clipboard access is unavailable. The prompt is selected for copying.", "neutral");
    }
  });
  byId("close-prompt")?.addEventListener("click", (event) => {
    event.preventDefault();
    closeDialog(byId("prompt-dialog"));
  });

  byId("open-import")?.addEventListener("click", (event) => {
    event.preventDefault();
    setMessage(byId("import-errors"), "");
    openDialog(byId("import-dialog"));
  });
  byId("close-import")?.addEventListener("click", (event) => {
    event.preventDefault();
    closeDialog(byId("import-dialog"));
  });
  byId("apply-import")?.addEventListener("click", (event) => {
    event.preventDefault();
    const result = parseReviewJson(byId("import-json")?.value || "");
    if (!result.valid) {
      setMessage(byId("import-errors"), result.errors.map((message) => `• ${message}`).join("\n"), "error");
      return;
    }
    const contextErrors = importContextErrors(result.review,{metadata:collectMetadata(),sourceMessaging:byId('source-messaging').value});
    if (contextErrors.length) {setMessage(byId('import-errors'),contextErrors.join('\n'),'error'); return;}
    const imported = prepareImportedReview(result.review);
    populateReview(imported);
    renderResults(imported);
    setMessage(byId("import-errors"), "");
    clearErrors();
    closeDialog(byId("import-dialog"));
    setMessage(byId("status-message"), "Imported as a draft. Previous notes are preserved; human review must be recorded again.", "success");
  });

  byId("export-markdown")?.addEventListener("click", (event) => {
    event.preventDefault();
    exportReview("markdown");
  });
  byId("export-json")?.addEventListener("click", (event) => {
    event.preventDefault();
    exportReview("json");
  });
  byId("clear-review")?.addEventListener("click", (event) => {
    event.preventDefault();
    clearReview();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}
