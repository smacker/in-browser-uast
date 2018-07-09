import lib from './_wasm/libuast.js';

export function protoToMap(uast) {
  let id = 0;
  let mapping = {};

  function addIds(node) {
    mapping[id] = node;

    node.id = id;
    node.getChildrenList().forEach(child => addIds(child, ++id));
  }

  addIds(uast);

  return mapping;
}

export function init(options) {
  const Module = lib(options);

  let initResolve;
  let initReject;
  const runtimeInitialized = new Promise((resolve, reject) => {
    initResolve = resolve;
    initReject = reject;
  });

  Module.onRuntimeInitialized = () => {
    initResolve();
  };

  Module.onAbort = () => {
    initReject(new Error('error during initialization'));
  };

  function readArray(ptr, length) {
    let result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = Module.HEAP8[ptr + i];
    }
    return result;
  }

  const cApi = {
    filter: Module.cwrap('filter', 'number', ['number', 'string']),
    freeFilter: Module.cwrap('free_filter', '', ['number']),
    getError: Module.cwrap('get_error', 'string', ['number']),
    getNodesSize: Module.cwrap('get_nodes_size', 'number', ['number']),
    getNodes: Module.cwrap('get_nodes', 'number', ['number'])
  };

  function isInitialized() {
    return runtimeInitialized;
  }

  function filter(id, mapping, query) {
    return runtimeInitialized.then(() => {
      Module.UAST_setMapping(mapping);

      return new Promise((resolve, reject) => {
        const result = cApi.filter(id, query);
        if (!result) {
          return reject(
            new Error('internal error: filter did not return result')
          );
        }

        function cleanup() {
          Module.UAST_setMapping(null);
          cApi.freeFilter(result);
        }

        const err = cApi.getError(result);
        if (err) {
          cleanup();
          return reject(new Error(err));
        }

        const size = cApi.getNodesSize(result);
        const nodes = cApi.getNodes(result);
        const arr = readArray(nodes, size);

        cleanup();

        return resolve(Array.from(arr));
      });
    });
  }

  return {
    isInitialized,
    filter
  };
}
