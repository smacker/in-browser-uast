import React, { Component } from 'react';
import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import { ParseRequest } from './_proto/protocol_pb';
import './App.css';

/* global Module */
function callLibuast(uast) {
  Module.onRuntimeInitialized = async _ => {
    const api = {
      filter: Module.cwrap('filter', 'number', ['array', 'number', 'string'])
    };
    console.log('call:');
    const r = api.filter(uast, uast.length, '//*');
    console.log('r:', r);
  };
}

function parse() {
  const client = new ProtocolServiceClient('http://127.0.0.1:8080');
  const req = new ParseRequest();
  req.setLanguage('javascript');
  req.setContent('console.log("test");');
  return new Promise((resolve, reject) => {
    client.parse(req, function(err, res) {
      if (err) {
        reject(err);
        return;
      }

      callLibuast(res.getUast().serializeBinary());

      resolve(res);
    });
  });
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      res: null,
      err: null
    };
  }

  componentDidMount() {
    parse()
      .then(res => this.setState({ res }))
      .catch(err => this.setState({ err }));
  }

  render() {
    const { res, err } = this.state;

    if (!res && !err) {
      return <div>loading...</div>;
    }

    if (err) {
      return <div>{err}</div>;
    }

    return (
      <div>
        <pre>{JSON.stringify(res.toObject(), null, '  ')}</pre>
      </div>
    );
  }
}

export default App;
