
build:
	@grunt
	@$(MAKE) size

build_all:
	@grunt all
	@$(MAKE) size

test: test_node test_local test_http

test_node:
	@node tests/node-runner.js

test_local:
	@phantomjs tools/phantom.js tests/runner.html?console

test_http:
	@node tools/server.js . phantomjs tools/phantom.js http://127.0.0.1:9012/tests/runner.html?console

totoro:
	@totoro-test --adapter=tests/totoro-adapter.js

size:
	@tools/size.sh
