var LibUAST = {
  getNodeString: function(n, method) {
    var jsString = globalTable[n][UTF8ToString(method)]();
    var lengthBytes = lengthBytesUTF8(jsString) + 1;
    var stringOnWasmHeap = _malloc(lengthBytes);
    stringToUTF8(jsString, stringOnWasmHeap, lengthBytes + 1);
    return stringOnWasmHeap;
  },

  getNodeBool: function(n, method) {
    return globalTable[n][UTF8ToString(method)]();
  },

  getNodeInt: function(n, method, submethod) {
    return globalTable[n][UTF8ToString(method)]()[UTF8ToString(submethod)]();
  },

  getNodeChildrenSize: function(n) {
    return globalTable[n].getChildrenList().length;
  },

  getNodeChildAt: function(n, idx) {
    return globalTable[n].getChildrenList()[idx].getId();
  },

  getNodeRolesSize: function(n) {
    return globalTable[n].getRolesList().length;
  },

  getNodeRoleAt: function(n, idx) {
    return globalTable[n].getRolesList()[idx];
  }
};

mergeInto(LibraryManager.library, LibUAST);
