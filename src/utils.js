import { sheetsBaseUrl, sheetsID } from './constants';

export function buildSheetsURL(tab) {
  return `${sheetsBaseUrl}/${sheetsID}/${tab}/public/basic?alt=json`;
}

export function parseRow(row) {
  // Takes a string and converts it into an object with keys for each column

  const pieces = {};
  row.split(', ').forEach((r) => {
    const key = r.split(': ')[0];
    const value = r.split(': ')[1];
    pieces[key] = Number.isNaN(Number(value)) ? value : Number(value);
  });
  return pieces;
}

export function formatAsPercentage(value) {
  if (isNaN(value)) {
    return value;
  }
  const percentage = value * 100;
  return `${percentage.toFixed(0)}%`;
}

export function parseStats(data) {
  const cleanStats = [];
  data.feed.entry.forEach((d) => {
    const row = parseRow(d.content.$t);
    row.fips = Number(d.title.$t); // Need to add the first column manually
    cleanStats.push(row);
  });
  return cleanStats;
}

export function selectActiveFilter(group, filter) {
  group.select('.selected').attr('class', '');
  group.select(`#${filter}`).attr('class', 'selected');
}
