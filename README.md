# In-browser UAST prototype.

* use web grpc to call bblfsh
* use libuast compiled to WASM for uast filtering

## Docker

```
docker-compose up
```

The example app will be available on http://127.0.0.1:8444

## Manual building:

### Requirements:

* nodejs + yarn
* python2.7
* build tools: cmake autoconf libtool automake pkg-config make
* [emscripten](http://kripken.github.io/emscripten-site/)
* [protoc](https://github.com/google/protobuf)

### Steps to build:

* generate code from proto: `./protogen.sh`
* download and build C dependencies: `./build_libs.sh`
* build wasm adapter to libuast `./wasm_build.sh`
* build/start the example app: `yarn buid/start`

## Backend dependencies without docker

* run [bblfsh server](https://github.com/bblfsh/bblfshd/) on 9432 port
* run [grpc proxy](https://github.com/improbable-eng/grpc-web/tree/master/go/grpcwebproxy) `grpcwebproxy --backend_addr=127.0.0.1:9432 --run_tls_server=false`