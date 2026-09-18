ENV_FILE ?= .env
COMPOSE_FILE ?= docker-compose/compose-local.yml

.PHONY: start-dev start-prod local-infra-up local-infra-down

start-dev:
	node --env-file=$(ENV_FILE) ./node_modules/@nestjs/cli/bin/nest.js start --watch

start-prod:
	node --env-file=$(ENV_FILE) dist/main.js

local-infra-up:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d

local-infra-down:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down
