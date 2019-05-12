import { sheetsBaseUrl, rootURL } from "./constants";

export const buildSheetsURL = (tab, sheetsID) =>
  `${sheetsBaseUrl}/${sheetsID}/${tab}/public/basic?alt=json`;

export const buildMapURL = map => `${rootURL}${map}.json`;

export const parseRow = row => {
  // Takes a string and converts it into an object with keys for each column

  const pieces = {};
  row.split(", ").forEach(r => {
    const key = r.split(": ")[0];
    const value = r.split(": ")[1];
    pieces[key] = Number.isNaN(Number(value)) ? value : Number(value);
  });
  return pieces;
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
    no: "None",
    yes_low: "Yes, but the policy is inadequate",
    yes_no: "Yes, and the policy is adequate"
  };

  const shortLabels = {
    no: "None",
    yes_low: "Inadequate",
    yes_high: "Adequate"
  };
  return kind === "short" ? shortLabels[key] : longLabels[key];
};

export const notNA = value => ["NA", "N/A"].indexOf(value) === -1;
