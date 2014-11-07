JS_COMPILER = ./node_modules/.bin/uglifyjs

#dnaism.v1.min.js
all: dnaism.v1.js

dnaism.v1.js: \
	src/dnaism.js \
	src/id.js \
	src/identity.js \
	src/context.js \
	src/metric.js \
	src/horizon.js \
	src/axis.js \
	src/rule.js \
	src/bedfile.js \
	src/bedserver.js \
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

site: dnaism.v1.min.js
	rsync -Lavz --delete $< site/* apu:/usr/local/www/dnaism.davidr.io/public/

pages:
	cp -r site /tmp
	git checkout gh-pages
	cp -r /tmp/site/* .
	rm -rf /tmp/site
	echo "Type comming msg: "; read MSG; git commit -a -m '$$MSG'
	git push -u origin gh-pages
	git checkout master

clean:
	rm -f dnaism.v1.js dnaism.v1.min.js

.PHONY: site pages
