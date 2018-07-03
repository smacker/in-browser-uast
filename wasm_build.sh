#!/bin/bash

emcc -s WASM=1 -s USE_ZLIB=1 -s ALLOW_MEMORY_GROWTH=1 \
    -s ASSERTIONS=2 \
    -s DISABLE_EXCEPTION_CATCHING=0 \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    --js-library src/libuast.js \
    -Werror \
    -o public/libuast.js \
    -Ilibs/libxml2/include \
    -Ilibs/libuast/src \
    -Icpp/_proto \
    libs/libxml2.a libs/libxml2.dylib \
    libs/libuast/src/roles.c libs/libuast/src/uast.cc \
    cpp/libuast_binding.cc
