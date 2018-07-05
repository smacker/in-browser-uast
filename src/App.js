import React, { Component } from 'react';
import UASTViewer, { Editor } from 'uast-viewer';
import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import { ParseRequest } from './_proto/protocol_pb';
import { Role } from './_proto/uast_pb';
import 'uast-viewer/dist/default-theme.css';
import './App.css';

const reversedRoles = Object.keys(Role).reduce(
  (acc, name) => Object.assign(acc, { [Role[name]]: name.toLowerCase() }),
  {}
);

/* global Module */
function readArray(ptr, length) {
  let result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = Module.HEAP8[ptr + i];
  }
  return result;
}

function callLibuast(uast, mapping, query) {
  return new Promise((resolve, reject) => {
    const api = {
      filter: Module.cwrap('filter', 'number', ['number', 'string']),
      freeFilter: Module.cwrap('free_filter', '', ['number']),
      getError: Module.cwrap('get_error', 'string', ['number']),
      getNodesSize: Module.cwrap('get_nodes_size', 'number', ['number']),
      getNodes: Module.cwrap('get_nodes', 'number', ['number'])
    };

    Module.UAST_setMapping(mapping);

    const result = api.filter(uast.id, query);
    if (!result) {
      return reject(new Error('internal error: filter did not return result'));
    }

    const err = api.getError(result);
    if (err) {
      api.freeFilter(result);
      return reject(new Error(err));
    }

    const size = api.getNodesSize(result);
    const nodes = api.getNodes(result);
    const arr = readArray(nodes, size);

    Module.UAST_setMapping(null);
    api.freeFilter(result);

    resolve(Array.from(arr));
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
        reject(new Error(err));
        return;
      }

      resolve(res);
    });
  });
}

function mapUAST(uast) {
  let globalId = 0;
  let mapping = {};

  function addIds(node) {
    mapping[globalId] = node;

    node.id = globalId;
    node.getChildrenList().forEach(child => addIds(child, ++globalId));
  }

  addIds(uast);

  return mapping;
}

function convertPos(pos) {
  return {
    Offset: pos.getOffset(),
    Line: pos.getLine(),
    Col: pos.getCol()
  };
}

function convertUAST(mapping) {
  return Object.keys(mapping).reduce((tree, id) => {
    const node = mapping[id];

    tree[id] = {
      id: +id + 1,
      InternalType: node.getInternalType(),
      Properties: node
        .getPropertiesMap()
        .toArray()
        .reduce(
          (acc, [key, value]) => Object.assign(acc, { [key]: value }),
          {}
        ),
      StartPosition: node.hasStartPosition()
        ? convertPos(node.getStartPosition())
        : null,
      EndPosition: node.hasEndPosition()
        ? convertPos(node.getEndPosition())
        : null,
      Roles: node.getRolesList().map(r => reversedRoles[r]),
      Children: node.getChildrenList().map(n => n.id),
      //
      expanded: id === '0'
    };

    if (node.getToken()) {
      tree[id].Token = node.getToken();
    }

    return tree;
  }, {});
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      code: 'console.log("test");',
      res: null,
      err: null,
      wasmReady: false,
      query: '//*[@roleLiteral]',
      uastMapping: null,
      filterResult: null,
      filterErr: null
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
    this.setState({
      res: null,
      uastMapping: null,
      filterResult: null,
      filterErr: null,
      err: null
    });

    parse(this.state.code)
      .then(res => {
        const uastMapping = mapUAST(res.getUast());
        this.setState({ res, uastMapping });
      })
      .catch(err => this.setState({ err }));
  }

  handleFilter() {
    this.setState({ filterResult: null, filterErr: null });

    const uast = this.state.res.getUast();

    callLibuast(uast, this.state.uastMapping, this.state.query)
      .then(r => this.setState({ filterResult: r }))
      .catch(filterErr => this.setState({ filterErr }));
  }

  render() {
    const {
      code,
      res,
      err,
      wasmReady,
      query,
      uastMapping,
      filterResult,
      filterErr
    } = this.state;

    if (!res && !err) {
      return <div>loading...</div>;
    }

    if (err) {
      return <div>{err.toString()}</div>;
    }

    let uast = convertUAST(uastMapping);
    let rootIds = filterResult || [0];

    return (
      <div className="app">
        <div className="app__left-pane">
          <button className="parse-button" onClick={this.handleParse}>
            Parse
          </button>
          <Editor
            code={code}
            onChange={code => this.setState({ code })}
            languageMode="text/javascript"
          />
        </div>
        <div className="app__right-pane">
          <div className="filter-box">
            Query{' '}
            <input
              type="text"
              value={query}
              onChange={e => this.setState({ query: e.target.value })}
            />
            <button onClick={this.handleFilter} disabled={!wasmReady}>
              Filter
            </button>
          </div>
          {filterErr ? <div>{filterErr.toString()}</div> : null}
          {uast ? <UASTViewer uast={uast} rootIds={rootIds} /> : null}
        </div>
      </div>
    );
  }
}

export default App;
