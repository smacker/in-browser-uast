/* global bblfsh */

var Client = bblfsh.default;
var client = new Client('http://127.0.0.1:8080');
var libuast = bblfsh.initLibuast();

var errorEl = document.getElementById('error');
var responseEl = document.getElementById('response');
var filteredEl = document.getElementById('filtered');

var sourceCode = 'console.log("test")';

client
  .parse(sourceCode, 'index.js')
  .then(function(resp) {
    responseEl.innerHTML = JSON.stringify(resp.toObject(), undefined, 2);

    var mapping = bblfsh.protoToMap(resp.getUast());
    return libuast.filter(0, mapping, '//*[@roleLiteral]').then(function(ids) {
      var filtered = ids.reduce(function(acc, id) {
        return acc.concat(mapping[id].toObject());
      }, []);

      filteredEl.innerHTML = JSON.stringify(filtered, undefined, 2);
    });
  })
  .catch(function(err) {
    errorEl.innerHTML = err.toString();
  });
