// The simplets source, a bed file
dnaism_contextPrototype.bedfile = function() {
  var source = {},
      context = this;

  source.metric = function(file_name) {
    return context.metric(function(start, stop, chrm, step, callback) {

      d3.text(file_name, function(contents) {
        var values = [],
            size = context.size(),
            curr_locus = +start,
            interval_size = (stop-start)/size,
            int_mark, n_vals, sum;

        console.log("  data:" + contents.length);
        console.log("  start:" + start);
        console.log("  stop:" + stop);
        console.log("  step:" + step);
        console.log("  chrm:" + chrm);
        console.log("  i size:" + interval_size);

        // TODO: use step
        // Not used because complicates the logic. We will end up using
        // a backend server anyway which will facilitate the implementation
        // of these. In the server, we can read from and indexed version of
        // the bed file from disk.
        int_mark = start + interval_size;
        n_vals = 0;
        sum = 0;
        d3.tsv.parseRows(contents, function(a_row) {
          var _chrm = a_row[0],
              locus = +a_row[1],
              value = +a_row[3];
          if (chrm === _chrm && locus >= start && locus <= stop) {
            if (locus < int_mark) {
              sum += value;
              n_vals += 1;
            } else {
              values.push(n_vals === 0 ? 0 : sum/n_vals);
              sum = value;
              n_vals = 1;
              int_mark = int_mark + interval_size;
            }
          }
          return null;
        });

        console.log("values.length =  " + values.length);

        callback(null, values.slice(-context.size()));
      });


    }, file_name);
  };

  return source;
};

