SRC_FILES := $(shell find src)

EXAMPLES := $(sort $(dir $(wildcard ./examples/*/)))
EXAMPLE_ENTRIES := $(addsuffix index.ts,$(EXAMPLES))
EXAMPLE_BUNDLES := $(addsuffix bundle.js,$(EXAMPLES))

.PHONY: all
all: $(EXAMPLE_BUNDLES)

.PHONY: clean
clean:
	rm -rf $(EXAMPLE_BUNDLES) node_modules

node_modules: package.json
	npm ci

%/bundle.js: %/index.ts $(SRC_FILES) | node_modules
	./examples/bundle $< -o $@
