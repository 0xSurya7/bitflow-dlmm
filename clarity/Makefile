.PHONY: help fuzz test clean reproduce corpus install

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

fuzz: ## Run all fuzz targets
	npm run fuzz

fuzz-comprehensive: ## Run comprehensive fuzz test
	npm run fuzz:comprehensive

fuzz-quote-engine: ## Run quote engine validation fuzz test
	npm run fuzz:quote-engine

fuzz-bin-traversal: ## Run bin traversal fuzz test
	npm run fuzz:bin-traversal

fuzz-zero-fee: ## Run zero-fee exploit fuzz test
	npm run fuzz:zero-fee

fuzz-basic: ## Run basic fuzz test
	npm run fuzz:basic

test: ## Run all unit tests
	npm run test:unit

test-all: ## Run all tests (unit + fuzz)
	npm run test:all

test-coverage: ## Run tests with coverage
	npm run test:report

clean: ## Clean build artifacts and logs
	rm -rf coverage/
	rm -rf logs/
	rm -f *.log
	rm -f lcov.info
	rm -rf .cache/

reproduce: ## Reproduce a fuzz run with specific seed (usage: make reproduce SEED=12345 SIZE=100)
	@if [ -z "$(SEED)" ]; then \
		echo "Error: SEED is required. Usage: make reproduce SEED=12345 SIZE=100"; \
		exit 1; \
	fi
	npm run fuzz:comprehensive --seed $(SEED) --size $(or $(SIZE),100)

corpus: ## Generate corpus from existing fuzz runs
	@echo "Corpus generation not yet implemented"
	@echo "Place seed inputs in fuzz/corpus/seeds/"

build: ## Build contracts and generate docs
	npm run build

docs: ## Generate documentation
	npm run build:docs

