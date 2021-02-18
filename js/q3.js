// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 50, left: 350},
    width = 630 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

// set the ranges
var y2 = d3.scaleBand()
          .range([height, 0])
          .padding(0.1);

var x2 = d3.scaleLinear()
          .range([0, width]);
          
// append the svg object to the q3
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#q3").append("svg")
            .attr("id", "q3svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip1 = d3.select("#q3").append("div").attr("class", "toolTip");

// load the data
d3.csv("data/cleaned-googleplaystore.csv", function(d) {
    d.installs = +d.Installs; 
    d.installs = d.installs/1000000;
    d.rating = +d.Rating;
return d;
}, function(error, datafile) {

    if (error) throw error;

    //descending sort 
    datafile.sort(function(a, b) {
        return d3.descending(+a.installs, +b.installs);
    });

    // put the original data in csv
    csv = datafile;

    // filter the data based on the inital value
    var data = csv.filter(function(d) { 
        var sq = d3.select("#filter").property("value");
        return d.Category === sq;
    }).slice(0, 20); //get the top 15

    console.log(data);

    data.sort(function(a, b) {
        var aInstalls = a.installs;
        var bInstalls = b.installs;
        var aRating = a.rating;
        var bRating = b.rating;
        // return a.installs - b.installs;

        if(aInstalls == bInstalls)
        {
            return (aRating < bRating) ? -1 : (aRating > bRating) ? 1 : 0;
        }
        else
        {
            return (aInstalls < bInstalls) ? -1 : 1;
        }

    }); 

    // Scale the range of the data in the domains
    x2.domain([0, d3.max(data, function(d){ return d.installs; })])
    y2.domain(data.map(function(d) { return d.App; }));
    
    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("width", function(d) {return x2(d.installs); } )
        .attr("y", function(d) { return y2(d.App); })
        .attr("height", y2.bandwidth()-5) //20
        .on("mousemove", function(d){
                tooltip1
                .style("opacity", "1")
                .style("left", d3.event.pageX - 40 + "px")
                .style("top", d3.event.pageY - 60 + "px")
                .style("display", "inline-block")
                .html(("Rating: " + "<b>" + (d.Rating) + "</b>" + ", " + "Num of Installs: " + "<b>" + (d.installs) + "M" + "</b>"));
            })
        .on("mouseout", function(d){ tooltip1.style("display", "none");});

    // add the x2 Axis
    svg.append("g")
        .attr("class", "x2 axis1")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x2));

    svg.append("text")             
        .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Number of Installs (M)");
        
    // add the y2 Axis
    svg.append("g")
        .attr("class", "y2 axis1")
        .call(d3.axisLeft(y2));
        
    // svg.append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("y", 0 - margin.left)
    // .attr("x",0 - (height / 2))
    // .attr("dy", "1em")
    // .style("text-anchor", "middle");
    // .text("App");  
            
    // add a change event handler 
    d3.select("#filter").on("change", function() {
        applyFilter(this.value);
        });

    function applyFilter(value) {

        // filter the data
        var data = csv.filter(function(d) {return d.Category === value;}).slice(0,20);

        data.sort(function(a, b) {
        // return a.installs - b.installs;
            var aInstalls = a.installs;
            var bInstalls = b.installs;
            var aRating = a.rating;
            var bRating = b.rating;
            // return a.installs - b.installs;

            if(aInstalls == bInstalls)
            {
                return (aRating < bRating) ? -1 : (aRating > bRating) ? 1 : 0;
            }
            else
            {
                return (aInstalls < bInstalls) ? -1 : 1;
            }
        });
        
        x2.domain([0, d3.max(data, function(d){ return d.installs; })])
        y2.domain(data.map(function(d) { return d.App; }));
        
        svg.select('.x2.axis1').transition().duration(300).call(d3.axisBottom(x2));

        svg.select(".y2.axis1").transition().duration(300).call(d3.axisLeft(y2));

        var bars = svg.selectAll(".bar").data(data, function(d) { return d.Category === value; })
        
        bars.exit()
            .transition()
            .duration(300)
            .attr("width", function(d) {return x2(d.installs); } )
            .attr("y", function(d) { return y2(d.App); })
            .attr("height", y2.bandwidth()-5) 
            .remove();

        // data that needs DOM = enter() 
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("width", function(d) {return x2(d.installs); } ) 
            .attr("y", function(d) { return y2(d.App); })
            .attr("height", y2.bandwidth()-5)
            .on("mousemove", function(d){
                    tooltip1
                    .style("opacity", "1")
                    .style("left", d3.event.pageX - 40 + "px")
                    .style("top", d3.event.pageY - 60 + "px")
                    .style("display", "inline-block")
                    .html(("Rating: " + "<b>" + (d.Rating) + "</b>" + ", " + "Num of Installs: " + "<b>" + (d.installs) + "M" + "</b>"));
                })
            .on("mouseout", function(d){ tooltip1.style("display", "none");}); 

        // the "UPDATE" set:
        bars.transition().duration(300)
            .attr("x", function(d) { return x2(d.installs); }) 
            .attr("width", function(d) {return x2(d.installs); } )
            .attr("y", function(d) { return y2(d.App); })
            .attr("height", y2.bandwidth()-5); 
    }
});