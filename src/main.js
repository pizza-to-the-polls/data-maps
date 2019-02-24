// make D3 aware of the <svg> element in the HTML
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

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', zoomed);


 svg.call(zoom);

 function zoomed() {
      svg
        .selectAll('path') // To prevent stroke width from scaling
        .attr('transform', d3.event.transform);
    }
