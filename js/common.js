var common = {};

(function() {

  function prepare_employment(data) {
    // Offset so that positive is above-average and negative is below-average.
    var mean = data.rate.reduce(function(p, v) { return p + v; }, 0) / data.rate.length;

    // Transpose column values to rows.
    data = data.rate.map(function(rate, i) {
      return [Date.UTC(data.year[i], data.month[i] - 1), rate - mean];
    });

    return data;
  }

  function rate_only(data) {
    return _.map(prepare_employment(data), function(a) { return a[1]; })
  }

  common.prepare_employment = prepare_employment;
  common.rate_only = rate_only;

})();

