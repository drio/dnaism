### DNAism

Main site [here](http://drio.github.io/dnaism/).

#### Questions, patches, comments, feedback?

Please open a [ticket](https://github.com/drio/dnaism/issues) and we will
be happy to help you.

#### Intro

DNAism is a modified version of [Cubism](http://square.github.io/cubism/) aimed
to work with genomic data.

[Cubism](http://square.github.io/cubism/) effectively allows you to visualize
time-series data using [Horizon](http://bl.ocks.org/mbostock/1483226) charts.
In time-series data your metrics change over time, with DNA it changes
over genomic coordinates (e.g. `chr17:45000`).

Head to the [wiki](https://github.com/drio/dnaism/wiki) for more details on the API reference (still
a work in progress).

There are two other projects that go together with DNAism: [bedserver](https://github.com/drio/bedserver) and
[bedbrowser](https://github.com/drio/bedbrowser). Bedserver is a lightweight backend for the
bedserver source (more on that below) and bedbrowser is a web app example that uses DNAism and bedserver.

#### What type of skills I need to use this software?

In the bioinformatics community we are more used to run standalone applications.
Those run directly in your Operating System. DNAism is a javascript library.
Javascript interpreters run in browsers which in turn run in the Operating System.

To get the most of this library you have to be comfortable writing web applications.
That means you should be familiar with [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS),
[HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) and
[Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript).

The library uses [D3](http://d3js.org/) to interact with the
[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).
D3 experience would be very valuable, specially if you are planning on
going beyond the basics.

#### What resources does this library consume?

It is not CPU intensive. Any current laptop or workstation will render the
visualizations without trouble.

Data has to be loaded in the browser. If you choose to load all the visualization
data points in memory your system (depending of the memory available and the
region your are visualizing)
may start [Thrashing](http://en.wikipedia.org/wiki/Thrashing_(computer_science)).
To avoid that you should preprocess the regions you are visualizing and only
send to the browser the data points used for rendering. That processing can
happen prior to run the visualization or in realtime using the bedserver source.
You can also build your own source to target your own needs.



#### How do I install DNAism?

DNAism is a Javascript library and it is designed to be used in modern browser environments.
You simply include the latest version of the library's code ([raw](https://raw.githubusercontent.com/drio/dnaism/master/dnaism.v1.js)
 or [minimized](https://raw.githubusercontent.com/drio/dnaism/master/dnaism.v1.min.js)) in your
web app. You can also copy the contents of that file to your local disk and load directly
from there. Since DNAism uses [D3](http://d3js.org/), we have to also include that library prior
to load DNAism:

```js
...
<script src="http://d3js.org/d3.v2.min.js" charset="utf-8"></script>
<script src="dnaism.v1.js"></script>
...
```


#### Basic example (Simulated data)

NOTE: Example with real data [here](https://github.com/drio/dnaism#real-data-show-me-the-money).

Here is a screen shot of DNAism visualizing a region of simulated random data
for 23+ samples.  The details of how these files are generated is
[here](https://github.com/drio/dnaism/blob/master/example/simulated/build.sh).
Basically a bunch of [Bed](https://genome.ucsc.edu/FAQ/FAQformat.html#format1)
files are generated for a small region of a genome. It introduces constant
values on certain intervals to allow visual validation. Then, we tell DNAism to
use that context when visualizing the data.

![](http://f.cl.ly/items/382L0O252a3j2w2w2F1b/Screen%20Shot%202014-01-16%20at%2010.43.42%20AM.png)

To try this yourself go to `examples/depth` and run `build.sh`. It will
generate the javascript code using this
[template](https://github.com/drio/dnaism/blob/master/example/depth/index.template.html)
and it will generate the bed file with the genomic data:

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

You can look in the
[template](https://github.com/drio/dnaism/blob/master/example/depth/index.template.html)'s
code to see how we use DNAism to load the data. It is very similar to cubism
with minor changes in the creation of the context and the definition of the
metrics:

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


#### Real data (Show me the money!)

Here is another example, this time with real data. We computed the
[read depth](http://en.wikipedia.org/wiki/Deep_sequencing) across
25 [Whole genome](http://en.wikipedia.org/wiki/Whole_genome_sequencing) samples
(30x coverage). As with the simulated data, we use the bedfile source to access
the data. Here is a screen shot:

![](http://f.cl.ly/items/2q0c0b1q2S1p1M1w2l2a/foo.png)

The id of the sample is shown at the beginning of each chart. At the top and
bottom we have the region of the genome we are visualizing.

We can appreciate the consistency in read depth across the majority of the samples
(Some of them have a lower read depth across the whole genome).

Also, there are small intervals where the read depth is very low, and that is
also consistent across all the samples.

#### Snp density

Here is another example, this time showing snp density
across 20 Rhesus Macaque samples on chromosome 1.

![density](http://f.cl.ly/items/0o321p3L0r1r3G0S0w38/Screen%20Shot%202014-03-04%20at%2012.59.18%20PM.png)

