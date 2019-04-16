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

const build = tab => {
  if (!sheets[tab])
    return json(buildSheetsURL(tab, sheetKey)).then(raw => {
      sheets[tab] = raw;
      build(tab);
    });

  if (!maps.states) return setTimeout(() => build(tab), 500);

  drawMap(sheets[tab], maps, currentDataset);

  title.text(`Support for ${currentDataset.issuelabel}`);

  removeDetails();
  removeTooltip();
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
  ["states", "districts"].map(map => json(buildMapURL(map)).then(geojson => (maps[map] = geojson)));

  // Get the Settings tab which lists all the datasets (other tabs) we'll later get
  json(buildSheetsURL(1, sheetKey)).then(response => {
    response.feed.entry.forEach(entry => {
      const dataset = parseRow(entry.content.$t);
      const key = entry.title.$t;
      if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
        datasets[key] = {};
        datasets[key].issuelabel = dataset.issuelabel;
        datasets[key].defaultTab = dataset.tab;
        datasets[key].defaultView = dataset.dataset.toLowerCase();
        datasets[key].issuekey = key;
        if (dataset.max) datasets[key].max = floatOrNull(dataset.max);
        if (dataset.min) datasets[key].min = floatOrNull(dataset.min);
      }
      datasets[key][dataset.dataset.toLowerCase()] = dataset;
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
    getContent(firstDataset.issuekey, sheetKey);
  });
};

initDataMap(document.querySelector(".data-progress-maps"));
