// function for loading the data and creating the d3 map
function renderMap() {
  console.log('render map triggered', new Date().getSeconds());

  // select drop down menu
  var dropdown = d3.select("#variable-options");

  // Get the variable currently selected in the dropdown menu
  var variableName = dropdown.node().options[dropdown.node().selectedIndex].value;
  var fieldName

  // Translate the selected variable in the dropdown menu to
  // 1) the data table field name (fieldName), and
  // 2) the preferred title for the legend (legendTitle)
  if (variableName == "total") {
    fieldName = "No Internet Access (Percentage of Households)";
    legendTitle = "% of Households without Any Broadband Access"
  } else if (variableName == "mobile") {
    fieldName = "No Mobile Broadband Adoption (Percentage of Households)";
    legendTitle = "% of Households without Mobile Broadband"
  } else if (variableName == "home") {
    fieldName = "No Home Broadband Adoption (Percentage of  Households)";
    legendTitle = "% of Households without Broadband at Home"
  } else {
    console.log('no field selected by user');
  }

  //clear all g elements for the regeneration of the map and legend
  d3.selectAll("g").remove();

  // make load spinner visible
  var loader = document.createElement('div');
  loader.className = 'loader';
  loader.id = 'the-loader';
  document.getElementById('loader-container').appendChild(loader);

  // The svg
  var svg = d3.select("svg"),
    width = getInnerWidth(),
    height = getInnerHeight();

  svg.attr("width", width);
  svg.attr("height", height);

  // TODO: understand what this is doing
  var data = d3.map();

  console.log('loading data', new Date().getSeconds());
  // Load external data and boot
  d3.queue()
    .defer(d3.json, "/data/Community Districts.geojson")
    .defer(d3.csv, "https://data.cityofnewyork.us/api/views/rxpf-yca2/rows.csv?accessType=DOWNLOAD",
      function(d) {
        data.set(d["Community District"], +d[fieldName]);
      })
    .await(ready);

  function ready(error, cds) {
    console.log('data loaded', new Date().getSeconds());

    path = d3.geoPath().projection(
      d3.geoConicConformal()
        .parallels([40 + 40 / 60, 41 + 2 / 60])
        .rotate([74, 0])
        .fitSize([width, height], cds)
      );

    // Data and color scale
    var colorScale = d3.scaleThreshold()
      // domain is based on data value range
      .domain([.1, .2, .3, .4, .5])
      .range(d3.schemeBlues[5]);

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

      // Legend
      var g = svg.append("g")
          .attr("class", "legendThreshold")
          .attr("transform", "translate(0,10)");
      var labels = ['0-10%', '11-20%', '21-30%', '31-40%', '41-50%'];
      var legend = d3.legendColor()
          .labels(function (d) { return labels[d.i]; })
          .shapePadding(4)
          .scale(colorScale);
      svg.select(".legendThreshold")
          .call(legend);

    document.getElementById("the-loader").remove();
    console.log('done', new Date().getSeconds());
  }
}

function getInnerWidth() {
  return parseFloat(window.getComputedStyle(document.getElementById("map-canvas"), null).getPropertyValue("width"));
}

function getInnerHeight() {
  return parseFloat(window.getComputedStyle(document.getElementById("map-canvas"), null).getPropertyValue("height"));
}

// setup resize events
window.addEventListener("resize", renderMap);

renderMap();
