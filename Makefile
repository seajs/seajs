
build:
	ant -buildfile tools/build.xml

build_all:
	ant -buildfile tools/build.xml build_seajs
	ant -buildfile tools/build.xml build_plugins

test:
	node tests/runner.js
	phantomjs tools/phantom.js http://localhost/~lifesinger/seajs/seajs/tests/runner.html?console

size:
	tools/size.sh
