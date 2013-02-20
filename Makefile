
build:
	grunt
	make size

all:
	grunt all

test:
	phantomjs tools/phantom.js http://localhost/~lifesinger/seajs/seajs/tests/runner.html?console

local:
	phantomjs tools/phantom.js tests/runner.html?console

node:
	node tests/node-runner.js

size:
	tools/size.sh
