#
all: beds index.html serve

beds:
	@echo "Unpacking bed files ..."
	tar -jxf depth.beds.tar.bz2

index.html: index.template.html
	./gen_html.py > $@

from_server:
	./from_server.sh

serve:
	@echo "point browser your browser here: http://localhost:8888"
	python3 -m http.server 8888

clean:
	rm -f *.bed index.html

.phony: from_server serve beds clean
