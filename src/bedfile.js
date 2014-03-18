// The simplets source, a bed file
dnaism_contextPrototype.bedfile = function() {
  var source = {},
      context = this;

  source.metric = function(file_name) {
    return context.metric(function(start, stop, chrm, step, callback) {

      d3.text(file_name, function(contents) {
        var values = [],
            size = context.size(),
            interval_size = (stop-start)/size,
            int_mark, n_vals, sum;

        int_mark = start + interval_size;
        n_vals = 0;
        sum = 0;
        d3.tsv.parseRows(contents, function(a_row) {
          /*
           * This is buggy: you may jump windows without assigning a value.
           * Alterantive:
           * while coor < int_mark
           *    store coor, val
           * if coor within next window
           *    compute average and store in array
           *    N = 1
           * else
           *    save 0 in all the windows that have no value
           *    N = ?
           * update current in_mark (int_mark + w_size*N)
           */
          var _chrm = a_row[0],
              coor = +a_row[1],
              value = +a_row[3];
          if (chrm === _chrm && coor >= start && coor <= stop) {
            if (coor < int_mark) {
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

