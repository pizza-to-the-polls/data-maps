import { select, selectAll, json } from "d3";
import marked from "marked";
import fs from "fs";
import { legendWidth, legendHeight, prefix } from "../constants";

import { buildSheetsURL } from "../utils";

let vis;
let shareContainer;
let shareImg;

export const toggleLoading = (isLoading, elem = vis) => {
  if (isLoading) {
    elem.classList.add("is--loading");
  } else {
    // The animation looks better if it's given room to run a little
    elem.classList.remove("is--loading");
  }
};

export const toggleShare = (isOpen, dataURL) => {
  if (isOpen) {
    shareImg.setAttribute("src", dataURL);
    shareContainer.style.display = "flex";
  } else {
    shareImg.removeAttribute("src");
    shareContainer.style.display = "none";
  }
};

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

  vis = document.createElement("figure");
  vis.className = `${prefix}vis`;

  const loader = document.createElement("div");
  for (let i = 3; i >= 0; i--) {
    const bar = document.createElement("div");
    bar.className = "bar";
    loader.appendChild(bar);
  }
  loader.className = `${prefix}loader`;

  const clickInstructions = document.createElement("span");
  clickInstructions.className = `${prefix}click-instructions`;

  const map = document.createElement("div");
  map.className = `${prefix}map`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", `${prefix}map-svg`);
  svg.setAttribute("viewBox", "0 0 960 600");
  map.appendChild(svg);
  map.appendChild(clickInstructions);

  const legendImg = document.createElement("img");

  // html2canvass only supported with promises
  if (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) {
    const shareButton = document.createElement("button");
    shareButton.className = `${prefix}share-button`;
    shareButton.innerText = "Share Map";
    map.appendChild(shareButton);

    const embedButton = document.createElement("button");
    embedButton.className = `${prefix}embed-button`;
    embedButton.innerText = "Embed Map";
    map.appendChild(embedButton);

    shareContainer = document.createElement("div");
    shareContainer.className = `${prefix}share-container`;

    const shareInstructions = document.createElement("p");
    shareInstructions.innerText = "Click to download the image.";

    const closeButton = document.createElement("button");
    closeButton.innerText = "Back to Map";
    closeButton.onclick = () => toggleShare(false);
    shareImg = document.createElement("img");

    // This is a weird one - you can't just open data-urls anymore
    // so we need to open a window then write html to it :P
    shareImg.onclick = event => {
      const newWindow = window.open();
      newWindow.document.write(`
        <body style="background: #1c313a; margin: 0; padding: 0;">
          <img src=${event.target.getAttribute("src")} style="width: 100%;">
        </body>
      `);
    };
    shareContainer.appendChild(shareImg);
    shareContainer.appendChild(shareInstructions);
    shareContainer.appendChild(closeButton);

    // html2canvass will only load images with the same domain as the visited page
    // so we need to inline the dfp logo
    legendImg.setAttribute(
      "src",
      `data:image/jpg;base64,${btoa(fs.readFileSync("img/dfp-logo-share.jpg", "binary"))}`
    );
  }

  const legend = document.createElement("div");
  legend.className = `${prefix}legend`;

  const legendLabel = document.createElement("span");
  legendLabel.className = `${prefix}legend-label`;

  const legendSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  legendSvg.setAttribute("viewBox", `0 0 ${legendWidth} ${legendHeight}`);

  legend.appendChild(legendLabel);
  legend.appendChild(legendSvg);
  if (typeof shareContainer !== "undefined") legend.appendChild(legendImg);

  vis.appendChild(header);
  vis.appendChild(map);
  vis.appendChild(legend);
  vis.appendChild(loader);
  if (typeof shareContainer !== "undefined") vis.appendChild(shareContainer);
  container.appendChild(vis);

  const controls = document.createElement("div");
  controls.className = `${prefix}controls`;
  ["selector", "filters", "toggle"].forEach(name => {
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
