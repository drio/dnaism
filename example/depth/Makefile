#
index.html: index.template.html
	./gen_html.py > $@

from_server:
	./from_server.sh

listen:
	python3 -m http.server 8888

.phony: listen from_server
