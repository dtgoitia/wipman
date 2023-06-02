WEBAPP_NAME:=wipman-webapp
API_NAME:=wipman-api-dev

set_up_development_environment:
	@echo ""
	@echo Installing git hooks...
	make install_dev_tools

	@echo ""
	@echo ""
	@echo Installing NPM dependencies outside of the container, to support pre-push builds...
	@# this step is necessary because otherwise docker compose creates a node_modules
	@# folder with root permissions and outside-container build fails
	cd webapp; npm ci

	@echo ""
	@echo ""
	@echo Installing Python dependencies outside of the container, so that the IDE can detect them
	@# this step is necessary because otherwise docker compose creates a node_modules
	@# folder with root permissions and outside-container build fails
	cd api;~/.pyenv/versions/3.11.2/bin/python -m venv .venv/
	bash api/bin/dev/install_dev_deps

	@echo ""
	@echo ""
	@echo Creating development docker images...
	make rebuild_webapp
	make rebuild_api

	@echo ""
	@echo ""
	@echo To start webapp:  make run_webapp
	@echo To start api:     make run_api

install_dev_tools:
	pre-commit install  # pre-commit is (default)
	pre-commit install --hook-type pre-push

uninstall_dev_tools:
	pre-commit uninstall  # pre-commit is (default)
	pre-commit uninstall --hook-type pre-push


#===============================================================================
#
#   webapp
#
#===============================================================================

run_webapp:
	scripts/print_local_ip_via_qr.sh
	docker compose up $(WEBAPP_NAME)

rebuild_webapp:
	docker compose down
	docker image rm $(WEBAPP_NAME) || (echo "No $(WEBAPP_NAME) found, all good."; exit 0)
	docker compose build --no-cache $(WEBAPP_NAME)

test_dev_webapp:
	docker compose run --rm $(WEBAPP_NAME) npm test

shell_webapp:
	docker compose run --rm $(WEBAPP_NAME) bash

deploy_webapp_from_local:
	cd ./webapp \
		&& npm run deploy_from_local
	@# TODO: docker compose run --rm $(WEBAPP_NAME) npm run deploy_from_local

build_webapp:
	scripts/build_webapp.sh


#===============================================================================
#
#   API
#
#===============================================================================

run_api:
	docker compose up $(API_NAME)

compile_api_development_dependencies:
	bash api/bin/dev/compile_dev_deps

compile_api_production_dependencies:
	bash api/bin/dev/compile_prod_deps

install_api_development_dependencies:
	bash api/bin/dev/install_dev_deps

rebuild_api:
	docker compose down
	docker image rm $(API_NAME) || (echo "No $(API_NAME) found, all good."; exit 0)
	docker compose build --no-cache $(API_NAME)

shell_into_api_container:
	docker compose run --rm $(API_NAME) /bin/bash

delete_local_db:
	find ./api -maxdepth 1 -type f -name $(DB_PATH) -delete
	touch ./api/$(DB_PATH)


#===============================================================================
#
#   daemon
#
#===============================================================================

compile_daemon_development_dependencies:
	bash daemon/bin/dev/compile_dev_deps

compile_daemon_production_dependencies:
	bash daemon/bin/dev/compile_prod_deps

install_daemon_development_dependencies:
	bash daemon/bin/dev/install_dev_deps

daemon_restore_wipman_dir_from_api:
	bash daemon/bin/restore_wipman_dir_from_api

daemon_push_wipman_dir_to_api:
	bash daemon/bin/push_wipman_dir_to_api
