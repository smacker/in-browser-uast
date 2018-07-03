#!/bin/bash

mkdir -p src/_proto
mkdir -p cpp/_proto

protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  -I ./proto -I /include \
  --js_out=import_style=commonjs,binary:./src/_proto \
  --ts_out=service=true:./src/_proto \
  ./proto/github.com/gogo/protobuf/gogoproto/gogo.proto \
  ./proto/uast.proto \
  ./proto/protocol.proto

# create-react-app doesn't support lint disable
disable_eslint() {
  (echo "/* eslint-disable */"; cat $1) > $1.tmp
  mv $1.tmp $1
}

disable_eslint src/_proto/uast_pb.js
disable_eslint src/_proto/protocol_pb.js
disable_eslint src/_proto/protocol_pb_service.js
disable_eslint src/_proto/github.com/gogo/protobuf/gogoproto/gogo_pb.js

protoc3.1/bin/protoc -I ./proto -I ./protoc3.1/include --cpp_out=cpp/_proto \
  ./proto/github.com/gogo/protobuf/gogoproto/gogo.proto \
  ./proto/uast.proto
