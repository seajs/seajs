
build:
	ant -buildfile tools/build.xml

build_all:
	ant -buildfile tools/build.xml build_seajs
	ant -buildfile tools/build.xml build_plugins

test:
	phantomjs tools/phantom.js http://localhost:8080/leeight.github.com/seajs/tests/runner.html?console

test_local:
	phantomjs tools/phantom.js tests/runner.html?console

test_node:
	node tests/node-runner.js

size:
	tools/size.sh
