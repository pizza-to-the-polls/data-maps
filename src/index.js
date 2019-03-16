const sheetsBaseUrl = 'https://spreadsheets.google.com/feeds/list';
const sheetsID = '1loELb4aslMLnvzdU7mMz75iz11OyDblZZSRcINnukYk';
const statesURL = '/data/us.json';
const districtsURL = '/data/us-congress-113.json';
const districtData = [];
const tabs = [3, 4, 5, 6]; // Array of tab IDs
const filterContainer = d3.select('#filters');
const mapSelectorContainer = d3.select('#selector');
const tableContainer = d3.select('#table');

// SVG stuff
const svg = d3.select("svg");
const svgWidth = +svg.attr("viewBox").split(" ")[2],
  svgHeight = +svg.attr("viewBox").split(" ")[3];

const projection = d3
  .geoAlbersUsa()
  .translate([svgWidth / 2, svgHeight / 2]);

const geoPathGenerator = d3.geoPath().projection(projection);
const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([0, 1]);

// Tooltip
tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Default filter value
let globalFilter = 'overall';
let sortAscending = true;

// Build() calls the API and builds everything
build(tabs[0]);

function buildSheetsURL(tab) {
  return `${sheetsBaseUrl}/${sheetsID}/${tab}/public/basic?alt=json`;
}

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
  let keys = Object.keys(data[Object.keys(data)[0]]);
  keys.pop('fips');
  tableContainer.selectAll("*").remove();
  const table = tableContainer.append('table');

  let rows = createRows(table, data, keys);

  const tableHeaders = table
    .append('thead')
    .selectAll('th')
    .data(keys)
    .enter()
    .append('th')
    .text(d => d)
    .attr('class', d => {
      return !isNaN(data[0][d]) ? 'sortable' : 'not-sortable';
    })
    .on('click', function (d) {
      tableHeaders.attr('class', d => {
         return !isNaN(data[0][d]) ? 'sortable' : 'not-sortable';
      });
      if (!isNaN(data[0][d])) {
    	   if (sortAscending) {
    	     data.sort((a, b) => {
             return b[d] - a[d];
           });
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

function createRows(table, data, keys) {
  return table
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
    .enter()
    .append('td')
    .attr('data-th', d => d.key)
    .text(d => d.value);
}

// Load data
function build(tab) {
  const sheetsURL = buildSheetsURL(tab);
  const files = [statesURL, districtsURL, sheetsURL];
  let promises = [];
  files.forEach(url => promises.push(d3.json(url)));
  Promise.all(promises).then(drawMap);
}

// Clean up the google data
function parseStats(data) {
  const cleanStats = [];
  data.feed.entry.forEach(d => {
    const rowContent = d.content.$t.split(', ');
    const row = parseRow(rowContent);
    row['fips'] = Number(d.title.$t); // Need to add the first column manually
    cleanStats.push(row);
  })
  return cleanStats;
}

// Get data from Google Sheet and add it to the geojson data
// Returns an enriched set of district data
function addStatsToFeatures(features, stats) {
  const combinedData = [];

  features.forEach(feature => {
    const data = stats.find(d => d.fips === feature.id);
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

  // Clear the map out
  svg.selectAll("*").remove();

  // If the first row's FIPS code is over 100 we know it's district data
  if (cleanStats[0].fips > 100) {
    const statePaths = drawStates(statesGeo.features);
    const districtsWithStats = addStatsToFeatures(districtsGeo.features, cleanStats);
    const districtPaths = drawDistricts(districtsWithStats);
  } else {
    // Otherwise we know it's states
    const statesWithStats = addStatsToFeatures(statesGeo.features, cleanStats);
    const statePaths = drawStatesWithData(statesWithStats);
  }

  const filters = Object.keys(cleanStats[0]).filter(key => ['label', 'fips', 'state'].indexOf(key) === -1);
  const dataTable = createTable(cleanStats);

  // Add some filters
  filterContainer.selectAll("*").remove();
  filterContainer
    .selectAll('button')
    .data(filters)
    .enter()
    .append('button')
    .text(d => d)
    .on('click', filter => updateDistricts(districtPaths, filter));

};

function drawStatesWithData(states) {
  svg
    .selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .style("fill", d => colorScale(d[globalFilter]))
    .attr("d", geoPathGenerator)
    .attr("class", "state")
    .on('mouseover', addTooltip)
    .on("mouseout", removeTooltip);
}

function drawStates(states) {
  svg
    .selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "state")
    .on('mouseover', addTooltip)
    .on("mouseout", removeTooltip);
}

function createTooltipContent(data) {
    let content = `<strong>${data.label}</strong>`;
    content += `<table><tbody>`;
    Object.keys(data).forEach(key => {
      if (!isNaN(data[key]) && key !== 'fips' && key !== 'id') {
        content += `<tr><td>${key}</td><td>${data[key]}</td></tr>`;
      }
    });
    content += `</tbody></table>`;
    return content;
}

function addTooltip(d) {
  tooltip.transition()
  .duration(250);

  tooltip.html(createTooltipContent(d))
  .style("opacity", 1)
  .style("left", (d3.event.pageX + 15) + "px")
  .style("top", (d3.event.pageY - 28) + "px");
}

function removeTooltip(d) {
  tooltip.transition()
  .duration(250)
  .style("opacity", 0);
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
    .on('mouseover', addTooltip)
    .on("mouseout", removeTooltip);
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

// Map switcher
mapSelectorContainer.append('label').attr('for', 'map-selector').text('Issue');

const mapSelector = mapSelectorContainer
  .append('select')
  .attr('id', 'map-selector')
  .on('change', () => {
    const selectedTab = mapSelector.property('value');
    build(selectedTab);
  });

const options = mapSelector
  .selectAll('option')
  .data(tabs)
  .enter()
  .append('option')
  .attr('value', d => d)
  .text(d => d);
