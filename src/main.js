/** D3 examples
http://bl.ocks.org/dougdowson/9832019


**/


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


// Maybe throwaway, but useful to see
function createTable(data) {
  const keys = Object.keys(data[Object.keys(data)[0]]);
  const table = d3
    .select('body')
    .append('div')
    .attr('class', 'table-container')
    .append('table');

  const tableHead = table
    .append('thead')
    .selectAll('th')
    .data(keys)
    .enter()
    .append('th')
    .text(d => d);

  const rows = table
    .append('tbody')
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    .selectAll('td')
    .data(d => Object.values(d))
    .enter()
    .append('td')
    .text(d => d);
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

async function addDataToFeatures(features) {
  // Get data from Google Sheet and add it to the geojson data
  // Returns an enriched set of district data
  const combinedData = [];

  await d3.json(sheetsURL)
    .then(function(response) {
      response.feed.entry.forEach(d => {
        const rowContent = d.content.$t.split(', ');
        const row = parseRow(rowContent);
        row['id'] = Number(d.title.$t); // Need to add the first column manually
        districtData.push(row);
      })
      // Let's create a table to see what we've got
      createTable(districtData);

      features.forEach(feature => {
        const data = districtData.find(d => d.id === feature.id);
        const richDistrict = {...feature, ...data};
        combinedData.push(richDistrict);
      })
    });

    return combinedData;
}

// Tooltip
tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

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
    addDataToFeatures(districtJson.features)
      .then(data => {
        svg
          .selectAll("path")
          .data(data)
          .enter()
          .append("path")
          .attr("d", geoPathGenerator)
          .attr("class", "district")
          .style("fill", "#229fdd")
          .style("fill-opacity", d => d.overall)
          .on('mouseover', d => {
            tooltip.transition()
      			.duration(250)
      			.style("opacity", 1);
      			tooltip.html(
        			"<strong>" + d.label + "</strong>" +
        			"<table><tbody><tr><td class='wide'>Overall:</td><td>" + d.overall + "</td></tr>" +
        			"<tr><td>Clinton</td><td>" + d.clinton + "</td></tr>" +
        			"<tr><td>Trump:</td><td>" + d.trump + "</td></tr>" +
              "<tr><td>Independent:</td><td>" + d.independent + "</td></tr>" +
              "</tbody></table>"
      			)
      			.style("left", (d3.event.pageX + 15) + "px")
      			.style("top", (d3.event.pageY - 28) + "px");
      		})
      		.on("mouseout", function(d) {
      			tooltip.transition()
      			.duration(250)
      			.style("opacity", 0);
      		});
      });
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
