// vim: set ts=2 sw=2 ft=javascript:
(function() {

  d3.linechart = function() {

    var width = 800,
        height = 200;

    function linechart(g) { // call on selections

      g.each(function(data, i) {

        var x = d3.scale.linear().range([0, width]),
            y = d3.scale.linear().range([height, 0]),

            line = d3.svg.line()
              .x(function(d, i) { return x(i); })
              .y(function(d, i) { return y(d); }),

            baseline = d3.svg.line()
              .x(function(d, i) { return x(i); })
              .y(function(d) { return y(0); });


        y.domain(d3.extent(data, function(d) { return d; }));
        x.domain([0, data.length]);

        g.append("path")
            .datum(data)
            .attr("class", "line-chart")
            .attr("d", line);

        g.append("path")
            .datum(data)
            .attr("class", "baseline")
            .attr("d", baseline);
      });

    } // core logic

    linechart.width = function(x) {
      if (!arguments.length) return width;
      width= +x;
      return linechart;
    };

    linechart.height = function(x) {
      if (!arguments.length) return height;
      height = +x;
      return linechart;
    };

    return linechart;

  }; // namespace

  // private stuff here

})();
