
build:
	@grunt
	@$(MAKE) size

test: test_node test_local test_http

test_node:
	@node tests/node-runner.js

test_local:
	@phantomjs tools/phantom.js tests/runner.html?console

test_http:
	@node tools/server.js seajs/tests/runner.html?console

totoro:
	@totoro --adapter=tests/totoro-adapter.js --client-root=../

size:
	@tools/size.sh sea
