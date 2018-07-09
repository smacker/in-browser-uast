#!/bin/bash

# DISABLE_EXCEPTION_CATCHING must be 0 to get correct error from libuast

mkdir -p src/_wasm

emcc -s ENVIRONMENT=web -s MODULARIZE=1 -s EXPORT_ES6=1 -s WASM=1 \
    -s NO_FILESYSTEM=1 -s USE_ZLIB=1 -Os -s DISABLE_EXCEPTION_CATCHING=0 \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    --js-library src/binding.js \
    -Werror \
    -o src/_wasm/libuast.js \
    -Ilibs/libxml2/include \
    -Ilibs/libuast/src \
    -Icpp/_proto \
    libs/libxml2.a libs/libxml2.dylib \
    libs/libuast/src/roles.c libs/libuast/src/uast.cc \
    cpp/libuast_binding.cc
