import * as d3 from 'd3';

let sortAscending = true;

const tableContainer = d3.select('#table');

function createRows(table, data, keys) {
  return table
    .append('tbody')
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    .selectAll('td')
    .data((d) => {
      const tempdata = keys.map(k => ({ value: d[k], key: k }));

      return tempdata;
    })
    .enter()
    .append('td')
    .attr('data-th', d => d.key)
    .text(d => d.value);
}

function createTable(data) {
  const keys = Object.keys(data[Object.keys(data)[0]]);
  keys.pop('fips');
  tableContainer.selectAll('*').remove();
  const table = tableContainer.append('table');

  let rows = createRows(table, data, keys);

  const tableHeaders = table
    .append('thead')
    .selectAll('th')
    .data(keys)
    .enter()
    .append('th')
    .text(d => d)
    .attr('class', d => (!isNaN(data[0][d]) ? 'sortable' : 'not-sortable'))
    .on('click', (d) => {
      tableHeaders.attr('class', d => (!isNaN(data[0][d]) ? 'sortable' : 'not-sortable'));
      if (!isNaN(data[0][d])) {
        if (sortAscending) {
          data.sort((a, b) => b[d] - a[d]);
          sortAscending = false;
          this.className = 'sortable sort--ascending';
        } else {
          data.sort((a, b) => a[d] - b[d]);
          sortAscending = true;
          this.className = 'sortable sort--descending';
        }

        rows.remove();
        rows = createRows(table, data, keys);
      }
    });
}

export default createTable;
