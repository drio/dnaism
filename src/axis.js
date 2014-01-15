// ... { d3.select(this).call(context.axis().ticks(12).orient(d)); });
dnaism_contextPrototype.axis = function() {
  var context = this,
      scale = context.scale,
      axis_ = d3.svg.axis().scale(scale);

  //var format = d3.format("s");
  var format = function(d) { return context.chrm() + ":" + d3.format("s")(d); };

  function axis(selection) {
    var id = ++dnaism_id,
        tick;

    var g = selection.append("svg")
        .datum({id: id})
        .attr("width", context.size())
        .attr("height", Math.max(28, -axis.tickSize()))
      .append("g")
        .attr("transform", "translate(0," + (axis_.orient() === "top" ? 27 : 4) + ")")
        .call(axis_);

    context.on("focus.axis-" + id, function(i) {
      if (tick) {
        if (i == null) {
          tick.style("display", "none");
          g.selectAll("text").style("fill-opacity", null);
        } else {
          tick.style("display", null).attr("x", i).text(format(scale.invert(i)));
          var dx = tick.node().getComputedTextLength() + 6;
          g.selectAll("text").style("fill-opacity", function(d) { return Math.abs(scale(d) - i) < dx ? 0 : 1; });
        }
      }
    });
  }

  axis.remove = function(selection) {

    selection.selectAll("svg")
        .each(remove)
        .remove();

    function remove(d) {
      context.on("change.axis-" + d.id, null);
      context.on("focus.axis-" + d.id, null);
    }
  };

  return d3.rebind(axis, axis_,
      "orient",
      "ticks",
      "tickSubdivide",
      "tickSize",
      "tickPadding",
      "tickFormat").tickFormat(format);
};
