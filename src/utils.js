import {sheetsBaseUrl, sheetsID} from './constants';

export function buildSheetsURL(tab) {
  return `${sheetsBaseUrl}/${sheetsID}/${tab}/public/basic?alt=json`;
}

export function parseRow(row) {
  // Takes a string and converts it into an object with keys for each column
  const pieces = {};
  row.forEach(r => {
    const key = r.split(': ')[0];
    const value = r.split(': ')[1];
    pieces[key] = isNaN(Number(value)) ? value : Number(value);
  })
  return pieces;
}
