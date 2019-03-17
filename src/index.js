import { select, json } from 'd3';
import {
  statesURL, districtsURL,
} from './constants';
import { buildSheetsURL, parseRow, selectActiveFilter } from './utils';
import drawMap from './map';

const state = {};

function build(tab) {
  const sheetsURL = buildSheetsURL(tab);
  const files = [statesURL, districtsURL, sheetsURL];
  const promises = [];
  files.forEach(url => promises.push(json(url)));
  Promise.all(promises).then(drawMap);
  select('#header').text(state.currentDataset.issuelabel);
}

// Map switcher
const url = buildSheetsURL(1);
const mapSelectorContainer = select('#selector');
const toggleContainer = select('#toggle');
const datasets = {};

mapSelectorContainer.append('label').attr('for', 'map-selector').text('Issue');

function addStateAndDistrictToggle(dataset) {
  toggleContainer.selectAll('*').remove();
  if (dataset.state && dataset.house) {
    toggleContainer.append('label').attr('for', 'toggle').text('View by');

    const toggle = toggleContainer.append('select').attr('name', 'toggle').on('change', () => {
      const selected = dataset[toggle.property('value')];
      state.currentDataset = selected;
      build(selected.tab);
    });

    toggle
      .selectAll('option')
      .data(['state', 'house'])
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d);
  }
}

const mapSelector = mapSelectorContainer
  .append('select')
  .attr('name', 'map-selector')
  .on('change', () => {
    const selected = state.datasets[mapSelector.property('value')];
    state.currentDataset = selected;
    build(selected.defaultTab);
    addStateAndDistrictToggle(selected);
  });


// Get the Settings tab which lists all the datasets (other tabs) we'll later get
json(url).then((response) => {
  response.feed.entry.forEach((entry) => {
    const dataset = parseRow(entry.content.$t);
    const key = entry.title.$t;
    if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
      datasets[key] = {};
      datasets[key].issuelabel = dataset.issuelabel;
      datasets[key].defaultTab = dataset.tab;
      datasets[key].defaultView = dataset.dataset.toLowerCase();
    }
    datasets[key][dataset.dataset.toLowerCase()] = dataset;
  });

  // Save to state
  state.datasets = datasets;

  const datasetKeys = Object.keys(datasets);
  mapSelector
    .selectAll('option')
    .data(datasetKeys)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => datasets[d].issuelabel);

  const firstDataset = datasets[datasetKeys[0]];
  addStateAndDistrictToggle(firstDataset);
  state.currentDataset = firstDataset;
  build(firstDataset.defaultTab, firstDataset.issuelabel);
});
