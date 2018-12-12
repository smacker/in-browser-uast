import { ProtocolServiceClient } from './_proto/protocol_grpc_web_pb';
import {
  ParseRequest,
  SupportedLanguagesRequest,
  VersionRequest
} from './_proto/protocol_pb';

function promisify(client, method, req, metadata) {
  return new Promise((resolve, reject) => {
    client[method](req, metadata, (err, res) => {
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
   * @param {object} [metadata]
   * @returns {pb.ParseResponse}
   */
  parse(code, filename, language, metadata) {
    const req = new ParseRequest();

    if (filename) {
      req.setFilename(filename);
    }

    if (language) {
      req.setLanguage(language);
    }

    req.setContent(code);

    return promisify(this.client, 'parse', req, metadata);
  }

  /**
   * Queries the Babelfish server for a list of supported languages.
   * @param {object} [metadata]
   * @returns {pb.SupportedLanguagesResponse}
   */
  supportedLanguages(metadata) {
    const req = new SupportedLanguagesRequest();

    return promisify(this.client, 'supportedLanguages', req, metadata);
  }

  /**
   * Queries the Babelfish server for version and runtime information.
   * @param {object} [metadata]
   * @returns {pb.VersionResponse}
   */
  version(metadata) {
    const req = new VersionRequest();

    return promisify(this.client, 'version', req, metadata);
  }
}

export default Client;
