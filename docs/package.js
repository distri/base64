(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "base64\n======\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "content": "Base64\n======\n\nJust a wrapper over http://www.webtoolkit.info/ for encoding and decoding\nutf8 <=> base64.\n\n    module.exports = require \"./lib/base64\"\n",
      "mode": "100644"
    },
    "lib/base64.js": {
      "path": "lib/base64.js",
      "content": "/**\n*\n*  Base64 encode / decode\n*  http://www.webtoolkit.info/\n*\n**/\n\nvar Base64 = {\n\n    // private property\n    _keyStr : \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\",\n\n    // public method for encoding\n    encode : function (input) {\n        var output = \"\";\n        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;\n        var i = 0;\n\n        input = Base64._utf8_encode(input);\n\n        while (i < input.length) {\n\n            chr1 = input.charCodeAt(i++);\n            chr2 = input.charCodeAt(i++);\n            chr3 = input.charCodeAt(i++);\n\n            enc1 = chr1 >> 2;\n            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);\n            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);\n            enc4 = chr3 & 63;\n\n            if (isNaN(chr2)) {\n                enc3 = enc4 = 64;\n            } else if (isNaN(chr3)) {\n                enc4 = 64;\n            }\n\n            output = output +\n            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +\n            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);\n\n        }\n\n        return output;\n    },\n\n    // public method for decoding\n    decode : function (input) {\n        var output = \"\";\n        var chr1, chr2, chr3;\n        var enc1, enc2, enc3, enc4;\n        var i = 0;\n\n        input = input.replace(/[^A-Za-z0-9\\+\\/\\=]/g, \"\");\n\n        while (i < input.length) {\n\n            enc1 = this._keyStr.indexOf(input.charAt(i++));\n            enc2 = this._keyStr.indexOf(input.charAt(i++));\n            enc3 = this._keyStr.indexOf(input.charAt(i++));\n            enc4 = this._keyStr.indexOf(input.charAt(i++));\n\n            chr1 = (enc1 << 2) | (enc2 >> 4);\n            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);\n            chr3 = ((enc3 & 3) << 6) | enc4;\n\n            output = output + String.fromCharCode(chr1);\n\n            if (enc3 != 64) {\n                output = output + String.fromCharCode(chr2);\n            }\n            if (enc4 != 64) {\n                output = output + String.fromCharCode(chr3);\n            }\n\n        }\n\n        output = Base64._utf8_decode(output);\n\n        return output;\n\n    },\n\n    // private method for UTF-8 encoding\n    _utf8_encode : function (string) {\n        string = string.replace(/\\r\\n/g,\"\\n\");\n        var utftext = \"\";\n\n        for (var n = 0; n < string.length; n++) {\n\n            var c = string.charCodeAt(n);\n\n            if (c < 128) {\n                utftext += String.fromCharCode(c);\n            }\n            else if((c > 127) && (c < 2048)) {\n                utftext += String.fromCharCode((c >> 6) | 192);\n                utftext += String.fromCharCode((c & 63) | 128);\n            }\n            else {\n                utftext += String.fromCharCode((c >> 12) | 224);\n                utftext += String.fromCharCode(((c >> 6) & 63) | 128);\n                utftext += String.fromCharCode((c & 63) | 128);\n            }\n\n        }\n\n        return utftext;\n    },\n\n    // private method for UTF-8 decoding\n    _utf8_decode : function (utftext) {\n        var string = \"\";\n        var i = 0;\n        var c = 0;\n        var c1 = 0;\n        var c2 = 0;\n\n        while ( i < utftext.length ) {\n\n            c = utftext.charCodeAt(i);\n\n            if (c < 128) {\n                string += String.fromCharCode(c);\n                i++;\n            }\n            else if((c > 191) && (c < 224)) {\n                c2 = utftext.charCodeAt(i+1);\n                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));\n                i += 2;\n            }\n            else {\n                c2 = utftext.charCodeAt(i+1);\n                c3 = utftext.charCodeAt(i+2);\n                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));\n                i += 3;\n            }\n\n        }\n\n        return string;\n    }\n\n}\n\nmodule.exports = Base64;\n",
      "mode": "100644"
    },
    "test/base64.coffee": {
      "path": "test/base64.coffee",
      "content": "Base64 = require \"../main\"\n\ndescribe \"Base64\", ->\n  it \"should encode\", ->\n    assert.equal Base64.encode(\"hello\"), \"aGVsbG8=\"\n\n  it \"should decode\", ->\n    assert.equal Base64.decode(\"aGVsbG8=\"), \"hello\"\n\n  it \"should work with utf-8\", ->\n    assert.equal Base64.decode(\"ZMO8ZGVy\"), \"düder\"\n\n  it \"should work with utf-8\", ->\n    assert.equal Base64.encode(\"düder\"), \"ZMO8ZGVy\"\n\n  it \"should decode long strings\", ->\n    encoded = \"\"\"\n      VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\n      ZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\n      ZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\n      Ci0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\n      ZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\n      eSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\n      ZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\n      b2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\n      b2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\n      dmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\n      ZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\n      c2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\n      cm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\n      CkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\n      dCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\n      biBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\n      ciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\n      cGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\n      b3VyY2UgZmlsZSBoeWdpZW5lCg==\n    \"\"\"\n\n    decoded = \"\"\"\n      TODO\n      ----\n      Bundled Dependencies\n      - Build bundled dependencies into published script\n      - Dependency source should not be in revision control\n      - requires and module.exports\n      - inter-component and intra-component dependencies\n      - One day we'll need to implement a bundleresque system, but not today\n\n      Live Update Demo\n      - Hot reload css\n      - Display Demo Runtime Errors in console\n\n      Open published page in editor and run live demo with same state as when editor was opened\n      - Pass git repo/branch metadata to published page for use in editor\n\n      Persist state across demo reloads\n\n      Organize File tree by type\n      File icons\n\n      Display Diffs\n\n      First auth doesn't display in bar\n\n      Cache Git trees and files in some form of local storage\n\n      Sometimes editor appears blank when switching files\n\n      Editor plugins\n      - static analysis\n      - find in files\n      - source file hygiene\n\n    \"\"\"\n\n    assert.equal Base64.decode(encoded), decoded\n\n  it \"should encode long strings\", ->\n    encoded = \"\"\"\n      VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\n      ZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\n      ZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\n      Ci0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\n      ZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\n      eSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\n      ZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\n      b2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\n      b2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\n      dmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\n      ZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\n      c2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\n      cm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\n      CkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\n      dCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\n      biBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\n      ciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\n      cGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\n      b3VyY2UgZmlsZSBoeWdpZW5lCg==\n    \"\"\"\n\n    decoded = \"\"\"\n      TODO\n      ----\n      Bundled Dependencies\n      - Build bundled dependencies into published script\n      - Dependency source should not be in revision control\n      - requires and module.exports\n      - inter-component and intra-component dependencies\n      - One day we'll need to implement a bundleresque system, but not today\n\n      Live Update Demo\n      - Hot reload css\n      - Display Demo Runtime Errors in console\n\n      Open published page in editor and run live demo with same state as when editor was opened\n      - Pass git repo/branch metadata to published page for use in editor\n\n      Persist state across demo reloads\n\n      Organize File tree by type\n      File icons\n\n      Display Diffs\n\n      First auth doesn't display in bar\n\n      Cache Git trees and files in some form of local storage\n\n      Sometimes editor appears blank when switching files\n\n      Editor plugins\n      - static analysis\n      - find in files\n      - source file hygiene\n\n    \"\"\"\n\n    # Note: loses new lines\n    assert.equal Base64.encode(decoded), encoded.replace(/\\n/g, \"\")\n",
      "mode": "100644"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.9.0\"\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  module.exports = require(\"./lib/base64\");\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/base64": {
      "path": "lib/base64",
      "content": "/**\n*\n*  Base64 encode / decode\n*  http://www.webtoolkit.info/\n*\n**/\n\nvar Base64 = {\n\n    // private property\n    _keyStr : \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\",\n\n    // public method for encoding\n    encode : function (input) {\n        var output = \"\";\n        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;\n        var i = 0;\n\n        input = Base64._utf8_encode(input);\n\n        while (i < input.length) {\n\n            chr1 = input.charCodeAt(i++);\n            chr2 = input.charCodeAt(i++);\n            chr3 = input.charCodeAt(i++);\n\n            enc1 = chr1 >> 2;\n            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);\n            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);\n            enc4 = chr3 & 63;\n\n            if (isNaN(chr2)) {\n                enc3 = enc4 = 64;\n            } else if (isNaN(chr3)) {\n                enc4 = 64;\n            }\n\n            output = output +\n            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +\n            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);\n\n        }\n\n        return output;\n    },\n\n    // public method for decoding\n    decode : function (input) {\n        var output = \"\";\n        var chr1, chr2, chr3;\n        var enc1, enc2, enc3, enc4;\n        var i = 0;\n\n        input = input.replace(/[^A-Za-z0-9\\+\\/\\=]/g, \"\");\n\n        while (i < input.length) {\n\n            enc1 = this._keyStr.indexOf(input.charAt(i++));\n            enc2 = this._keyStr.indexOf(input.charAt(i++));\n            enc3 = this._keyStr.indexOf(input.charAt(i++));\n            enc4 = this._keyStr.indexOf(input.charAt(i++));\n\n            chr1 = (enc1 << 2) | (enc2 >> 4);\n            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);\n            chr3 = ((enc3 & 3) << 6) | enc4;\n\n            output = output + String.fromCharCode(chr1);\n\n            if (enc3 != 64) {\n                output = output + String.fromCharCode(chr2);\n            }\n            if (enc4 != 64) {\n                output = output + String.fromCharCode(chr3);\n            }\n\n        }\n\n        output = Base64._utf8_decode(output);\n\n        return output;\n\n    },\n\n    // private method for UTF-8 encoding\n    _utf8_encode : function (string) {\n        string = string.replace(/\\r\\n/g,\"\\n\");\n        var utftext = \"\";\n\n        for (var n = 0; n < string.length; n++) {\n\n            var c = string.charCodeAt(n);\n\n            if (c < 128) {\n                utftext += String.fromCharCode(c);\n            }\n            else if((c > 127) && (c < 2048)) {\n                utftext += String.fromCharCode((c >> 6) | 192);\n                utftext += String.fromCharCode((c & 63) | 128);\n            }\n            else {\n                utftext += String.fromCharCode((c >> 12) | 224);\n                utftext += String.fromCharCode(((c >> 6) & 63) | 128);\n                utftext += String.fromCharCode((c & 63) | 128);\n            }\n\n        }\n\n        return utftext;\n    },\n\n    // private method for UTF-8 decoding\n    _utf8_decode : function (utftext) {\n        var string = \"\";\n        var i = 0;\n        var c = 0;\n        var c1 = 0;\n        var c2 = 0;\n\n        while ( i < utftext.length ) {\n\n            c = utftext.charCodeAt(i);\n\n            if (c < 128) {\n                string += String.fromCharCode(c);\n                i++;\n            }\n            else if((c > 191) && (c < 224)) {\n                c2 = utftext.charCodeAt(i+1);\n                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));\n                i += 2;\n            }\n            else {\n                c2 = utftext.charCodeAt(i+1);\n                c3 = utftext.charCodeAt(i+2);\n                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));\n                i += 3;\n            }\n\n        }\n\n        return string;\n    }\n\n}\n\nmodule.exports = Base64;\n",
      "type": "blob"
    },
    "test/base64": {
      "path": "test/base64",
      "content": "(function() {\n  var Base64;\n\n  Base64 = require(\"../main\");\n\n  describe(\"Base64\", function() {\n    it(\"should encode\", function() {\n      return assert.equal(Base64.encode(\"hello\"), \"aGVsbG8=\");\n    });\n    it(\"should decode\", function() {\n      return assert.equal(Base64.decode(\"aGVsbG8=\"), \"hello\");\n    });\n    it(\"should work with utf-8\", function() {\n      return assert.equal(Base64.decode(\"ZMO8ZGVy\"), \"düder\");\n    });\n    it(\"should work with utf-8\", function() {\n      return assert.equal(Base64.encode(\"düder\"), \"ZMO8ZGVy\");\n    });\n    it(\"should decode long strings\", function() {\n      var decoded, encoded;\n      encoded = \"VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\\nZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\\nZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\\nCi0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\\nZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\\neSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\\nZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\\nb2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\\nb2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\\ndmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\\nZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\\nc2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\\ncm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\\nCkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\\ndCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\\nbiBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\\nciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\\ncGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\\nb3VyY2UgZmlsZSBoeWdpZW5lCg==\";\n      decoded = \"TODO\\n----\\nBundled Dependencies\\n- Build bundled dependencies into published script\\n- Dependency source should not be in revision control\\n- requires and module.exports\\n- inter-component and intra-component dependencies\\n- One day we'll need to implement a bundleresque system, but not today\\n\\nLive Update Demo\\n- Hot reload css\\n- Display Demo Runtime Errors in console\\n\\nOpen published page in editor and run live demo with same state as when editor was opened\\n- Pass git repo/branch metadata to published page for use in editor\\n\\nPersist state across demo reloads\\n\\nOrganize File tree by type\\nFile icons\\n\\nDisplay Diffs\\n\\nFirst auth doesn't display in bar\\n\\nCache Git trees and files in some form of local storage\\n\\nSometimes editor appears blank when switching files\\n\\nEditor plugins\\n- static analysis\\n- find in files\\n- source file hygiene\\n\";\n      return assert.equal(Base64.decode(encoded), decoded);\n    });\n    return it(\"should encode long strings\", function() {\n      var decoded, encoded;\n      encoded = \"VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\\nZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\\nZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\\nCi0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\\nZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\\neSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\\nZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\\nb2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\\nb2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\\ndmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\\nZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\\nc2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\\ncm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\\nCkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\\ndCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\\nbiBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\\nciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\\ncGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\\nb3VyY2UgZmlsZSBoeWdpZW5lCg==\";\n      decoded = \"TODO\\n----\\nBundled Dependencies\\n- Build bundled dependencies into published script\\n- Dependency source should not be in revision control\\n- requires and module.exports\\n- inter-component and intra-component dependencies\\n- One day we'll need to implement a bundleresque system, but not today\\n\\nLive Update Demo\\n- Hot reload css\\n- Display Demo Runtime Errors in console\\n\\nOpen published page in editor and run live demo with same state as when editor was opened\\n- Pass git repo/branch metadata to published page for use in editor\\n\\nPersist state across demo reloads\\n\\nOrganize File tree by type\\nFile icons\\n\\nDisplay Diffs\\n\\nFirst auth doesn't display in bar\\n\\nCache Git trees and files in some form of local storage\\n\\nSometimes editor appears blank when switching files\\n\\nEditor plugins\\n- static analysis\\n- find in files\\n- source file hygiene\\n\";\n      return assert.equal(Base64.encode(decoded), encoded.replace(/\\n/g, \"\"));\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.9.0\"};",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "version": "0.9.0",
  "entryPoint": "main",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "distri/base64",
    "homepage": null,
    "description": "",
    "html_url": "https://github.com/distri/base64",
    "url": "https://api.github.com/repos/distri/base64",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});