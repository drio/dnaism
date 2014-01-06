#!/usr/bin/env node

var dnaism = require('./dnaism.test.js').dnaism,
    assert = require('assert');

var basic = function() {
  assert(typeof dnaism.version === "string", "Is version there?");
};

var context = function() {

};

basic();
context();
