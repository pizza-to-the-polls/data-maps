import * as d3 from 'd3';
import { formatAsPercentage } from '../utils';
import { excludedKeys } from '../constants';
import { labelMap } from '../translations';

// Tooltip
const placeholder = 'Hover over the map to view details.';
const tooltip = d3.select('#details').append('p').text(placeholder);

function getTooltipKeys(data) {
  return Object.keys(data).filter(k => excludedKeys.indexOf(k) === -1);
}

function createTooltipContent(data) {
  let content = `<strong>${data.label}</strong>`;
  content += '<table><tbody>';
  const keys = getTooltipKeys(data);
  keys.forEach((key) => {
    content += `<tr><td>${labelMap[key]}</td><td>${formatAsPercentage(data[key])}</td></tr>`;
  });
  content += '</tbody></table>';
  return content;
}

export function addTooltip(d) {
  tooltip.html(createTooltipContent(d));
}

export function removeTooltip() {
  tooltip.selectAll('*').remove();
  tooltip.append('p').text(placeholder);
}
