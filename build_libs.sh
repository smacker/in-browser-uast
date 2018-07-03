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
        --without-python --without-regexps \
        --without-threads --without-modules \
        --without-html --without-legacy --without-output --without-push

    emmake make
)
cp libxml2/.libs/libxml2.a .
# different extentions on mac/linux
cp libxml2/.libs/libxml2.so ./libxml2.dylib || true
cp libxml2/.libs/libxml2.dylib . || true

cd ..
