const stopWords = ["i", "im", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];
const minimumWordSize = 10;
const maximumWordSize = 25;

/** General */
var selectedWordSize = 200;
var selectedCategory = "HEALTH_AND_FITNESS";

var structuredData = new Map(); // Sorted, unique and stuff.
var words = []; // Words to be shown.
var barPlotData = []; // Restructured data for bar plot.
var stackedData = [];
var categories = [];
var subCategory = ['positive', 'neutral', 'negative'];

/** Word cloud */
var wcMargin = {top: 10, right: 10, bottom: 10, left: 10},
    wcWidth = 750 - wcMargin.left - wcMargin.right,
    wcHeight = 360 - wcMargin.top - wcMargin.bottom;

var wcSVG = d3.select("#word_cloud_viz")
    .select("#wcSVG")
    .attr("width", wcWidth + wcMargin.left + wcMargin.right)
    .attr("height", wcHeight + wcMargin.top + wcMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + wcMargin.left + "," + wcMargin.top + ")");
var wcLayout = d3.layout.cloud();

/**Bar plot stacked  */
var bpMargin = {top: 10, right: 30, bottom: 20, left: 50},
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

document.getElementById("selectedCategory").addEventListener('change', (event) =>
{
    selectedCategory = event.target.value;
    wcSVG.selectAll("g > *").remove();
    words = [];
    generateWC();
});

// Restructure data to be displayed using d3 graphs.
// *File is read in a local server.
d3.csv("data/cleaned_googleplaystore_user_reviews.csv", function (data)
{
    // Restructure data for word cloud & bar plot.
    for (i = 0; i < data.length; i++)
    {
        /** Word cloud */
        if (!structuredData.has(data[i].Category))
        {
            structuredData.set(data[i].Category, []);
        }

        // Get current row review's sentence, split it, remove symbols and jibberish, make it lowercase.
        // Then push it into categories.
        let sentence = data[i].Translated_Review.replace(/[^a-zA-Z ]/g, "").toLowerCase();
        let splittedSentence = sentence.split(" ");
        splittedSentence.forEach(wordInSentence =>
        {
            if (wordInSentence && !stopWords.includes(wordInSentence))
            { // Check if wordInSentence is a stopword.
                let words = structuredData.get(data[i].Category).filter(word => word.word == wordInSentence);
                if (words.length > 0)
                { // Add to existing word and then size++;
                    words[0].size++;
                    if (data[i].Sentiment_Polarity > 0)
                        words[0].positive++;
                    else if (data[i].Sentiment_Polarity == 0)
                        words[0].neutral++;
                    else
                        words[0].negative++;
                } else
                { // Push new word with size == 0.
                    if (data[i].Sentiment_Polarity > 0)
                        structuredData.get(data[i].Category).push({word: wordInSentence, size: 1, positive: 1, neutral: 0, negative: 0});
                    else if (data[i].Sentiment_Polarity == 0)
                        structuredData.get(data[i].Category).push({word: wordInSentence, size: 1, positive: 0, neutral: 1, negative: 0});
                    else
                        structuredData.get(data[i].Category).push({word: wordInSentence, size: 1, positive: 0, neutral: 0, negative: 1});
                }
            }
        });

        /** Bar plot */
        let isExistInBP = barPlotData.filter(dt => dt.category == data[i].Category);
        if (isExistInBP.length > 0)
        {
            isExistInBP[0].total++;

            if (data[i].Sentiment_Polarity > 0)
                isExistInBP[0].positive += 1;
            else if (data[i].Sentiment_Polarity == 0)
                isExistInBP[0].neutral += 1;
            else
                isExistInBP[0].negative += 1;
        } else
        {
            if (data[i].Sentiment_Polarity > 0)
                barPlotData.push({category: data[i].Category, total: 1, positive: 1, neutral: 0, negative: 0});
            else if (data[i].Sentiment_Polarity == 0)
                barPlotData.push({category: data[i].Category, total: 1, positive: 0, neutral: 1, negative: 0});
            else
                barPlotData.push({category: data[i].Category, total: 1, positive: 0, neutral: 0, negative: 1});
        }
    }

    // Add categories to select/dropdown
    structuredData.forEach((v, k) =>
    {
        categories.push(k);
        let option = document.createElement('option');
        option.value = k;
        option.innerHTML = k;
        document.getElementById("selectedCategory").appendChild(option);
    });

    // Bar plot axes
    x = d3.scaleBand()
        .domain(categories)
        .range([0, bpWidth])
        .padding([0.2]);
    y = d3.scaleLinear()
        .domain([0, 100])
        .range([bpHeight, 0]);

    // Finish loading data
    document.getElementById('loadingText').style.display = "none";
    generateWC();
    generateBP();
});

function generateWC()
{
    document.getElementById('loadingText').style.display = "block";
    let averageSize = 0;

    sortedUniqueWords = structuredData.get(selectedCategory).sort((a, b) => b.size - a.size);
    for (i = 0; i < selectedWordSize; i++)
    {
        averageSize += sortedUniqueWords[i].size;
        words.push({word: sortedUniqueWords[i].word, size: sortedUniqueWords[i].positive, type: "positive"});
        words.push({word: sortedUniqueWords[i].word, size: sortedUniqueWords[i].neutral, type: "neutral"});
        words.push({word: sortedUniqueWords[i].word, size: sortedUniqueWords[i].negative, type: "negative"});
    }

    // Calculate average and set the sizes.
    // averageSize = averageSize / selectedWordSize;
    // if (averageSize > 0)
    // {
    words.forEach((chosenWord,) =>
    {
        if (chosenWord.size < 10)
        {
            chosenWord.size = minimumWordSize;
        }
        // chosenWord.size = chosenWord.size / averageSize * 50;
        // if (chosenWord.size / averageSize < 0.5)
        // {
        //     chosenWord.size = minimumWordSize;
        // } else
        // {
        //     chosenWord.size = maximumWordSize;
        // }
    });
    console.log(words);
    // }

    // Draw word cloud.
    wcLayout.size([wcWidth, wcHeight])
        .words(words.map(function (d) {return {text: d.word, size: d.size, type: d.type};}))
        .padding(5)        //space between words
        .rotate(function () {return ~~(Math.random() * 2) * 90;})
        .fontSize(function (d) {return d.size;}) // font size of words
        .font("Impact")
        .on("end", drawWC); // <--- drawMC() function
    wcLayout.start();
}

function drawWC(words)
{
    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", function (event, d)
        {
            var e = d3.event.transform,
                tx = Math.min(0, Math.max(e.x, wcWidth - wcWidth * e.k)),
                ty = Math.min(0, Math.max(e.y, wcHeight - wcHeight * e.k));

            //wcSVG.attr("transform", event.transform);

            wcSVG.attr("transform", [
                "translate(" + [tx, ty] + ")",
                "scale(" + e.k + ")"
            ].join(" "));
        });

    d3.select("#word_cloud_viz")
        .call(zoom);

    wcSVG
        .append("g")
        .attr("transform", "translate(" + wcLayout.size()[0] / 2 + "," + wcLayout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-family", "Impact")
        .style("fill", function (d)
        {
            return d.type == "positive" ? "#15607A" : d.type == "neutral" ? "#FFC684" : "#FF483A";
        })
        .attr("text-anchor", "middle")
        .attr('font-size', 1)
        .text(function (d) {return d.text;})
        .transition() // Animation, ref: https://rawgit.com/jasondavies/d3-cloud/master/build/d3.layout.cloud.js
        .duration(600)
        .style("font-size", function (d) {return d.size + "px";})
        .attr("transform", function (d)
        {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("fill-opacity", 1);


    document.getElementById('loadingText').style.display = "none";
}

function generateBP()
{
    barPlotData.forEach(data =>
    {
        data.positive = (data.positive / data.total) * 100;
        data.negative = (data.negative / data.total) * 100;
        data.neutral = (data.neutral / data.total) * 100;
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
        .attr("width", x.bandwidth());


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
        .style("font-size", "14");
    bpSVG.append("g")
        .call(d3.axisLeft(y));
}