(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

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
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
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
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
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
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
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

  return publicAPI;

}).call(this);

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
      "content": "Base64\n======\n\nBase64 to UTF8 encoding and decoding, wrapping up \n[TextEncoderLite](https://github.com/coolaj86/TextEncoderLite) and\n[base64-js](https://github.com/beatgammit/base64-js)\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/base64-js.js": {
      "path": "lib/base64-js.js",
      "content": "'use strict'\n\nexports.toByteArray = toByteArray\nexports.fromByteArray = fromByteArray\n\nvar lookup = []\nvar revLookup = []\nvar Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array\n\nfunction init () {\n  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\n  for (var i = 0, len = code.length; i < len; ++i) {\n    lookup[i] = code[i]\n    revLookup[code.charCodeAt(i)] = i\n  }\n\n  revLookup['-'.charCodeAt(0)] = 62\n  revLookup['_'.charCodeAt(0)] = 63\n}\n\ninit()\n\nfunction toByteArray (b64) {\n  var i, j, l, tmp, placeHolders, arr\n  var len = b64.length\n\n  if (len % 4 > 0) {\n    throw new Error('Invalid string. Length must be a multiple of 4')\n  }\n\n  // the number of equal signs (place holders)\n  // if there are two placeholders, than the two characters before it\n  // represent one byte\n  // if there is only one, then the three characters before it represent 2 bytes\n  // this is just a cheap hack to not do indexOf twice\n  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0\n\n  // base64 is 4/3 + up to two characters of the original data\n  arr = new Arr(len * 3 / 4 - placeHolders)\n\n  // if there are placeholders, only get up to the last complete 4 chars\n  l = placeHolders > 0 ? len - 4 : len\n\n  var L = 0\n\n  for (i = 0, j = 0; i < l; i += 4, j += 3) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]\n    arr[L++] = (tmp >> 16) & 0xFF\n    arr[L++] = (tmp >> 8) & 0xFF\n    arr[L++] = tmp & 0xFF\n  }\n\n  if (placeHolders === 2) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)\n    arr[L++] = tmp & 0xFF\n  } else if (placeHolders === 1) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)\n    arr[L++] = (tmp >> 8) & 0xFF\n    arr[L++] = tmp & 0xFF\n  }\n\n  return arr\n}\n\nfunction tripletToBase64 (num) {\n  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]\n}\n\nfunction encodeChunk (uint8, start, end) {\n  var tmp\n  var output = []\n  for (var i = start; i < end; i += 3) {\n    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])\n    output.push(tripletToBase64(tmp))\n  }\n  return output.join('')\n}\n\nfunction fromByteArray (uint8) {\n  var tmp\n  var len = uint8.length\n  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes\n  var output = ''\n  var parts = []\n  var maxChunkLength = 16383 // must be multiple of 3\n\n  // go through the array every three bytes, we'll deal with trailing stuff later\n  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {\n    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))\n  }\n\n  // pad the end with zeros, but make sure to not forget the extra bytes\n  if (extraBytes === 1) {\n    tmp = uint8[len - 1]\n    output += lookup[tmp >> 2]\n    output += lookup[(tmp << 4) & 0x3F]\n    output += '=='\n  } else if (extraBytes === 2) {\n    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])\n    output += lookup[tmp >> 10]\n    output += lookup[(tmp >> 4) & 0x3F]\n    output += lookup[(tmp << 2) & 0x3F]\n    output += '='\n  }\n\n  parts.push(output)\n\n  return parts.join('')\n}",
      "mode": "100644",
      "type": "blob"
    },
    "lib/text-encoder.js": {
      "path": "lib/text-encoder.js",
      "content": "function TextEncoderLite() {\n}\nfunction TextDecoderLite() {\n}\n\nmodule.exports = {\n  encoder: TextEncoderLite,\n  decoder: TextDecoderLite\n};\n\n(function () {\n'use strict';\n\n// Taken from https://github.com/feross/buffer/blob/master/index.js\n// Thanks Feross et al! :-)\n\nfunction utf8ToBytes (string, units) {\n  units = units || Infinity\n  var codePoint\n  var length = string.length\n  var leadSurrogate = null\n  var bytes = []\n  var i = 0\n\n  for (; i < length; i++) {\n    codePoint = string.charCodeAt(i)\n\n    // is surrogate component\n    if (codePoint > 0xD7FF && codePoint < 0xE000) {\n      // last char was a lead\n      if (leadSurrogate) {\n        // 2 leads in a row\n        if (codePoint < 0xDC00) {\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          leadSurrogate = codePoint\n          continue\n        } else {\n          // valid surrogate pair\n          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000\n          leadSurrogate = null\n        }\n      } else {\n        // no lead yet\n\n        if (codePoint > 0xDBFF) {\n          // unexpected trail\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        } else if (i + 1 === length) {\n          // unpaired lead\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        } else {\n          // valid lead\n          leadSurrogate = codePoint\n          continue\n        }\n      }\n    } else if (leadSurrogate) {\n      // valid bmp char, but last char was a lead\n      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n      leadSurrogate = null\n    }\n\n    // encode utf8\n    if (codePoint < 0x80) {\n      if ((units -= 1) < 0) break\n      bytes.push(codePoint)\n    } else if (codePoint < 0x800) {\n      if ((units -= 2) < 0) break\n      bytes.push(\n        codePoint >> 0x6 | 0xC0,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x10000) {\n      if ((units -= 3) < 0) break\n      bytes.push(\n        codePoint >> 0xC | 0xE0,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x200000) {\n      if ((units -= 4) < 0) break\n      bytes.push(\n        codePoint >> 0x12 | 0xF0,\n        codePoint >> 0xC & 0x3F | 0x80,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else {\n      throw new Error('Invalid code point')\n    }\n  }\n\n  return bytes\n}\n\nfunction utf8Slice (buf, start, end) {\n  var res = ''\n  var tmp = ''\n  end = Math.min(buf.length, end || Infinity)\n  start = start || 0;\n\n  for (var i = start; i < end; i++) {\n    if (buf[i] <= 0x7F) {\n      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])\n      tmp = ''\n    } else {\n      tmp += '%' + buf[i].toString(16)\n    }\n  }\n\n  return res + decodeUtf8Char(tmp)\n}\n\nfunction decodeUtf8Char (str) {\n  try {\n    return decodeURIComponent(str)\n  } catch (err) {\n    return String.fromCharCode(0xFFFD) // UTF 8 invalid char\n  }\n}\n\nTextEncoderLite.prototype.encode = function (str) {\n  var result;\n\n  if ('undefined' === typeof Uint8Array) {\n    result = utf8ToBytes(str);\n  } else {\n    result = new Uint8Array(utf8ToBytes(str));\n  }\n\n  return result;\n};\n\nTextDecoderLite.prototype.decode = function (bytes) {\n  return utf8Slice(bytes, 0, bytes.length);\n}\n\n}());",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "Base64Js = require \"../lib/base64-js\"\n{decoder:Decoder, encoder:Encoder} = require \"../lib/text-encoder\"\n\nencoder = new Encoder('utf-8')\ndecoder = new Decoder('utf-8')\n\nmodule.exports =\n  encode: (s) ->\n    Base64Js.fromByteArray encoder.encode(s)\n\n  decode: (b64string) ->\n    decoder.decode Base64Js.toByteArray(b64string.replace(/\\n/g, ''))\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.9.2\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/base64.coffee": {
      "path": "test/base64.coffee",
      "content": "Base64 = require \"../main\"\nBase64Js = require \"../lib/base64-js\"\n{decoder:Decoder} = require \"../lib/text-encoder\"\n\ndescribe \"Base64\", ->\n  it \"should encode\", ->\n    assert.equal Base64.encode(\"hello\"), \"aGVsbG8=\"\n\n  it \"should decode\", ->\n    assert.equal Base64.decode(\"aGVsbG8=\"), \"hello\"\n\n  it \"should work with utf-8\", ->\n    assert.equal Base64.decode(\"ZMO8ZGVy\"), \"düder\"\n\n  it \"should work with utf-8\", ->\n    assert.equal Base64.encode(\"düder\"), \"ZMO8ZGVy\"\n\n  it \"should work with astral emojis\", ->\n    decoder = new Decoder('utf8')\n    result = decoder.decode(Base64Js.toByteArray(\"8J+NlAo=\"))\n    burger = \"\\uD83C\\uDF54\\n\"\n\n    assert.equal result, burger\n\n  it \"should decode long strings\", ->\n    encoded = \"\"\"\n      VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\n      ZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\n      ZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\n      Ci0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\n      ZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\n      eSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\n      ZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\n      b2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\n      b2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\n      dmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\n      ZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\n      c2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\n      cm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\n      CkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\n      dCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\n      biBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\n      ciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\n      cGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\n      b3VyY2UgZmlsZSBoeWdpZW5lCg==\n    \"\"\"\n\n    decoded = \"\"\"\n      TODO\n      ----\n      Bundled Dependencies\n      - Build bundled dependencies into published script\n      - Dependency source should not be in revision control\n      - requires and module.exports\n      - inter-component and intra-component dependencies\n      - One day we'll need to implement a bundleresque system, but not today\n\n      Live Update Demo\n      - Hot reload css\n      - Display Demo Runtime Errors in console\n\n      Open published page in editor and run live demo with same state as when editor was opened\n      - Pass git repo/branch metadata to published page for use in editor\n\n      Persist state across demo reloads\n\n      Organize File tree by type\n      File icons\n\n      Display Diffs\n\n      First auth doesn't display in bar\n\n      Cache Git trees and files in some form of local storage\n\n      Sometimes editor appears blank when switching files\n\n      Editor plugins\n      - static analysis\n      - find in files\n      - source file hygiene\n\n    \"\"\"\n\n    assert.equal Base64.decode(encoded), decoded\n\n  it \"should encode long strings\", ->\n    encoded = \"\"\"\n      VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\n      ZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\n      ZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\n      Ci0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\n      ZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\n      eSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\n      ZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\n      b2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\n      b2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\n      dmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\n      ZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\n      c2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\n      cm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\n      CkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\n      dCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\n      biBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\n      ciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\n      cGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\n      b3VyY2UgZmlsZSBoeWdpZW5lCg==\n    \"\"\"\n\n    decoded = \"\"\"\n      TODO\n      ----\n      Bundled Dependencies\n      - Build bundled dependencies into published script\n      - Dependency source should not be in revision control\n      - requires and module.exports\n      - inter-component and intra-component dependencies\n      - One day we'll need to implement a bundleresque system, but not today\n\n      Live Update Demo\n      - Hot reload css\n      - Display Demo Runtime Errors in console\n\n      Open published page in editor and run live demo with same state as when editor was opened\n      - Pass git repo/branch metadata to published page for use in editor\n\n      Persist state across demo reloads\n\n      Organize File tree by type\n      File icons\n\n      Display Diffs\n\n      First auth doesn't display in bar\n\n      Cache Git trees and files in some form of local storage\n\n      Sometimes editor appears blank when switching files\n\n      Editor plugins\n      - static analysis\n      - find in files\n      - source file hygiene\n\n    \"\"\"\n\n    # Note: loses new lines\n    assert.equal Base64.encode(decoded), encoded.replace(/\\n/g, \"\")\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "lib/base64-js": {
      "path": "lib/base64-js",
      "content": "'use strict'\n\nexports.toByteArray = toByteArray\nexports.fromByteArray = fromByteArray\n\nvar lookup = []\nvar revLookup = []\nvar Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array\n\nfunction init () {\n  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\n  for (var i = 0, len = code.length; i < len; ++i) {\n    lookup[i] = code[i]\n    revLookup[code.charCodeAt(i)] = i\n  }\n\n  revLookup['-'.charCodeAt(0)] = 62\n  revLookup['_'.charCodeAt(0)] = 63\n}\n\ninit()\n\nfunction toByteArray (b64) {\n  var i, j, l, tmp, placeHolders, arr\n  var len = b64.length\n\n  if (len % 4 > 0) {\n    throw new Error('Invalid string. Length must be a multiple of 4')\n  }\n\n  // the number of equal signs (place holders)\n  // if there are two placeholders, than the two characters before it\n  // represent one byte\n  // if there is only one, then the three characters before it represent 2 bytes\n  // this is just a cheap hack to not do indexOf twice\n  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0\n\n  // base64 is 4/3 + up to two characters of the original data\n  arr = new Arr(len * 3 / 4 - placeHolders)\n\n  // if there are placeholders, only get up to the last complete 4 chars\n  l = placeHolders > 0 ? len - 4 : len\n\n  var L = 0\n\n  for (i = 0, j = 0; i < l; i += 4, j += 3) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]\n    arr[L++] = (tmp >> 16) & 0xFF\n    arr[L++] = (tmp >> 8) & 0xFF\n    arr[L++] = tmp & 0xFF\n  }\n\n  if (placeHolders === 2) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)\n    arr[L++] = tmp & 0xFF\n  } else if (placeHolders === 1) {\n    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)\n    arr[L++] = (tmp >> 8) & 0xFF\n    arr[L++] = tmp & 0xFF\n  }\n\n  return arr\n}\n\nfunction tripletToBase64 (num) {\n  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]\n}\n\nfunction encodeChunk (uint8, start, end) {\n  var tmp\n  var output = []\n  for (var i = start; i < end; i += 3) {\n    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])\n    output.push(tripletToBase64(tmp))\n  }\n  return output.join('')\n}\n\nfunction fromByteArray (uint8) {\n  var tmp\n  var len = uint8.length\n  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes\n  var output = ''\n  var parts = []\n  var maxChunkLength = 16383 // must be multiple of 3\n\n  // go through the array every three bytes, we'll deal with trailing stuff later\n  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {\n    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))\n  }\n\n  // pad the end with zeros, but make sure to not forget the extra bytes\n  if (extraBytes === 1) {\n    tmp = uint8[len - 1]\n    output += lookup[tmp >> 2]\n    output += lookup[(tmp << 4) & 0x3F]\n    output += '=='\n  } else if (extraBytes === 2) {\n    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])\n    output += lookup[tmp >> 10]\n    output += lookup[(tmp >> 4) & 0x3F]\n    output += lookup[(tmp << 2) & 0x3F]\n    output += '='\n  }\n\n  parts.push(output)\n\n  return parts.join('')\n}",
      "type": "blob"
    },
    "lib/text-encoder": {
      "path": "lib/text-encoder",
      "content": "function TextEncoderLite() {\n}\nfunction TextDecoderLite() {\n}\n\nmodule.exports = {\n  encoder: TextEncoderLite,\n  decoder: TextDecoderLite\n};\n\n(function () {\n'use strict';\n\n// Taken from https://github.com/feross/buffer/blob/master/index.js\n// Thanks Feross et al! :-)\n\nfunction utf8ToBytes (string, units) {\n  units = units || Infinity\n  var codePoint\n  var length = string.length\n  var leadSurrogate = null\n  var bytes = []\n  var i = 0\n\n  for (; i < length; i++) {\n    codePoint = string.charCodeAt(i)\n\n    // is surrogate component\n    if (codePoint > 0xD7FF && codePoint < 0xE000) {\n      // last char was a lead\n      if (leadSurrogate) {\n        // 2 leads in a row\n        if (codePoint < 0xDC00) {\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          leadSurrogate = codePoint\n          continue\n        } else {\n          // valid surrogate pair\n          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000\n          leadSurrogate = null\n        }\n      } else {\n        // no lead yet\n\n        if (codePoint > 0xDBFF) {\n          // unexpected trail\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        } else if (i + 1 === length) {\n          // unpaired lead\n          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n          continue\n        } else {\n          // valid lead\n          leadSurrogate = codePoint\n          continue\n        }\n      }\n    } else if (leadSurrogate) {\n      // valid bmp char, but last char was a lead\n      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)\n      leadSurrogate = null\n    }\n\n    // encode utf8\n    if (codePoint < 0x80) {\n      if ((units -= 1) < 0) break\n      bytes.push(codePoint)\n    } else if (codePoint < 0x800) {\n      if ((units -= 2) < 0) break\n      bytes.push(\n        codePoint >> 0x6 | 0xC0,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x10000) {\n      if ((units -= 3) < 0) break\n      bytes.push(\n        codePoint >> 0xC | 0xE0,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else if (codePoint < 0x200000) {\n      if ((units -= 4) < 0) break\n      bytes.push(\n        codePoint >> 0x12 | 0xF0,\n        codePoint >> 0xC & 0x3F | 0x80,\n        codePoint >> 0x6 & 0x3F | 0x80,\n        codePoint & 0x3F | 0x80\n      )\n    } else {\n      throw new Error('Invalid code point')\n    }\n  }\n\n  return bytes\n}\n\nfunction utf8Slice (buf, start, end) {\n  var res = ''\n  var tmp = ''\n  end = Math.min(buf.length, end || Infinity)\n  start = start || 0;\n\n  for (var i = start; i < end; i++) {\n    if (buf[i] <= 0x7F) {\n      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])\n      tmp = ''\n    } else {\n      tmp += '%' + buf[i].toString(16)\n    }\n  }\n\n  return res + decodeUtf8Char(tmp)\n}\n\nfunction decodeUtf8Char (str) {\n  try {\n    return decodeURIComponent(str)\n  } catch (err) {\n    return String.fromCharCode(0xFFFD) // UTF 8 invalid char\n  }\n}\n\nTextEncoderLite.prototype.encode = function (str) {\n  var result;\n\n  if ('undefined' === typeof Uint8Array) {\n    result = utf8ToBytes(str);\n  } else {\n    result = new Uint8Array(utf8ToBytes(str));\n  }\n\n  return result;\n};\n\nTextDecoderLite.prototype.decode = function (bytes) {\n  return utf8Slice(bytes, 0, bytes.length);\n}\n\n}());",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Base64Js, Decoder, Encoder, decoder, encoder, _ref;\n\n  Base64Js = require(\"../lib/base64-js\");\n\n  _ref = require(\"../lib/text-encoder\"), Decoder = _ref.decoder, Encoder = _ref.encoder;\n\n  encoder = new Encoder('utf-8');\n\n  decoder = new Decoder('utf-8');\n\n  module.exports = {\n    encode: function(s) {\n      return Base64Js.fromByteArray(encoder.encode(s));\n    },\n    decode: function(b64string) {\n      return decoder.decode(Base64Js.toByteArray(b64string.replace(/\\n/g, '')));\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.9.2\"};",
      "type": "blob"
    },
    "test/base64": {
      "path": "test/base64",
      "content": "(function() {\n  var Base64, Base64Js, Decoder;\n\n  Base64 = require(\"../main\");\n\n  Base64Js = require(\"../lib/base64-js\");\n\n  Decoder = require(\"../lib/text-encoder\").decoder;\n\n  describe(\"Base64\", function() {\n    it(\"should encode\", function() {\n      return assert.equal(Base64.encode(\"hello\"), \"aGVsbG8=\");\n    });\n    it(\"should decode\", function() {\n      return assert.equal(Base64.decode(\"aGVsbG8=\"), \"hello\");\n    });\n    it(\"should work with utf-8\", function() {\n      return assert.equal(Base64.decode(\"ZMO8ZGVy\"), \"düder\");\n    });\n    it(\"should work with utf-8\", function() {\n      return assert.equal(Base64.encode(\"düder\"), \"ZMO8ZGVy\");\n    });\n    it(\"should work with astral emojis\", function() {\n      var burger, decoder, result;\n      decoder = new Decoder('utf8');\n      result = decoder.decode(Base64Js.toByteArray(\"8J+NlAo=\"));\n      burger = \"\\uD83C\\uDF54\\n\";\n      return assert.equal(result, burger);\n    });\n    it(\"should decode long strings\", function() {\n      var decoded, encoded;\n      encoded = \"VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\\nZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\\nZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\\nCi0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\\nZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\\neSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\\nZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\\nb2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\\nb2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\\ndmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\\nZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\\nc2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\\ncm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\\nCkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\\ndCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\\nbiBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\\nciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\\ncGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\\nb3VyY2UgZmlsZSBoeWdpZW5lCg==\";\n      decoded = \"TODO\\n----\\nBundled Dependencies\\n- Build bundled dependencies into published script\\n- Dependency source should not be in revision control\\n- requires and module.exports\\n- inter-component and intra-component dependencies\\n- One day we'll need to implement a bundleresque system, but not today\\n\\nLive Update Demo\\n- Hot reload css\\n- Display Demo Runtime Errors in console\\n\\nOpen published page in editor and run live demo with same state as when editor was opened\\n- Pass git repo/branch metadata to published page for use in editor\\n\\nPersist state across demo reloads\\n\\nOrganize File tree by type\\nFile icons\\n\\nDisplay Diffs\\n\\nFirst auth doesn't display in bar\\n\\nCache Git trees and files in some form of local storage\\n\\nSometimes editor appears blank when switching files\\n\\nEditor plugins\\n- static analysis\\n- find in files\\n- source file hygiene\\n\";\n      return assert.equal(Base64.decode(encoded), decoded);\n    });\n    return it(\"should encode long strings\", function() {\n      var decoded, encoded;\n      encoded = \"VE9ETwotLS0tCkJ1bmRsZWQgRGVwZW5kZW5jaWVzCi0gQnVpbGQgYnVuZGxl\\nZCBkZXBlbmRlbmNpZXMgaW50byBwdWJsaXNoZWQgc2NyaXB0Ci0gRGVwZW5k\\nZW5jeSBzb3VyY2Ugc2hvdWxkIG5vdCBiZSBpbiByZXZpc2lvbiBjb250cm9s\\nCi0gcmVxdWlyZXMgYW5kIG1vZHVsZS5leHBvcnRzCi0gaW50ZXItY29tcG9u\\nZW50IGFuZCBpbnRyYS1jb21wb25lbnQgZGVwZW5kZW5jaWVzCi0gT25lIGRh\\neSB3ZSdsbCBuZWVkIHRvIGltcGxlbWVudCBhIGJ1bmRsZXJlc3F1ZSBzeXN0\\nZW0sIGJ1dCBub3QgdG9kYXkKCkxpdmUgVXBkYXRlIERlbW8KLSBIb3QgcmVs\\nb2FkIGNzcwotIERpc3BsYXkgRGVtbyBSdW50aW1lIEVycm9ycyBpbiBjb25z\\nb2xlCgpPcGVuIHB1Ymxpc2hlZCBwYWdlIGluIGVkaXRvciBhbmQgcnVuIGxp\\ndmUgZGVtbyB3aXRoIHNhbWUgc3RhdGUgYXMgd2hlbiBlZGl0b3Igd2FzIG9w\\nZW5lZAotIFBhc3MgZ2l0IHJlcG8vYnJhbmNoIG1ldGFkYXRhIHRvIHB1Ymxp\\nc2hlZCBwYWdlIGZvciB1c2UgaW4gZWRpdG9yCgpQZXJzaXN0IHN0YXRlIGFj\\ncm9zcyBkZW1vIHJlbG9hZHMKCk9yZ2FuaXplIEZpbGUgdHJlZSBieSB0eXBl\\nCkZpbGUgaWNvbnMKCkRpc3BsYXkgRGlmZnMKCkZpcnN0IGF1dGggZG9lc24n\\ndCBkaXNwbGF5IGluIGJhcgoKQ2FjaGUgR2l0IHRyZWVzIGFuZCBmaWxlcyBp\\nbiBzb21lIGZvcm0gb2YgbG9jYWwgc3RvcmFnZQoKU29tZXRpbWVzIGVkaXRv\\nciBhcHBlYXJzIGJsYW5rIHdoZW4gc3dpdGNoaW5nIGZpbGVzCgpFZGl0b3Ig\\ncGx1Z2lucwotIHN0YXRpYyBhbmFseXNpcwotIGZpbmQgaW4gZmlsZXMKLSBz\\nb3VyY2UgZmlsZSBoeWdpZW5lCg==\";\n      decoded = \"TODO\\n----\\nBundled Dependencies\\n- Build bundled dependencies into published script\\n- Dependency source should not be in revision control\\n- requires and module.exports\\n- inter-component and intra-component dependencies\\n- One day we'll need to implement a bundleresque system, but not today\\n\\nLive Update Demo\\n- Hot reload css\\n- Display Demo Runtime Errors in console\\n\\nOpen published page in editor and run live demo with same state as when editor was opened\\n- Pass git repo/branch metadata to published page for use in editor\\n\\nPersist state across demo reloads\\n\\nOrganize File tree by type\\nFile icons\\n\\nDisplay Diffs\\n\\nFirst auth doesn't display in bar\\n\\nCache Git trees and files in some form of local storage\\n\\nSometimes editor appears blank when switching files\\n\\nEditor plugins\\n- static analysis\\n- find in files\\n- source file hygiene\\n\";\n      return assert.equal(Base64.encode(decoded), encoded.replace(/\\n/g, \"\"));\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "config": {
    "version": "0.9.2"
  },
  "version": "0.9.2",
  "entryPoint": "main",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "distri/base64",
    "homepage": null,
    "description": null,
    "html_url": "https://github.com/distri/base64",
    "url": "https://api.github.com/repos/distri/base64",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});