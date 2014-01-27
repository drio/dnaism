#!/usr/bin/env python

import sys
from drdcommon import xopen

if len(sys.argv) == 3:
    start, end = sys.argv[1:]
    start, end = int(start), int(end)
else:
    start, end = 1, None

sys.stderr.write("(%s, %s)\n" % (start, end))

d = {}
chrm = None
for l in xopen("-"):
    chrm, coor, _, m_val = l.split("\t")
    coor, m_val = int(coor), int(m_val)
    d[coor] = m_val
    if not end:
        end = coor
sys.stderr.write("len(d) = %s \n" % len(d))

found = 0
for i in range(start, end+1):
    val = 0
    if i in d:
        val = d[i]
        found += 1
    print "%s\t%s\t%s\t%s" % (chrm, i, i, val)

sys.stderr.write("found = %s \n" % found)
sys.stderr.write("total = %s \n" % (end-start))
sys.stderr.write("%s%% found\n" % ((found*100.0)/(0.0+end-start)))

