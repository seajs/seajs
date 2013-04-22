
build:
	grunt
	make size

build_all:
	grunt all
	make size

test:
	make test_node
	make test_local
	make test_http

test_http:
	@node tools/server.js . phantomjs tools/phantom.js http://127.0.0.1:9012/tests/runner.html?console

test_local:
	phantomjs tools/phantom.js tests/runner.html?console

test_node:
	node tests/node-runner.js

totoro:
	totoro-test --adapter=tests/totoro-adapter.js

size:
	tools/size.sh
