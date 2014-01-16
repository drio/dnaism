### DNAism

DNAism is a modified version of [Cubism](http://square.github.io/cubism/) aimed to work with genomic data.

[Cubism](http://square.github.io/cubism/) effectively allows you to visualize time-series data using [Horizon](http://bl.ocks.org/mbostock/1483226) charts. With Time-series data in your metrics changes over time, with DNA
it changes over genomic coordinates.

I will be modifying this readme a lot so stay tunned!

Here is a screenshot of DNAism visualizing a region of simulated random data for 23+ samples. 
The details of how these files are generated
is [here](https://github.com/drio/dnaism/blob/master/example/depth/build.sh). Basically a bunch of 
[Bed](https://genome.ucsc.edu/FAQ/FAQformat.html#format1) files are generated for a small region of a genome. It introduces constant values on certain intervals to allow visual validation. Then, we tell DNAism to use that
context when visualizing the data.

![](http://f.cl.ly/items/382L0O252a3j2w2w2F1b/Screen%20Shot%202014-01-16%20at%2010.43.42%20AM.png)
