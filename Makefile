WEBAPP_NAME:=wipman-webapp

install-dev-tools:
	pre-commit install  # pre-commit is (default)
	pre-commit install --hook-type pre-push

uninstall-dev-tools:
	pre-commit uninstall  # pre-commit is (default)
	pre-commit uninstall --hook-type pre-push

run-webapp:
	scripts/print_local_ip_via_qr.sh
	docker-compose up $(WEBAPP_NAME)

# Recreate web app docker image
rebuild-webapp:
	docker-compose down
	rm -rf webapp/node_modules
	docker-compose build $(WEBAPP_NAME)

test-dev-webapp:
	docker-compose run --rm $(WEBAPP_NAME) npm test

shell-webapp:
	docker-compose run --rm $(WEBAPP_NAME) bash

deploy-webapp-from-local:
	cd ./webapp \
		&& npm run deploy_from_local
	@# TODO: docker-compose run --rm $(WEBAPP_NAME) npm run deploy_from_local

build-webapp:
	scripts/build_webapp.sh

set-up-development-environment: install-dev-tools rebuild-webapp

run-db:
	docker-compose up dynamodb

migrate-db:
	bash ./db-migration-scripts/migrate-using-webapp-logic.sh

compile_python_dependencies:
	docker-compose run --rm db-migrations \
		pip-compile requirements.in \
			--output-file requirements.txt \
			--no-header \
			--no-emit-index-url \
			--verbose
