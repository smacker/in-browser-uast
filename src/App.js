import React, { Component } from 'react';
import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import { ParseRequest } from './_proto/protocol_pb';
import './App.css';

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
