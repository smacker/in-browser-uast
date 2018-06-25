import React, { Component } from 'react';
import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import { ParseRequest } from './_proto/protocol_pb';
import { Node } from './_proto/uast_pb';
import './App.css';

/* global Module */
function readArray(ptr, length) {
  let result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = Module.HEAP8[ptr + i];
  }
  return result;
}

function callLibuast(uast, query) {
  return new Promise((resolve, reject) => {
    const api = {
      filter: Module.cwrap('filter', 'number', ['array', 'number', 'string']),
      getNodesSize: Module.cwrap('get_nodes_size', 'number', ['number']),
      getNodeSize: Module.cwrap('get_node_size', 'number', [
        'number',
        'number'
      ]),
      getNode: Module.cwrap('get_node', 'number', ['number']),
      free: Module.cwrap('free_filter', 'number', [])
    };
    console.log('call:');
    const resultPointer = api.filter(uast, uast.length, query);
    console.log('resultPointer', resultPointer);
    const nodes = api.getNodesSize(resultPointer);
    console.log('getNodesSize', nodes);

    const result = [];

    for (let i = 0; i < nodes; i++) {
      const nodeSize = api.getNodeSize(resultPointer, 1);
      console.log('getNodeSize', nodeSize);
      const node = api.getNode(resultPointer, 1);
      console.log('getNode', node);

      const arr = readArray(node, nodeSize);
      const n = Node.deserializeBinary(arr);
      //console.log('n', n);

      result.push(n.toObject());
    }

    api.free(resultPointer);

    resolve(result);
  });
}

function parse(code) {
  const client = new ProtocolServiceClient('http://127.0.0.1:8080');
  const req = new ParseRequest();
  req.setLanguage('javascript');
  req.setContent(code);
  return new Promise((resolve, reject) => {
    client.parse(req, function(err, res) {
      if (err) {
        reject(err);
        return;
      }

      resolve(res);
    });
  });
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wasmReady: false,
      code: 'console.log("test");',
      query: '//*',
      filterResult: null,
      res: null,
      err: null
    };

    this.handleParse = this.handleParse.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    this.handleParse();

    Module.onRuntimeInitialized = async _ => {
      this.setState({ wasmReady: true });
    };
  }

  handleParse() {
    parse(this.state.code)
      .then(res => this.setState({ res }))
      .catch(err => this.setState({ err }));
  }

  handleFilter() {
    callLibuast(
      this.state.res.getUast().serializeBinary(),
      this.state.query
    ).then(r => this.setState({ filterResult: r }));
  }

  render() {
    const { code, res, err, query, filterResult, wasmReady } = this.state;

    if (!res && !err) {
      return <div>loading...</div>;
    }

    if (err) {
      return <div>{err}</div>;
    }

    return (
      <div style={{ padding: '10px 30px' }}>
        <div>
          UAST for code:<br />
          <textarea
            value={code}
            onChange={e => this.setState({ code: e.target.value })}
            style={{ width: '250px', height: '100px' }}
          />
          <br />
          <button onClick={this.handleParse}>parse</button>
          <br />
          <br />
        </div>
        <div>
          Query{' '}
          <input
            type="text"
            value={query}
            onChange={e => this.setState({ query: e.target.value })}
          />
          <button onClick={this.handleFilter} disabled={!wasmReady}>
            Filter
          </button>
          {filterResult ? (
            <div>
              Nodes found: <pre>{JSON.stringify(filterResult, null, '  ')}</pre>
            </div>
          ) : null}
          <br />
        </div>
        <div>
          Full server response:
          <pre>{JSON.stringify(res.toObject(), null, '  ')}</pre>
        </div>
      </div>
    );
  }
}

export default App;
