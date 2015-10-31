var dnaism = {};
dnaism.version = "0.3.3";

if (window === 'undefined') { // node
  exports = dnaism;
} else { // browser
  window.dnaism = dnaism;
}

//var dnaism = exports.dnaism = {version: "X.Y.Z"};

