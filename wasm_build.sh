#!/bin/bash

emcc -s WASM=1 -s USE_ZLIB=1 -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' -s DISABLE_EXCEPTION_CATCHING=0 \
    -o public/libuast.js \
    -Ilibs/libxml2/include \
    -Ilibs/libuast/src \
    -Ilibs/protobuf-emscripten/3.1.0/src \
    -Icpp/_proto \
    libs/libxml2.a libs/libxml2.dylib \
    libs/libprotobuf.a libs/libprotobuf.dylib \
    libs/libuast/src/roles.c libs/libuast/src/uast.cc \
    cpp/_proto/github.com/gogo/protobuf/gogoproto/gogo.pb.cc \
    cpp/_proto/uast.pb.cc \
    cpp/libuast_binding.cc
