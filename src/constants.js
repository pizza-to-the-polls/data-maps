export const sheetsBaseUrl = "https://spreadsheets.google.com/feeds/list";
export const excludedKeys = [
  "id",
  "fips",
  "type",
  "properties",
  "geometry",
  "label",
  "scale",
  "legendLabel"
];
export const prefix = "dfp-map__";
export const rootURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:1234/"
    : "https://pizza-to-the-polls.github.io/data-maps/";
export const legendWidth = 320;
export const legendHeight = 40;
export const nonFilters = [
  "label",
  "fips",
  "state",
  "content",
  "currentdescription",
  "proposeddescription",
  "bill",
  "link"
];

export const nonFilterPrefix = 'na_'

export const qualKeys = [
  "no",
  "yes_low",
  "yes_high",
  "proposed_low",
  "proposed_high",
  "no-no",
  "no-yes_low",
  "no-yes_high",
  "yes_low-no",
  "yes_low-yes_low",
  "yes_low-yes_high",
  "yes_high-no",
  "yes-high_yes-low",
  "yes-high_yes-high"
];

export const quantitativeColors = [
  "#67001f",
  "#b2182b",
  "#d6604d",
  "#f4a582",
  "#92c5de",
  "#4393c3",
  "#2166ac",
  "#053061"
];
