#
all: beds index.html serve

beds:
	@echo "Unpacking bed files ..."
	tar -jxf depth.beds.tar.bz2

index.html: index.template.html
	./gen_html.py > $@

serve:
	@echo "--> point your browser here: http://localhost:8888"
	python -m SimpleHTTPServer 8888

clean:
	rm -f *.bed index.html

.phony: checks from_server serve beds clean
