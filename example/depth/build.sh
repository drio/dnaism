#!/bin/bash

n_samples=10
chrm=Chr17

./gen_html.py $chrm $n_samples > index.html

for i in `seq 1 $n_samples`
do
    out="sample${i}.bed"
    echo $out
    ./gen_bed.py $chrm 500 1000 > $out
    ./gen_bed.py $chrm 1001 3000 0 >> $out
    ./gen_bed.py $chrm 3001 4000 >> $out
    ./gen_bed.py $chrm 4001 7000 20 >> $out
    ./gen_bed.py $chrm 7001 20000 >> $out
done




