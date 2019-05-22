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
