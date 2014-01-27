#!/usr/bin/env python

import sys
from jinja2 import Template

start = 500
stop = 20000
size = 1280
chrm = sys.argv[1]
step = 2

n_samples = int(sys.argv[2])
seed = "sample"
samples = []
for i in range(1, n_samples+1):
    f_name = seed + str(i) + ".bed"
    samples.append(f_name)

template = Template(open("index.template.html").read())
print template.render(start=start, stop=stop, size=size, chrm=chrm, step=step, metrics=samples)
