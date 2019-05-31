import * as d3 from "d3";
import * as topojson from "topojson";

import { parseStats, makeLabel } from "../utils";
import createTable from "../table";
import { prefix, nonFilters, nonFilterPrefix, QUALITATIVE_SCALE } from "../constants";
import { addDetails, removeDetails } from "./details";
import { buildQuantitativeLegend, buildQualitativeLegend } from "./legend";
import { addTooltip, removeTooltip } from "./tooltip";
import { addShare } from "./share";
import { getMapScale, getLegendScale } from "./scale";
import { addQualPatterns, toggleHoverPattern } from "./patterns";

let filterContainer;
let svg;

let geoPathGenerator;
let svgWidth;
let svgHeight;

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

const buildZoom = (baseZoom, svgWidth, svgHeight, mapConfig) => {
  const zoomScaler = mapConfig.zoomScaler || 4;
  const zoom = d3
    .zoom()
    .scaleExtent([baseZoom, baseZoom * zoomScaler])
    .translateExtent([[0, 0], [svgWidth, svgHeight]])
    .on("zoom", () => {
      svg
        .selectAll("path")
        .style("stroke-width", `${1 / d3.event.transform.k}px`)
        .attr("transform", d3.event.transform);

      svg
        .selectAll("pattern")
        .attr("width", `${10 / d3.event.transform.k}px`)
        .attr("height", `${10 / d3.event.transform.k}px`);

      svg
        .selectAll("image")
        .attr("width", `${10 / d3.event.transform.k}px`)
        .attr("height", `${10 / d3.event.transform.k}px`);
    });
  addZoomButtons(zoom);
  svg.call(zoom);
  return zoom;
};

export const initMap = container => {
  filterContainer = d3.select(container).select(`.${prefix}filters`);
  svg = d3.select(container).select("svg");

  svgWidth = +svg.attr("viewBox").split(" ")[2];
  svgHeight = +svg.attr("viewBox").split(" ")[3];
  const projection = d3.geoAlbersUsa().translate([svgWidth / 2, svgHeight / 2]);
  geoPathGenerator = d3.geoPath().projection(projection);
  addShare();

  document.addEventListener("click", event => {
    if (event.target.id === `${prefix}map-svg`) {
      svg.selectAll("path").style("opacity", 1);
      removeDetails();
    }
  });
};

const addStatsToFeatures = (features, stats, scaleType, legendLabel) =>
  features.map(feature => ({
    scaleType,
    legendLabel,
    ...feature,
    ...stats.find(d => d.fips === feature.id)
  }));

const handleClick = (d, key, allPaths) => {
  // d3.select('.selected-path')
  const thisPath = allPaths[key];
  d3.selectAll(".selected-path").classed("selected-path", false);
  thisPath.classList += " selected-path";
  svg.selectAll("path").style("opacity", 0.3);
  thisPath.style.opacity = 1;
  addDetails(d);
};

const drawFeatures = (pathGenerator, data) =>
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("class", "feature")
    .on("click", handleClick);

const updatePaths = (
  paths,
  filter,
  { max: setMax, min: setMin, scaleType, legendLabel, buckets }
) => {
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

  const scale = getMapScale(scaleType, domain, buckets);

  paths
    .transition()
    .style("fill", d => scale(d[filter]))
    .style("stroke", "#03172d")
    .style("stroke-linejoin", "round");
  paths
    .on("mouseenter", d => {
      addTooltip(d, filter, scale);
    })
    .on("mouseleave", d => {
      removeTooltip(d);
    });

  if (scaleType === QUALITATIVE_SCALE) {
    addQualPatterns(svg);
    buildQualitativeLegend(getLegendScale(), filter);
  } else {
    buildQuantitativeLegend(scale, legendLabel);
  }
};

const addFilters = (paths, filters, dataSetConfig) => {
  filterContainer.selectAll("*").remove();
  if (filters.length > 1) {
    filterContainer
      .append("label")
      .attr("for", "filter")
      .text(dataSetConfig.scale === QUALITATIVE_SCALE ? "Current vs. Proposed" : "Group");
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

const buildPathGenerator = (map, topoFeature) => {
  const svgWidth = +svg.attr("viewBox").split(" ")[2];
  const svgHeight = +svg.attr("viewBox").split(" ")[3];
  const config = map.config || {};

  let projection = d3[config.projection || "geoAlbersUsa"]();

  if (config.rotate) {
    projection = projection.rotate(config.rotate);
  }

  if (config.scale) {
    projection = projection.scale(config.scale);
  }

  const geoPathGenerator = d3
    .geoPath()
    .projection(projection.translate([svgWidth / 2, svgHeight / 2]));

  const bounds = geoPathGenerator.bounds(topoFeature);

  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / svgWidth, dy / svgHeight)));
  const translate = [svgWidth / 2 - scale * x, svgHeight / 2 - scale * y];

  if (scale > 2) {
    svg
      .transition()
      .duration(100)
      .call(
        buildZoom(scale, svgWidth, svgHeight, config).transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  } else {
    buildZoom(1, svgWidth, svgHeight, config);
  }

  return geoPathGenerator;
};

// Draw the map
export const drawMap = (stats, map, dataSetConfig) => {
  const topoFeature = topojson.feature(map, map.objects.features);
  const cleanStats = parseStats(stats);
  svg.selectAll("path").remove();

  const geoPathGenerator = buildPathGenerator(map, topoFeature);

  const filters = Object.keys(cleanStats[0]).filter(
    key => !nonFilters.includes(key) && key.search(nonFilterPrefix) !== 0
  );

  toggleHoverPattern(svg, dataSetConfig.scaleType !== QUALITATIVE_SCALE);

  const currentGeography = drawFeatures(
    geoPathGenerator,
    addStatsToFeatures(
      topoFeature.features,
      cleanStats,
      dataSetConfig.scaleType,
      dataSetConfig.legendLabel
    )
  );

  addFilters(currentGeography, filters, dataSetConfig);
  updatePaths(currentGeography, filters[0], dataSetConfig);
  createTable(cleanStats);
};
