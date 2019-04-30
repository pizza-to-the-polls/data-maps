import { selectAll, select, json } from "d3";
import { prefix } from "./constants";
import { buildMapURL, buildSheetsURL, parseRow, floatOrNull, makeLabel } from "./utils";
import { getContent, showContent, initDom } from "./content";
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

const fetchMap = map => json(buildMapURL(map)).then(geojson => (maps[map] = geojson));

const build = (tab, attempts) => {
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
    } else {
      console.error(
        `Map ${mapKeys[tab]} never loaded - are you sure this row is configured correctly?`
      );
      return;
    }
  }

  drawMap(sheets[tab], map, currentDataset);

  title.text(`Support for ${currentDataset.issuelabel}`);

  removeDetails();
  removeTooltip();
};

const updateClickInstructions = value => {
  select(`.${prefix}click-instructions`).text(
    `Click a ${value === "state" ? "state" : "district"} for details`
  );
};
const addStateAndDistrictToggle = dataset => {
  toggleContainer.selectAll("*").remove();
  if (dataset.state && dataset.house) {
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
        updateClickInstructions(toggle.property("value"));
        build(selected.tab);
      });

    toggle
      .selectAll("option")
      .data(["state", "house"])
      .enter()
      .append("option")
      .attr("value", d => d.toLowerCase())
      .text(d => makeLabel(d));
  }
};

const initDataMap = container => {
  sheetKey = container ? container.getAttribute("data-spreadsheet-key") : null;
  if (!sheetKey) {
    console.error("Cannot init maps without a key - set the data-spreadsheet-key attribute");
    return;
  }
  initDom(container);
  initMap(container);
  initTable(container);
  initDetails(container);
  initTooltip(container);

  title = select(container).select(`.${prefix}header`);
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

  // Load the states and district maps
  fetchMap("state");

  // Get the Settings tab which lists all the datasets (other tabs) we'll later get
  json(buildSheetsURL(1, sheetKey)).then(response => {
    const loadedMaps = { state: true };

    response.feed.entry.forEach(entry => {
      try {
        const dataset = parseRow(entry.content.$t);
        const key = entry.title.$t;
        const map = dataset.dataset.toLowerCase();

        if (!loadedMaps[map]) {
          fetchMap(map);
          loadedMaps[map] = true;
        }

        if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
          datasets[key] = {};
          datasets[key].issuelabel = dataset.issuelabel;
          datasets[key].defaultTab = dataset.tab;
          datasets[key].defaultView = dataset.dataset.toLowerCase();
          datasets[key].issuekey = key;
          datasets[key].maps = {};
          if (dataset.max) datasets[key].max = floatOrNull(dataset.max);
          if (dataset.min) datasets[key].min = floatOrNull(dataset.min);
        }
        datasets[key][dataset.dataset.toLowerCase()] = dataset;
        mapKeys[dataset.tab] = map;
      } catch (error) {
        console.error(
          `Could not import settings row ${entry.title.$t} ${entry.content.$t}, error:`
        );
        console.error(error);
      }
    });

    const datasetKeys = Object.keys(datasets);
    mapSelector
      .selectAll("option")
      .data(datasetKeys)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => datasets[d].issuelabel);

    const firstDataset = datasets[datasetKeys[0]];
    addStateAndDistrictToggle(firstDataset);
    currentDataset = firstDataset;
    build(firstDataset.defaultTab);
    updateClickInstructions(firstDataset.defaultView);
    getContent(firstDataset.issuekey, sheetKey);
  });
};

initDataMap(document.querySelector(".data-progress-maps"));
