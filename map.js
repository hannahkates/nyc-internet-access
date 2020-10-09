// variables used across functions
var width;
var height;
var svg;
var cdGeo;
var cdAttributes;

// function that removes existing map/legend, adds load spinner, and sets svg size
function resetSvgAndSpin() {

  //clear all g elements from the svg for the regeneration of the map and legend
  d3.selectAll("g").remove();

  // make load spinner visible
  var loader = document.createElement('div');
  loader.className = 'loader';
  loader.id = 'the-loader';
  document.getElementById('loader-container').appendChild(loader);

  // The svg
  svg = d3.select("svg");
  width = getInnerWidth();
  height = getInnerHeight();

  svg.attr("width", width);
  svg.attr("height", height);
}

// function for loading the data and creating the d3 map
function triggerLoad() {

  resetSvgAndSpin()

  // TODO: understand what this is doing
  cdAttributes = d3.map();

  console.log('loading data...', new Date().getSeconds());

  // Load external data, then trigger the rendering of the map
  d3.queue()
    // .defer(d3.json, "/data/Community Districts.geojson",
    //   function(d) {
    //     cdGeo = d;
    //     console.log('after updating cdGeo', new Date().getSeconds(), cdGeo);
    //   })
    .defer(d3.csv, "https://data.cityofnewyork.us/api/views/rxpf-yca2/rows.csv?accessType=DOWNLOAD",
      function(d) {
        cdAttributes.set(
          d["Community District"],
          // Note: the order of these fields must match the fiendIndex value assigned in the if statement below
          [
            +d["No Internet Access (Percentage of Households)"],
            +d["No Mobile Broadband Adoption (Percentage of Households)"],
            +d["No Home Broadband Adoption (Percentage of  Households)"]
          ]
        );
        console.log('cdAttributes set', new Date().getSeconds(), cdGeo);
      })
    .await(renderMap);
}

function renderMap(cdGeo, cdAttributes) {
  console.log('data loaded, now rendering map...', new Date().getSeconds());
  console.log('inside render', cdGeo);
  var cdGeo = cdGeo;

  // select drop down menu
  var dropdown = d3.select("#variable-options");

  // Get the variable currently selected in the dropdown menu
  var variableName = dropdown.node().options[dropdown.node().selectedIndex].value;
  var fieldIndex

  // Translate the selected variable in the dropdown menu to
  // 1) the data table field name (fieldIndex), and
  // 2) the preferred title for the legend (legendTitle)
  if (variableName == "total") {
    fieldIndex = 0;
    legendTitle = "% of Households without Any Broadband Access"
  } else if (variableName == "mobile") {
    fieldIndex = 1;
    legendTitle = "% of Households without Mobile Broadband"
  } else if (variableName == "home") {
    fieldIndex = 2;
    legendTitle = "% of Households without Broadband at Home"
  } else {
    console.log('no field selected by user');
  }

  path = d3.geoPath().projection(
    d3.geoConicConformal()
      .parallels([40 + 40 / 60, 41 + 2 / 60])
      .rotate([74, 0])
      .fitSize([width, height], cdAttributes)
    );

  // Data and color scale
  var colorScale = d3.scaleThreshold()
    // domain is based on data value range
    .domain([.1, .2, .3, .4, .5])
    .range(d3.schemeBlues[5]);

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(cdGeo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", path)
    // set the color of each country
    .attr("fill", function (d) {
      // gets the curresponding data from cdAttributes based on the id of the individual feature in cdGeo
      // assign 0 if a CD doesn't have data because it doesn't have population
      d.total = cdAttributes.get(d.properties.boro_cd) || [0,0,0];
      return colorScale(d.total[fieldIndex]);
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

// setup resize events
window.addEventListener("resize", renderMap);

function getInnerWidth() {
  return parseFloat(window.getComputedStyle(document.getElementById("map-canvas"), null).getPropertyValue("width"));
}

function getInnerHeight() {
  return parseFloat(window.getComputedStyle(document.getElementById("map-canvas"), null).getPropertyValue("height"));
}

triggerLoad();
