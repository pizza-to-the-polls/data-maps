/** D3 examples
http://bl.ocks.org/dougdowson/9832019


**/


const sheetsURL = 'https://spreadsheets.google.com/feeds/list/1loELb4aslMLnvzdU7mMz75iz11OyDblZZSRcINnukYk/1/public/basic?alt=json';
const statesURL = '/src/us.json';
const districtsURL = '/src/us-congress-113.json';
const districtData = [];
let sortAscending = true;

// Default filter value
let globalFilter = 'overall';

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

  const tableHeaders = table
    .append('thead')
    .selectAll('th')
    .data(keys)
    .enter()
    .append('th')
    .text(d => d)
    .on('click', function (d) {
      // This doesn't work yet
  	 //   tableHeaders.attr('class', 'header');
     //
  	 //   if (sortAscending) {
  	 //     data.sort((a, b) => {
     //       return b[d] - a[d];
     //     });
  	 //     sortAscending = false;
  	 //     this.className = 'aes';
  	 //   } else {
    	// 	 data.sort((a, b) => b[d] - a[d]);
    	// 	 sortAscending = true;
    	// 	 this.className = 'des';
  	 //   }
     //
     //   rows.data(data);
     //
     });

     createRows(table, data, keys);
}

function createRows(table, data, keys) {
  const rows = table
    .append('tbody')
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    .selectAll('td')
    .data(function (d) {
      const tempdata = keys.map(function (k) {
        return { 'value': d[k], 'key': k};
      });

      return tempdata;
    })
    // .data(d => Object.values(d))
    .enter()
    .append('td')
    .attr('data-th', d => d.key)
    .text(d => d.value);
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

// Create a diverging red to blue scale
const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([0, 1]);

// Tooltip
tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Load data
const files = [statesURL, districtsURL, sheetsURL];
let promises = [];
files.forEach(url => promises.push(d3.json(url)));
Promise.all(promises).then(drawMap);

// Clean up the google data
function parseStats(data) {
  const cleanStats = [];
  data.feed.entry.forEach(d => {
    const rowContent = d.content.$t.split(', ');
    const row = parseRow(rowContent);
    row['id'] = Number(d.title.$t); // Need to add the first column manually
    cleanStats.push(row);
  })
  return cleanStats;
}

// Get data from Google Sheet and add it to the geojson data
// Returns an enriched set of district data
function addStatsToFeatures(districts, stats) {
  const combinedData = [];

  districts.forEach(feature => {
    const data = stats.find(d => d.id === feature.id);
    const richDistrict = {...feature, ...data};
    combinedData.push(richDistrict);
  });

  return combinedData;
}

// Draw the map
function drawMap(data) {
  // Data = results from the three json calls
  const states = data[0];
  const districts = data[1];
  const stats = data[2];

  const statesGeo = topojson.feature(states, states.objects.states);
  const districtsGeo = topojson.feature(districts, districts.objects.districts);
  const cleanStats = parseStats(stats);
  const districtsWithStats = addStatsToFeatures(districtsGeo.features, cleanStats);
  const filters = Object.keys(cleanStats[0]).filter(key => ['label', 'id', 'state'].indexOf(key) === -1);

  const statePaths = drawStates(statesGeo);
  const districtPaths = drawDistricts(districtsWithStats);
  const dataTable = createTable(cleanStats);

  // Add some filters
  d3
    .select('#filters')
    .selectAll('button')
    .data(filters)
    .enter()
    .append('button')
    .text(d => d)
    .on('click', filter => updateDistricts(districtPaths, filter));

};

function drawStates(states) {
  svg
    .selectAll("path")
    .data(states.features)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "state");
}


function drawDistricts(districts) {
  return svg
    .selectAll("path")
    .data(districts)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "district")
    .style("fill", d => colorScale(d[globalFilter]))
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
}

function updateDistricts(districtPaths, filter) {
  districtPaths
    .transition()
    .style("fill", d => colorScale(d[filter]));
}

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
