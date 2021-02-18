// set the dimensions and margins of the graph
var selectedCategory = "ART_AND_DESIGN";

var s_width1 = (window.innerWidth > 0) ? window.innerWidth : screen.width;

var margin = {top: 20, right: 20, bottom: 50, left: 200},
    width1 = 960 - margin.left - margin.right, //960
    height1 = 550 - margin.top - margin.bottom;

// set the ranges
var x2 = d3.scaleBand()
          .range([0, width1])
          .padding(0.1);

var y2 = d3.scaleLinear()
          .range([height1, 0]);
          
// append the svg3 object to the body of the page
// append a 'group' element to 'svg3'
// moves the 'group' element to the top left margin
var svg3 = d3.select("#q4").append("svg")
            .attr("class", "container3__svg")
            .attr("width", width1 + margin.left + margin.right)
            .attr("height", height1 + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip1 = d3.select("#q4").append("div").attr("class", "toolTip");

// load the data
d3.csv("data/cleaned-googleplaystore.csv", function(d) {
    // console.log(d);
    return d;
}, function(error, datafile) {

    if (error) throw error;

    // console.log(datafile);

    // nest
    var nested_data = d3.nest()
                        .key(function(d) { return d.Category; })
                        .rollup(function(leaves) { return leaves.length; })
                        .entries(datafile)

    // console.log(nested_data);

    data = datafile;

    var categoryMenu = d3.select("#catDropdown")
    
    categoryMenu.append("select")
                .style("width", 490 + 'px')
                .selectAll("option")
                .data(nested_data)
                .enter()
                .append("option")
                .attr("value", function(d){return d.key;})
                .text(function(d){return d.key;})

    var data2 = data.filter(function(d) { 
        var sq = d3.select("#catDropdown").select("select").property("value");
        return d.Category === sq;
    }); 
    console.log("data2");
    console.log(data2);

    var nested_data2 = d3.nest()
                        .key(function(d) { return d.bin_size; })
                        .rollup(function(leaves) { return leaves.length; })
                        .entries(data2)

    // console.log(nested_data2);

    nested_data2.forEach(function(element) {
    //   console.log(element)
    //   console.log(element.key, element.values)
        // console.log(element.key)
    });

    nested_data2.sort(function(a, b) {
        return b.value - a.value;
    });
    
    // Scale the range of the data in the domains
    x2.domain(nested_data2.map(function(d) { return d.key; })); 
    y2.domain([0, d3.max(nested_data2, function(d){ return d.value; })]) 

    // Set up the x2 axis
    svg3.append("g")
       .attr("transform", "translate(0," + height1 + ")")
       .attr("class", "x2 axis1")
       .call(d3.axisBottom(x2));
    
    svg3.append("text")             
        .attr("transform", "translate(" + (width1/2) + " ," + (height1 + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Size");

    svg3.append("g")
        .attr("class", "y2 axis1")
        .call(d3.axisLeft(y2));
    
    svg3.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 150 - margin.left)
        .attr("x",0 - (height1 / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count"); 
    
    svg3.selectAll(".bar")
        .data(nested_data2)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return x2(d.key);})
        .attr("width", x2.bandwidth())
        .attr("y", function(d) { return y2(d.value);})
        .attr("height", function(d) {return height1 - y2(d.value)})
        .on("mousemove", function(d){
                tooltip1
                .style("opacity", "1")
                .style("left", d3.event.pageX - 40 + "px")
                .style("top", d3.event.pageY - 60 + "px")
                .style("display", "inline-block")
                .html((d.key) + ", " + "<b>" + (d.value) + "</b>");
            })
        .on("mouseout", function(d){ tooltip1.style("display", "none");});

    // Update the data
 	var updateGraph = function(){

    // var selectCategory = nested_data.filter(function(d){
    //     return d.key == category;
    //     });
    
    var data2 = data.filter(function(d) { 
        var sq = d3.select("#catDropdown").select("select").property("value");
        return d.Category === sq;
    });

    console.log('anotherdata2');
    console.log(data2);
    var nested_data2 = d3.nest()
                        .key(function(d) { return d.bin_size; })
                        .rollup(function(leaves) { return leaves.length; })
                        .entries(data2)
     
    nested_data2.sort(function(a, b) {
        return b.value - a.value;
    }); 

    x2.domain(nested_data2.map(function(d) { return d.key; })); 
    y2.domain([0, d3.max(nested_data2, function(d){ return d.value; })]) 

    svg3.select('.x2.axis1').transition().duration(300).call(d3.axisBottom(x2));

    svg3.select(".y2.axis1").transition().duration(300).call(d3.axisLeft(y2));

    // var bars = svg3.selectAll(".bar").data(nested_data, function(d) { return d.key === category; })
    var bars = svg3.selectAll(".bar").data(nested_data2);

    bars.exit()
        .transition()
        .duration(300)
        .attr("x", function(d) {return x2(d.key);})
        .attr("width", x2.bandwidth())
        .attr("y", function(d) { return y2(d.value);})
        .attr("height", function(d) {return height1 - y2(d.value)})
        .remove();
    
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return x2(d.key);})
        .attr("width", x2.bandwidth())
        .attr("y", function(d) { return y2(d.value);})
        .attr("height", function(d) {return height1 - y2(d.value)})
        .on("mousemove", function(d){
                tooltip1
                .style("opacity", "1")
                .style("left", d3.event.pageX - 40 + "px")
                .style("top", d3.event.pageY - 60 + "px")
                .style("display", "inline-block")
                .html((d.key) + ", " + "<b>" + (d.value) + "</b>");
            })
        .on("mouseout", function(d){ tooltip1.style("display", "none");});

    bars.transition().duration(300) 
        .attr("x", function(d) {return x2(d.key);})
        .attr("width", x2.bandwidth())
        .attr("y", function(d) { return y2(d.value);})
        .attr("height", function(d) {return height1 - y2(d.value)});    

    // console.log('change');
    // console.log(category);
    }

    // Run update function when dropdown selection changes
    categoryMenu.on('change', function(){

    var selectedCategory = d3.select(this)
                        .select("select")
                        .property("value")
  
    updateGraph(selectedCategory)
    
    console.log('hello here');
    console.log(selectedCategory);
    });

});