
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
	phantomjs tools/phantom.js http://localhost/~lifesinger/seajs/seajs/tests/runner.html?console

test_local:
	phantomjs tools/phantom.js tests/runner.html?console

test_node:
	node tests/node-runner.js

totoro:
	totoro test --adaptor=seajs

size:
	tools/size.sh
