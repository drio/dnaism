(function(exports){
var dnaism = exports.dnaism = {version: "0.1.0"};
var dnaism_id = 0;
function dnaism_identity(d) { return d; }
dnaism.context = function() {
  var context = new dnaism_context,
      step = 1e4,  // 10k bp
      size = 1440, // 10k * 1440 pixes = 14M bases
      chrm,        // chrm
      start, stop, // start/stop of the current region
      event = d3.dispatch("focus", "change", "prepare", "beforechange"),
      scale = context.scale = d3.scale.linear().range([0, size]),
      focus;

  function update() {
    scale.domain([start, stop]);
    return context;
  }

  context.chrm = function(_) {
    if (!arguments.length) return chrm;
    chrm = _;
    return update();
  };

  context.start = function(_) {
    if (!arguments.length) return start;
    start = +_;
    return update();
  };

  context.stop = function(_) {
    if (!arguments.length) return stop;
    stop = +_;
    return update();
  };

  // Set or get the step interval in milliseconds.
  // Defaults to ten seconds.
  context.step = function(_) {
    if (!arguments.length) return step;
    step = +_;
    return update();
  };

  // Defaults to 1440 pixels (14M bases).
  context.size = function(_) {
    if (!arguments.length) return size;
    scale.range([0, size = +_]);
    return update();
  };

  // Sets the focus to the specified index, and dispatches a "focus" event.
  context.focus = function(i) {
    event.focus.call(context, focus = i);
    return context;
  };

  // Add, remove or get listeners for events.
  context.on = function(type, listener) {
    if (arguments.length < 2) return event.on(type); // return the listener for that event

    event.on(type, listener); // set the listener for that event

    // Notify the listener of the current start and stop time, as appropriate.
    // This way, metrics can make requests for data immediately,
    // and likewise the axis can display itself synchronously.
    if (listener !== null) {
      if (/^focus(\.|$)/.test(type)) listener.call(context, focus);
      if (/^change(\.|$)/.test(type)) listener.call(context, start, stop);
      if (/^prepare(\.|$)/.test(type)) listener.call(context, start, stop);
      if (/^beforechange(\.|$)/.test(type)) listener.call(context, start, stop);
    }

    return context;
  };


  return update();
};

function dnaism_context() {}

var dnaism_contextPrototype = dnaism.context.prototype = dnaism_context.prototype;
function dnaism_metric(context) {
  if (!(context instanceof dnaism_context)) throw new Error("invalid context");
  this.context = context;
}

var dnaism_metricPrototype = dnaism_metric.prototype;

dnaism.metric = dnaism_metric;

dnaism_metricPrototype.valueAt = function() {
  return NaN;
};

dnaism_metricPrototype.alias = function(name) {
  this.toString = function() { return name; };
  return this;
};

dnaism_metricPrototype.extent = function() {
  var i = 0,
      n = this.context.size(),
      value,
      min = Infinity,
      max = -Infinity;
  while (++i < n) {
    value = this.valueAt(i);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
};

dnaism_metricPrototype.on = function(type, listener) {
  return arguments.length < 2 ? null : this;
};

dnaism_metricPrototype.shift = function() {
  return this;
};

dnaism_metricPrototype.on = function() {
  return arguments.length < 2 ? null : this;
};

dnaism_contextPrototype.metric = function(request, name) {
  var context = this,
      metric = new dnaism_metric(context),
      id = ".metric-" + ++dnaism_id,
      start = -Infinity,
      stop,
      step = context.step(),
      size = context.size(),
      chrm = context.chrm(),
      values = [],
      event = d3.dispatch("change"),
      listening = 0,
      fetching;

  // Prefetch new data into a temporary array.
  function prepare(start1, stop) {
    var steps = Math.min(size, Math.round((start1 - start) / step));
    if (!steps || fetching) return; // already fetched, or fetching!
    fetching = true;
    /*
    steps = Math.min(size, steps + dnaism_metricOverlap);
    var start0 = stop - steps * step;
    */
    console.log("Requesting ..." + chrm + ":" + start1 + "," + stop);
    request(start1, stop, chrm, step, function(error, data) {
      fetching = false;
      if (error) return console.warn(error);
      var i = isFinite(start) ? Math.round((start1 - start) / step) : 0;
      for (var j = 0, m = data.length; j < m; ++j) values[j + i] = data[j];
      event.change.call(metric, start, stop);
    });
  }

  // When the context changes, switch to the new data, ready-or-not!
  function beforechange(start1, stop1) {
    if (!isFinite(start)) start = start1;
    values.splice(0, Math.max(0, Math.min(size, Math.round((start1 - start) / step))));
    start = start1;
    stop = stop1;
  }

  //
  metric.valueAt = function(i) {
    return values[i];
  };

  // drd
  metric.values = function() {
    return values;
  };

  //
  metric.shift = function(offset) {
    return context.metric(dnaism_metricShift(request, +offset));
  };

  //
  metric.on = function(type, listener) {
    if (!arguments.length) return event.on(type);

    // If there are no listeners, then stop listening to the context,
    // and avoid unnecessary fetches.
    if (listener == null) {
      if (event.on(type) != null && --listening == 0) {
        context.on("prepare" + id, null).on("beforechange" + id, null);
      }
    } else {
      if (event.on(type) == null && ++listening == 1) {
        context.on("prepare" + id, prepare).on("beforechange" + id, beforechange);
      }
    }

    event.on(type, listener);

    // Notify the listener of the current start and stop time, as appropriate.
    // This way, charts can display synchronous metrics immediately.
    if (listener != null) {
      if (/^change(\.|$)/.test(type)) listener.call(context, start, stop);
    }

    return metric;
  };

  //
  if (arguments.length > 1) metric.toString = function() {
    return name;
  };

  return metric;
};

// Number of metric to refetch each period, in case of lag.
var dnaism_metricOverlap = 6;

// Wraps the specified request implementation, and shifts time by the given offset.
function dnaism_metricShift(request, offset) {
  return function(start, stop, step, callback) {
    request(+start + offset, +stop + offset, chrm, step, callback);
  };
}
dnaism_contextPrototype.horizon = function() {
  var context = this,
      mode = "offset",
      buffer = document.createElement("canvas"),
      width = buffer.width = context.size(),
      height = buffer.height = 30,
      scale = d3.scale.linear().interpolate(d3.interpolateRound),
      metric = dnaism_identity,
      extent = null,
      title = dnaism_identity,
      format = d3.format(".2s"),
      colors = ["#08519c","#3182bd","#6baed6","#bdd7e7","#bae4b3","#74c476","#31a354","#006d2c"];

  function horizon(selection) {

    selection
        .on("mousemove.horizon", function() { context.focus(Math.round(d3.mouse(this)[0])); })
        .on("mouseout.horizon", function() { context.focus(null); });

    selection.append("canvas")
        .attr("width", width)
        .attr("height", height);

    selection.append("span")
        .attr("class", "title")
        .text(title);

    selection.append("span")
        .attr("class", "value");

    selection.each(function(d, i) {
      var that = this,
          id = ++dnaism_id,
          metric_ = typeof metric === "function" ? metric.call(that, d, i) : metric,
          colors_ = typeof colors === "function" ? colors.call(that, d, i) : colors,
          extent_ = typeof extent === "function" ? extent.call(that, d, i) : extent,
          start = -Infinity,
          step = context.step(),
          canvas = d3.select(that).select("canvas"),
          span = d3.select(that).select(".value"),
          max_,
          m = colors_.length >> 1,
          ready;

      canvas.datum({id: id, metric: metric_});
      canvas = canvas.node().getContext("2d");

      function change(start1, stop) {
        canvas.save();

        // compute the new extent and ready flag
        var extent = metric_.extent();
        ready = extent.every(isFinite);
        if (extent_ != null) extent = extent_;

        // if this is an update (with no extent change), copy old values!
        var i0 = 0, max = Math.max(-extent[0], extent[1]);
        if (this === context) {
          if (max == max_) {
            i0 = width - dnaism_metricOverlap;
            var dx = (start1 - start) / step;
            if (dx < width) {
              var canvas0 = buffer.getContext("2d");
              canvas0.clearRect(0, 0, width, height);
              canvas0.drawImage(canvas.canvas, dx, 0, width - dx, height, 0, 0, width - dx, height);
              canvas.clearRect(0, 0, width, height);
              canvas.drawImage(canvas0.canvas, 0, 0);
            }
          }
          start = start1;
        }

        // update the domain
        scale.domain([0, max_ = max]);

        // clear for the new data
        canvas.clearRect(i0, 0, width - i0, height);

        // record whether there are negative values to display
        var negative;

        // positive bands
        for (var j = 0; j < m; ++j) {
          canvas.fillStyle = colors_[m + j];

          // Adjust the range based on the current band index.
          var y0 = (j - m + 1) * height;
          scale.range([m * height + y0, y0]);
          y0 = scale(0);

          for (var i = i0, n = width, y1; i < n; ++i) {
            y1 = metric_.valueAt(i);
            if (y1 <= 0) { negative = true; continue; }
            if (y1 === undefined) continue;
            canvas.fillRect(i, y1 = scale(y1), 1, y0 - y1);
          }
        }

        if (negative) {
          // enable offset mode
          if (mode === "offset") {
            canvas.translate(0, height);
            canvas.scale(1, -1);
          }

          // negative bands
          for (var j = 0; j < m; ++j) {
            canvas.fillStyle = colors_[m - 1 - j];

            // Adjust the range based on the current band index.
            var y0 = (j - m + 1) * height;
            scale.range([m * height + y0, y0]);
            y0 = scale(0);

            for (var i = i0, n = width, y1; i < n; ++i) {
              y1 = metric_.valueAt(i);
              if (y1 >= 0) continue;
              canvas.fillRect(i, scale(-y1), 1, y0 - scale(-y1));
            }
          }
        }

        canvas.restore();
      }

      function focus(i) {
        if (i == null) i = width - 1;
        var value = metric_.valueAt(i);
        span.datum(value).text(isNaN(value) ? null : format);
        if (i === width - 1)
          span.datum(value).text(null); // Do not show last value when not in focus
      }

      // Update the chart when the context changes.
      context.on("change.horizon-" + id, change);
      context.on("focus.horizon-" + id, focus);

      // Display the first metric change immediately,
      // but defer subsequent updates to the canvas change.
      // Note that someone still needs to listen to the metric,
      // so that it continues to update automatically.
      metric_.on("change.horizon-" + id, function(start, stop) {
        change(start, stop), focus();
        if (ready) metric_.on("change.horizon-" + id, dnaism_identity);
      });
    });
  }

  horizon.remove = function(selection) {

    selection
        .on("mousemove.horizon", null)
        .on("mouseout.horizon", null);

    selection.selectAll("canvas")
        .each(remove)
        .remove();

    selection.selectAll(".title,.value")
        .remove();

    function remove(d) {
      d.metric.on("change.horizon-" + d.id, null);
      context.on("change.horizon-" + d.id, null);
      context.on("focus.horizon-" + d.id, null);
    }
  };

  horizon.mode = function(_) {
    if (!arguments.length) return mode;
    mode = _ + "";
    return horizon;
  };

  horizon.height = function(_) {
    if (!arguments.length) return height;
    buffer.height = height = +_;
    return horizon;
  };

  horizon.metric = function(_) {
    if (!arguments.length) return metric;
    metric = _;
    return horizon;
  };

  horizon.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return horizon;
  };

  horizon.extent = function(_) {
    if (!arguments.length) return extent;
    extent = _;
    return horizon;
  };

  horizon.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return horizon;
  };

  horizon.format = function(_) {
    if (!arguments.length) return format;
    format = _;
    return horizon;
  };

  horizon.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return horizon;
  };

  return horizon;
};
// ... { d3.select(this).call(context.axis().ticks(12).orient(d)); });
dnaism_contextPrototype.axis = function() {
  var context = this,
      scale = context.scale,
      axis_ = d3.svg.axis().scale(scale);

  //var format = d3.format("s");
  var format = function(d) { return context.chrm() + ":" + d3.format("s")(d); };
  var format_log = function(d) { return context.chrm() + ":" + Math.round(d); };

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

    context.on("change.axis-" + id, function() {
      g.call(axis_);
      if (!tick) tick = d3.select(g.node().appendChild(g.selectAll("text").node().cloneNode(true)))
          .style("display", "none")
          .text(null);
    });

    context.on("focus.axis-" + id, function(i) {
      if (tick) {
        if (i == null) {
          tick.style("display", "none");
          g.selectAll("text").style("fill-opacity", null);
        } else {
          //console.log(format_log(scale.invert(i)));
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
dnaism_contextPrototype.rule = function() {
  var context = this,
      metric = dnaism_identity;

  function rule(selection) {
    var id = ++dnaism_id;

    var line = selection.append("div")
        .datum({id: id})
        .attr("class", "line")
        .call(dnaism_ruleStyle);

    selection.each(function(d, i) {
      var that = this,
          id = ++dnaism_id,
          metric_ = typeof metric === "function" ? metric.call(that, d, i) : metric;

      if (!metric_) return;

      function change(start, stop) {
        var values = [];

        for (var i = 0, n = context.size(); i < n; ++i) {
          if (metric_.valueAt(i)) {
            values.push(i);
          }
        }

        var lines = selection.selectAll(".metric").data(values);
        lines.exit().remove();
        lines.enter().append("div").attr("class", "metric line").call(dnaism_ruleStyle);
        lines.style("left", dnaism_ruleLeft);
      }

      context.on("change.rule-" + id, change);
      metric_.on("change.rule-" + id, change);
    });

    context.on("focus.rule-" + id, function(i) {
      line.datum(i)
          .style("display", i == null ? "none" : null)
          .style("left", i == null ? null : dnaism_ruleLeft);
    });
  }

  rule.remove = function(selection) {

    selection.selectAll(".line")
        .each(remove)
        .remove();

    function remove(d) {
      context.on("focus.rule-" + d.id, null);
    }
  };

  rule.metric = function(_) {
    if (!arguments.length) return metric;
    metric = _;
    return rule;
  };

  return rule;
};

function dnaism_ruleStyle(line) {
  line
      .style("position", "absolute")
      .style("top", 0)
      .style("bottom", 0)
      .style("width", "1px")
      .style("pointer-events", "none");
}

function dnaism_ruleLeft(i) {
  return i + "px";
}
// vim: ts=4 expandtab:

/* The simplets source, a bed file */
dnaism_contextPrototype.bedfile = function() {
    var source = {},
        context = this,
        compute_average;

    compute_average = function(arr) {
        var sum = 0, i;
        for (i=0; i<arr.length; i++)
            sum = sum + arr[i];
        return +((sum/arr.length).toFixed(2));
    };

    source.metric = function(file_name) {

    return context.metric(function(start, stop, chrm, step, callback) {

        d3.text(file_name, function(contents) {
            var final_data_points = [],
                size = context.size(),
                interval_size = (stop-start)/size,
                int_mark = start + interval_size,
                sum = 0,
                int_vals = [],
                _n_plus;

            d3.tsv.parseRows(contents, function(a_row) {
                var _chrm = a_row[0],
                    coor  = +a_row[1],
                    value = +a_row[3];

                if (chrm === _chrm && coor < int_mark) {
                    int_vals.push(value);
                }
                else {
                    if (coor < int_mark + interval_size) {
                        final_data_points.push(compute_average(int_vals));
                        int_mark = int_mark + interval_size;
                    }
                    else {
                        _n_plus = ~~((coor - int_mark) / interval_size);
                        int_mark += (interval_size * _n_plus);
                        while (_n_plus--)
                          final_data_points.push(0);
                    }
                    int_vals = [value];
                }
                return null;
            });

            // Data points ready to send back to dnaism engine
            callback(null, final_data_points.slice(-context.size()));
        });

      }, file_name);
    };

    return source;
};
// Source for bedserver: https://github.com/drio/bedserver
dnaism_contextPrototype.bedserver = function(host) {
  if (!arguments.length) host = "";
  var source = {},
      context = this;

  source.metric = function(project, sample) {
    return context.metric(function(start, stop, chrm, step, callback) {
      var url = host + "/bedserver/api/v1.0/samples/"
          + project + "/" + sample
          + "?start=" + start
          + "&stop=" + stop
          + "&chrm=" + context.chrm()
          + "&size=" + context.size()
          + "&step=" + step;
      console.log("bedserver; url= " + url);
      d3.json(url, function(data) {
        if (!data) return callback(new Error("unable to load data"));
        callback(null, data);
      });
    }, project + ":" + sample);
  };

  // Returns the bedserver host.
  source.toString = function() {
    return host;
  };

  return source;
};
})(this);
