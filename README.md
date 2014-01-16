### DNAism

DNAism is a modified version of [Cubism](http://square.github.io/cubism/) aimed to work with genomic data.

[Cubism](http://square.github.io/cubism/) effectively allows you to visualize time-series data using [Horizon](http://bl.ocks.org/mbostock/1483226) charts. With Time-series data in your metrics changes over time, with DNA
it changes over genomic coordinates.

### Basic example

Here is a screenshot of DNAism visualizing a region of simulated random data for 23+ samples. 
The details of how these files are generated
is [here](https://github.com/drio/dnaism/blob/master/example/depth/build.sh). Basically a bunch of 
[Bed](https://genome.ucsc.edu/FAQ/FAQformat.html#format1) files are generated for a small region of a genome. It introduces constant values on certain intervals to allow visual validation. Then, we tell DNAism to use that
context when visualizing the data.

![](http://f.cl.ly/items/382L0O252a3j2w2w2F1b/Screen%20Shot%202014-01-16%20at%2010.43.42%20AM.png)

To try this yourself go to ```examples/depth``` and run ```build.sh```. It will generate the javascript code
using this [template](https://github.com/drio/dnaism/blob/master/example/depth/index.template.html) and it
will generate the bed file with the genomic data:

```sh
$ head example/depth/sample21.bed
Chr17   500     500     21
Chr17   501     501     18
Chr17   502     502     37
Chr17   503     503     94
Chr17   504     504     45
Chr17   505     505     22
Chr17   506     506     84
Chr17   507     507     66
Chr17   508     508     93
Chr17   509     509     97
```

You can look in the [template](https://github.com/drio/dnaism/blob/master/example/depth/index.template.html)'s code 
to see how we use DNAism to load the data. It is very similar to cubism with minor changes in the creation of the
context and the definion of the metrics:

```js
var context = dnaism.context()
               .start(500)
               .stop(20000)
               .size(1280)
               .chrm('Chr17')
               .step(2);
```

```js
var metrics = [
    source_bedfile.metric("sample1.bed"),
    source_bedfile.metric("sample2.bed"),
    source_bedfile.metric("sample3.bed"),
    //...
    source_bedfile.metric("sample23.bed"),
    source_bedfile.metric("sample24.bed"),
    source_bedfile.metric("sample25.bed"),
];
    
```

### Limitations

Currently we have only one source ([bedfile.js](https://github.com/drio/dnaism/blob/master/src/bedfile.js)). This 
source is enough to expose the usefulness of DNAism but it is not very practical since we are loading the whole 
bed files in memory. It is necessary to release a new source that works against a backend server. Code for that 
server will have to be created also. Once that is completed the data loaded in the browser will be much smaller.
