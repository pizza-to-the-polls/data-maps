import { select } from "d3";
import marked from "marked";
import { formatAsPercentage, makeLabel, formatQualitativeScale } from "../utils";
import { prefix, excludedKeys } from "../constants";

// Tooltip
let details;

const getDetailsKeys = data => {
  return Object.keys(data).filter(k => excludedKeys.indexOf(k) === -1);
};

const quantitativeContent = data => {
  let content = `<h4>${data.label}</h4>`;
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
  let content = `<h4>${data.label}</h4>`;
  content += `<p><strong>Current policy:</strong> ${formatQualitativeScale(
    data.current,
    "long"
  )}</p>`;
  content += `<p>${marked(data.currentdescription)}</p>`;
  content += `<p><strong>Proposed policy:</strong> ${formatQualitativeScale(
    data.proposed,
    "long"
  )}</p>`;
  content += `<p>${marked(data.proposeddescription)}</p>`;
  if (data.bill !== "NA" && data.bill !== "N/A") {
    content += `<p><strong>Policy</strong>: <a href=${data.link} target="blank">${
      data.bill
    }</a></p>`;
  }
  return content;
};

export const addDetails = d => {
  let content;
  if (d.scale === "quantitative") {
    content = quantitativeContent(d);
  } else {
    content = qualitativeContent(d);
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
