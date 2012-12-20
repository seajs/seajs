
build:
	ant -buildfile tools/build.xml build_seajs

build_all:
	ant -buildfile tools/build.xml

test:
	node tests/runner.js
	phantomjs tools/phantom.js http://localhost:3000/tests/runner.html?console
