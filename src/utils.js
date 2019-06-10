import { sheetsBaseUrl, rootURL, stateLabels } from "./constants";

export const buildSheetsURL = (tab, sheetsID) =>
  process.env.LOCAL_DATA === "true"
    ? `${rootURL}sheets/${sheetsID}/${tab}.json`
    : `${sheetsBaseUrl}/${sheetsID}/${tab}/public/basic?alt=json`;

export const buildMapURL = map => `${rootURL}${map}.json`;

export const parseRow = row => {
  // Takes a string and converts it into an object with keys for each column
  let last;
  return row.split(/, /).reduce((obj, el) => {
    const [label, ...values] = el.split(": ");
    if (values.length > 0) {
      obj[label] = values.join(": ").trim();
      last = label;
    } else {
      obj[last] += `, ${el}`;
    }
    return obj;
  }, {});
};

export const formatAsPercentage = value => {
  if (isNaN(value)) {
    return value;
  }
  const percentage = value <= 1 ? value * 100 : value;
  return `${percentage.toFixed(0)}%`;
};

export const parseStats = data => {
  const cleanStats = [];
  data.feed.entry.forEach(d => {
    const row = parseRow(d.content.$t);
    row.fips = fipsOrString(d.title.$t); // Need to add the first column manually
    cleanStats.push(row);
  });
  return cleanStats;
};

export const floatOrNull = num => (isNaN(parseFloat(num)) ? null : parseFloat(num));
export const fipsOrString = fips => (isNaN(Number(fips)) ? fips : Number(fips));

export const makeLabel = text => {
  let formatted = text.replace(/-/g, " ");
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return formatted;
};

export const formatQualitativeScale = (key, kind) => {
  const longLabels = {
    no: "No policy",
    yes_low: "Yes, but insufficient",
    yes_high: "Yes, and sufficient"
  };

  const shortLabels = {
    no: "No policy",
    yes_low: "Insufficient",
    yes_high: "Sufficient",
    proposed_low: "Insufficient",
    proposed_high: "Sufficient"
  };
  return kind === "short" ? shortLabels[key] : longLabels[key];
};

export const notNA = value => ["NA", "N/A"].indexOf(value) === -1;

export const getFullLabel = value => {
  if (value.search("_") > -1) {
    const parts = value.split("_");
    const state = stateLabels[parts[0]];
    const district = Number(parts[1]);
    return `${state} District ${district}`;
  }

  return stateLabels[value] || value;
};
