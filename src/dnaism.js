var VERSION = "0.3.9",
    dnaism;

if (typeof window === 'undefined') { // node
  dnaism = exports;
} else {
  dnaism = exports.dnaism = {};
}

dnaism.version = VERSION;

