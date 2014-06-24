
build:
	@seatools build

site:
	@seatools build
	@seatools site

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
