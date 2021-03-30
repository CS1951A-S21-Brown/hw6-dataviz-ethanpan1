// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const NUM_TOP_GAMES = 10;
const NUM_GENRES = 12;
const margin = {top: 40, right: 100, bottom: 40, left: 280};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 1.25), graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 1.25), graph_2_height = 400;
let graph_3_width = MAX_WIDTH, graph_3_height = 575;

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(220, ${margin.top})`);

let countRef1 = svg1.append("g");


d3.csv('data/video_games.csv').then(function(data) {
    function compare(a, b) {
        return parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales);
    }

    let top_games = getTopGames(data, compare, NUM_TOP_GAMES);

    let x = d3.scaleLinear()
        .domain([0, d3.max(top_games, function(game) {return game.Global_Sales})])
        .range([0, graph_1_width - margin.left - margin.right]);

    let y = d3.scaleBand()
        .domain(top_games.map(function(game) {return game.Name}))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.3); 

    svg1.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .call(function(g) {g.select("path").remove()});

    

    let color = d3.scaleOrdinal()
        .domain(top_games.map(function(game) {return game.Name}))
        .range(d3.quantize(d3.interpolateHcl("green", "blue"), NUM_TOP_GAMES));

    let bars = svg1.selectAll("rect").data(top_games);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(game) { return color(game.Name) })
        .attr("x", x(0))
        .attr("y", function(game) {return y(game.Name)})
        .attr("width", function(game) {return x(parseFloat(game.Global_Sales))})
        .attr("height",  y.bandwidth()); 

    let counts = countRef1.selectAll("text").data(top_games);

    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(game) {return x(parseFloat(game.Global_Sales)) + 5}) 
        .attr("y", function(game) {return y(game.Name) + 10})   
        .style("text-anchor", "start")
        .text(function(game) {return parseFloat(game.Global_Sales)}); 

    // X axis
    svg1.append("text")
        .attr("transform", `translate(300, 190)`) 
        .style("text-anchor", "middle")
        .text("Global sales (millions)");

    // Y axis
    svg1.append("text")
        .attr("transform", `translate(-180,90)`) 
        .style("text-anchor", "middle")
        .text("Game");

    // Title 
    svg1.append("text")
        .attr("transform", `translate(300,-10)`)  
        .style("text-anchor", "middle")
        .text("Top 10 Video Games of All Time");
});

function getTopGames(data, comparator, numExamples) {
  data.sort(comparator)
  return data.slice(0, numExamples)
}



let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(200, ${margin.top})`);


let x = d3.scaleBand()
    .range([0, graph_2_width - margin.left - margin.right])
    .padding(0.1);

let y = d3.scaleLinear()
    .range([graph_2_height - margin.top - margin.bottom, 0]);


let x_axis_label = svg2.append("text")
    .attr("transform", `translate(300, 360)`) 
    .style("text-anchor", "middle")
    .text("Genre");

svg2.append("text")
    .attr("transform", `translate(-130,150)`) 
    .style("text-anchor", "middle")
    .text("Total sales (millions)");

let title = svg2.append("text")
    .attr("transform", `translate(300,-10)`)  
    .style("text-anchor", "middle");

let div2 = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
    
function setGenreData(location) {
    d3.csv('data/genre_sales.csv').then(function(data) {
        function compare(a, b) {
            return parseFloat(b[location]) - parseFloat(a[location]);
        }

        top_genres = getGenreSales(data, compare)

        x.domain(top_genres.map(function(genre) {return genre.Genre}));

        max = d3.max(top_genres, function(genre) {return parseFloat(genre[location])})

        y.domain([0, max + 200 - max % 200]);

        svg2.call(function(g) {g.select("#y-axis-label").remove()})
            .append("g")
            .attr("id", "y-axis-label")
            .call(d3.axisLeft(y).tickSize(4).tickPadding(10))

        svg2.call(function(g) {g.select("#x-axis-label").remove()})
            .append("g")
            .attr("id", "x-axis-label")
            .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
            .attr("transform", "translate(0, 320)");

        let color = d3.scaleOrdinal()
            .domain(top_genres.map(function(genre) {return genre.Genre}))
            .range(d3.quantize(d3.interpolateHcl("green", "blue"), NUM_GENRES));
        
        let bars = svg2.selectAll("rect").data(top_genres);
        
        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function(genre) {return color(genre.Genre)})
            .attr("x", function(genre) {return x(genre.Genre)})
            .attr("y", function(genre) {return y(parseFloat(genre[location]))})
            .attr("width", x.bandwidth())
            .attr("height",  function(genre) {return graph_2_height - margin.top - margin.bottom - y(parseFloat(genre[location]))})
            .on("mouseenter", function(genre) {		
                div2.transition().style("opacity", 1);	
                div2.html(genre.Genre + "<br/>" + parseInt(genre[location]) + "m sales")
                    .style("left", (x(genre.Genre)) + margin.left + 35 + "px")		
                    .style("top", y(parseFloat(genre[location])) + graph_3_height - 5 + "px")
                    .style("background-color","rgba(200, 200, 255, 0.9)")
                    .style("color","black")
                    .style("padding", "5px")
                    .style("border-radius","5px");	
            })
            .on("mouseleave", function() {		
                div2.transition().style("opacity", 0);	
            });

        
        title.text(getTitle(location));
    });
}

setGenreData("Global_Sales");

function getGenreSales(data, comparator) {
  data.sort(comparator)
  return data
}

function getTitle(location) {
    switch (location) {
        case "Global_Sales":
            return "Total Sales by Genre - Global"
        case "NA_Sales":
            return "Total Sales by Genre - North America"
        case "EU_Sales":
            return "Total Sales by Genre - Europe"
        case "JP_Sales":
            return "Total Sales by Genre - Japan"
        case "Other_Sales":
            return "Total Sales by Genre - Global (not NA, EU, or JP)"
    }
}


let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(220, ${margin.top})`);

let x3 = d3.scaleBand()
    .range([0, graph_3_width - margin.left - margin.right])
    .padding(0.1);

let y3 = d3.scaleLinear()
    .range([graph_3_height - margin.top - margin.bottom, 0]);


let x_axis_label3 = svg3.append("text")
    .attr("transform", `translate(430, 535)`) 
    .style("text-anchor", "middle")
    .text("Year of Game Release");

svg3.append("text")
    .attr("transform", `translate(-110,250)`) 
    .style("text-anchor", "middle")
    .text("Global sales (millions)");

let title3 = svg3.append("text")
    .attr("transform", `translate(430,-20)`)  
    .style("text-anchor", "middle");

let subtitle = svg3.append("text")
    .attr("transform", `translate(430, 0)`)  
    .style("text-anchor", "middle") 
    .style("font-size", 15);

let div3 = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    
function setPubData(genre) {
    d3.csv('data/genre_publisher_sales.csv').then(function(data) {
        genre_sales = data.filter(row => row.Genre == genre);
        
        let publishers = Array.from(new Set(genre_sales.map(row => row.Publisher)))

        let c = 0
        let publisherData = publishers.map(function(publisher) {
            let publisher_sales = genre_sales.filter(row => row.Publisher == publisher)
            c++;
            return {
                name: publisher,
                count: c,
                values: publisher_sales.map(function(entry) {return {publisher: entry.Publisher, year: parseInt(entry.Year), sales: parseFloat(entry.Global_Sales)}})
            };
        });

        let color = d3.scaleOrdinal()
            .domain(publishers)
            .range(d3.schemeSet1);

        x3.domain(genre_sales.map(function(genre) {return parseInt(genre.Year)}));

        y3.domain([0, d3.max(genre_sales, function(genre) {return parseFloat(genre.Global_Sales)})]);

        svg3.call(function(g) {g.select("#y-axis-label").remove()})
            .append("g")
            .attr("id", "y-axis-label")
            .call(d3.axisLeft(y3).tickSize(4).tickPadding(10))

        svg3.call(function(g) {g.select("#x-axis-label").remove()})
            .append("g")
            .attr("id", "x-axis-label")
            .call(d3.axisBottom(x3).tickSize(0).tickPadding(10))
            .attr("transform", "translate(0, 495)");

        let line = d3.line()
            .x(function(entry) {return x3(entry.year) + 40})
            .y(function(entry) {return y3(entry.sales)})

        svg3.call(function(g) {g.selectAll(".graph3-line").remove()})
            .selectAll("lines")
            .data(publisherData)
            .enter()
            .append("path")
            .attr("class", "graph3-line")
            .attr("d", function(publisher){return line(publisher.values)} )
            .attr("stroke", function(publisher){return color(publisher.name)})
            .style("stroke-width", 2)
            .style("fill", "none")
        
        let linearRegression = d3.regressionLinear()
            .x(function(entry) {return x3(entry.year) + 40})
            .y(function(entry) {return y3(entry.sales)});

        svg3.call(function(g) {g.selectAll(".graph3-dots").remove()})
            .selectAll("dot")
            .data(publisherData)
            .enter()
            .append("g")
            .attr("class", "graph3-dots")
            .style("fill", function(publisher) {return color(publisher.name)})
            .selectAll("point")
            .data(function(publisher) {return publisher.values})
            .enter()
            .append("circle")
            .attr("class", function (entry) {return classify(entry.publisher)})
            .attr("cx", function (entry) {return x3(parseInt(entry.year)) + 40})
            .attr("cy", function (entry) {return y3(parseFloat(entry.sales))})
            .attr("r", 3)
            .on("mouseenter", function(entry) {	
                d3.selectAll("." + classify(entry.publisher))
                    .attr("r", 6);

                div3.transition().style("opacity", 1);	

                div3.html(entry.publisher + "<br/>" + entry.year + ' - ' + parseFloat(entry.sales) + "m sales")
                    .style("left", (x3(parseInt(entry.year)) + 260) + "px")		
                    .style("top", (y3(parseFloat(entry.sales)) + graph_1_height + graph_2_height + 720) + "px")
                    .style("background-color","rgba(200, 200, 255, 0.9)")
                    .style("color","black")
                    .style("padding", "5px")
                    .style("border-radius","5px");	

                svg3.call(function(g) {g.selectAll(".graph3-regression").remove()})
                    .selectAll("regressions")
                    .data(publisherData.filter(publisher => publisher.name == entry.publisher))
                    .enter()
                    .append("path")
                    .attr("class", "graph3-regression")
                    .attr("d", function(publisher){return getRegression(linearRegression(publisher.values))})
                    .attr("stroke", function(publisher){return color(publisher.name)})
                    .style("stroke-width", 1)
                    .style("stroke-dasharray", "10,10")
                    .style("fill", "none")
            })
            .on("mouseleave", function(entry) {		
                div3.transition().style("opacity", 0);	

                d3.selectAll("." + classify(entry.publisher))
                    .attr("r", 3);

                svg3.call(function(g) {g.selectAll(".graph3-regression").remove()})
            });

        svg3.call(function(g) {g.selectAll(".graph3-labels").remove()})
            .selectAll("labels")
            .data(publisherData)
            .enter()
            .append("text")
            .attr("class", "graph3-labels")
            .attr("transform", function(publisher) {return "translate(780," + (publisher.count * 20) + ")"})
            .text(function(publisher) {return publisher.name})
            .style("fill", function(publisher){return color(publisher.name)})

        

        let publisherTotals = publisherData.map(function(publisher) {
            let total_sales = publisher.values.map(function(value) {return value.sales})
            return {name: publisher.name,
                sales: total_sales.reduce((accumulator, value) => accumulator + value)
            }
        });

        let topPublisher = publisherTotals.reduce(function(accumulator, value) {
            if (value.sales > accumulator.sales) {
                return value
            } else {
                return accumulator
            }
        });

        console.log(topPublisher);

        title3.text('Top 5 Publishers - ' + genre);
        subtitle.text('Top publisher: ' + topPublisher.name);
        
    });
}

function classify(publisher) {
    return publisher.split(" ")[0]
}

function getRegression(regressionResults) {
    regressionResults0 = regressionResults[0]
    regressionResults1 = regressionResults[1]
    return `M ${regressionResults0[0]}, ${regressionResults0[1]}
    L ${regressionResults1[0]}, ${regressionResults1[1]}`
}

setPubData("Action");

