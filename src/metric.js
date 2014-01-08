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
    request(start1, stop, chrm, step, function(error, data) {
      fetching = false;
      if (error) return console.warn(error);
      var i = isFinite(start) ? Math.round((start0 - start) / step) : 0;
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
