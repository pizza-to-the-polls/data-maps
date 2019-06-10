import { DEFAULT_SCALE, DEFAULT_BUCKETS } from "./constants";
import { parseRow, floatOrNull } from "./utils";

export const buildContent = (entries) => (
  entries.reduce((content, entry) => (
    { ...content, ...{[entry.title.$t]: entry.content.$t.split("content: ")[1] }}
  ), {})
)

export const buildDatasets = (entries) => (
  entries.reduce((datasets, entry) => {
    try {
      const dataset = parseRow(entry.content.$t);
      const key = entry.title.$t;

      dataset.map = dataset.dataset.replace(/\s/g, "-").toLowerCase();
      dataset.scaleType = dataset.scale || DEFAULT_SCALE;
      dataset.buckets = Number(dataset.buckets) || DEFAULT_BUCKETS;

      if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
        datasets[key] = {};
        datasets[key].label = dataset.label || dataset.issuelabel;
        datasets[key].title = dataset.title || `Support for ${datasets[key].label}`;
        datasets[key].defaultSheet = dataset.map;
        datasets[key].scaleType = dataset.scaleType;
        datasets[key].legendLabel = dataset.legendlabel || "Issue support";
        datasets[key].defaultView = dataset.dataset.toLowerCase();
        datasets[key].issuekey = key;
        datasets[key].sheets = {};
        datasets[key].buckets = Number(dataset.buckets) || DEFAULT_BUCKETS;
        if (dataset.max) datasets[key].max = floatOrNull(dataset.max);
        if (dataset.min) datasets[key].min = floatOrNull(dataset.min);
      }
      datasets[key].sheets[dataset.map] = dataset;
    } catch (error) {
      console.error(
        `Could not import settings row ${entry.title.$t} ${entry.content.$t}, error:`
      );
      console.error(error);
    }
    return datasets
  }, {})
)
