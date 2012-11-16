
build:
	ant -buildfile tools/build.xml build_seajs

build_all:
	ant -buildfile tools/build.xml

tests:
	node test/runner.js
	phantomjs tools/phantom.js http://localhost/~lifesinger/seajs/seajs/test/runner.html?console
