import { ProtocolServiceClient } from './_proto/protocol_pb_service';
import {
  ParseRequest,
  SupportedLanguagesRequest,
  VersionRequest
} from './_proto/protocol_pb';

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

/**
 * Create a gRPC client.
 * @param {string} addr - web gRPC address.
 */
class Client {
  constructor(addr) {
    this.client = new ProtocolServiceClient(addr);
  }

  /**
   * Queries the Babelfish server and receives the UAST response for the specified file.
   * @param {string} code - input source code
   * @param {string} [filename] - name of the parsing file
   * @param {string} [language] - language name
   * @returns {pb.ParseResponse}
   */
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

  /**
   * Queries the Babelfish server for a list of supported languages.
   * @returns {pb.SupportedLanguagesResponse}
   */
  supportedLanguages() {
    const req = new SupportedLanguagesRequest();

    return promisify(this.client, 'supportedLanguages', req);
  }

  /**
   * Queries the Babelfish server for version and runtime information.
   * @returns {pb.VersionResponse}
   */
  version() {
    const req = new VersionRequest();

    return promisify(this.client, 'version', req);
  }
}

export default Client;
