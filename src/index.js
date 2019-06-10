import { select, json } from "d3";
import { h, render } from "preact";

import { prefix, DEFAULT_SCALE, DEFAULT_BUCKETS } from "./constants";
import App from "./components/App";

import { buildMapURL, buildSheetsURL, parseRow, floatOrNull } from "./utils";
import { removeDetails, initDetails } from "./map/details";
import { initTooltip, removeTooltip } from "./map/tooltip";
import { drawMap, initMap } from "./map";
import { initTable } from "./table";

let currentDataset;
let mapSelectorContainer;
let toggleContainer;
let title;
let sheetKey;

const datasets = {};
const sheets = {};
const maps = {};
const mapKeys = {};

const build = (tab, attempts) => {
  toggleLoading(true);
  if (!sheets[tab])
    return json(buildSheetsURL(tab, sheetKey)).then(raw => {
      sheets[tab] = raw;
      build(tab);
    });

  const map = maps[mapKeys[tab]];

  if (!map) {
    const attempt = attempts || 0;
    if (attempt < 2) {
      return setTimeout(() => build(tab, attempt + 1), 500);
    }
    console.error(
      `Map ${mapKeys[tab]} never loaded - are you sure this row is configured correctly?`
    );
    return;
  }

  toggleLoading(false);
  drawMap(sheets[tab], map, currentDataset);

  title.text(currentDataset.title);

  removeDetails();
  removeTooltip();
};

const addStateAndDistrictToggle = dataset => {
  toggleContainer.selectAll("*").remove();

  if (dataset.maps.length > 1) {
    toggleContainer
      .append("label")
      .attr("for", "toggle")
      .text("View by");

    const toggle = toggleContainer
      .append("select")
      .attr("name", "toggle")
      .on("change", () => {
        const selected = dataset[toggle.property("value")];
        currentDataset = selected;
        build(selected.tab);
      });

    toggle
      .selectAll("option")
      .data(dataset.maps)
      .enter()
      .append("option")
      .attr("value", d => d.toLowerCase())
      .text(d => dataset[d].dataset);
  }
};

const addMapSelector = (container, data) => {
  mapSelectorContainer = select(container).select(`.${prefix}selector`);
  toggleContainer = select(container).select(`.${prefix}toggle`);

  mapSelectorContainer
    .append("label")
    .attr("for", "map-selector")
    .text("Issue");

  const mapSelector = mapSelectorContainer
    .append("select")
    .attr("name", "map-selector")
    .on("change", () => {
      const selected = datasets[mapSelector.property("value")];
      currentDataset = selected;
      build(selected.defaultTab);
      addStateAndDistrictToggle(selected);
      showContent(currentDataset.issuekey);
    });

  mapSelector
    .selectAll("option")
    .data(data)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => datasets[d].label);
};

const initDataMap = container => {
  sheetKey = container ? container.getAttribute("data-spreadsheet-key") : null;
  if (!sheetKey) {
    console.error("Cannot init maps without a key - set the data-spreadsheet-key attribute");
    return;
  }
  render(<App sheetKey={sheetKey} />, container);

  return null;

  initMap(container);
  initTable(container);
  initDetails(container);
  initTooltip(container);

  title = select(container).select(`.${prefix}header`);

  // Load the states and district maps
  fetchMap("state");

  // Get the Settings tab which lists all the datasets (other tabs) we'll later get
  json(buildSheetsURL(1, sheetKey)).then(response => {
    const loadedMaps = { state: true };

    response.feed.entry.forEach(entry => {
      try {
        const dataset = parseRow(entry.content.$t);
        const key = entry.title.$t;
        const mapKey = dataset.dataset.replace(/\s/g, "-").toLowerCase();

        if (!loadedMaps[mapKey]) {
          fetchMap(mapKey);
          loadedMaps[mapKey] = true;
        }

        dataset.scaleType = dataset.scale || DEFAULT_SCALE;
        dataset.buckets = Number(dataset.buckets) || DEFAULT_BUCKETS;

        if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
          datasets[key] = {};
          datasets[key].label = dataset.label || dataset.issuelabel;
          datasets[key].title = dataset.title || `Support for ${datasets[key].label}`;
          datasets[key].defaultTab = dataset.tab;
          datasets[key].scaleType = dataset.scaleType;
          datasets[key].legendLabel = dataset.legendlabel || "Issue support";
          datasets[key].defaultView = dataset.dataset.toLowerCase();
          datasets[key].issuekey = key;
          datasets[key].maps = [];
          datasets[key].buckets = Number(dataset.buckets) || DEFAULT_BUCKETS;
          if (dataset.max) datasets[key].max = floatOrNull(dataset.max);
          if (dataset.min) datasets[key].min = floatOrNull(dataset.min);
        }
        datasets[key][mapKey] = dataset;
        datasets[key].maps.push(mapKey);
        mapKeys[dataset.tab] = mapKey;
      } catch (error) {
        console.error(
          `Could not import settings row ${entry.title.$t} ${entry.content.$t}, error:`
        );
        console.error(error);
      }
    });

    const datasetKeys = Object.keys(datasets);
    const firstDataset = datasets[datasetKeys[0]];

    if (datasetKeys.length > 1) {
      addMapSelector(container, datasetKeys);
      addStateAndDistrictToggle(firstDataset);
    }

    currentDataset = firstDataset;
    build(firstDataset.defaultTab);
    getContent(firstDataset.issuekey, sheetKey);
  });
};

initDataMap(document.querySelector(".data-progress-maps"));
