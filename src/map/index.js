import * as d3 from "d3";
import * as topojson from "topojson";

import { parseStats, makeLabel } from "../utils";
import createTable from "../table";
import { prefix, nonFilters } from "../constants";
import { addDetails, removeDetails } from "./details";
import { buildQuantitativeLegend, buildQualitativeLegend } from "./legend";
import { addTooltip, removeTooltip } from "./tooltip";
import { addShare } from "./share";

let filterContainer;
let svg;

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

const buildZoom = (baseZoom, svgWidth, svgHeight) => {
  const zoom = d3
    .zoom()
    .scaleExtent([baseZoom, baseZoom * 4])
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

  addPattern(svg);
  addShare();

  document.addEventListener("click", event => {
    if (event.target.id === `${prefix}map-svg`) {
      svg.selectAll("path").style("opacity", 1);
      removeDetails();
    }
  });
};

const addStatsToFeatures = (features, stats, scale, legendLabel) =>
  features.map(feature => ({
    scale,
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

const updatePaths = (paths, filter, { max: setMax, min: setMin, scale, legendLabel }) => {
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

  const qualScale = {
    no: "#fff8f0",
    yes_low: "#adb37f",
    yes_high: "#127a39"
  };

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

  paths
    .transition()
    .style("fill", d => (scale === "quantitative" ? quantScale(d[filter]) : qualScale[d[filter]]))
    .style("stroke", "#03172d")
    .style("stroke-linejoin", "round");
  paths
    .on("mouseenter", d => {
      addTooltip(d, filter);
    })
    .on("mouseleave", d => {
      removeTooltip(d);
    });

  if (scale === "quantitative") {
    buildQuantitativeLegend(quantScale, legendLabel);
  } else {
    buildQualitativeLegend(qualScale, legendLabel);
  }
};

const addFilters = (paths, filters, dataSetConfig) => {
  filterContainer.selectAll("*").remove();
  if (filters.length > 1) {
    filterContainer
      .append("label")
      .attr("for", "filter")
      .text(dataSetConfig.scale === "quantitative" ? "Group" : "Current vs. Proposed");
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

const buildPathGenerator = (config, svgWidth, svgHeight) => {
  config = config || {
    projection: "geoAlbersUsa"
  };

  let projection = d3[config.projection]();

  if (config.rotate) {
    projection = projection.rotate(config.rotate);
  }

  if (config.scale) {
    projection = projection.scale(config.scale);
  }

  return d3.geoPath().projection(projection.translate([svgWidth / 2, svgHeight / 2]));
};

// Draw the map
export const drawMap = (stats, map, dataSetConfig) => {
  const topoFeature = topojson.feature(map, map.objects.features);
  const cleanStats = parseStats(stats);
  svg.selectAll("path").remove();

  const svgWidth = +svg.attr("viewBox").split(" ")[2];
  const svgHeight = +svg.attr("viewBox").split(" ")[3];

  const geoPathGenerator = buildPathGenerator(map.config, svgWidth, svgHeight);

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
        buildZoom(scale, svgWidth, svgHeight).transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  } else {
    buildZoom(1, svgWidth, svgHeight);
  }

  const filters = Object.keys(cleanStats[0]).filter(key => !nonFilters.includes(key));
  const currentGeography = drawFeatures(
    geoPathGenerator,
    addStatsToFeatures(
      topoFeature.features,
      cleanStats,
      dataSetConfig.scale,
      dataSetConfig.legendLabel
    )
  );

  addFilters(currentGeography, filters, dataSetConfig);
  updatePaths(currentGeography, filters[0], dataSetConfig);
  createTable(cleanStats);
};
