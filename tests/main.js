#!/usr/bin/env node

var dnaism = require('./dnaism.test.js').dnaism,
    assert = require('assert');

var basic = function() {
  assert(typeof dnaism.version === "string", "Is version there?");
};

var context = function() {
  var ct = dnaism.context()
           .start(100)
           .stop(50e6)
           .size(1280)
           .chrm('chr1')
           .step(20000);

  assert(ct.start() === 100, "start properly set");
  assert(ct.stop() === 50e6, "stop properly set");
  assert(ct.size() === 1280, "size properly set");
  assert(ct.chrm() === "chr1", "chrm properly set");
  assert(ct.step() === 20000, "chrm properly set");

};

basic();
context();
