// <!-- Which is the most popular app category or genre? -->
const container = d3.select(".container #q1");

// HTML ELEMENTS
// include introductory elements in a wrapping container
// include also a tooltip, but in the main container
var tooltip = container
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", "0");

var s_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 20, bottom: 30, left: 150},
    width = (s_width/2)-50 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


// LOLLIPOP PLOT
// include the svg and g elements following the mentioned convention

// append the svg object to the body of the page
var svg = container
    .append("svg")
    .attr("class", "container__svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// Initialize X axis
var x = d3.scaleLinear()
    .range([ 0, width]);
var xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")");

// Initialize Y axis
var y = d3.scaleBand()
    .range([ 0, height ])
    .padding(1);
var yAxis = svg.append("g")
.attr("class", "axis")

// A function that create / update the plot for a given variable:
function update(selectedVar) {
    console.log(selectedVar)
    if(selectedVar=='Category'){
        document.getElementById("button1")
        .style.backgroundColor = "#e29578";
        document.getElementById("button2")
        .style.backgroundColor = "#6b705c";
    } else {
        document.getElementById("button1")
        .style.backgroundColor = "#6b705c";
        document.getElementById("button2")
        .style.backgroundColor = "#e29578";
    };


    var countCat = {};

    // Parse the Data    
    d3.csv("../data/cleaned-googleplaystore.csv", function(data) {

    data.forEach(function(obj) {
        var cat = obj[selectedVar];

        if (selectedVar == 'Genre1'){
            var cat1 = obj['Genre2'];
        }
        if(countCat[cat] === undefined) {
            countCat[cat] = 1;
        } else {
            countCat[cat] = countCat[cat] + 1;
        }
        if (cat1 != ""){
            cat = cat1
            if(countCat[cat] === undefined) {
                countCat[cat] = 1;
            } else {
                countCat[cat] = countCat[cat1] + 1;
            }
        }
        
    });

    // now store the count in each data member
    data.forEach(function(d) {
        var cat = d[selectedVar];
        d.count = countCat[cat];
    });
        
    console.log(countCat)
        
    // sort data
    data.sort(function(b, a) {
    return a.count - b.count;
    });

    var maxValue = d3.max(data, function(d) { return +d.count;} ); // get maximum value of our dataset


    // Add X axis
    x.domain([0, maxValue]);
    xAxis.transition()
    .duration(1000)
    .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    
    // Y axis
    y.domain(data.map(function(d) { return d[selectedVar]; }));
    yAxis.transition()
    .duration(1000)
    .call(d3.axisLeft(y));

    // Lines
    var j = svg.selectAll("line.q1-line")
    .data(data)
    // update lines
    j
    .enter()
    .append("line")
    .attr("class", "q1-line")
    .merge(j)
    .transition()
    .duration(1000)
    .attr("x1", function(d) { return x(d.count); })
    .attr("x2", x(0))
    .attr("y1", function(d) { return y(d[selectedVar]); })
    .attr("y2", function(d) { return y(d[selectedVar]); })
        
    // Circles
    var u = svg.selectAll("circle.q1-circle")
    .data(data)
    // update bars
    u
    .enter()
    .append("circle")
    .attr("class", "q1-circle")
    .merge(u)
    .transition()
    .duration(1000)
    .attr("cx", function(d) { return x(d.count); })
    .attr("cy", function(d) { return y(d[selectedVar]); })
    .attr("r", 5)

    svg.selectAll("circle.q1-circle")
    // on mouseenter display the tooltip including text pertaining to the data point
    .on("mouseover", function(d) {
        
        tooltip
        .style("opacity", "1")
        .style("top", (d3.event.pageY) + "px")
        .style("left", d3.event.pageX + "px")
        .text(d.count)
        
        var rad = +d3.select(this).attr("r")
        d3.select(this).attr("r", rad +7)
        console.log(d3.select(this))

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

    
}
  

update('Category')
