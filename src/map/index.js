import * as d3 from "d3";
import * as topojson from "topojson";

import { parseStats, makeLabel } from "../utils";
import createTable from "../table";
import { prefix } from "../constants";
import { addDetails, removeDetails } from "./details";
import buildLegend from "./legend";
import { addTooltip, removeTooltip } from "./tooltip";

let filterContainer;
let svg;

let geoPathGenerator;

const addPattern = () => {
  svg
    .append("defs")
    .append("pattern")
    .attr("id", "hoverPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10)
    .append("image")
    .attr(
      "xlink:href",
      // dots
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PScxLjUnIGN5PScxLjUnIHI9JzEuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+Cg=="
      // crosshatch
      // "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnPgogIDxyZWN0IHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9JyNmZmYnLz4KICA8cGF0aCBkPSdNMCAwTDggOFpNOCAwTDAgOFonIHN0cm9rZS13aWR0aD0nMC41JyBzdHJva2U9JyNhYWEnLz4KPC9zdmc+Cg=="
      // lines
      // "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+Cg=="
    )
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10);

  svg
    .select("defs")
    .append("mask")
    .attr("id", "hoverMask")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "url(#hoverPattern)");
};

const addZoomButtons = zoomFunction => {
  d3.select(`.${prefix}map`)
    .append("button")
    .text("+")
    .attr("class", `${prefix}zoom-in`)
    .on("click", () => {
      svg
        .transition()
        .duration(1000)
        .call(zoomFunction.scaleBy, 2);
    });

  d3.select(`.${prefix}map`)
    .append("button")
    .text("-")
    .attr("class", `${prefix}zoom-out`)
    .on("click", () => {
      svg
        .transition()
        .duration(1000)
        .call(zoomFunction.scaleBy, 0.5);
    });
};

export const initMap = container => {
  filterContainer = d3.select(container).select(`.${prefix}filters`);
  svg = d3.select(container).select("svg");

  const svgWidth = +svg.attr("viewBox").split(" ")[2];
  const svgHeight = +svg.attr("viewBox").split(" ")[3];
  const projection = d3.geoAlbersUsa().translate([svgWidth / 2, svgHeight / 2]);
  const zoom = d3
    .zoom()
    .scaleExtent([1, 4])
    .translateExtent([[0, 0], [svgWidth, svgHeight]])
    .on("zoom", () => {
      svg
        .selectAll("path")
        .style("stroke-width", `${1 / d3.event.transform.k}px`)
        .attr("transform", d3.event.transform);
    });

  geoPathGenerator = d3.geoPath().projection(projection);
  addPattern(svg);
  addZoomButtons(zoom);
  svg.call(zoom);

  document.addEventListener("click", e => {
    if (e.target.nodeName !== "path") {
      svg.selectAll("path").style("opacity", 1);
      removeDetails();
    }
  });
};

const addStatsToFeatures = (features, stats) => {
  const combinedData = [];

  features.forEach(feature => {
    const data = stats.find(d => d.fips === feature.id);
    const richDistrict = { ...feature, ...data };
    combinedData.push(richDistrict);
  });

  return combinedData;
};

const handleClick = (d, key, allPaths) => {
  // d3.select('.selected-path')
  const thisPath = allPaths[key];
  d3.selectAll(".selected-path").classed("selected-path", false);
  thisPath.classList += " selected-path";
  svg.selectAll("path").style("opacity", 0.3);
  thisPath.style.opacity = 1;
  addDetails(d);
};

const drawStatesWithData = data =>
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "state")
    .on("click", handleClick);

const drawDistricts = data =>
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "district")
    .on("click", handleClick);

const updatePaths = (paths, filter, { max: setMax, min: setMin }) => {
  const data = paths
    .data()
    .map(d => d[filter])
    .filter(p => p);
  const max = Math.max.apply(null, data);
  const min = Math.min.apply(null, data);
  const domain = [];

  if (setMin) {
    domain.push(setMin);
  } else {
    domain.push(
      min < 0
        ? min < -1
          ? -100
          : -1 // Assume equal distribution around zero
        : 0 // Assume floor is zero
    );
  }
  if (setMax) {
    domain.push(setMax);
  } else {
    domain.push(max > 1 ? 100 : 1);
  }

  const quantScale = d3.scaleQuantize(domain, [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ]);

  paths.transition().style("fill", d => quantScale(d[filter]));
  paths
    .on("mouseenter", d => {
      addTooltip(d, filter);
    })
    .on("mouseleave", d => {
      removeTooltip(d);
    });

  buildLegend(quantScale, domain);
};

const addFilters = (paths, filters, dataSetConfig) => {
  // Add some filters
  filterContainer.selectAll("*").remove();
  if (filters.length > 1) {
    filterContainer
      .append("label")
      .attr("for", "filter")
      .text("Group");
    const filter = filterContainer
      .append("select")
      .attr("name", "filter")
      .on("change", () => {
        updatePaths(paths, filter.property("value"), dataSetConfig);
      });

    filter
      .selectAll("options")
      .data(filters)
      .enter()
      .append("option")
      .text(makeLabel)
      .attr("value", d => d);
  }
};

// Draw the map
export const drawMap = (stats, { states, districts }, dataSetConfig) => {
  const statesGeo = topojson.feature(states, states.objects.states);
  const districtsGeo = topojson.feature(districts, districts.objects.districts);
  const cleanStats = parseStats(stats);
  let currentGeography;
  svg.selectAll("path").remove();

  const filters = Object.keys(cleanStats[0]).filter(
    key => ["label", "fips", "state", "content"].indexOf(key) === -1
  );

  // If the first row's FIPS code is over 100 we know it's district data
  if (cleanStats[0].fips > 100) {
    const districtsWithStats = addStatsToFeatures(districtsGeo.features, cleanStats);
    currentGeography = drawDistricts(districtsWithStats);
  } else {
    // Otherwise we know it's states
    const statesWithStats = addStatsToFeatures(statesGeo.features, cleanStats);
    currentGeography = drawStatesWithData(statesWithStats);
  }
  addFilters(currentGeography, filters, dataSetConfig);
  updatePaths(currentGeography, filters[0], dataSetConfig);
  createTable(cleanStats);
};
