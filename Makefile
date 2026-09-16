ENV_FILE ?= .env

.PHONY: start-dev start-prod

start-dev:
	node --env-file=$(ENV_FILE) ./node_modules/@nestjs/cli/bin/nest.js start --watch

start-prod:
	node --env-file=$(ENV_FILE) dist/main.js
