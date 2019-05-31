import { select } from "d3";
import marked from "marked";
import {
  formatAsPercentage,
  makeLabel,
  formatQualitativeScale,
  notNA,
  getFullLabel
} from "../utils";
import { prefix, excludedKeys, QUALITATIVE_SCALE } from "../constants";

// Tooltip
let details;

const getDetailsKeys = data => {
  return Object.keys(data).filter(k => excludedKeys.indexOf(k) === -1);
};

const quantitativeContent = data => {
  let content = `<h4>${getFullLabel(data.label)}</h4>`;
  content += "<table><tbody>";
  const keys = getDetailsKeys(data);
  keys.forEach(key => {
    if (key !== "content") {
      content += `<tr><td>${makeLabel(key)}</td><td>${formatAsPercentage(data[key])}</td></tr>`;
    }
  });
  content += "</tbody></table>";
  if (data.content) {
    content += `<p class="details-content">${marked(data.content)}</p>`;
  }

  return content;
};

const qualitativeContent = data => {
  let content = `<h4>${getFullLabel(data.label)}</h4>`;
  content += `<div class="${prefix}current-policy"><h5>Current policy</h5>`;
  if (notNA(data.currentdescription)) content += `<p>${marked(data.currentdescription)}</p>`;
  content += `<p><strong>Quality:</strong> ${formatQualitativeScale(
    data.current,
    "short"
  )}</p></div>`;
  content += `<h5>Proposed policy</h5>`;
  if (notNA(data.proposeddescription)) content += `<p>${marked(data.proposeddescription)}</p>`;
  if (notNA(data.bill))
    content += `<p><strong>Policy</strong>: <a href=${data.link} target="blank">${
      data.bill
    }</a></p>`;
  content += `<p><strong>Quality:</strong> ${formatQualitativeScale(data.proposed, "short")}</p>`;
  return content;
};

export const addDetails = d => {
  let content;
  if (d.scaleType === QUALITATIVE_SCALE) {
    content = qualitativeContent(d);
  } else {
    content = quantitativeContent(d);
  }

  details.style("display", "block").html(content);
};

export const removeDetails = () => {
  details
    .style("display", "none")
    .selectAll("*")
    .remove();
};

export const initDetails = container => {
  details = select(container)
    .select(`.${prefix}map`)
    .append("div")
    .attr("class", `${prefix}details`);
};
