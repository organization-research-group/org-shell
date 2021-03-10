SRC_FILES := $(shell find src)

TS_FILES := $(shell find src -name *.ts)

MJS_EXPORT_DIR := dist/esm
CJS_EXPORT_DIR := dist/cjs

MJS_EXPORTED_FILES := $(subst src,$(MJS_EXPORT_DIR),$(subst .ts,.mjs,$(TS_FILES)))
CJS_EXPORTED_FILES := $(subst src,$(CJS_EXPORT_DIR),$(subst .ts,.js,$(TS_FILES)))

EXAMPLES := $(sort $(dir $(wildcard ./examples/*/)))
EXAMPLE_ENTRIES := $(addsuffix index.ts,$(EXAMPLES))
EXAMPLE_BUNDLES := $(addsuffix bundle.js,$(EXAMPLES))

ESBUILD_BIN := node_modules/.bin/esbuild

.PHONY: all
all: $(EXAMPLE_BUNDLES) dist/index.d.ts $(MJS_EXPORTED_FILES) $(CJS_EXPORTED_FILES)

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

$(MJS_EXPORT_DIR)/%.mjs: src/%.ts | node_modules
	$(ESBUILD_BIN) --platform=neutral --format=esm $^ --out-extension:.js=.mjs --outdir=$(MJS_EXPORT_DIR)

$(CJS_EXPORT_DIR)/%.js: src/%.ts | node_modules
	$(ESBUILD_BIN) --platform=node --format=cjs $^ --outdir=$(CJS_EXPORT_DIR)
