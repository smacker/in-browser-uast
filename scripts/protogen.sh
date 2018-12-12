#!/bin/bash

mkdir -p src/_proto
mkdir -p cpp/_proto

protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  -I ./proto -I /include \
  --js_out=import_style=commonjs,binary:./src/_proto \
  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src/_proto \
  ./proto/github.com/gogo/protobuf/gogoproto/gogo.proto \
  ./proto/uast.proto \
  ./proto/protocol.proto
