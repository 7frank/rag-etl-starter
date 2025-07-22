.PHONY: install dev ui flow wikipedia-flow setup clean

# Python environment setup
install:
	uv sync

setup: install
	uv run prefect config set PREFECT_API_URL=http://127.0.0.1:4200/api

# Development commands
dev: setup
	uv run prefect server start --host 127.0.0.1

ui: setup
	uv run prefect server start --host 127.0.0.1

# Flow execution
flow: wikipedia-flow

wikipedia-flow: setup
	uv run python src/flows/wikipedia_flow.py

# Utility commands
clean:
	rm -rf .venv
	rm -rf __pycache__
	rm -rf .prefect

# Show available commands
help:
	@echo "Available commands:"
	@echo "  install       - Install Python dependencies using uv"
	@echo "  setup         - Setup Prefect configuration"
	@echo "  dev/ui        - Start Prefect UI server"
	@echo "  flow          - Run the default Wikipedia flow"
	@echo "  wikipedia-flow - Run Wikipedia ETL flow"
	@echo "  clean         - Clean up generated files and virtual environment"