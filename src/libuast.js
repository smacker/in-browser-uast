import lib from './_wasm/libuast.js';

/**
 * Creates mapping to each node in the tree with unique id.
 * @param {pb.Node} uast - uast tree.
 * @returns {object.<number, pb.Node>} - object with keys as unique ids starting with 0 and values are pointers to nodes.
 */
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

/**
 * Creates new instance of libuast.
 * @alias initLibuast
 * @param {object} [options] - Emscripten Module [creation attributes](http://kripken.github.io/emscripten-site/docs/api_reference/module.html#affecting-execution)
 * @returns {Libuast} - instance of the library
 */
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

  /**
   * some desc
   * @namespace Libuast
   */

  /**
   * Returns status of the library.
   * @memberof Libuast
   * @instance
   * @returns {Promise} - Promise is resolved when WASM is initialized or rejected in case of error.
   */
  function isInitialized() {
    return runtimeInitialized;
  }

  /**
   * Filters UAST tree using xpath query.
   * @memberof Libuast
   * @instance
   * @param {string} id - Root node id.
   * @param {Object<number, pb.Node>} mapping - UAST tree mapping.
   * @param {string} query - xpath query.
   * @returns {number[]} - list of node ids that satisfy the given query.
   */
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
