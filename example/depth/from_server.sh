#!/bin/bash
#set -x

rm -f *.bed
beds=`ssh ardmore ls /stornext/snfs6/rogers/drio_scratch/projects/dnaism/crv_wgs/*00*.bed`

i=0
for b in $beds
do
    bn=`basename $b`
    id=`echo $bn | ruby -ne 'puts $_.split(".")[0]'`;
    echo $id
    (ssh ardmore head -100000 $b | awk -F"\t" '{if ($2>1100000 && $2<1200000) print}' ) > ${id}.bed &
    i=$[$i+1]
    if [ $i -eq 10 ];then
        wait
        i=0
    fi
done
wait
