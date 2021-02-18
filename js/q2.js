// <!-- Which category has the highest share of apps in the market? -->
const container2 = d3.select(".container #q2");

// HTML ELEMENTS
// include introductory elements in a wrapping container2

container2
  .append("h3")
  .attr("id", "title")
  .text("Which category has the highest share of apps in the market?");

// include also a tooltip, but in the main container2
var tooltip = container2
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", "0");

var s_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 20, bottom: 30, left: 150},
    width = (s_width/2)-50 - margin.left - margin.right, //680
    height = 643 - margin.top - margin.bottom;


// LOLLIPOP PLOT
// include the svg and g elements following the mentioned convention

// append the svg object to the body of the page
var svg2 = container2
    .append("svg")
    .attr("class", "container2__svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

var shareCat = {};

// Parse the Data    
d3.csv("data/cleaned-googleplaystore.csv", function(data) {
    var total_apps = data.length;


data.forEach(function(obj) {
    var cat = obj.Category;

    if(shareCat[cat] === undefined) {
        shareCat[cat] = 1;
    } else {
        shareCat[cat] = shareCat[cat] + 1;
    }
    
});

// now store the share in each data member
data.forEach(function(d) {
    var cat = d.Category;
    d.share = (shareCat[cat] / total_apps * 100).toFixed(2);
});

// sort data
data.sort(function(b, a) {
return a.share - b.share;
});

// get maximum value of our dataset
var maxValue = d3.max(data, function(d) { return +d.share;} ); 

// Add x1 axis
var x1 = d3.scaleLinear()
  .domain([0, maxValue])
  .range([ 0, width]);
  svg2.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x1))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// y1 axis
var y1 = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.Category; }))
  .padding(1);
  svg2.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(y1))

// Lines -> start at x1=0
svg2.selectAll("line.q2-line")
.data(data)
.enter()
.append("line")
    .attr("class", "q2-line")
    .attr("x1", x1(0))
    .attr("x2", x1(0))
    .attr("y1", function(d) { return y1(d.Category); })
    .attr("y2", function(d) { return y1(d.Category); })
    
// Circles -> start at x1=0
svg2.selectAll("circle.q2-circle")
.data(data)
.enter()
.append("circle")
    .attr("class", "q2-circle")
    .attr("cx", x1(0))
    .attr("cy", function(d) { return y1(d.Category); })
    .attr("r", 5)

// Change the x1 coordinates of line and circle
svg2.selectAll("circle.q2-circle")
  .transition()
  .duration(2000)
  .attr("cx", function(d) { return x1(d.share); })

svg2.selectAll("line.q2-line")
  .transition()
  .duration(2000)
  .attr("x1", function(d) { return x1(d.share); })

svg2.selectAll("circle.q2-circle")
// on mouseenter display the tooltip including text pertaining to the data point
.on("mouseover", function(d) {
    
    tooltip
    .style("opacity", "1")
    .style("top", (d3.event.pageY) + "px")
    .style("left", d3.event.pageX + "px")
    .text(d.share + "%")
    
    var rad = +d3.select(this).attr("r")
    d3.select(this).attr("r", rad +7)
    // console.log(d3.select(this))

    var thickness = +d3.select(this).attr("stroke-width")
    d3.select(this).attr("stroke-width", thickness + 5);
    
})
// on mouseleave, hide the tooltip back
.on("mouseout", function(d) {
    tooltip
    .style("opacity", "0")
    var rad = +d3.select(this).attr("r")
    d3.select(this).attr("r", 5)

    var thickness = +d3.select(this).attr("stroke-width")
    d3.select(this).attr("stroke-width", 1)
});



})

