// MS: adding a random number generator
function lcg(seed) {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    let current = seed;
  
    return function() {
      current = (a * current + c) % m;
      return current / m;
    };
}

let rng = lcg(123);

function betaOneTwoSample(){
    let u1 = randomGenerator();
    let u2 = randomGenerator();

    // Convert to Beta(1, 2) using the transformation technique
    let fillRadius = u1 / (u1 + Math.pow(u2, 1 / 2))  * shapeSize;

    let values = [];
    for (let i = 0; i < 1000; i++) {
        let sample = betaOneTwoSample();
        values.push(sample);
    }

    return values;
}


let sample = betaOneTwoSample();

function getHistogram(sample){
    // histogram of the sample
    let histogram = d3.histogram()
        .domain([0, 1])
        .thresholds(20);

    let bins = histogram(sample);

    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    let svg = d3.select("#histogram")   
        .append("svg")     
        .attr("width", width + margin.left + margin.right)     
        .attr("height", height + margin.top + margin.bottom)   
        .append("g")     
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.selectAll("rect")

        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", d => `translate(${x(d.x0)}, ${y(d.length)})`)
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length))
        .style("fill", "steelblue");

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Path: js/valueSample.js
}
