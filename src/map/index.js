import * as d3 from "d3";
import * as topojson from "topojson";

import { parseStats } from "../utils";
import createTable from "../table";
import { defaultFilter, labelMap } from "../constants";
import { addTooltip, removeTooltip } from "./tooltip";
import * as states from "../data/us.json";
import * as districts from "../data/districts.json";

const filterContainer = d3.select("#filters");

const svg = d3.select("svg");
const svgWidth = +svg.attr("viewBox").split(" ")[2];
const svgHeight = +svg.attr("viewBox").split(" ")[3];

const projection = d3.geoAlbersUsa().translate([svgWidth / 2, svgHeight / 2]);

const geoPathGenerator = d3.geoPath().projection(projection);
const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([0, 1]);

const zoomed = () =>
  svg
    .selectAll("path") // To prevent stroke width from scaling
    .attr("transform", d3.event.transform);

const zoom = d3
  .zoom()
  .scaleExtent([1, 20])
  .on("zoom", zoomed);

svg.call(zoom);

const addStatsToFeatures = (features, stats) => {
  const combinedData = [];

  features.forEach(feature => {
    const data = stats.find(d => d.fips === feature.id);
    const richDistrict = { ...feature, ...data };
    combinedData.push(richDistrict);
  });

  return combinedData;
};

const drawStatesWithData = states =>
  svg
    .selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .style("fill", d => colorScale(d[defaultFilter]))
    .attr("d", geoPathGenerator)
    .attr("class", "state")
    .on("click", addTooltip);

const drawStates = states =>
  svg
    .selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "state")
    .on("click", addTooltip);

const drawDistricts = districts =>
  svg
    .selectAll("path")
    .data(districts)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "district")
    .style("fill", d => colorScale(d[defaultFilter]))
    .on("mouseover", addTooltip)
    .on("mouseout", removeTooltip);

const updatePaths = (paths, filter) =>
  paths.transition().style("fill", d => colorScale(d[filter]));

const addFilters = (paths, filters) => {
  // Add some filters
  filterContainer.selectAll("*").remove();
  filterContainer
    .append("label")
    .attr("for", "filter")
    .text("Group");
  const filter = filterContainer
    .append("select")
    .attr("name", "filter")
    .on("change", () => {
      updatePaths(paths, filter.property("value"));
    });

  filter
    .selectAll("options")
    .data(filters)
    .enter()
    .append("option")
    .text(d => labelMap[d])
    .attr("value", d => d);
};

// Draw the map
const drawMap = stats => {
  const statesGeo = topojson.feature(states, states.objects.states);
  const districtsGeo = topojson.feature(districts, districts.objects.districts);
  const cleanStats = parseStats(stats);

  // Clear the map out
  svg.selectAll("*").remove();
  const filters = Object.keys(cleanStats[0]).filter(
    key => ["label", "fips", "state"].indexOf(key) === -1
  );

  // If the first row's FIPS code is over 100 we know it's district data
  if (cleanStats[0].fips > 100) {
    const districtsWithStats = addStatsToFeatures(
      districtsGeo.features,
      cleanStats
    );
    const districtPaths = drawDistricts(districtsWithStats);
    addFilters(districtPaths, filters);
  } else {
    // Otherwise we know it's states
    const statesWithStats = addStatsToFeatures(statesGeo.features, cleanStats);
    const statePaths = drawStatesWithData(statesWithStats);
    addFilters(statePaths, filters);
  }

  createTable(cleanStats);
};
export default drawMap;
