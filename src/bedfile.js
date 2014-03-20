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
        return sum/arr.length;
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
