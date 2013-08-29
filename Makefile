
build:
	@seatools build

test: test_node test_local test_http

test_node:
	@node tests/node-runner.js

test_local:
	@seatools test --local

test_http:
	@seatools test --http

totoro:
	@seatools test --totoro

size:
	@seatools size
