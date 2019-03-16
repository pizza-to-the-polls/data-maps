import { json } from 'd3';
import { buildSheetsURL, parseRow } from './utils';

const datasets = {};

async function getDatasets() {
  const url = buildSheetsURL(1);
  json(url).then((response) => {
    // Get the Settings tab which lists all the datasets (other tabs) we'll later get
    response.feed.entry.forEach((entry) => {
      const dataset = parseRow(entry.content.$t);
      const key = entry.title.$t;
      if (!datasets.hasOwnProperty(key)) {
        datasets[key] = {};
      }
      datasets[key][dataset.dataset.toLowerCase()] = dataset;
    });
  });
  return datasets;
}

export default getDatasets;
