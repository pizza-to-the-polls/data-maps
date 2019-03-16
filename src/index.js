import {sheetsBaseUrl, sheetsID, statesURL, districtsURL, districtData, tabs} from './constants';
import { buildSheetsURL, parseRow } from './utils';
import { createTable } from './table';
import { drawMap } from './map';
import { setup } from './setup';
import { select, json } from 'd3';

setup();

function build(tab) {
  const sheetsURL = buildSheetsURL(tab);
  const files = [statesURL, districtsURL, sheetsURL];
  let promises = [];
  files.forEach(url => promises.push(json(url)));
  Promise.all(promises).then(drawMap);
}

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

const options = mapSelector
  .selectAll('option')
  .data(tabs)
  .enter()
  .append('option')
  .attr('value', d => d)
  .text(d => d);
