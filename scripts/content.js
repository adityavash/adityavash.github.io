/**
 * Does the muscle of the visualization. A big thanks to Mike Bostock for the
 * example below:
 * http://bl.ocks.org/mbostock/4060606
 *
 * Also here, where he uses NaturalEarth to do some amazing things:
 * http://bost.ocks.org/mike/map/
 */
define(['jquery',
        'd3',
        'topojson',
        'ui-slider',
        'queue'
],
        function ($, d3, topojson, slider, queue) {

            // This will be the module we return.
            var pub = {};


            /**
             * This function is called in main.js and is where we begin the
             * customization of the page.
             */
            pub.onReady = function onReady() {
                // Do something here
                console.log("the onReady function of content.js was called. " +
                    "You're up and running!");
                var width = 1000;
                var height = 1000;

                var svg = d3.select('#map').append('svg')
                    .attr('width', width)
                    .attr('height', height);

                var timepoint = 1;

                // These are the quantiles Aditya set up to use.
                var domain = [29, 145, 322, 472, 977, 2259, 8861];
                // These are the colors we're going to set to fill values, a la:
                // http://bl.ocks.org/mbostock/4060606
                var range = [
                   'rgb(198,219,239)',
                   'rgb(158,202,225)',
                   'rgb(107,174,214)',
                   'rgb(66,146,198)',
                   'rgb(33,113,181)',
                   'rgb(8,81,156)',
                   'rgb(8,48,107)'
                ];
                var colorScale = d3.scale.threshold()
                    .domain(domain)
                    .range(range);

                var quantileLabels = [
                    '< 29',
                    '< 145',
                    '< 322',
                    '< 472',
                    '< 977',
                    '< 2259',
                    '< 8861',

                ];
                var div = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);

                // This is the function that actually performs the visualization. It
                // expects to get the loaded TopoJSON of the states as well as the 
                // csv with the time series.
                function doViz(topoJson, csv) {
                    setData(csv);
                    drawUndefinedRegion();

                    drawMap(topoJson);
                    setUpSlider(csv);
                    // Color the map the first time.
                    colorMap(1);
                    drawScale();
                }

                // This will hold the time headings. In the case of weeks it should be
                // things like "Week 1, Week 2".
                var timeNames = [];

                // We also need to construct up a basic way to store the csv data.
                // This will be an array of arrays. Its length will be the number of
                // time periods we have (ie the number of columns in the csv -1, since
                // we don't have data in the first column, which is state names.)
                // Each element will be an array of length for each region (ie the
                // total number of rows -1, since we aren't counting the column
                // headings).
                var csvData = [];

                // And we also need a way to map each row in the csv to the states that
                // it represents. This is hardcoded for now, because we need to map
                // the state names in the csv to those in the svg we built from
                // naturalearth data. 
                // Row 2 of the csv is the first place that states occur (+1 for the
                // column heads and +1 for 1-based index). So.
                var states = [];

                // We need to do two ajax calls--one to get the csv and one to get the
                // TopoJSON. To do this we're going to use queue. It is YET ANOTHER
                // mbostock library that appears to be nice and easy.
                queue()
                    .defer(d3.json, 'data/maps/india_IN_State_Delhi_Gujarat.json')
                    .defer(d3.csv, 'data/WeeklyData_v2.csv')
                    .defer(d3.json, 'data/rowToStates.json')
                    .await(function (error, topoJson, csv, rowToStates) {
                        states = rowToStates;
                        doViz(topoJson, csv);
                    });

                // This function will put our csv data into the data expected by 
                // csvData. Namely, this will remove the first row and first column.
                function setData(csv) {
                    console.log('csv.length:' + csv.length);
                    csvData = csv;
                }

                /**
                 * Draws the color scale explaining the quantiles. This must be called
                 * AFTER the svg is appended.
                 */
                function drawScale() {
                    var h = 50;  // the height/width of the box
                    var startX = 80;
                    var startY = 200;
                    var padding = 5;
                    var yPos = startY;  // the y pos of the box. will be incremented
                    // Reverse because we want the darkest value on top.

                    d3.select('svg').append('rect')
                            .attr('x', startX)
                            .attr('y', yPos)
                            .attr('height', h)
                            .attr('width', h)
                            .style('fill', '#fff');
                    yPos += h + padding;

                    range.reverse().forEach(function (d) {
                        d3.select('svg').append('rect')
                            .attr('x', startX)
                            .attr('y', yPos)
                            .attr('height', h)
                            .attr('width', h)
                            .style('fill', d);
                        // And now increment the startY so that we don't overlap the
                        // scales.
                        yPos += h + padding;
                    });


                    // Also add text labels.
                    var textX = 10;
                    var textYPos = 229;

                    d3.select('svg').append('text')
                           .attr('x', textX)
                           .attr('y', textYPos)
                           .attr('font-size', 17)
                           .attr('font-weight', 'bold')
                           .text('Total Calls');

                    textYPos += h + padding;

                    quantileLabels.reverse().forEach(function (d) {
                        d3.select('svg').append('text')
                            .attr('x', textX)
                            .attr('y', textYPos)
                            .attr('font-size', 17)
                            .attr('font-weight', 'bold')
                            .text(d);
                        textYPos += h + padding;
                    });

                    // reverse() reverses in-place, so un-reverse here, just because.
                    range.reverse();
                    quantileLabels.reverse();
                }

                /**
                 * Draws the square representing the undefined region corresponding to the calls. This must be called
                 * AFTER the svg is appended.
                */
                function drawUndefinedRegion() {
                    d3.select('svg').append('circle')
                            .attr('cx', 550)
                            .attr('cy', 200)
                            .attr('r', 50);

                    d3.select('svg').append('text')
                           .attr('x', 510)
                           .attr('y', 200)
                           .attr('font-size', 17)
                           .attr('font-weight', 'bold')
                           .text('Undefined')
                           .style('fill', 'rgb(255,255, 255)');

                    d3.select('svg').append('text')
                           .attr('x', 520)
                           .attr('y', 220)
                           .attr('font-size', 17)
                           .attr('font-weight', 'bold')
                           .text('Region')
                           .style('fill', 'rgb(255,255, 255)');

                }


                function drawMap(india) {
                    var subunits = topojson.feature(
                            india,
                            india.objects.places_IN_State_Delhi_Gujarat);

                    // According to: http://teczno.com/squares/#4.39/22.83/79.83,
                    // centering at 23 80 is ok. The above url is lat/lon. However, the
                    // api appears to take lng/lat.
                    var projection = d3.geo.mercator()
                        .scale(1200)
                        .translate([-1250, 900]);

                    var path = d3.geo.path()
                        .projection(projection);

                    svg.append('path')
                        .datum(subunits)
                        .attr('d', path);

                    svg.selectAll('.subunit')
                        .data(topojson.feature(
                                    india,
                                    india.objects.places_IN_State_Delhi_Gujarat)
                                .features)
                        .enter().append('path')
                        .attr('class', function (d) {
                            // We need to replace all the spaces with underscores so
                            // that we can use selectors to get them.
                            console.log('d.id: ' + d.id.replace(/ /g, '_'));
                            return d.id.replace(/ /g, '_');
                        })
                        .attr('d', path);
                       

                }

                // This will load the csv.
                function setUpSlider(csv) {
                    var titleRow = d3.keys(csv[0]);
                    for (var i = 1; i < titleRow.length - 1; i++) {
                        timeNames.push(titleRow[i]);
                    }
                    console.log('timeNames: ' + timeNames);
                    console.log('timeNames.length: ' + timeNames.length);
                    // We're going to make the range of the slider 1 to
                    // timeNames.length. If i is selected on the slider, that means
                    // we'll index into the timeNames array at i-1.
                    // First handle the error case where there are no names. This
                    // likely would mean something hasn't parsed correctly.
                    if (timeNames.length < 1) {
                        alert('no names for time periods, big problems');
                    }
                    // And we'll set the label the first time even before a slide.
                    $('#time-label').text(timeNames[0]);
                    $('#slider-div').slider({
                        range: 'min',
                        value: 1,
                        min: 1,
                        max: timeNames.length,
                        slide: onSlide,
                        width: 20
                    });
                }

                function onSlide(event, ui) {
                    timepoint = ui.value;
                    colorMap(ui.value);
                }

                function getValueForState(state) {
                    var weekHeading = timeNames[timepoint - 1];
                    var stateWithoutSpaces = state.replace(/ /g, '_');
                    for (var row = 0; row < csvData.length; row++) {
                        if ($.inArray(stateWithoutSpaces, states[row]) !== -1) {
                            return csvData[row][weekHeading];
                        }
                    }
                }

                function colorMap(timeIndex) {
                    var weekHeading = timeNames[timeIndex - 1];
                    $('#time-label').text(weekHeading);
                    console.log('slider slid to: ' + timeIndex);
                    // We need to iterate over every row in the csv.
                    for (var row = 0; row < csvData.length; row++) {
                        var value = csvData[row][weekHeading];
                        var color = colorScale(value);
                        // And now we need to set the fill for each state in this
                        // row to the correct fill.
                        for (var state = 0; state < states[row].length; state++) {
                            var stateName = states[row][state];
                            if (stateName !== 'Not_defined') {

                                console.log("value is:" + value);

                                d3.select('svg').select('.' + stateName)
                                    .style('fill', color)
                                    .on("mouseover", function (d) {
                                        d3.select(this).transition().duration(300).style("opacity", 1);
                                        div.transition().duration(300)
                                        .style("opacity", 1)
                                        div.text(function() {
                                            var val = getValueForState(d.id);
                                            console.log('val for ' + d.id + ' is: ' + val);
                                            return d.id + ':\n' + val;
                                        })
                                        .style("left", (d3.event.pageX) + "px")
                                        .style("top", (d3.event.pageY - 30) + "px");
                                    })
                                  .on("mouseout", function () {
                                      d3.select(this)
                                      .transition().duration(300)
                                      .style("opacity", 1);
                                      div.transition().duration(300)
                                      .style("opacity", 0);
                                  });
                            }
                            else {
                                d3.select('svg').select('circle')
                                    .style('fill', color)
                                    .on("mouseover", function (d) {
                                        d3.select(this).transition().duration(300).style("opacity", 1);
                                        div.transition().duration(300)
                                        .style("opacity", 1)
                                        div.text(function() {
                                            var val = getValueForState('Not defined');
                                            return 'Undefined Region:\n' + val;
                                        })
                                        .style("left", (d3.event.pageX) + "px")
                                        .style("top", (d3.event.pageY - 30) + "px");
                                                                    })
                                  .on("mouseout", function () {
                                      d3.select(this)
                                      .transition().duration(300)
                                      .style("opacity", 1);
                                      div.transition().duration(300)
                                      .style("opacity", 0);
                                  });


                            }
                        }
                    }

                }

                console.log('returning pub');

            };

            return pub;

        });

