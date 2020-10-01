// select drop down menu
var dropdown = d3.select("#variable-options");

// function for loading the data and creating the d3 map
function renderMap() {

  // The svg
  var svg = d3.select("svg"),
    width = getInnerWidth(),
    height = getInnerHeight();

  svg.attr("width", width);
  svg.attr("height", height);

  var data = d3.map();

  // Data and color scale
  var colorScale = d3.scaleThreshold()
    // domain is based on data value range
    .domain([.1, .2, .3, .4, .5])
    .range(d3.schemeBlues[5]);

  console.log('i am triggered');

  var variableName = dropdown.node().options[dropdown.node().selectedIndex].value;
  var fieldName

  if (variableName == "total") {
    fieldName = "No Internet Access (Percentage of Households)";
  } else if (variableName == "mobile") {
    fieldName = "No Mobile Broadband Adoption (Percentage of Households)";
  } else if (variableName == "home") {
    fieldName = "No Home Broadband Adoption (Percentage of  Households)";
  } else {
    console.log('no field selected by user');
  }

  // Load external data and boot
  d3.queue()
    .defer(d3.json, "https://data.cityofnewyork.us/api/geospatial/yfnk-k7r4?method=export&format=GeoJSON")
    .defer(d3.csv, "https://data.cityofnewyork.us/api/views/rxpf-yca2/rows.csv?accessType=DOWNLOAD",
      function(d) {
        data.set(d["Community District"], +d[fieldName]);
      })
    .await(ready);

  function ready(error, cds) {

    //clear way for the regeneration
    d3.selectAll("path").remove();

    path = d3.geoPath().projection(
      d3.geoConicConformal()
        .parallels([40 + 40 / 60, 41 + 2 / 60])
        .rotate([74, 0])
        .fitSize([width, height], cds)
      );

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(cds.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", path)
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.properties.boro_cd) || 0;
        return colorScale(d.total);
      });
  }
}

function getInnerWidth() {
  return parseFloat(window.getComputedStyle(document.getElementById("my-map"), null).getPropertyValue("width"));
}

function getInnerHeight() {
  return parseFloat(window.getComputedStyle(document.getElementById("my-map"), null).getPropertyValue("height"));
}

// setup resize events
window.addEventListener("resize", renderMap);

renderMap();
