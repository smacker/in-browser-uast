var LibUAST = {
  $UAST__postset:
    'Module["UAST_setMapping"] = function Module_UAST_setMapping(mapping) { UAST.mapping = mapping }',

  $UAST: {
    mapping: {}
  },

  $setMapping: function(mapping) {
    $UAST.mapping = mapping;
  },

  getNodeString: function(n, method) {
    var jsString = UAST.mapping[n][UTF8ToString(method)]();
    var lengthBytes = lengthBytesUTF8(jsString) + 1;
    var stringOnWasmHeap = _malloc(lengthBytes);
    stringToUTF8(jsString, stringOnWasmHeap, lengthBytes + 1);
    return stringOnWasmHeap;
  },

  getNodeBool: function(n, method) {
    return UAST.mapping[n][UTF8ToString(method)]();
  },

  getNodeInt: function(n, method, submethod) {
    return UAST.mapping[n][UTF8ToString(method)]()[UTF8ToString(submethod)]();
  },

  getNodeChildrenSize: function(n) {
    return UAST.mapping[n].getChildrenList().length;
  },

  getNodeChildAt: function(n, idx) {
    return UAST.mapping[n].getChildrenList()[idx].getId();
  },

  getNodeRolesSize: function(n) {
    return UAST.mapping[n].getRolesList().length;
  },

  getNodeRoleAt: function(n, idx) {
    return UAST.mapping[n].getRolesList()[idx];
  },

  getNodePropertiesSize: function(n) {
    return UAST.mapping[n].getPropertiesMap().getLength();
  },

  getNodePropertyKeyAt: function(n, idx) {
    var jsString = Array.from(UAST.mapping[n].getPropertiesMap().keys())[idx];
    var lengthBytes = lengthBytesUTF8(jsString) + 1;
    var stringOnWasmHeap = _malloc(lengthBytes);
    stringToUTF8(jsString, stringOnWasmHeap, lengthBytes + 1);
    return stringOnWasmHeap;
  },

  getNodePropertyValueAt: function(n, idx) {
    var jsString = Array.from(UAST.mapping[n].getPropertiesMap().values())[idx];
    var lengthBytes = lengthBytesUTF8(jsString) + 1;
    var stringOnWasmHeap = _malloc(lengthBytes);
    stringToUTF8(jsString, stringOnWasmHeap, lengthBytes + 1);
    return stringOnWasmHeap;
  }
};

autoAddDeps(LibUAST, '$UAST');
mergeInto(LibraryManager.library, LibUAST);
