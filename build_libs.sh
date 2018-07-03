#!/bin/bash

set -e

mkdir -p libs
cd libs

echo "clone libuast"
git clone https://github.com/bblfsh/libuast.git

echo "clone and compile libxml"
git clone git://git.gnome.org/libxml2 libxml2
(
    cd libxml2

    # make it work on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i -e 's/libtoolize/glibtoolize/' autogen.sh
    fi;

    emconfigure ./autogen.sh \
        --without-debug \
        --without-ftp --without-http \
        --without-python --without-regexps --without-threads --without-modules

    emmake make
)
cp libxml2/.libs/libxml2.a .
# different extentions on mac/linux
cp libxml2/.libs/libxml2.so ./libxml2.dylib || true
cp libxml2/.libs/libxml2.dylib . || true

echo " clone and compile libprotobuf"
git clone https://github.com/invokr/protobuf-emscripten.git
(
    cd protobuf-emscripten/3.1.0
    sh autogen.sh
    emconfigure ./configure --with-protoc=protoc
    emmake make
)

cp protobuf-emscripten/3.1.0/src/.libs/libprotobuf.a .
# different extentions on mac/linux
cp protobuf-emscripten/3.1.0/src/.libs/libprotobuf.so ./libprotobuf.dylib || true
cp protobuf-emscripten/3.1.0/src/.libs/libprotobuf.dylib . || true

cd ..
