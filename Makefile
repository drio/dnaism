JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

#all: dnaism.v1.min.js
all: dnaism.v1.js

dnaism.v1.js: \
	src/dnaism.js \
	src/id.js \
	src/identity.js \
	src/context.js \
	src/axis.js \
	src/rule.js \
	Makefile

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

%.js:
	@rm -f $@
	@echo '(function(exports){' > $@
	cat $(filter %.js,$^) >> $@
	@echo '})(this);' >> $@
	@chmod a-w $@

test: dnaism.v1.js
	@echo "var d3 = require('d3');" > tests/dnaism.test.js
	@cat $< | grep -v "(this);" | grep -v "(exports)" >> tests/dnaism.test.js
	@chmod 755 tests/*.js
	tests/main.js

clean:
	rm -f dnaism.v1.js dnaism.v1.min.js
