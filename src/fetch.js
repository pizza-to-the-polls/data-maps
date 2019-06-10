import { json } from "d3";

import { buildMapURL, buildSheetsURL } from "./utils";

export const fetchMap = (map, callback) => json(buildMapURL(map)).then(callback);

export const fetchSheet = (tab, sheetKey, callback) => {
 json(buildSheetsURL(tab, sheetKey)).then(response => callback(response.feed.entry));
}
