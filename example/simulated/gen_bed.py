#!/usr/bin/env python

import sys
import random


s = sys.argv
chrm = s[1]
start, end = [int(i) for i in s[2:4]]


val = None

for i in range(start, end+1):
    if len(s) == 5:
        val = int(s[4])
    else:
        val = random.randint(0, 100)
    print "%s\t%s\t%s\t%s" % (chrm, i, i, val)

