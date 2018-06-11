1. generate code from proto: `./protogen.sh`
2. download and build C dependencies: `./build_libs.sh`
3. build wasm adapter to libuast `./wasm_build.sh`
4. run bblfsh server normally
5. run grpc proxy `grpcwebproxy --backend_addr=127.0.0.1:9432 --run_tls_server=false`
6. start the example app: `yarn start`
