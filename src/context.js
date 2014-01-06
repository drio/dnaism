dnaism.context = function() {
  var context = new dnaism_context,
      step = 1e4,  // 10k bp
      size = 1440, // 10k * 1440 pixes = 14M bases
      chrm,        // chrm
      start, stop, // start/stop of the current region
      event = d3.dispatch("focus"),
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
    if (listener != null) {
      if (/^focus(\.|$)/.test(type)) listener.call(context, focus);
    }

    return context;
  };


  return update();
};

function dnaism_context() {}

var dnaism_contextPrototype = dnaism.context.prototype = dnaism_context.prototype;
