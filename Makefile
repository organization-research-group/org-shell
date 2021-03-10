SRC_FILES := $(shell find src)

TS_FILES := $(shell find src -name *.ts)

EXAMPLES := $(sort $(dir $(wildcard ./examples/*/)))
EXAMPLE_ENTRIES := $(addsuffix index.ts,$(EXAMPLES))
EXAMPLE_BUNDLES := $(addsuffix bundle.js,$(EXAMPLES))

.PHONY: all
all: $(EXAMPLE_BUNDLES) index.d.ts

.PHONY: clean
clean:
	rm -rf $(EXAMPLE_BUNDLES) node_modules dist

.PHONY: check
check:
	tsc --noEmit -p .

dist/index.d.ts: $(TS_FILES) | node_modules
	tsc -p .

node_modules: package.json
	npm ci

%/bundle.js: %/index.ts $(SRC_FILES) | node_modules
	./examples/bundle $< -o $@
