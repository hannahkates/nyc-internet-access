// function for loading the data and creating the d3 map
function renderMap(width, height) {

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
    width = width,
    height = height;

  svg.attr("width", width);
  svg.attr("height", height);

  // TODO: understand what this is doing
  var data = d3.map();

  // Load external data and boot
  d3.queue()
    .defer(d3.json, "https://www.hannahkates.com/nyc-internet-access/data/Community%20Districts.geojson")
    .defer(d3.csv, "https://data.cityofnewyork.us/api/views/rxpf-yca2/rows.csv?accessType=DOWNLOAD",
      function(d) {
        data.set(d["Community District"], +d[fieldName]);
      })
    .await(ready);

  function ready(error, cds) {

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

    // Define the tooltop for hover
    var tool_tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var boro_cd = d.properties.boro_cd;
        var boro;
        if (boro_cd > 500) {
          boro = 'Staten Island';
        } else if (boro_cd > 400) {
          boro = 'Queens';
        } else if (boro_cd > 300) {
          boro = 'Brooklyn';
        } else if (boro_cd > 200) {
          boro = 'Bronx';
        } else {
          boro = 'Manhttan'
        }
        return `${boro} ${parseInt(boro_cd.slice(-2))}<br>${Math.round(100*d.total)}%`;
    })

    // Apply the tooltip to the svg
    svg.call(tool_tip);

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
      })
      .on('mouseover', tool_tip.show)
      .on("mouseover", function(d) {
        d3.select(this).style('stroke', 'black')
          .attr('stroke-opacity', 1)
          .attr('stroke-width', 1.5);
      })
      .on('mouseout', tool_tip.hide)
      .on("mouseout", function(d) {
        d3.select(this).style('stroke', 'white')
          .attr('stroke-opacity', 0);
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
  }
}

function resizeMap() {
  var newWidth = getInnerWidth();
  var newHeight = getInnerHeight();
  renderMap(newWidth, newHeight);
}

function getInnerWidth() {
  return parseFloat(window.getComputedStyle(document.getElementById("map-canvas"), null).getPropertyValue("width"));
}

function getInnerHeight() {
  return parseFloat(window.getComputedStyle(document.getElementById("map-canvas"), null).getPropertyValue("height"));
}

// setup resize events
window.addEventListener("resize", resizeMap);

var width = getInnerWidth();
var height = getInnerHeight();

renderMap(width, height);
