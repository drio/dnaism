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
