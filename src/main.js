const sheetsURL = 'https://spreadsheets.google.com/feeds/list/1loELb4aslMLnvzdU7mMz75iz11OyDblZZSRcINnukYk/1/public/basic?alt=json';
const districtData = [];

function parseRow(row) {
  // Takes a string and converts it into an object with keys for each column
  const pieces = {};
  row.forEach(r => {
    const key = r.split(': ')[0];
    const value = r.split(': ')[1];
    pieces[key] = isNaN(Number(value)) ? value : Number(value);
  })
  return pieces;
}

d3.json(sheetsURL)
  .then(function(response) {
    response.feed.entry.forEach(d => {
      const rowContent = d.content.$t.split(', ');
      const row = parseRow(rowContent);
      row['id'] = d.title.$t; // Need to add the first column manually
      districtData.push(row);
    })
    // Let's create a table to see what we've got
    createTable(districtData);
  });

// Maybe throwaway, but useful to see
function createTable(data) {
  const keys = Object.keys(data[Object.keys(data)[0]]);
  const tableHead = document.getElementById('data-table-header');
  const tableBody = document.getElementById('data-table-body');
  console.log(tableHead);
  keys.forEach(k => {
    const label = document.createElement('th');
    label.innerHTML = k;
    tableHead.appendChild(label);
  });

  data.forEach(d => {
    const row = document.createElement('tr');
    Object.values(d).forEach(c => {
        const cell = document.createElement('td');
        cell.innerHTML = c;
        row.appendChild(cell);
    })
    tableBody.appendChild(row);
  })
}

////// D3 ///////
const svg = d3.select("svg");

// get <svg> width and height from HTML instead of hard-coding values
const svgWidth = +svg.attr("viewBox").split(" ")[2],
  svgHeight = +svg.attr("viewBox").split(" ")[3];

const projection = d3
  .geoAlbersUsa()
  .translate([svgWidth / 2, svgHeight / 2]);

const geoPathGenerator = d3.geoPath().projection(projection);

// Load states
d3
  .json("/src/us.json")
  .then(function(loadedTopoJson) {
    const geoJson = topojson.feature(loadedTopoJson, loadedTopoJson.objects.states);

    svg
      .selectAll("path")
      .data(geoJson.features)
      .enter()
      .append("path")
      .attr("d", geoPathGenerator)
      .attr("class", "state");
  });

// Load districts
d3
  .json("/src/us-congress-113.json")
  .then(function(loadedTopoJson) {
    const districtJson = topojson.feature(loadedTopoJson, loadedTopoJson.objects.districts);

    svg
      .selectAll("path")
      .data(districtJson.features)
      .enter()
      .append("path")
      .attr("d", geoPathGenerator)
      .attr("class", "district");
});

// ZOOM ZOOM //
const zoom = d3.zoom()
  .scaleExtent([1, 20])
  .on('zoom', zoomed);


svg.call(zoom);

function zoomed() {
  svg
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3.event.transform);
}
