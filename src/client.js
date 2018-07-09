import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import { ParseRequest, VersionRequest } from './_proto/protocol_pb';

function promisify(client, method, req) {
  return new Promise((resolve, reject) => {
    client[method](req, (err, res) => {
      if (err) {
        return reject(new Error(err));
      }
      return resolve(res);
    });
  });
}

class Client {
  constructor(addr) {
    this.client = new ProtocolServiceClient(addr);
  }

  parse(code, filename, language) {
    const req = new ParseRequest();

    if (filename) {
      req.setFilename(filename);
    }

    if (language) {
      req.setLanguage(language);
    }

    req.setContent(code);

    return promisify(this.client, 'parse', req);
  }

  version() {
    const req = new VersionRequest();

    return promisify(this.client, 'version', req);
  }
}

export default Client;
