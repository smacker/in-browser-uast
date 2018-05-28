#!/bin/bash

mkdir -p src/_proto
mkdir -p cpp

protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  -I ./proto \
  --js_out=import_style=commonjs,binary:./src/_proto \
  --ts_out=service=true:./src/_proto \
  ./proto/github.com/gogo/protobuf/gogoproto/gogo.proto \
  ./proto/uast.proto \
  ./proto/protocol.proto

protoc -I=./proto --cpp_out=cpp \
  ./proto/github.com/gogo/protobuf/gogoproto/gogo.proto \
  ./proto/uast.proto
