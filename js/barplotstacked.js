var barPlotData = []; // Restructured data for bar plot.
var stackedData = [];
var categories = [];
var subCategory = ['Positive', 'Neutral', 'Negative'];

/**Bar plot stacked  */
var bpMargin = {top: 10, right: 30, bottom: 40, left: 50},
    bpWidth = 750 - bpMargin.left - bpMargin.right,
    bpHeight = 360 - bpMargin.top - bpMargin.bottom;

var bpSVG = d3.select("#bar_plot_stacked_viz")
    .select("#bpSVG")
    .attr("width", bpWidth + bpMargin.left + bpMargin.right)
    .attr("height", bpHeight + bpMargin.top + bpMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + bpMargin.left + "," + bpMargin.top + ")");

// Bar plot axes
var x, y;
var bpSubCategoryColor = d3.scaleOrdinal()
    .domain(subCategory)
    .range(['#15607A', '#FFC684', '#FF483A']);

// Restructure data to be displayed using d3 graphs.
// *File is read in a local server.
d3.csv("../data/cleaned_googleplaystore_user_reviews.csv", function (data)
{
    // Restructure data for word cloud & bar plot.
    for (i = 0; i < data.length; i++)
    {
        /** Bar plot */
        let isExistInBP = barPlotData.filter(dt => dt.category == data[i].Category);
        if (isExistInBP.length > 0)
        {
            isExistInBP[0].total++;

            if (data[i].Sentiment_Polarity > 0)
                isExistInBP[0].Positive += 1;
            else if (data[i].Sentiment_Polarity == 0)
                isExistInBP[0].Neutral += 1;
            else
                isExistInBP[0].Negative += 1;
        } else
        {
            if (data[i].Sentiment_Polarity > 0)
                barPlotData.push({category: data[i].Category, total: 1, Positive: 1, Neutral: 0, Negative: 0});
            else if (data[i].Sentiment_Polarity == 0)
                barPlotData.push({category: data[i].Category, total: 1, Positive: 0, Neutral: 1, Negative: 0});
            else
                barPlotData.push({category: data[i].Category, total: 1, Positive: 0, Neutral: 0, Negative: 1});
        }
    }

    // All categories
    barPlotData.forEach(datum =>
    {
        if (!categories.includes(datum.category))
        {
            categories.push(datum.category);
        }
    });

    // Bar plot axes
    x = d3.scaleBand()
        .domain(categories)
        .range([0, bpWidth])
        .padding([0.2]);
    y = d3.scaleLinear()
        .domain([0, 100])
        .range([bpHeight, 0]);

    // Finish loading data, draw
    generateBP();
    document.getElementById('loadingBP').style.display = "none";
});

function generateBP()
{
    barPlotData.forEach(data =>
    {
        data.Positive = (data.Positive / data.total) * 100;
        data.Negative = (data.Negative / data.total) * 100;
        data.Neutral = (data.Neutral / data.total) * 100;
    });

    stackedData = d3.stack()
        .keys(subCategory)
        (barPlotData);
    console.log(barPlotData, stackedData);
    bpSVG.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d)
        {
            return bpSubCategoryColor(d.key);
        })
        .selectAll("rect")
        .data(function (d) {return d;})
        .enter().append("rect")
        .attr("x", function (d) {return x(d.data.category);})
        .attr("y", function (d) {return y(d[1]);})
        .attr("height", function (d) {return y(d[0]) - y(d[1]);})
        .attr("width", x.bandwidth())
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    bpSVG.append("g")
        .attr("transform", "translate(0," + bpHeight + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("x", 9)
        .attr("y", 0)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start")
        .style("fill", "white")
        .style("font-size", "12");

    bpSVG.append("g")
        .call(d3.axisLeft(y));

    bpSVG.append("circle").attr("cx", 200).attr("cy", 340).attr("r", 7).style("fill", "#15607A");
    bpSVG.append("circle").attr("cx", 300).attr("cy", 340).attr("r", 7).style("fill", "#FFC684");
    bpSVG.append("circle").attr("cx", 400).attr("cy", 340).attr("r", 7).style("fill", "#FF483A");
    bpSVG.append("text").attr("x", 212).attr("y", 341).text("Positive").style("font-size", "16px").attr("alignment-baseline", "middle");
    bpSVG.append("text").attr("x", 312).attr("y", 341).text("Neutral").style("font-size", "16px").attr("alignment-baseline", "middle");
    bpSVG.append("text").attr("x", 412).attr("y", 341).text("Negative").style("font-size", "16px").attr("alignment-baseline", "middle");
}

var tooltip = d3.select("#bar_plot_stacked_viz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "absolute");

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (d)
{
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip
        .html(subgroupValue)
        .style("opacity", 0.9)
        .style("font-size", "12px")
        .style("background", "white");

};
var mousemove = function (d)
{
    tooltip
        .style("left", (d3.event.pageX - 110 + "px")) // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1] + 100) + "px");
};
var mouseleave = function (d)
{
    tooltip
        .style("opacity", 0);
};
