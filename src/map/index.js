import * as d3 from 'd3';
import * as topojson from 'topojson';

import { parseStats, selectActiveFilter } from '../utils';
import createTable from '../table';
import { defaultFilter } from '../constants';
import { labelMap } from '../translations';
import { addTooltip, removeTooltip } from './tooltip';

const filterContainer = d3.select('#filters');

const svg = d3.select('svg');
const svgWidth = +svg.attr('viewBox').split(' ')[2];
const svgHeight = +svg.attr('viewBox').split(' ')[3];

const projection = d3
  .geoAlbersUsa()
  .translate([svgWidth / 2, svgHeight / 2]);

const geoPathGenerator = d3.geoPath().projection(projection);
const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([0, 1]);

function zoomed() {
  svg
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3.event.transform);
}

const zoom = d3.zoom()
  .scaleExtent([1, 20])
  .on('zoom', zoomed);

svg.call(zoom);

function addStatsToFeatures(features, stats) {
  const combinedData = [];

  features.forEach((feature) => {
    const data = stats.find(d => d.fips === feature.id);
    const richDistrict = { ...feature, ...data };
    combinedData.push(richDistrict);
  });

  return combinedData;
}

function drawStatesWithData(states) {
  return svg
    .selectAll('path')
    .data(states)
    .enter()
    .append('path')
    .style('fill', d => colorScale(d[defaultFilter]))
    .attr('d', geoPathGenerator)
    .attr('class', 'state')
    .on('mouseover', addTooltip)
    .on('mouseout', removeTooltip);
}

function drawStates(states) {
  svg
    .selectAll('path')
    .data(states)
    .enter()
    .append('path')
    .attr('d', geoPathGenerator)
    .attr('class', 'state')
    .on('mouseover', addTooltip)
    .on('mouseout', removeTooltip);
}

function drawDistricts(districts) {
  return svg
    .selectAll('path')
    .data(districts)
    .enter()
    .append('path')
    .attr('d', geoPathGenerator)
    .attr('class', 'district')
    .style('fill', d => colorScale(d[defaultFilter]))
    .on('mouseover', addTooltip)
    .on('mouseout', removeTooltip);
}

function updatePaths(paths, filter) {
  paths
    .transition()
    .style('fill', d => colorScale(d[filter]));
}

function addFilters(paths, filters) {
  // Add some filters
  filterContainer.selectAll('*').remove();
  filterContainer
    .selectAll('button')
    .data(filters)
    .enter()
    .append('button')
    .text(d => labelMap[d])
    .attr('id', d => d)
    .on('click', (filter) => {
      updatePaths(paths, filter);
      selectActiveFilter(filterContainer, filter);
    });

  selectActiveFilter(filterContainer, defaultFilter);
}

// Draw the map
function drawMap(data) {
  // Data = results from the three json calls
  const states = data[0];
  const districts = data[1];
  const stats = data[2];

  const statesGeo = topojson.feature(states, states.objects.states);
  const districtsGeo = topojson.feature(districts, districts.objects.districts);
  const cleanStats = parseStats(stats);

  // Clear the map out
  svg.selectAll('*').remove();
  const filters = Object.keys(cleanStats[0]).filter(key => ['label', 'fips', 'state'].indexOf(key) === -1);

  // If the first row's FIPS code is over 100 we know it's district data
  if (cleanStats[0].fips > 100) {
    drawStates(statesGeo.features);
    const districtsWithStats = addStatsToFeatures(districtsGeo.features, cleanStats);
    const districtPaths = drawDistricts(districtsWithStats);
    addFilters(districtPaths, filters);
  } else {
    // Otherwise we know it's states
    const statesWithStats = addStatsToFeatures(statesGeo.features, cleanStats);
    const statePaths = drawStatesWithData(statesWithStats);
    addFilters(statePaths, filters);
  }

  createTable(cleanStats);
}
export default drawMap;
