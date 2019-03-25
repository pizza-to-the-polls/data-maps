import { select, json } from "d3";
import { labelMap } from "./constants";
import { buildMapURL, buildSheetsURL, parseRow } from "./utils";
import { getContent, showContent } from "./content";
import { removeTooltip } from "./map/tooltip";
import drawMap from "./map";

const state = { maps: {}, data: {} };

["states", "districts"].map(map => json(buildMapURL(map)).then(data => (state.maps[map] = data)));

const build = tab => {
  if (!state.data[tab])
    return json(buildSheetsURL(tab)).then(raw => {
      state.data[tab] = raw;
      build(tab)
    });

  if (!state.maps.states) return setTimeout(() => build(tab), 500);

  drawMap(state.data[tab], state.maps);

  select("#header").text(state.currentDataset.issuelabel);

  removeTooltip();
};

// Map switcher
const settingsURL = buildSheetsURL(1);
const mapSelectorContainer = select("#selector");
const toggleContainer = select("#toggle");
const datasets = {};

mapSelectorContainer
  .append("label")
  .attr("for", "map-selector")
  .text("Issue");

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
        state.currentDataset = selected;
        build(selected.tab);
      });

    toggle
      .selectAll("option")
      .data(["state", "house"])
      .enter()
      .append("option")
      .attr("value", d => d.toLowerCase())
      .text(d => labelMap[d]);
  }
};

const mapSelector = mapSelectorContainer
  .append("select")
  .attr("name", "map-selector")
  .on("change", () => {
    const selected = state.datasets[mapSelector.property("value")];
    state.currentDataset = selected;
    build(selected.defaultTab);
    addStateAndDistrictToggle(selected);
    showContent(state.currentDataset.issuekey);
  });

// Get the Settings tab which lists all the datasets (other tabs) we'll later get
json(settingsURL).then(response => {
  response.feed.entry.forEach(entry => {
    const dataset = parseRow(entry.content.$t);
    const key = entry.title.$t;
    if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
      datasets[key] = {};
      datasets[key].issuelabel = dataset.issuelabel;
      datasets[key].defaultTab = dataset.tab;
      datasets[key].defaultView = dataset.dataset.toLowerCase();
      datasets[key].issuekey = key;
    }
    datasets[key][dataset.dataset.toLowerCase()] = dataset;
  });

  // Save to state
  state.datasets = datasets;

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
  state.currentDataset = firstDataset;
  build(firstDataset.defaultTab, firstDataset.issuelabel);
  getContent(firstDataset.issuekey);
});
