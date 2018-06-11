import React, { Component } from 'react';
import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import { ParseRequest } from './_proto/protocol_pb';
import './App.css';

/* global Module */
function callLibuast(uast, query) {
  return new Promise((resolve, reject) => {
    const api = {
      filter: Module.cwrap('filter', 'number', ['array', 'number', 'string'])
    };
    console.log('call:');
    const r = api.filter(uast, uast.length, query);
    resolve(r);
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
          <div>Nodes found: {filterResult}</div>
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
