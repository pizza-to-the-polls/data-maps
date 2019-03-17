import * as d3 from 'd3';
import { formatAsPercentage } from '../utils';
import { excludedKeys } from '../constants';
import { labelMap } from '../translations';

// Tooltip
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);


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
  tooltip.transition()
    .duration(250);

  tooltip.html(createTooltipContent(d))
    .style('opacity', 1)
    .style('left', `${d3.event.pageX + 15}px`)
    .style('top', `${d3.event.pageY - 28}px`);
}

export function removeTooltip() {
  tooltip.transition()
    .duration(250)
    .style('opacity', 0);
}
