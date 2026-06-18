const storageKey = "eol-forecasting-suite-v1";
const weeksPerYear = 365.2425 / 7;
const boxWidth = 45;
const barWidth = 43;

const baselines = {
  global: { label: "Global average", female: 75.9, male: 70.8, intersex: 73.4 },
  us: { label: "United States", female: 80.2, male: 74.8, intersex: 77.5 },
  canada: { label: "Canada", female: 84.0, male: 80.0, intersex: 82.0 },
  uk: { label: "United Kingdom", female: 82.8, male: 79.0, intersex: 80.9 },
  "western-europe": { label: "Western Europe", female: 84.2, male: 79.6, intersex: 81.9 },
  "eastern-europe": { label: "Eastern Europe", female: 78.4, male: 68.9, intersex: 73.7 },
  "east-asia": { label: "East Asia", female: 82.9, male: 77.1, intersex: 80.0 },
  "south-asia": { label: "South Asia", female: 72.9, male: 69.7, intersex: 71.3 },
  "latin-america": { label: "Latin America", female: 78.6, male: 72.1, intersex: 75.4 },
  "middle-east-north-africa": { label: "Middle East & North Africa", female: 76.7, male: 72.3, intersex: 74.5 },
  "sub-saharan-africa": { label: "Sub-Saharan Africa", female: 64.6, male: 60.7, intersex: 62.7 },
  oceania: { label: "Oceania", female: 82.4, male: 78.5, intersex: 80.5 },
};

const labels = {
  smoking: ["Never", "Former", "Some", "Daily"],
  activity: ["Low", "Light", "Moderate", "High"],
  sleep: ["Poor", "Uneven", "Okay", "Strong"],
  stress: ["Low", "Medium", "High", "Severe"],
};

const adjustments = {
  smoking: [3, 1.5, -3.5, -10],
  activity: [-2.5, 0, 2.5, 4.5],
  sleep: [-3, -1, 1, 3.5],
  stress: [1, 0, -2, -3.5],
};

const form = document.querySelector("#forecast-form");
const output = document.querySelector("#forecast-output");
const resetButton = document.querySelector("#reset-button");
const copyButton = document.querySelector("#copy-output");

const today = new Date();
const defaultBirthday = new Date(today.getFullYear() - 38, today.getMonth() - 6, today.getDate());

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function yearsBetween(start, end) {
  return (end - start) / (1000 * 60 * 60 * 24 * 365.2425);
}

function readNumber(id, fallback = 0) {
  const value = Number(document.querySelector(`#${id}`).value);
  return Number.isFinite(value) ? value : fallback;
}

function selectedSex() {
  return new FormData(form).get("sex") || "intersex";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function line(content = "") {
  return `│${content.padEnd(boxWidth, " ")}│`;
}

function separator() {
  return `├${"─".repeat(boxWidth)}┤`;
}

function dataLine(label, value) {
  return line(` ${label.padEnd(20, " ")} ${String(value).padEnd(23, " ")}`);
}

function renderBar(percent) {
  const filled = clamp(Math.ceil((percent / 100) * barWidth), 0, barWidth);
  return "█".repeat(filled) + "░".repeat(barWidth - filled);
}

function renderBox(result) {
  return [
    `┌${"─".repeat(boxWidth)}┐`,
    line(" End-of-Life Forecasting Suite™"),
    separator(),
    dataLine("Forecast Horizon", `~${result.forecastYear}`),
    dataLine("Lifecycle Estimate", `${result.lifespanYears} years`),
    dataLine("System Runtime", `${result.runtimeYears.toFixed(2)} years`),
    separator(),
    dataLine("Utilization", `${result.percent.toFixed(1)}%`),
    line(` ${renderBar(result.percent)} `),
    separator(),
    dataLine("Capacity Consumed", `${result.weeksAlive.toLocaleString()} weeks`),
    dataLine("Capacity Remaining", `${result.weeksRemaining.toLocaleString()} weeks`),
    `└${"─".repeat(boxWidth)}┘`,
  ].join("\n");
}

function calculateAutomatic() {
  const birthdate = new Date(`${document.querySelector("#birthdate").value}T00:00:00`);
  const region = document.querySelector("#region").value;
  const sex = selectedSex();
  const ageYears = Math.max(0, yearsBetween(birthdate, today));
  const weeksAlive = Math.max(0, Math.floor(ageYears * weeksPerYear));

  const lifestyleAdjustment =
    adjustments.smoking[readNumber("smoking")] +
    adjustments.activity[readNumber("activity")] +
    adjustments.sleep[readNumber("sleep")] +
    adjustments.stress[readNumber("stress")];

  const estimate = baselines[region][sex] + lifestyleAdjustment;
  const lifespanYears = Math.round(clamp(estimate, ageYears + 1, 120));
  const totalWeeks = Math.round(lifespanYears * weeksPerYear);
  const weeksRemaining = Math.max(0, totalWeeks - weeksAlive);

  return {
    lifespanYears,
    weeksAlive,
    weeksRemaining,
    runtimeYears: ageYears,
    percent: clamp((weeksAlive / Math.max(1, totalWeeks)) * 100, 0, 100),
    forecastYear: today.getFullYear() + Math.ceil(weeksRemaining / weeksPerYear),
  };
}

function updateLabels() {
  for (const key of Object.keys(labels)) {
    document.querySelector(`#${key}-output`).value = labels[key][readNumber(key)];
  }
}

function saveForm() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.sex = selectedSex();
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function update() {
  updateLabels();

  const result = calculateAutomatic();
  output.textContent = renderBox(result);
  copyButton.textContent = "⧉";
  copyButton.setAttribute("aria-label", "Copy data");
  copyButton.title = "Copy data";
  saveForm();
}

function formatCopiedOutput(text) {
  return ["```", text, "```"].join("\n");
}

async function copyOutput() {
  const text = formatCopiedOutput(output.textContent);

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    copyButton.textContent = "✓";
    copyButton.setAttribute("aria-label", "Copied");
    copyButton.title = "Copied";
  } catch {
    copyButton.textContent = "!";
    copyButton.setAttribute("aria-label", "Copy failed");
    copyButton.title = "Copy failed";
  }
}

function restore() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  document.querySelector("#birthdate").value = saved.birthdate || isoDate(defaultBirthday);

  for (const [key, value] of Object.entries(saved)) {
    const element = form.elements[key];
    if (!element || key === "birthdate" || key === "sex") continue;

    if (element.type === "checkbox") {
      element.checked = value === true || value === "on";
    } else {
      element.value = value;
    }
  }

  const sex = saved.sex || "female";
  const sexInput = form.querySelector(`input[name="sex"][value="${sex}"]`);
  if (sexInput) sexInput.checked = true;

  if (!baselines[document.querySelector("#region").value]) {
    document.querySelector("#region").value = "global";
  }
}

resetButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  form.reset();
  restore();
  update();
});

form.addEventListener("input", update);
form.addEventListener("change", update);
copyButton.addEventListener("click", copyOutput);

restore();
update();
