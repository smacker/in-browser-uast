#!/bin/bash

# DISABLE_EXCEPTION_CATCHING must be 0 to get correct error from libuast

emcc -s WASM=1 -s USE_ZLIB=1 -Os -s DISABLE_EXCEPTION_CATCHING=0 \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    --js-library src/libuast_proto_binding.js \
    -Werror \
    -o public/libuast.js \
    -Ilibs/libxml2/include \
    -Ilibs/libuast/src \
    -Icpp/_proto \
    libs/libxml2.a libs/libxml2.dylib \
    libs/libuast/src/roles.c libs/libuast/src/uast.cc \
    cpp/libuast_binding.cc
