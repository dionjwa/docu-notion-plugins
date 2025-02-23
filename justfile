# just docs: https://github.com/casey/just
###########################################################################
set shell                           := ["bash", "-c"]
set dotenv-load                     := true
set export                          := true
###########################################################################
# Configuration
###########################################################################
# The NPM_TOKEN is required for publishing to https://www.npmjs.com
NPM_TOKEN                          := env_var_or_default("NPM_TOKEN", "")
tsc                                := "./node_modules/typescript/bin/tsc"
vite                               := "NODE_OPTIONS='--max_old_space_size=16384' ./node_modules/vite/bin/vite.js"
###########################################################################
# Formatting
###########################################################################
bold                               := '\033[1m'
normal                             := '\033[0m'
green                              := "\\e[32m"
yellow                             := "\\e[33m"
blue                               := "\\e[34m"
magenta                            := "\\e[35m"
grey                               := "\\e[90m"

###########################################################################
# Begin commands
###########################################################################
_help:
    #!/usr/bin/env bash
    echo ""
    just --list --unsorted --list-heading $'📚 Commands:\n'

test: _ensure_npm_modules _build

# If the npm version does not exist, publish the module
publish: _require_NPM_TOKEN _build
    #!/usr/bin/env bash
    set -euo pipefail
    # if [ "$CI" != "true" ]; then
    #     # This check is here to prevent publishing if there are uncommitted changes, but this check does not work in CI environments
    #     # because it starts as a clean checkout and git is not installed and it is not a full checkout, just the tip
    #     if [[ $(git status --short) != '' ]]; then
    #         git status
    #         echo -e '💥 Cannot publish with uncommitted changes'
    #         exit 2
    #     fi
    # fi

    PACKAGE_EXISTS=true
    if npm search $(cat package.json | jq -r .name) | grep -q  "No matches found"; then
        echo -e "  👉 new npm module !"
        PACKAGE_EXISTS=false
    fi
    VERSION=$(cat package.json | jq -r '.version')
    if [ $PACKAGE_EXISTS = "true" ]; then
        INDEX=$(npm view $(cat package.json | jq -r .name) versions --json | jq "index( \"$VERSION\" )")
        if [ "$INDEX" != "null" ]; then
            echo -e '  🌳 Version exists, not publishing'
            exit 0
        fi
    fi

    echo -e "  👉 PUBLISHING npm version $VERSION"
    if [ ! -f .npmrc ]; then
        echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
    fi
    npm publish --access public .


@_build:
    #!/usr/bin/env bash
    set -euo pipefail
    # Compiles the entire codebase to typescript files in ./dist.
    # How to test installation of the build?
    {{tsc}} --noEmit
    echo "✅ typescript check"
    {{vite}} build
    echo "✅ vite build"

_install +args="":
    pnpm i {{args}}

@_ensure_npm_modules:
    if [ ! -d node_modules ]; then pnpm i; fi

@_require_NPM_TOKEN:
	if [ -z "{{NPM_TOKEN}}" ]; then echo "Missing NPM_TOKEN env var"; exit 1; fi
