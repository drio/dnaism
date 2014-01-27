#!/bin/bash

set -e

input_f=$1
id=$2
chrm=$3

mkdir -p dnaism
#gzip -cd $input_f | awk '{print $$1"\t"$$2"\t"$$2"\t"$$3}' | bgzip > dnaism/${id}.bed.gz
#tabix -p bed dnaism/${id}.bed.gz
#tabix dnaism/${id}.bed.gz $chrm > dnaism/${id}.${chrm}.bed
gzip -cd $input_f | grep $chrm | awk '{print $$1"\t"$$2"\t"$$2"\t"$$3}' > dnaism/${id}.bed
