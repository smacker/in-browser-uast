# Bblfsh javascript client

* use web grpc to call bblfsh
* use libuast compiled to WASM for uast filtering

## Installation

```bash
yarn add bblfsh
```

The WASM module from `node_modules/dist/libuast.wasm` must be available as `/libuast.wasm` in a browser.

It's possible to change the public path to the file like this:

```js
const libuast = initLibuast({
  locateFile(path) {
    if(path.endsWith('.wasm')) {
      return '/some/other/path/libuast.wasm';
    }
    return path;
  }
});
```

## Usage

### Client

```js
import Client from 'bblfsh';

const client = new Client('<web-grpc-address>');

client.parse(sourceCode, filename, language)
  .then(r => /* gRPC response */)
  .catch(err => /* or error */);
```

### Libuast

```js
import { protoToMap, initLibuast } from 'bblfsh';

const libuast = initLibuast();
const uastMapping = protoToMap(uast);

libuast.filter(nodeId, uastMapping, xpathQuery)
  .then(ids => /* list of nodes */)
  .catch(err => /* or error */);

```

Full API documentation available here: [API.md](API.md).

## Run examples locally

```
docker-compose up
```

The example app will be available on http://127.0.0.1:8444

Please check Dockerfile in the app example directory to run it without docker

### Backend dependencies without docker

* run [bblfsh server](https://github.com/bblfsh/bblfshd/) on 9432 port
* run [grpc proxy](https://github.com/improbable-eng/grpc-web/tree/master/go/grpcwebproxy) `grpcwebproxy --backend_addr=127.0.0.1:9432 --run_tls_server=false`

## Development:

### Requirements:

* nodejs + yarn
* python2.7
* build tools: cmake autoconf libtool automake pkg-config make
* [emscripten](http://kripken.github.io/emscripten-site/) (v1.38.8+)
* [protoc](https://github.com/google/protobuf)

### Commands

- `yarn build` - build everything
- `yarn build:proto` - generate js from protobuf files
- `yarn build:libs` - download & build C dependencies for libuast
- `yarn build:wasm`- generate WASM & js helper for libuast
- `yarn build:bundle` - generate library as a bundle with all dependencies included
