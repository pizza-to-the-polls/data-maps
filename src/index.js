import { select, json } from 'd3';
import {
  statesURL, districtsURL, tabs,
} from './constants';
import { buildSheetsURL } from './utils';
import drawMap from './map';
import getSettings from './getSettings';

const datasets = getSettings();
const datasetKeys = Object.keys(datasets);

function build(tab) {
  const sheetsURL = buildSheetsURL(tab);
  const files = [statesURL, districtsURL, sheetsURL];
  const promises = [];
  files.forEach(url => promises.push(json(url)));
  Promise.all(promises).then(drawMap);
}

// Build the map for the first tab
build(tabs[0]);

// Map switcher
const mapSelectorContainer = select('#selector');

mapSelectorContainer.append('label').attr('for', 'map-selector').text('Issue');

const mapSelector = mapSelectorContainer
  .append('select')
  .attr('id', 'map-selector')
  .on('change', () => {
    const selectedTab = mapSelector.property('value');
    build(selectedTab);
  });

mapSelector
  .selectAll('option')
  .data(datasetKeys)
  .enter()
  .append('option')
  .attr('value', d => d)
  .text(d => datasets[d].issuelabel);
