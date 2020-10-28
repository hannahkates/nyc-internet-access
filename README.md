# Data Viz: Map of broadband internet access by NYC Community District

[hannahkates.com/nyc-internet-access](https://www.hannahkates.com/nyc-internet-access)

## About
This is an interactive map showing which NYC Community Districts have the most households without broadband internet access. It is a simple vanilla JavaScript application with a d3.js chloropleth map.

## Data sources
- The household internet access data is sourced directly from live data on [NYC Open Data, Dept. of Environmental Protection, "Water Consumption In The New York City"](https://data.cityofnewyork.us/Environment/Water-Consumption-In-The-New-York-City/ia2d-e54m)
- The Community District boundaries were originally sourced from [NYC Open Data, Dept. of City Planning "Community Districts"](https://data.cityofnewyork.us/City-Government/Community-Districts/yfnk-k7r4). However, the file was too large and contained unnecessary details (like piers) for the citywide zoom level of the map. I used [mapshaper.org](https://mapshaper.org/) to simplify the geometries and reduce the file size. The [resized GeoJSON](https://github.com/hannahkates/nyc-internet-access/blob/master/data/Community%20Districts.geojson) is stored in this repo.

## Dependencies
- d3 v4
- To implement tooltips, I used d3-tip.js written by Justin Palmer. I [copied the code directly into this repo](https://github.com/hannahkates/nyc-water/blob/master/js/d3-tip.js) because I had trouble finding a stable, secure link to a hosted version online.

## How to run this application locally
- Clone repo `git clone https://github.com/hannahkates/nyc-internet-access.git`
- Run using python dev server `python -m SimpleHTTPServer` (or other local server options like Atom Live Server)

## Resources
This build was guided by these blog posts:
- http://bl.ocks.org/lwhitaker3/e8090246a20d9515789b
