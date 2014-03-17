// Source for bedserver: https://github.com/drio/bedserver
dnaism_contextPrototype.bedserver = function(host) {
  if (!arguments.length) host = "";
  var source = {},
      context = this;

  source.metric = function(sample, project) {
    return context.metric(function(start, stop, step, callback) {
      d3.json(host + "/bedserver/api/v1.0/samples/"
          + project + "/" +
          + "?start=" + start
          + "&stop=" + stop
          + "&chrm=" + chrm
          + "&size=" + context.size
          + "&step=" + step, function(data) {
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
