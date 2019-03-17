import { select, selectAll, json } from 'd3';
import marked from 'marked';

import { buildSheetsURL } from '../utils';

const contentURL = buildSheetsURL(2);

export function showContent(issueKey) {
  selectAll('#content section').style('display', 'none');
  select(`[data-issue=${issueKey}]`).style('display', 'block');
}

export function getContent(currentIssueKey) {
  json(contentURL).then((response) => {
    response.feed.entry.forEach((entry) => {
      select('#content')
        .append('section')
        .attr('data-issue', entry.title.$t)
        .style('display', 'none')
        .html(marked(entry.content.$t.split('content: ')[1]));
    });
    showContent(currentIssueKey);
  });
}

export default getContent;
