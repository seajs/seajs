family = $(shell cat package.json | grep '"family"' | awk -F'"' '{print $$4}')
name = $(shell cat package.json | grep '"name"' | awk -F'"' '{print $$4}')
version = $(shell cat package.json | grep version | awk -F'"' '{print $$4}')

build:
	@seatools build

test: test_node test_local test_http

test_node:
	@node tests/node-runner.js

test_local:
	@seatools site
	@seatools test --local

test_http:
	@seatools site
	@seatools test --http

totoro:
	@seatools site
	@seatools test --totoro

size:
	@seatools size

pages:
	@seatools publish

zip: clear build
	@mkdir -p _dist/$(family)/$(name)/
	@mv -i dist _dist/$(family)/$(name)/$(version)/
	@rm -rf dist
	@mv -i _dist dist
	@cd dist && zip -r $(family) .

clear:
	@rm -rf dist
