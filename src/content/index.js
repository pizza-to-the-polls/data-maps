import { select, selectAll, json } from "d3";
import marked from "marked";
import { legendWidth, legendHeight, prefix } from "../constants";

import { buildSheetsURL } from "../utils";

export const showContent = issueKey => {
  selectAll(`.${prefix}content section`).style("display", "none");
  select(`[data-issue=${issueKey}]`).style("display", "block");
};

export const getContent = (currentIssueKey, sheetsID) => {
  json(buildSheetsURL(2, sheetsID)).then(response => {
    response.feed.entry.forEach(entry => {
      select(`.${prefix}content`)
        .append("section")
        .attr("data-issue", entry.title.$t)
        .style("display", "none")
        .html(marked(entry.content.$t.split("content: ")[1]));
    });
    showContent(currentIssueKey);
  });
};

export const initDom = outer => {
  const container = document.createElement("div");
  container.className = `${prefix}container`;

  const header = document.createElement("h1");
  header.className = `${prefix}header`;
  container.appendChild(header);

  const vis = document.createElement("figure");
  vis.className = `${prefix}vis`;

  const map = document.createElement("div");
  map.className = `${prefix}map`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", `${prefix}map-svg`);
  svg.setAttribute("viewBox", "0 0 960 600");
  map.appendChild(svg);

  const legend = document.createElement("div");
  legend.className = `${prefix}legend`;
  map.appendChild(legend);

  const legendLabel = document.createElement("span");
  legendLabel.innerText = "Issue support";
  legendLabel.className = `${prefix}legend-label`;
  legend.appendChild(legendLabel);

  vis.appendChild(map);
  container.appendChild(vis);

  const legendSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  legendSvg.setAttribute("viewBox", `0 0 ${legendWidth} ${legendHeight}`);
  legend.appendChild(legendSvg);

  const controls = document.createElement("div");
  controls.className = `${prefix}controls`;
  ["selector", "toggle", "filters"].forEach(name => {
    const elem = document.createElement("div");
    elem.className = `${prefix}${name} ${prefix}control`;
    controls.appendChild(elem);
  });
  container.appendChild(controls);

  const tableContainer = document.createElement("details");
  tableContainer.className = `${prefix}table-container`;
  const summary = document.createElement("summary");
  summary.innerText = "Table";
  tableContainer.appendChild(summary);

  const table = document.createElement("div");
  table.className = `${prefix}table`;
  tableContainer.appendChild(table);
  container.appendChild(tableContainer);

  const content = document.createElement("div");
  content.className = `${prefix}content`;
  container.appendChild(content);

  outer.appendChild(container);
};

export default getContent;
