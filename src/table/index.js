import * as d3 from "d3";
import { formatAsPercentage } from "../utils";
import { labelMap } from "../constants";

let sortAscending = true;

const tableContainer = d3.select("#table");

function createRows(table, data, keys) {
  return table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr")
    .selectAll("td")
    .data(d => keys.map(k => ({ value: d[k], key: k })))
    .enter()
    .append("td")
    .attr("data-th", d => d.key)
    .text(d => formatAsPercentage(d.value));
}

function createTable(data) {
  const keys = Object.keys(data[Object.keys(data)[0]]).filter(
    k => ["fips", "content"].indexOf(k) === -1
  );
  tableContainer.selectAll("*").remove();
  const table = tableContainer.append("table");

  let rows = createRows(table, data, keys);

  const tableHeaders = table
    .append("thead")
    .selectAll("th")
    .data(keys)
    .enter()
    .append("th")
    .text(d => labelMap[d])
    .attr("class", d =>
      !Number.isNaN(data[0][d]) ? "sortable" : "not-sortable"
    )
    .on("click", (d, i, h) => {
      tableHeaders.attr("class", t =>
        !Number.isNaN(data[0][t]) ? "sortable" : "not-sortable"
      );
      const th = h[i];
      if (!Number.isNaN(data[0][d])) {
        if (sortAscending) {
          data.sort((a, b) => b[d] - a[d]);
          sortAscending = false;
          th.className = "sortable sort--ascending";
        } else {
          data.sort((a, b) => a[d] - b[d]);
          sortAscending = true;
          th.className = "sortable sort--descending";
        }

        rows.remove();
        rows = createRows(table, data, keys);
      }
    });
}

export default createTable;
