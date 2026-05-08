dev-web:
	bun run dev

dev-api:
	cd apps/api && python manage.py runserver

dev:
	make dev-web & make dev-api

migrate:
	cd apps/api && python manage.py migrate

makemigrations:
	cd apps/api && python manage.py makemigrations

shell:
	cd apps/api && python manage.py shell

install-api:
	cd apps/api && pip install -r requirements.txt

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
