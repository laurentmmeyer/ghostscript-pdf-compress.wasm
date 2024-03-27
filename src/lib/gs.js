// Copyright 2010 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module =
  typeof window.Module !== "undefined"
    ? window.Module
    : typeof Module !== "undefined"
      ? Module
      : {};
console.log(window.Module);
// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

Module["arguments"] = [];
Module["thisProgram"] = "./this.program";
Module["quit"] = function (status, toThrow) {
  throw toThrow;
};
Module["preRun"] = [];
Module["postRun"] = [];

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_IS_NODE =
  typeof process === "object" &&
  typeof require === "function" &&
  !ENVIRONMENT_IS_WEB &&
  !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL =
  !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module["ENVIRONMENT"]) {
  throw new Error(
    "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)",
  );
}

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = "";

function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  } else {
    return scriptDirectory + path;
  }
}

if (ENVIRONMENT_IS_NODE) {
  scriptDirectory = __dirname + "/";

  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  var nodeFS;
  var nodePath;

  Module["read"] = function shell_read(filename, binary) {
    var ret;
    if (!nodeFS) nodeFS = require("fs");
    if (!nodePath) nodePath = require("path");
    filename = nodePath["normalize"](filename);
    ret = nodeFS["readFileSync"](filename);
    return binary ? ret : ret.toString();
  };

  Module["readBinary"] = function readBinary(filename) {
    var ret = Module["read"](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  if (process["argv"].length > 1) {
    Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  }

  Module["arguments"] = process["argv"].slice(2);

  if (typeof module !== "undefined") {
    module["exports"] = Module;
  }

  process["on"]("uncaughtException", function (ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  // Currently node will swallow unhandled rejections, but this behavior is
  // deprecated, and in the future it will exit with error status.
  process["on"]("unhandledRejection", abort);

  Module["quit"] = function (status) {
    process["exit"](status);
  };

  Module["inspect"] = function () {
    return "[Emscripten Module object]";
  };
} else if (ENVIRONMENT_IS_SHELL) {
  if (typeof read != "undefined") {
    Module["read"] = function shell_read(f) {
      return read(f);
    };
  }

  Module["readBinary"] = function readBinary(f) {
    var data;
    if (typeof readbuffer === "function") {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, "binary");
    assert(typeof data === "object");
    return data;
  };

  if (typeof scriptArgs != "undefined") {
    Module["arguments"] = scriptArgs;
  } else if (typeof arguments != "undefined") {
    Module["arguments"] = arguments;
  }

  if (typeof quit === "function") {
    Module["quit"] = function (status) {
      quit(status);
    };
  }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (document.currentScript) {
    // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf("blob:") !== 0) {
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.lastIndexOf("/") + 1,
    );
  } else {
    scriptDirectory = "";
  }

  Module["read"] = function shell_read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (ENVIRONMENT_IS_WORKER) {
    Module["readBinary"] = function readBinary(url) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.responseType = "arraybuffer";
      xhr.send(null);
      return new Uint8Array(xhr.response);
    };
  }

  Module["readAsync"] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
        // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

  Module["setWindowTitle"] = function (title) {
    document.title = title;
  };
} else {
  throw new Error("environment detection error");
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// If the user provided Module.print or printErr, use that. Otherwise,
// console.log is checked first, as 'print' on the web will open a print dialogue
// printErr is preferable to console.warn (works better in shells)
// bind(console) is necessary to fix IE/Edge closed dev tools panel behavior.
var out =
  Module["print"] ||
  (typeof console !== "undefined"
    ? console.log.bind(console)
    : typeof print !== "undefined"
      ? print
      : null);
var err =
  Module["printErr"] ||
  (typeof printErr !== "undefined"
    ? printErr
    : (typeof console !== "undefined" && console.warn.bind(console)) || out);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = undefined;

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
assert(
  typeof Module["memoryInitializerPrefixURL"] === "undefined",
  "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead",
);
assert(
  typeof Module["pthreadMainPrefixURL"] === "undefined",
  "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead",
);
assert(
  typeof Module["cdInitializerPrefixURL"] === "undefined",
  "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead",
);
assert(
  typeof Module["filePackagePrefixURL"] === "undefined",
  "Module.filePackagePrefixURL option was removed, use Module.locateFile instead",
);

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// {{PREAMBLE_ADDITIONS}}

var STACK_ALIGN = 16;

// stack management, and other functionality that is provided by the compiled code,
// should not be used before it is ready
stackSave =
  stackRestore =
  stackAlloc =
    function () {
      abort(
        "cannot use the stack before compiled code is ready to run, and has provided stack access",
      );
    };

function staticAlloc(size) {
  abort(
    "staticAlloc is no longer available at runtime; instead, perform static allocations at compile time (using makeStaticAlloc)",
  );
}

function dynamicAlloc(size) {
  assert(DYNAMICTOP_PTR);
  var ret = HEAP32[DYNAMICTOP_PTR >> 2];
  var end = (ret + size + 15) & -16;
  if (end <= _emscripten_get_heap_size()) {
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
  } else {
    var success = _emscripten_resize_heap(end);
    if (!success) return 0;
  }
  return ret;
}

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case "i1":
    case "i8":
      return 1;
    case "i16":
      return 2;
    case "i32":
      return 4;
    case "i64":
      return 8;
    case "float":
      return 4;
    case "double":
      return 8;
    default: {
      if (type[type.length - 1] === "*") {
        return 4; // A pointer
      } else if (type[0] === "i") {
        var bits = parseInt(type.substr(1));
        assert(
          bits % 8 === 0,
          "getNativeTypeSize invalid bits " + bits + ", type " + type,
        );
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

var asm2wasmImports = {
  // special asm2wasm imports
  "f64-rem": function (x, y) {
    return x % y;
  },
  debugger: function () {
    debugger;
  },
};

var jsCallStartIndex = 1;
var functionPointers = new Array(0);

// Add a wasm function to the table.
// Attempting to call this with JS function will cause of table.set() to fail
function addWasmFunction(func) {
  var table = wasmTable;
  var ret = table.length;
  table.grow(1);
  table.set(ret, func);
  return ret;
}

// 'sig' parameter is currently only used for LLVM backend under certain
// circumstance: RESERVED_FUNCTION_POINTERS=1, EMULATED_FUNCTION_POINTERS=0.
function addFunction(func, sig) {
  var base = 0;
  for (var i = base; i < base + 0; i++) {
    if (!functionPointers[i]) {
      functionPointers[i] = func;
      return jsCallStartIndex + i;
    }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
}

function removeFunction(index) {
  functionPointers[index - jsCallStartIndex] = null;
}

var funcWrappers = {};

function getFuncWrapper(func, sig) {
  if (!func) return; // on null pointer, return undefined
  assert(sig);
  if (!funcWrappers[sig]) {
    funcWrappers[sig] = {};
  }
  var sigCache = funcWrappers[sig];
  if (!sigCache[func]) {
    // optimize away arguments usage in common cases
    if (sig.length === 1) {
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func);
      };
    } else if (sig.length === 2) {
      sigCache[func] = function dynCall_wrapper(arg) {
        return dynCall(sig, func, [arg]);
      };
    } else {
      // general case
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func, Array.prototype.slice.call(arguments));
      };
    }
  }
  return sigCache[func];
}

function makeBigInt(low, high, unsigned) {
  return unsigned
    ? +(low >>> 0) + +(high >>> 0) * 4294967296.0
    : +(low >>> 0) + +(high | 0) * 4294967296.0;
}

function dynCall(sig, ptr, args) {
  if (args && args.length) {
    assert(args.length == sig.length - 1);
    assert(
      "dynCall_" + sig in Module,
      "bad function pointer type - no table for sig '" + sig + "'",
    );
    return Module["dynCall_" + sig].apply(null, [ptr].concat(args));
  } else {
    assert(sig.length == 1);
    assert(
      "dynCall_" + sig in Module,
      "bad function pointer type - no table for sig '" + sig + "'",
    );
    return Module["dynCall_" + sig].call(null, ptr);
  }
}

var tempRet0 = 0;

var setTempRet0 = function (value) {
  tempRet0 = value;
};

var getTempRet0 = function () {
  return tempRet0;
};

function getCompilerSetting(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for getCompilerSetting or emscripten_get_compiler_setting to work";
}

var Runtime = {
  // helpful errors
  getTempRet0: function () {
    abort(
      'getTempRet0() is now a top-level function, after removing the Runtime object. Remove "Runtime."',
    );
  },
  staticAlloc: function () {
    abort(
      'staticAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."',
    );
  },
  stackAlloc: function () {
    abort(
      'stackAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."',
    );
  },
};

// The address globals begin at. Very low in memory, for code size and optimization opportunities.
// Above 0 is static memory, starting with globals.
// Then the stack.
// Then 'dynamic' memory for sbrk.
var GLOBAL_BASE = 1024;

// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

if (typeof WebAssembly !== "object") {
  abort(
    "No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.",
  );
}

/** @type {function(number, string, boolean=)} */
function getValue(ptr, type, noSafe) {
  type = type || "i8";
  if (type.charAt(type.length - 1) === "*") type = "i32"; // pointers are 32-bit
  switch (type) {
    case "i1":
      return HEAP8[ptr >> 0];
    case "i8":
      return HEAP8[ptr >> 0];
    case "i16":
      return HEAP16[ptr >> 1];
    case "i32":
      return HEAP32[ptr >> 2];
    case "i64":
      return HEAP32[ptr >> 2];
    case "float":
      return HEAPF32[ptr >> 2];
    case "double":
      return HEAPF64[ptr >> 3];
    default:
      abort("invalid type for getValue: " + type);
  }
  return null;
}

// Wasm globals

var wasmMemory;

// Potentially used for direct table calls.
var wasmTable;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS = 0;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort("Assertion failed: " + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module["_" + ident]; // closure exported function
  assert(
    func,
    "Cannot call unknown function " + ident + ", make sure it is exported",
  );
  return func;
}

// C calling interface.
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    string: function (str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    array: function (arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
  };

  function convertReturnValue(ret) {
    if (returnType === "string") return UTF8ToString(ret);
    if (returnType === "boolean") return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== "array", 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts);
  };
}

/** @type {function(number, number, string, boolean=)} */
function setValue(ptr, value, type, noSafe) {
  type = type || "i8";
  if (type.charAt(type.length - 1) === "*") type = "i32"; // pointers are 32-bit
  switch (type) {
    case "i1":
      HEAP8[ptr >> 0] = value;
      break;
    case "i8":
      HEAP8[ptr >> 0] = value;
      break;
    case "i16":
      HEAP16[ptr >> 1] = value;
      break;
    case "i32":
      HEAP32[ptr >> 2] = value;
      break;
    case "i64":
      (tempI64 = [
        value >>> 0,
        ((tempDouble = value),
        +Math_abs(tempDouble) >= 1.0
          ? tempDouble > 0.0
            ? (Math_min(+Math_floor(tempDouble / 4294967296.0), 4294967295.0) |
                0) >>>
              0
            : ~~+Math_ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0,
              ) >>> 0
          : 0),
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case "float":
      HEAPF32[ptr >> 2] = value;
      break;
    case "double":
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort("invalid type for setValue: " + type);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_DYNAMIC = 2; // Cannot be freed except through sbrk
var ALLOC_NONE = 3; // Do not allocate

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((TypedArray|Array<number>|number), string, number, number=)} */
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === "number") {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === "string" ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, stackAlloc, dynamicAlloc][allocator](
      Math.max(size, singleType ? 1 : types.length),
    );
  }

  if (zeroinit) {
    var stop;
    ptr = ret;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[ptr >> 2] = 0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[ptr++ >> 0] = 0;
    }
    return ret;
  }

  if (singleType === "i8") {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0,
    type,
    typeSize,
    previousType;
  while (i < size) {
    var curr = slab[i];

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, "Must know what type to store in allocate!");

    if (type == "i64") type = "i32"; // special case: we have one i32 here, and one i32 later

    setValue(ret + i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!runtimeInitialized) return dynamicAlloc(size);
  return _malloc(size);
}

/** @type {function(number, number=)} */
function Pointer_stringify(ptr, length) {
  abort(
    "this function has been removed - you should use UTF8ToString(ptr, maxBytesToRead) instead!",
  );
}

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = "";
  while (1) {
    var ch = HEAP8[ptr++ >> 0];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder =
  typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var str = "";
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = u8Array[idx++];
      if (!(u0 & 0x80)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = u8Array[idx++] & 63;
      if ((u0 & 0xe0) == 0xc0) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = u8Array[idx++] & 63;
      if ((u0 & 0xf0) == 0xe0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        if ((u0 & 0xf8) != 0xf0)
          warnOnce(
            "Invalid UTF-8 leading byte 0x" +
              u0.toString(16) +
              " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!",
          );
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (u8Array[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0))
    // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xd800 && u <= 0xdfff) {
      var u1 = str.charCodeAt(++i);
      u = (0x10000 + ((u & 0x3ff) << 10)) | (u1 & 0x3ff);
    }
    if (u <= 0x7f) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7ff) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xc0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xffff) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xe0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u >= 0x200000)
        warnOnce(
          "Invalid Unicode code point 0x" +
            u.toString(16) +
            " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).",
        );
      outU8Array[outIdx++] = 0xf0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(
    typeof maxBytesToWrite == "number",
    "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!",
  );
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xd800 && u <= 0xdfff)
      u = (0x10000 + ((u & 0x3ff) << 10)) | (str.charCodeAt(++i) & 0x3ff);
    if (u <= 0x7f) ++len;
    else if (u <= 0x7ff) len += 2;
    else if (u <= 0xffff) len += 3;
    else len += 4;
  }
  return len;
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder =
  typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

function UTF16ToString(ptr) {
  assert(
    ptr % 2 == 0,
    "Pointer passed to UTF16ToString must be aligned to two bytes!",
  );
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  while (HEAP16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var i = 0;

    var str = "";
    while (1) {
      var codeUnit = HEAP16[(ptr + i * 2) >> 1];
      if (codeUnit == 0) return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(
    outPtr % 2 == 0,
    "Pointer passed to stringToUTF16 must be aligned to two bytes!",
  );
  assert(
    typeof maxBytesToWrite == "number",
    "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!",
  );
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7fffffff;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite =
    maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[outPtr >> 1] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[outPtr >> 1] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length * 2;
}

function UTF32ToString(ptr) {
  assert(
    ptr % 4 == 0,
    "Pointer passed to UTF32ToString must be aligned to four bytes!",
  );
  var i = 0;

  var str = "";
  while (1) {
    var utf32 = HEAP32[(ptr + i * 4) >> 2];
    if (utf32 == 0) return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(
    outPtr % 4 == 0,
    "Pointer passed to stringToUTF32 must be aligned to four bytes!",
  );
  assert(
    typeof maxBytesToWrite == "number",
    "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!",
  );
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7fffffff;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit =
        (0x10000 + ((codeUnit & 0x3ff) << 10)) | (trailSurrogate & 0x3ff);
    }
    HEAP32[outPtr >> 2] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[outPtr >> 2] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce(
    "writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!",
  );

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  assert(
    array.length >= 0,
    "writeArrayToMemory array must have a length (should be an array or typed array)",
  );
  HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert((str.charCodeAt(i) === str.charCodeAt(i)) & 0xff);
    HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}

function demangle(func) {
  warnOnce(
    "warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling",
  );
  return func;
}

function demangleAll(text) {
  var regex = /__Z[\w\d_]+/g;
  return text.replace(regex, function (x) {
    var y = demangle(x);
    return x === y ? x : y + " [" + x + "]";
  });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch (e) {
      err = e;
    }
    if (!err.stack) {
      return "(no stack trace available)";
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  var js = jsStackTrace();
  if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
  return demangleAll(js);
}

// Memory management

var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
  /** @type {ArrayBuffer} */
  buffer,
  /** @type {Int8Array} */
  HEAP8,
  /** @type {Uint8Array} */
  HEAPU8,
  /** @type {Int16Array} */
  HEAP16,
  /** @type {Uint16Array} */
  HEAPU16,
  /** @type {Int32Array} */
  HEAP32,
  /** @type {Uint32Array} */
  HEAPU32,
  /** @type {Float32Array} */
  HEAPF32,
  /** @type {Float64Array} */
  HEAPF64;

function updateGlobalBuffer(buf) {
  Module["buffer"] = buffer = buf;
}

function updateGlobalBufferViews() {
  Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
  Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
  Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}

var STATIC_BASE = 1024,
  STACK_BASE = 10348944,
  STACKTOP = STACK_BASE,
  STACK_MAX = 15591824,
  DYNAMIC_BASE = 15591824,
  DYNAMICTOP_PTR = 10348688;

assert(STACK_BASE % 16 === 0, "stack must start aligned");
assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");

var TOTAL_STACK = 5242880;
if (Module["TOTAL_STACK"])
  assert(
    TOTAL_STACK === Module["TOTAL_STACK"],
    "the stack size can no longer be determined at runtime",
  );

var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK)
  err(
    "TOTAL_MEMORY should be larger than TOTAL_STACK, was " +
      TOTAL_MEMORY +
      "! (TOTAL_STACK=" +
      TOTAL_STACK +
      ")",
  );

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(
  typeof Int32Array !== "undefined" &&
    typeof Float64Array !== "undefined" &&
    Int32Array.prototype.subarray !== undefined &&
    Int32Array.prototype.set !== undefined,
  "JS engine does not provide full typed array support",
);

// Use a provided buffer, if there is one, or else allocate a new one
if (Module["buffer"]) {
  buffer = Module["buffer"];
  assert(
    buffer.byteLength === TOTAL_MEMORY,
    "provided buffer should be " +
      TOTAL_MEMORY +
      " bytes, but it is " +
      buffer.byteLength,
  );
} else {
  // Use a WebAssembly memory where available
  if (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.Memory === "function"
  ) {
    assert(TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
    wasmMemory = new WebAssembly.Memory({
      initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
    });
    buffer = wasmMemory.buffer;
  } else {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
  assert(buffer.byteLength === TOTAL_MEMORY);
  Module["buffer"] = buffer;
}
updateGlobalBufferViews();

HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  assert((STACK_MAX & 3) == 0);
  HEAPU32[(STACK_MAX >> 2) - 1] = 0x02135467;
  HEAPU32[(STACK_MAX >> 2) - 2] = 0x89bacdfe;
}

function checkStackCookie() {
  if (
    HEAPU32[(STACK_MAX >> 2) - 1] != 0x02135467 ||
    HEAPU32[(STACK_MAX >> 2) - 2] != 0x89bacdfe
  ) {
    abort(
      "Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" +
        HEAPU32[(STACK_MAX >> 2) - 2].toString(16) +
        " " +
        HEAPU32[(STACK_MAX >> 2) - 1].toString(16),
    );
  }
  // Also test the global address 0 for integrity.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */)
    throw "Runtime error: The application has corrupted its heap memory area (address zero)!";
}

function abortStackOverflow(allocSize) {
  abort(
    "Stack overflow! Attempted to allocate " +
      allocSize +
      " bytes on the stack, but stack has only " +
      (STACK_MAX - stackSave() + allocSize) +
      " bytes available!",
  );
}

HEAP32[0] = 0x63736d65; /* 'emsc' */

// Endianness check (note: assumes compiler arch was little-endian)
HEAP16[1] = 0x6373;
if (HEAPU8[2] !== 0x73 || HEAPU8[3] !== 0x63)
  throw "Runtime error: expected the system to be little-endian!";

function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == "function") {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === "number") {
      if (callback.arg === undefined) {
        Module["dynCall_v"](func);
      } else {
        Module["dynCall_vi"](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__ = []; // functions called before the runtime is initialized
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function")
      Module["preRun"] = [Module["preRun"]];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  checkStackCookie();
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  checkStackCookie();
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function")
      Module["postRun"] = [Module["postRun"]];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32
    ? 2 * Math.abs(1 << (bits - 1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
    : Math.pow(2, bits) + value;
}

function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half =
    bits <= 32
      ? Math.abs(1 << (bits - 1)) // abs is needed if bits == 32
      : Math.pow(2, bits - 1);
  if (value >= half && (bits <= 32 || value > half)) {
    // for huge values, we can hit the precision limit and always get true here. so don't do that
    // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
    // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2 * half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

assert(
  Math.imul,
  "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill",
);
assert(
  Math.fround,
  "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill",
);
assert(
  Math.clz32,
  "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill",
);
assert(
  Math.trunc,
  "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill",
);

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_max = Math.max;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function () {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err("still waiting on run dependencies:");
          }
          err("dependency: " + dep);
        }
        if (shown) {
          err("(end of list)");
        }
      }, 10000);
    }
  } else {
    err("warning: run dependency added without ID");
  }
}

function removeRunDependency(id) {
  runDependencies--;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err("warning: run dependency removed without ID");
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

var memoryInitializer = null;

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = "data:application/octet-stream;base64,";

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  if (!filename.startsWith || !filename.indexOf) {
    return false;
  }
  return String.prototype.startsWith
    ? filename.startsWith(dataURIPrefix)
    : filename.indexOf(dataURIPrefix) === 0;
}

var wasmBinaryFile = "https://cdn-wasm.b-cdn.net/gs.wasm";
// if (!isDataURI(wasmBinaryFile)) {
//   wasmBinaryFile = locateFile(wasmBinaryFile);
// }
function getBinary() {
  try {
    if (Module["wasmBinary"]) {
      return new Uint8Array(Module["wasmBinary"]);
    }
    if (Module["readBinary"]) {
      return Module["readBinary"](wasmBinaryFile);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  } catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // if we don't have the binary yet, and have the Fetch api, use that
  // in some environments, like Electron's render process, Fetch api may be present, but have a different context than expected, let's only use it on the Web
  if (
    !Module["wasmBinary"] &&
    (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
    typeof fetch === "function"
  ) {
    return fetch(wasmBinaryFile, { credentials: "same-origin" })
      .then(function (response) {
        if (!response["ok"]) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response["arrayBuffer"]();
      })
      .catch(function () {
        return getBinary();
      });
  }
  // Otherwise, getBinary should be able to get it synchronously
  return new Promise(function (resolve, reject) {
    resolve(getBinary());
  });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm(env) {
  // prepare imports
  var info = {
    env: env,
    global: {
      NaN: NaN,
      Infinity: Infinity,
    },
    "global.Math": Math,
    asm2wasm: asm2wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module["asm"] = exports;
    removeRunDependency("wasm-instantiate");
  }

  addRunDependency("wasm-instantiate");

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module["instantiateWasm"]) {
    try {
      return Module["instantiateWasm"](info, receiveInstance);
    } catch (e) {
      err("Module.instantiateWasm callback failed with error: " + e);
      return false;
    }
  }

  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;

  function receiveInstantiatedSource(output) {
    // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(
      Module === trueModule,
      "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?",
    );
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(output["instance"]);
  }

  function instantiateArrayBuffer(receiver) {
    getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(receiver, function (reason) {
        err("failed to asynchronously prepare wasm: " + reason);
        abort(reason);
      });
  }

  // Prefer streaming instantiation if available.
  if (
    !Module["wasmBinary"] &&
    typeof WebAssembly.instantiateStreaming === "function" &&
    !isDataURI(wasmBinaryFile) &&
    typeof fetch === "function"
  ) {
    WebAssembly.instantiateStreaming(
      fetch(wasmBinaryFile.default, { credentials: "same-origin" }),
      info,
    ).then(receiveInstantiatedSource, function (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err("wasm streaming compile failed: " + reason);
      err("falling back to ArrayBuffer instantiation");
      instantiateArrayBuffer(receiveInstantiatedSource);
    });
  } else {
    instantiateArrayBuffer(receiveInstantiatedSource);
  }
  return {}; // no exports yet; we'll fill them in later
}

// Provide an "asm.js function" for the application, called to "link" the asm.js module. We instantiate
// the wasm module at that time, and it receives imports and provides exports and so forth, the app
// doesn't need to care that it is wasm or asm.js.

Module["asm"] = function (global, env, providedBuffer) {
  // memory was already allocated (so js could use the buffer)
  env["memory"] = wasmMemory;
  // import table
  env["table"] = wasmTable = new WebAssembly.Table({
    initial: 393218,
    maximum: 393218,
    element: "anyfunc",
  });
  env["__memory_base"] = 1024; // tell the memory segments where to place themselves
  env["__table_base"] = 0; // table starts at 0 by default (even in dynamic linking, for the main module)

  var exports = createWasm(env);
  assert(exports, "binaryen setup failed (no wasm support?)");
  return exports;
};

// === Body ===

var ASM_CONSTS = [];

// STATICTOP = STATIC_BASE + 10347920;
/* global initializers */
__ATINIT__.push({
  func: function () {
    ___emscripten_environ_constructor();
  },
});

/* no memory initializer */
var tempDoublePtr = 10348928;
assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) {
  // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
  HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
  HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
}

function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
  HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
  HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
  HEAP8[tempDoublePtr + 4] = HEAP8[ptr + 4];
  HEAP8[tempDoublePtr + 5] = HEAP8[ptr + 5];
  HEAP8[tempDoublePtr + 6] = HEAP8[ptr + 6];
  HEAP8[tempDoublePtr + 7] = HEAP8[ptr + 7];
}

// {{PRE_LIBRARY}}

function ___assert_fail(condition, filename, line, func) {
  abort(
    "Assertion failed: " +
      UTF8ToString(condition) +
      ", at: " +
      [
        filename ? UTF8ToString(filename) : "unknown filename",
        line,
        func ? UTF8ToString(func) : "unknown function",
      ],
  );
}

var ENV = {};

function ___buildEnvironment(environ) {
  // WARNING: Arbitrary limit!
  var MAX_ENV_VALUES = 64;
  var TOTAL_ENV_SIZE = 1024;

  // Statically allocate memory for the environment.
  var poolPtr;
  var envPtr;
  if (!___buildEnvironment.called) {
    ___buildEnvironment.called = true;
    // Set default values. Use string keys for Closure Compiler compatibility.
    ENV["USER"] = ENV["LOGNAME"] = "web_user";
    ENV["PATH"] = "/";
    ENV["PWD"] = "/";
    ENV["HOME"] = "/home/web_user";
    ENV["LANG"] = "C.UTF-8";
    ENV["_"] = Module["thisProgram"];
    // Allocate memory.
    poolPtr = getMemory(TOTAL_ENV_SIZE);
    envPtr = getMemory(MAX_ENV_VALUES * 4);
    HEAP32[envPtr >> 2] = poolPtr;
    HEAP32[environ >> 2] = envPtr;
  } else {
    envPtr = HEAP32[environ >> 2];
    poolPtr = HEAP32[envPtr >> 2];
  }

  // Collect key=value lines.
  var strings = [];
  var totalSize = 0;
  for (var key in ENV) {
    if (typeof ENV[key] === "string") {
      var line = key + "=" + ENV[key];
      strings.push(line);
      totalSize += line.length;
    }
  }
  if (totalSize > TOTAL_ENV_SIZE) {
    throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
  }

  // Make new.
  var ptrSize = 4;
  for (var i = 0; i < strings.length; i++) {
    var line = strings[i];
    writeAsciiToMemory(line, poolPtr);
    HEAP32[(envPtr + i * ptrSize) >> 2] = poolPtr;
    poolPtr += line.length + 1;
  }
  HEAP32[(envPtr + strings.length * ptrSize) >> 2] = 0;
}

function _emscripten_get_now() {
  abort();
}

function _emscripten_get_now_is_monotonic() {
  // return whether emscripten_get_now is guaranteed monotonic; the Date.now
  // implementation is not :(
  return (
    ENVIRONMENT_IS_NODE ||
    typeof dateNow !== "undefined" ||
    ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
      self["performance"] &&
      self["performance"]["now"])
  );
}

function ___setErrNo(value) {
  if (Module["___errno_location"])
    HEAP32[Module["___errno_location"]() >> 2] = value;
  else err("failed to set errno from JS");
  return value;
}

function _clock_gettime(clk_id, tp) {
  // int clock_gettime(clockid_t clk_id, struct timespec *tp);
  var now;
  if (clk_id === 0) {
    now = Date.now();
  } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
    now = _emscripten_get_now();
  } else {
    ___setErrNo(22);
    return -1;
  }
  HEAP32[tp >> 2] = (now / 1000) | 0; // seconds
  HEAP32[(tp + 4) >> 2] = ((now % 1000) * 1000 * 1000) | 0; // nanoseconds
  return 0;
}

function ___clock_gettime(
  a0,
  a1,
  /*``*/
) {
  return _clock_gettime(a0, a1);
}

function ___lock() {}

function ___map_file(pathname, size) {
  ___setErrNo(1);
  return -1;
}

var PATH = {
  splitPath: function (filename) {
    var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: function (parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift("..");
      }
    }
    return parts;
  },
  normalize: function (path) {
    var isAbsolute = path.charAt(0) === "/",
      trailingSlash = path.substr(-1) === "/";
    // Normalize the path
    path = PATH.normalizeArray(
      path.split("/").filter(function (p) {
        return !!p;
      }),
      !isAbsolute,
    ).join("/");
    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }
    return (isAbsolute ? "/" : "") + path;
  },
  dirname: function (path) {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1];
    if (!root && !dir) {
      // No dirname whatsoever
      return ".";
    }
    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: function (path) {
    // EMSCRIPTEN return '/'' for '/', not an empty string
    if (path === "/") return "/";
    var lastSlash = path.lastIndexOf("/");
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  extname: function (path) {
    return PATH.splitPath(path)[3];
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join("/"));
  },
  join2: function (l, r) {
    return PATH.normalize(l + "/" + r);
  },
  resolve: function () {
    var resolvedPath = "",
      resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd();
      // Skip empty and invalid entries
      if (typeof path !== "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path) {
        return ""; // an invalid portion invalidates the whole thing
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path.charAt(0) === "/";
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split("/").filter(function (p) {
        return !!p;
      }),
      !resolvedAbsolute,
    ).join("/");
    return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
  },
  relative: function (from, to) {
    from = PATH.resolve(from).substr(1);
    to = PATH.resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  },
};

var TTY = {
  ttys: [],
  init: function () {
    // https://github.com/emscripten-core/emscripten/pull/1555
    // if (ENVIRONMENT_IS_NODE) {
    //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
    //   // device, it always assumes it's a TTY device. because of this, we're forcing
    //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
    //   // with text files until FS.init can be refactored.
    //   process['stdin']['setEncoding']('utf8');
    // }
  },
  shutdown: function () {
    // https://github.com/emscripten-core/emscripten/pull/1555
    // if (ENVIRONMENT_IS_NODE) {
    //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
    //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
    //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
    //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
    //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
    //   process['stdin']['pause']();
    // }
  },
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close: function (stream) {
      // flush any pending line data
      stream.tty.ops.flush(stream.tty);
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    read: function (stream, buffer, offset, length, pos /* ignored */) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES.EIO);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    },
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          // we will read data by chunks of BUFSIZE
          var BUFSIZE = 256;
          var buf = new Buffer(BUFSIZE);
          var bytesRead = 0;

          var isPosixPlatform = process.platform != "win32"; // Node doesn't offer a direct check, so test by exclusion

          var fd = process.stdin.fd;
          if (isPosixPlatform) {
            // Linux and Mac cannot use process.stdin.fd (which isn't set up as sync)
            var usingDevice = false;
            try {
              fd = fs.openSync("/dev/stdin", "r");
              usingDevice = true;
            } catch (e) {}
          }

          try {
            bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
          } catch (e) {
            // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
            // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
            if (e.toString().indexOf("EOF") != -1) bytesRead = 0;
            else throw e;
          }

          if (usingDevice) {
            fs.closeSync(fd);
          }
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString("utf-8");
          } else {
            result = null;
          }
        } else if (
          typeof window != "undefined" &&
          typeof window.prompt == "function"
        ) {
          // Browser.
          result = window.prompt("Input: "); // returns null on cancel
          if (result !== null) {
            result += "\n";
          }
        } else if (typeof readline == "function") {
          // Command line.
          result = readline();
          if (result !== null) {
            result += "\n";
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
};

var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, "/", 16384 | 511 /* 0777 */, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      // no supported
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
          },
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink,
          },
          stream: {},
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: FS.chrdev_stream_ops,
        },
      };
    }
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
      // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
      // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
      // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.timestamp = Date.now();
    // add the new node to the parent
    if (parent) {
      parent.contents[name] = node;
    }
    return node;
  },
  getFileDataAsRegularArray: function (node) {
    if (node.contents && node.contents.subarray) {
      var arr = [];
      for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
      return arr; // Returns a copy of the original data.
    }
    return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array();
    if (node.contents.subarray)
      return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
    return new Uint8Array(node.contents);
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
    // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
    // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
    // avoid overshooting the allocation cap by a very large margin.
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(
      newCapacity,
      (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0,
    );
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity); // Allocate new storage.
    if (node.usedBytes > 0)
      node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
    return;
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null; // Fully decommit when requesting a resize to zero.
      node.usedBytes = 0;
      return;
    }
    if (!node.contents || node.contents.subarray) {
      // Resize a typed array if that is being used as the backing store.
      var oldContents = node.contents;
      node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
      if (oldContents) {
        node.contents.set(
          oldContents.subarray(0, Math.min(newSize, node.usedBytes)),
        ); // Copy old data over to the new storage.
      }
      node.usedBytes = newSize;
      return;
    }
    // Backing with a JS array.
    if (!node.contents) node.contents = [];
    if (node.contents.length > newSize) node.contents.length = newSize;
    else while (node.contents.length < newSize) node.contents.push(0);
    node.usedBytes = newSize;
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      // device numbers reuse inode numbers.
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
      //       but this is not required by the standard.
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[ERRNO_CODES.ENOENT];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      // if we're overwriting a directory at new_name, make sure it's empty.
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
        }
      }
      // do the internal rewiring
      delete old_node.parent.contents[old_node.name];
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      old_node.parent = new_dir;
    },
    unlink: function (parent, name) {
      delete parent.contents[name];
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
      }
      delete parent.contents[name];
    },
    readdir: function (node) {
      var entries = [".", ".."];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return node.link;
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      assert(size >= 0);
      if (size > 8 && contents.subarray) {
        // non-trivial, and typed array
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++)
          buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      // If memory can grow, we don't want to hold on to references of
      // the memory Buffer, as they may get invalidated. That means
      // we need to do a copy here.
      // FIXME: this is inefficient as the file packager may have
      //        copied the data into memory already - we may want to
      //        integrate more there and let the file packager loading
      //        code be able to query if memory growth is on or off.
      if (canOwn) {
        warnOnce(
          "file packager has copied file data into memory, but in memory growth we are forced to copy it again (see --no-heap-copy)",
        );
      }
      canOwn = false;

      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();

      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        // This write is from a typed array to a typed array?
        if (canOwn) {
          assert(
            position === 0,
            "canOwn must imply no weird position inside the file",
          );
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
          node.contents = new Uint8Array(
            buffer.subarray(offset, offset + length),
          );
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          // Writing to an already allocated and used subrange of the file?
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }

      // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray)
        node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
      else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        // SEEK_CUR.
        position += stream.position;
      } else if (whence === 2) {
        // SEEK_END.
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return position;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap: function (stream, buffer, offset, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      // Only make a new copy when MAP_PRIVATE is specified.
      if (
        !(flags & 2) &&
        (contents.buffer === buffer || contents.buffer === buffer.buffer)
      ) {
        // We can't emulate MAP_SHARED when the file is not backed by the buffer
        // we're mapping to (e.g. the HEAP buffer).
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        // Try to avoid unnecessary slices.
        if (position > 0 || position + length < stream.node.usedBytes) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(
              contents,
              position,
              position + length,
            );
          }
        }
        allocated = true;
        ptr = _malloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
        }
        buffer.set(contents, ptr);
      }
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
      }
      if (mmapFlags & 2) {
        // MAP_PRIVATE calls need not to be synced back to underlying fs
        return 0;
      }

      var bytesWritten = MEMFS.stream_ops.write(
        stream,
        buffer,
        0,
        length,
        offset,
        false,
      );
      // should we check if bytesWritten and length are the same?
      return 0;
    },
  },
};

var IDBFS = {
  dbs: {},
  indexedDB: function () {
    if (typeof indexedDB !== "undefined") return indexedDB;
    var ret = null;
    if (typeof window === "object")
      ret =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;
    assert(ret, "IDBFS used, but indexedDB not supported");
    return ret;
  },
  DB_VERSION: 21,
  DB_STORE_NAME: "FILE_DATA",
  mount: function (mount) {
    // reuse all of the core MEMFS functionality
    return MEMFS.mount.apply(null, arguments);
  },
  syncfs: function (mount, populate, callback) {
    IDBFS.getLocalSet(mount, function (err, local) {
      if (err) return callback(err);

      IDBFS.getRemoteSet(mount, function (err, remote) {
        if (err) return callback(err);

        var src = populate ? remote : local;
        var dst = populate ? local : remote;

        IDBFS.reconcile(src, dst, callback);
      });
    });
  },
  getDB: function (name, callback) {
    // check the cache first
    var db = IDBFS.dbs[name];
    if (db) {
      return callback(null, db);
    }

    var req;
    try {
      req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
    } catch (e) {
      return callback(e);
    }
    if (!req) {
      return callback("Unable to connect to IndexedDB");
    }
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      var transaction = e.target.transaction;

      var fileStore;

      if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
        fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
      } else {
        fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
      }

      if (!fileStore.indexNames.contains("timestamp")) {
        fileStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    req.onsuccess = function () {
      db = req.result;

      // add to the cache
      IDBFS.dbs[name] = db;
      callback(null, db);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  getLocalSet: function (mount, callback) {
    var entries = {};

    function isRealDir(p) {
      return p !== "." && p !== "..";
    }

    function toAbsolute(root) {
      return function (p) {
        return PATH.join2(root, p);
      };
    }

    var check = FS.readdir(mount.mountpoint)
      .filter(isRealDir)
      .map(toAbsolute(mount.mountpoint));

    while (check.length) {
      var path = check.pop();
      var stat;

      try {
        stat = FS.stat(path);
      } catch (e) {
        return callback(e);
      }

      if (FS.isDir(stat.mode)) {
        check.push.apply(
          check,
          FS.readdir(path).filter(isRealDir).map(toAbsolute(path)),
        );
      }

      entries[path] = { timestamp: stat.mtime };
    }

    return callback(null, { type: "local", entries: entries });
  },
  getRemoteSet: function (mount, callback) {
    var entries = {};

    IDBFS.getDB(mount.mountpoint, function (err, db) {
      if (err) return callback(err);

      try {
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
        transaction.onerror = function (e) {
          callback(this.error);
          e.preventDefault();
        };

        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        var index = store.index("timestamp");

        index.openKeyCursor().onsuccess = function (event) {
          var cursor = event.target.result;

          if (!cursor) {
            return callback(null, { type: "remote", db: db, entries: entries });
          }

          entries[cursor.primaryKey] = { timestamp: cursor.key };

          cursor.continue();
        };
      } catch (e) {
        return callback(e);
      }
    });
  },
  loadLocalEntry: function (path, callback) {
    var stat, node;

    try {
      var lookup = FS.lookupPath(path);
      node = lookup.node;
      stat = FS.stat(path);
    } catch (e) {
      return callback(e);
    }

    if (FS.isDir(stat.mode)) {
      return callback(null, { timestamp: stat.mtime, mode: stat.mode });
    } else if (FS.isFile(stat.mode)) {
      // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
      // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
      node.contents = MEMFS.getFileDataAsTypedArray(node);
      return callback(null, {
        timestamp: stat.mtime,
        mode: stat.mode,
        contents: node.contents,
      });
    } else {
      return callback(new Error("node type not supported"));
    }
  },
  storeLocalEntry: function (path, entry, callback) {
    try {
      if (FS.isDir(entry.mode)) {
        FS.mkdir(path, entry.mode);
      } else if (FS.isFile(entry.mode)) {
        FS.writeFile(path, entry.contents, { canOwn: true });
      } else {
        return callback(new Error("node type not supported"));
      }

      FS.chmod(path, entry.mode);
      FS.utime(path, entry.timestamp, entry.timestamp);
    } catch (e) {
      return callback(e);
    }

    callback(null);
  },
  removeLocalEntry: function (path, callback) {
    try {
      var lookup = FS.lookupPath(path);
      var stat = FS.stat(path);

      if (FS.isDir(stat.mode)) {
        FS.rmdir(path);
      } else if (FS.isFile(stat.mode)) {
        FS.unlink(path);
      }
    } catch (e) {
      return callback(e);
    }

    callback(null);
  },
  loadRemoteEntry: function (store, path, callback) {
    var req = store.get(path);
    req.onsuccess = function (event) {
      callback(null, event.target.result);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  storeRemoteEntry: function (store, path, entry, callback) {
    var req = store.put(entry, path);
    req.onsuccess = function () {
      callback(null);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  removeRemoteEntry: function (store, path, callback) {
    var req = store.delete(path);
    req.onsuccess = function () {
      callback(null);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  reconcile: function (src, dst, callback) {
    var total = 0;

    var create = [];
    Object.keys(src.entries).forEach(function (key) {
      var e = src.entries[key];
      var e2 = dst.entries[key];
      if (!e2 || e.timestamp > e2.timestamp) {
        create.push(key);
        total++;
      }
    });

    var remove = [];
    Object.keys(dst.entries).forEach(function (key) {
      var e = dst.entries[key];
      var e2 = src.entries[key];
      if (!e2) {
        remove.push(key);
        total++;
      }
    });

    if (!total) {
      return callback(null);
    }

    var errored = false;
    var completed = 0;
    var db = src.type === "remote" ? src.db : dst.db;
    var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
    var store = transaction.objectStore(IDBFS.DB_STORE_NAME);

    function done(err) {
      if (err) {
        if (!done.errored) {
          done.errored = true;
          return callback(err);
        }
        return;
      }
      if (++completed >= total) {
        return callback(null);
      }
    }

    transaction.onerror = function (e) {
      done(this.error);
      e.preventDefault();
    };

    // sort paths in ascending order so directory entries are created
    // before the files inside them
    create.sort().forEach(function (path) {
      if (dst.type === "local") {
        IDBFS.loadRemoteEntry(store, path, function (err, entry) {
          if (err) return done(err);
          IDBFS.storeLocalEntry(path, entry, done);
        });
      } else {
        IDBFS.loadLocalEntry(path, function (err, entry) {
          if (err) return done(err);
          IDBFS.storeRemoteEntry(store, path, entry, done);
        });
      }
    });

    // sort paths in descending order so files are deleted before their
    // parent directories
    remove
      .sort()
      .reverse()
      .forEach(function (path) {
        if (dst.type === "local") {
          IDBFS.removeLocalEntry(path, done);
        } else {
          IDBFS.removeRemoteEntry(store, path, done);
        }
      });
  },
};

var NODEFS = {
  isWindows: false,
  staticInit: function () {
    NODEFS.isWindows = !!process.platform.match(/^win/);
    var flags = process["binding"]("constants");
    // Node.js 4 compatibility: it has no namespaces for constants
    if (flags["fs"]) {
      flags = flags["fs"];
    }
    NODEFS.flagsForNodeMap = {
      1024: flags["O_APPEND"],
      64: flags["O_CREAT"],
      128: flags["O_EXCL"],
      0: flags["O_RDONLY"],
      2: flags["O_RDWR"],
      4096: flags["O_SYNC"],
      512: flags["O_TRUNC"],
      1: flags["O_WRONLY"],
    };
  },
  bufferFrom: function (arrayBuffer) {
    // Node.js < 4.5 compatibility: Buffer.from does not support ArrayBuffer
    // Buffer.from before 4.5 was just a method inherited from Uint8Array
    // Buffer.alloc has been added with Buffer.from together, so check it instead
    return Buffer.alloc ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer);
  },
  mount: function (mount) {
    assert(ENVIRONMENT_IS_NODE);
    return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var node = FS.createNode(parent, name, mode);
    node.node_ops = NODEFS.node_ops;
    node.stream_ops = NODEFS.stream_ops;
    return node;
  },
  getMode: function (path) {
    var stat;
    try {
      stat = fs.lstatSync(path);
      if (NODEFS.isWindows) {
        // Node.js on Windows never represents permission bit 'x', so
        // propagate read bits to execute bits
        stat.mode = stat.mode | ((stat.mode & 292) >> 2);
      }
    } catch (e) {
      if (!e.code) throw e;
      throw new FS.ErrnoError(ERRNO_CODES[e.code]);
    }
    return stat.mode;
  },
  realPath: function (node) {
    var parts = [];
    while (node.parent !== node) {
      parts.push(node.name);
      node = node.parent;
    }
    parts.push(node.mount.opts.root);
    parts.reverse();
    return PATH.join.apply(null, parts);
  },
  flagsForNode: function (flags) {
    flags &= ~0x200000 /*O_PATH*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
    flags &= ~0x800 /*O_NONBLOCK*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
    flags &= ~0x8000 /*O_LARGEFILE*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
    flags &= ~0x80000 /*O_CLOEXEC*/; // Some applications may pass it; it makes no sense for a single process.
    var newFlags = 0;
    for (var k in NODEFS.flagsForNodeMap) {
      if (flags & k) {
        newFlags |= NODEFS.flagsForNodeMap[k];
        flags ^= k;
      }
    }

    if (!flags) {
      return newFlags;
    } else {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
  },
  node_ops: {
    getattr: function (node) {
      var path = NODEFS.realPath(node);
      var stat;
      try {
        stat = fs.lstatSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
      // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
      // See http://support.microsoft.com/kb/140365
      if (NODEFS.isWindows && !stat.blksize) {
        stat.blksize = 4096;
      }
      if (NODEFS.isWindows && !stat.blocks) {
        stat.blocks = ((stat.size + stat.blksize - 1) / stat.blksize) | 0;
      }
      return {
        dev: stat.dev,
        ino: stat.ino,
        mode: stat.mode,
        nlink: stat.nlink,
        uid: stat.uid,
        gid: stat.gid,
        rdev: stat.rdev,
        size: stat.size,
        atime: stat.atime,
        mtime: stat.mtime,
        ctime: stat.ctime,
        blksize: stat.blksize,
        blocks: stat.blocks,
      };
    },
    setattr: function (node, attr) {
      var path = NODEFS.realPath(node);
      try {
        if (attr.mode !== undefined) {
          fs.chmodSync(path, attr.mode);
          // update the common node structure mode as well
          node.mode = attr.mode;
        }
        if (attr.timestamp !== undefined) {
          var date = new Date(attr.timestamp);
          fs.utimesSync(path, date, date);
        }
        if (attr.size !== undefined) {
          fs.truncateSync(path, attr.size);
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    lookup: function (parent, name) {
      var path = PATH.join2(NODEFS.realPath(parent), name);
      var mode = NODEFS.getMode(path);
      return NODEFS.createNode(parent, name, mode);
    },
    mknod: function (parent, name, mode, dev) {
      var node = NODEFS.createNode(parent, name, mode, dev);
      // create the backing node for this in the fs root as well
      var path = NODEFS.realPath(node);
      try {
        if (FS.isDir(node.mode)) {
          fs.mkdirSync(path, node.mode);
        } else {
          fs.writeFileSync(path, "", { mode: node.mode });
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
      return node;
    },
    rename: function (oldNode, newDir, newName) {
      var oldPath = NODEFS.realPath(oldNode);
      var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
      try {
        fs.renameSync(oldPath, newPath);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    unlink: function (parent, name) {
      var path = PATH.join2(NODEFS.realPath(parent), name);
      try {
        fs.unlinkSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    rmdir: function (parent, name) {
      var path = PATH.join2(NODEFS.realPath(parent), name);
      try {
        fs.rmdirSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    readdir: function (node) {
      var path = NODEFS.realPath(node);
      try {
        return fs.readdirSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    symlink: function (parent, newName, oldPath) {
      var newPath = PATH.join2(NODEFS.realPath(parent), newName);
      try {
        fs.symlinkSync(oldPath, newPath);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    readlink: function (node) {
      var path = NODEFS.realPath(node);
      try {
        path = fs.readlinkSync(path);
        path = NODEJS_PATH.relative(
          NODEJS_PATH.resolve(node.mount.opts.root),
          path,
        );
        return path;
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
  },
  stream_ops: {
    open: function (stream) {
      var path = NODEFS.realPath(stream.node);
      try {
        if (FS.isFile(stream.node.mode)) {
          stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    close: function (stream) {
      try {
        if (FS.isFile(stream.node.mode) && stream.nfd) {
          fs.closeSync(stream.nfd);
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    read: function (stream, buffer, offset, length, position) {
      // Node.js < 6 compatibility: node errors on 0 length reads
      if (length === 0) return 0;
      try {
        return fs.readSync(
          stream.nfd,
          NODEFS.bufferFrom(buffer.buffer),
          offset,
          length,
          position,
        );
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    write: function (stream, buffer, offset, length, position) {
      try {
        return fs.writeSync(
          stream.nfd,
          NODEFS.bufferFrom(buffer.buffer),
          offset,
          length,
          position,
        );
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        // SEEK_CUR.
        position += stream.position;
      } else if (whence === 2) {
        // SEEK_END.
        if (FS.isFile(stream.node.mode)) {
          try {
            var stat = fs.fstatSync(stream.nfd);
            position += stat.size;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }
      }

      if (position < 0) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }

      return position;
    },
  },
};

var WORKERFS = {
  DIR_MODE: 16895,
  FILE_MODE: 33279,
  reader: null,
  mount: function (mount) {
    assert(ENVIRONMENT_IS_WORKER);
    if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
    var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
    var createdParents = {};

    function ensureParent(path) {
      // return the parent node, creating subdirs as necessary
      var parts = path.split("/");
      var parent = root;
      for (var i = 0; i < parts.length - 1; i++) {
        var curr = parts.slice(0, i + 1).join("/");
        // Issue 4254: Using curr as a node name will prevent the node
        // from being found in FS.nameTable when FS.open is called on
        // a path which holds a child of this node,
        // given that all FS functions assume node names
        // are just their corresponding parts within their given path,
        // rather than incremental aggregates which include their parent's
        // directories.
        if (!createdParents[curr]) {
          createdParents[curr] = WORKERFS.createNode(
            parent,
            parts[i],
            WORKERFS.DIR_MODE,
            0,
          );
        }
        parent = createdParents[curr];
      }
      return parent;
    }

    function base(path) {
      var parts = path.split("/");
      return parts[parts.length - 1];
    }

    // We also accept FileList here, by using Array.prototype
    Array.prototype.forEach.call(mount.opts["files"] || [], function (file) {
      WORKERFS.createNode(
        ensureParent(file.name),
        base(file.name),
        WORKERFS.FILE_MODE,
        0,
        file,
        file.lastModifiedDate,
      );
    });
    (mount.opts["blobs"] || []).forEach(function (obj) {
      WORKERFS.createNode(
        ensureParent(obj["name"]),
        base(obj["name"]),
        WORKERFS.FILE_MODE,
        0,
        obj["data"],
      );
    });
    (mount.opts["packages"] || []).forEach(function (pack) {
      pack["metadata"].files.forEach(function (file) {
        var name = file.filename.substr(1); // remove initial slash
        WORKERFS.createNode(
          ensureParent(name),
          base(name),
          WORKERFS.FILE_MODE,
          0,
          pack["blob"].slice(file.start, file.end),
        );
      });
    });
    return root;
  },
  createNode: function (parent, name, mode, dev, contents, mtime) {
    var node = FS.createNode(parent, name, mode);
    node.mode = mode;
    node.node_ops = WORKERFS.node_ops;
    node.stream_ops = WORKERFS.stream_ops;
    node.timestamp = (mtime || new Date()).getTime();
    assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
    if (mode === WORKERFS.FILE_MODE) {
      node.size = contents.size;
      node.contents = contents;
    } else {
      node.size = 4096;
      node.contents = {};
    }
    if (parent) {
      parent.contents[name] = node;
    }
    return node;
  },
  node_ops: {
    getattr: function (node) {
      return {
        dev: 1,
        ino: undefined,
        mode: node.mode,
        nlink: 1,
        uid: 0,
        gid: 0,
        rdev: undefined,
        size: node.size,
        atime: new Date(node.timestamp),
        mtime: new Date(node.timestamp),
        ctime: new Date(node.timestamp),
        blksize: 4096,
        blocks: Math.ceil(node.size / 4096),
      };
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
    },
    lookup: function (parent, name) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    },
    mknod: function (parent, name, mode, dev) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    rename: function (oldNode, newDir, newName) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    unlink: function (parent, name) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    rmdir: function (parent, name) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    readdir: function (node) {
      var entries = [".", ".."];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newName, oldPath) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    readlink: function (node) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      if (position >= stream.node.size) return 0;
      var chunk = stream.node.contents.slice(position, position + length);
      var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
      buffer.set(new Uint8Array(ab), offset);
      return chunk.size;
    },
    write: function (stream, buffer, offset, length, position) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        // SEEK_CUR.
        position += stream.position;
      } else if (whence === 2) {
        // SEEK_END.
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.size;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return position;
    },
  },
};

var ERRNO_MESSAGES = {
  0: "Success",
  1: "Not super-user",
  2: "No such file or directory",
  3: "No such process",
  4: "Interrupted system call",
  5: "I/O error",
  6: "No such device or address",
  7: "Arg list too long",
  8: "Exec format error",
  9: "Bad file number",
  10: "No children",
  11: "No more processes",
  12: "Not enough core",
  13: "Permission denied",
  14: "Bad address",
  15: "Block device required",
  16: "Mount device busy",
  17: "File exists",
  18: "Cross-device link",
  19: "No such device",
  20: "Not a directory",
  21: "Is a directory",
  22: "Invalid argument",
  23: "Too many open files in system",
  24: "Too many open files",
  25: "Not a typewriter",
  26: "Text file busy",
  27: "File too large",
  28: "No space left on device",
  29: "Illegal seek",
  30: "Read only file system",
  31: "Too many links",
  32: "Broken pipe",
  33: "Math arg out of domain of func",
  34: "Math result not representable",
  35: "File locking deadlock error",
  36: "File or path name too long",
  37: "No record locks available",
  38: "Function not implemented",
  39: "Directory not empty",
  40: "Too many symbolic links",
  42: "No message of desired type",
  43: "Identifier removed",
  44: "Channel number out of range",
  45: "Level 2 not synchronized",
  46: "Level 3 halted",
  47: "Level 3 reset",
  48: "Link number out of range",
  49: "Protocol driver not attached",
  50: "No CSI structure available",
  51: "Level 2 halted",
  52: "Invalid exchange",
  53: "Invalid request descriptor",
  54: "Exchange full",
  55: "No anode",
  56: "Invalid request code",
  57: "Invalid slot",
  59: "Bad font file fmt",
  60: "Device not a stream",
  61: "No data (for no delay io)",
  62: "Timer expired",
  63: "Out of streams resources",
  64: "Machine is not on the network",
  65: "Package not installed",
  66: "The object is remote",
  67: "The link has been severed",
  68: "Advertise error",
  69: "Srmount error",
  70: "Communication error on send",
  71: "Protocol error",
  72: "Multihop attempted",
  73: "Cross mount point (not really error)",
  74: "Trying to read unreadable message",
  75: "Value too large for defined data type",
  76: "Given log. name not unique",
  77: "f.d. invalid for this operation",
  78: "Remote address changed",
  79: "Can   access a needed shared lib",
  80: "Accessing a corrupted shared lib",
  81: ".lib section in a.out corrupted",
  82: "Attempting to link in too many libs",
  83: "Attempting to exec a shared library",
  84: "Illegal byte sequence",
  86: "Streams pipe error",
  87: "Too many users",
  88: "Socket operation on non-socket",
  89: "Destination address required",
  90: "Message too long",
  91: "Protocol wrong type for socket",
  92: "Protocol not available",
  93: "Unknown protocol",
  94: "Socket type not supported",
  95: "Not supported",
  96: "Protocol family not supported",
  97: "Address family not supported by protocol family",
  98: "Address already in use",
  99: "Address not available",
  100: "Network interface is not configured",
  101: "Network is unreachable",
  102: "Connection reset by network",
  103: "Connection aborted",
  104: "Connection reset by peer",
  105: "No buffer space available",
  106: "Socket is already connected",
  107: "Socket is not connected",
  108: "Can't send after socket shutdown",
  109: "Too many references",
  110: "Connection timed out",
  111: "Connection refused",
  112: "Host is down",
  113: "Host is unreachable",
  114: "Socket already connected",
  115: "Connection already in progress",
  116: "Stale file handle",
  122: "Quota exceeded",
  123: "No medium (in tape drive)",
  125: "Operation canceled",
  130: "Previous owner died",
  131: "State not recoverable",
};

var ERRNO_CODES = {
  EPERM: 1,
  ENOENT: 2,
  ESRCH: 3,
  EINTR: 4,
  EIO: 5,
  ENXIO: 6,
  E2BIG: 7,
  ENOEXEC: 8,
  EBADF: 9,
  ECHILD: 10,
  EAGAIN: 11,
  EWOULDBLOCK: 11,
  ENOMEM: 12,
  EACCES: 13,
  EFAULT: 14,
  ENOTBLK: 15,
  EBUSY: 16,
  EEXIST: 17,
  EXDEV: 18,
  ENODEV: 19,
  ENOTDIR: 20,
  EISDIR: 21,
  EINVAL: 22,
  ENFILE: 23,
  EMFILE: 24,
  ENOTTY: 25,
  ETXTBSY: 26,
  EFBIG: 27,
  ENOSPC: 28,
  ESPIPE: 29,
  EROFS: 30,
  EMLINK: 31,
  EPIPE: 32,
  EDOM: 33,
  ERANGE: 34,
  ENOMSG: 42,
  EIDRM: 43,
  ECHRNG: 44,
  EL2NSYNC: 45,
  EL3HLT: 46,
  EL3RST: 47,
  ELNRNG: 48,
  EUNATCH: 49,
  ENOCSI: 50,
  EL2HLT: 51,
  EDEADLK: 35,
  ENOLCK: 37,
  EBADE: 52,
  EBADR: 53,
  EXFULL: 54,
  ENOANO: 55,
  EBADRQC: 56,
  EBADSLT: 57,
  EDEADLOCK: 35,
  EBFONT: 59,
  ENOSTR: 60,
  ENODATA: 61,
  ETIME: 62,
  ENOSR: 63,
  ENONET: 64,
  ENOPKG: 65,
  EREMOTE: 66,
  ENOLINK: 67,
  EADV: 68,
  ESRMNT: 69,
  ECOMM: 70,
  EPROTO: 71,
  EMULTIHOP: 72,
  EDOTDOT: 73,
  EBADMSG: 74,
  ENOTUNIQ: 76,
  EBADFD: 77,
  EREMCHG: 78,
  ELIBACC: 79,
  ELIBBAD: 80,
  ELIBSCN: 81,
  ELIBMAX: 82,
  ELIBEXEC: 83,
  ENOSYS: 38,
  ENOTEMPTY: 39,
  ENAMETOOLONG: 36,
  ELOOP: 40,
  EOPNOTSUPP: 95,
  EPFNOSUPPORT: 96,
  ECONNRESET: 104,
  ENOBUFS: 105,
  EAFNOSUPPORT: 97,
  EPROTOTYPE: 91,
  ENOTSOCK: 88,
  ENOPROTOOPT: 92,
  ESHUTDOWN: 108,
  ECONNREFUSED: 111,
  EADDRINUSE: 98,
  ECONNABORTED: 103,
  ENETUNREACH: 101,
  ENETDOWN: 100,
  ETIMEDOUT: 110,
  EHOSTDOWN: 112,
  EHOSTUNREACH: 113,
  EINPROGRESS: 115,
  EALREADY: 114,
  EDESTADDRREQ: 89,
  EMSGSIZE: 90,
  EPROTONOSUPPORT: 93,
  ESOCKTNOSUPPORT: 94,
  EADDRNOTAVAIL: 99,
  ENETRESET: 102,
  EISCONN: 106,
  ENOTCONN: 107,
  ETOOMANYREFS: 109,
  EUSERS: 87,
  EDQUOT: 122,
  ESTALE: 116,
  ENOTSUP: 95,
  ENOMEDIUM: 123,
  EILSEQ: 84,
  EOVERFLOW: 75,
  ECANCELED: 125,
  ENOTRECOVERABLE: 131,
  EOWNERDEAD: 130,
  ESTRPIPE: 86,
};

var _stdin = 10348704;

var _stdout = 10348720;

var _stderr = 10348736;
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  trackingDelegate: {},
  tracking: { openFlags: { READ: 1, WRITE: 2 } },
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  handleFSError: function (e) {
    if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
    return ___setErrNo(e.errno);
  },
  lookupPath: function (path, opts) {
    path = PATH.resolve(FS.cwd(), path);
    opts = opts || {};

    if (!path) return { path: "", node: null };

    var defaults = {
      follow_mount: true,
      recurse_count: 0,
    };
    for (var key in defaults) {
      if (opts[key] === undefined) {
        opts[key] = defaults[key];
      }
    }

    if (opts.recurse_count > 8) {
      // max recursive lookup of 8
      throw new FS.ErrnoError(40);
    }

    // split the path
    var parts = PATH.normalizeArray(
      path.split("/").filter(function (p) {
        return !!p;
      }),
      false,
    );

    // start at the root
    var current = FS.root;
    var current_path = "/";

    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1;
      if (islast && opts.parent) {
        // stop resolving
        break;
      }

      current = FS.lookupNode(current, parts[i]);
      current_path = PATH.join2(current_path, parts[i]);

      // jump to the mount's root node if this is a mountpoint
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root;
        }
      }

      // by default, lookupPath will not follow a symlink if it is the final path component.
      // setting opts.follow = true will override this behavior.
      if (!islast || opts.follow) {
        var count = 0;
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path);
          current_path = PATH.resolve(PATH.dirname(current_path), link);

          var lookup = FS.lookupPath(current_path, {
            recurse_count: opts.recurse_count,
          });
          current = lookup.node;

          if (count++ > 40) {
            // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
            throw new FS.ErrnoError(40);
          }
        }
      }
    }

    return { path: current_path, node: current };
  },
  getPath: function (node) {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== "/"
          ? mount + "/" + path
          : mount + path;
      }
      path = path ? node.name + "/" + path : node.name;
      node = node.parent;
    }
  },
  hashName: function (parentid, name) {
    var hash = 0;

    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode: function (parent, name) {
    var err = FS.mayLookup(parent);
    if (err) {
      throw new FS.ErrnoError(err, parent);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    // if we failed to find it in the cache, call into the VFS
    return FS.lookup(parent, name);
  },
  createNode: function (parent, name, mode, rdev) {
    if (!FS.FSNode) {
      FS.FSNode = function (parent, name, mode, rdev) {
        if (!parent) {
          parent = this; // root node sets parent to itself
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      };

      FS.FSNode.prototype = {};

      // compatibility
      var readMode = 292 | 73;
      var writeMode = 146;

      // NOTE we must use Object.defineProperties instead of individual calls to
      // Object.defineProperty in order to make closure compiler happy
      Object.defineProperties(FS.FSNode.prototype, {
        read: {
          get: function () {
            return (this.mode & readMode) === readMode;
          },
          set: function (val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
          },
        },
        write: {
          get: function () {
            return (this.mode & writeMode) === writeMode;
          },
          set: function (val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
          },
        },
        isFolder: {
          get: function () {
            return FS.isDir(this.mode);
          },
        },
        isDevice: {
          get: function () {
            return FS.isChrdev(this.mode);
          },
        },
      });
    }

    var node = new FS.FSNode(parent, name, mode, rdev);

    FS.hashAddNode(node);

    return node;
  },
  destroyNode: function (node) {
    FS.hashRemoveNode(node);
  },
  isRoot: function (node) {
    return node === node.parent;
  },
  isMountpoint: function (node) {
    return !!node.mounted;
  },
  isFile: function (mode) {
    return (mode & 61440) === 32768;
  },
  isDir: function (mode) {
    return (mode & 61440) === 16384;
  },
  isLink: function (mode) {
    return (mode & 61440) === 40960;
  },
  isChrdev: function (mode) {
    return (mode & 61440) === 8192;
  },
  isBlkdev: function (mode) {
    return (mode & 61440) === 24576;
  },
  isFIFO: function (mode) {
    return (mode & 61440) === 4096;
  },
  isSocket: function (mode) {
    return (mode & 49152) === 49152;
  },
  flagModes: {
    r: 0,
    rs: 1052672,
    "r+": 2,
    w: 577,
    wx: 705,
    xw: 705,
    "w+": 578,
    "wx+": 706,
    "xw+": 706,
    a: 1089,
    ax: 1217,
    xa: 1217,
    "a+": 1090,
    "ax+": 1218,
    "xa+": 1218,
  },
  modeStringToFlags: function (str) {
    var flags = FS.flagModes[str];
    if (typeof flags === "undefined") {
      throw new Error("Unknown file open mode: " + str);
    }
    return flags;
  },
  flagsToPermissionString: function (flag) {
    var perms = ["r", "w", "rw"][flag & 3];
    if (flag & 512) {
      perms += "w";
    }
    return perms;
  },
  nodePermissions: function (node, perms) {
    if (FS.ignorePermissions) {
      return 0;
    }
    // return 0 if any user, group or owner bits are set.
    if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
      return 13;
    } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
      return 13;
    } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
      return 13;
    }
    return 0;
  },
  mayLookup: function (dir) {
    var err = FS.nodePermissions(dir, "x");
    if (err) return err;
    if (!dir.node_ops.lookup) return 13;
    return 0;
  },
  mayCreate: function (dir, name) {
    try {
      var node = FS.lookupNode(dir, name);
      return 17;
    } catch (e) {}
    return FS.nodePermissions(dir, "wx");
  },
  mayDelete: function (dir, name, isdir) {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var err = FS.nodePermissions(dir, "wx");
    if (err) {
      return err;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 20;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 16;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 21;
      }
    }
    return 0;
  },
  mayOpen: function (node, flags) {
    if (!node) {
      return 2;
    }
    if (FS.isLink(node.mode)) {
      return 40;
    } else if (FS.isDir(node.mode)) {
      if (
        FS.flagsToPermissionString(flags) !== "r" || // opening for write
        flags & 512
      ) {
        // TODO: check for O_SEARCH? (== search for dir only)
        return 21;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: function (fd_start, fd_end) {
    fd_start = fd_start || 0;
    fd_end = fd_end || FS.MAX_OPEN_FDS;
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(24);
  },
  getStream: function (fd) {
    return FS.streams[fd];
  },
  createStream: function (stream, fd_start, fd_end) {
    if (!FS.FSStream) {
      FS.FSStream = function () {};
      FS.FSStream.prototype = {};
      // compatibility
      Object.defineProperties(FS.FSStream.prototype, {
        object: {
          get: function () {
            return this.node;
          },
          set: function (val) {
            this.node = val;
          },
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1;
          },
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0;
          },
        },
        isAppend: {
          get: function () {
            return this.flags & 1024;
          },
        },
      });
    }
    // clone it, so we can return an instance of FSStream
    var newStream = new FS.FSStream();
    for (var p in stream) {
      newStream[p] = stream[p];
    }
    stream = newStream;
    var fd = FS.nextfd(fd_start, fd_end);
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream: function (fd) {
    FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
    open: function (stream) {
      var device = FS.getDevice(stream.node.rdev);
      // override node's stream ops with the device's
      stream.stream_ops = device.stream_ops;
      // forward the open call
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    },
    llseek: function () {
      throw new FS.ErrnoError(29);
    },
  },
  major: function (dev) {
    return dev >> 8;
  },
  minor: function (dev) {
    return dev & 0xff;
  },
  makedev: function (ma, mi) {
    return (ma << 8) | mi;
  },
  registerDevice: function (dev, ops) {
    FS.devices[dev] = { stream_ops: ops };
  },
  getDevice: function (dev) {
    return FS.devices[dev];
  },
  getMounts: function (mount) {
    var mounts = [];
    var check = [mount];

    while (check.length) {
      var m = check.pop();

      mounts.push(m);

      check.push.apply(check, m.mounts);
    }

    return mounts;
  },
  syncfs: function (populate, callback) {
    if (typeof populate === "function") {
      callback = populate;
      populate = false;
    }

    FS.syncFSRequests++;

    if (FS.syncFSRequests > 1) {
      console.log(
        "warning: " +
          FS.syncFSRequests +
          " FS.syncfs operations in flight at once, probably just doing extra work",
      );
    }

    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;

    function doCallback(err) {
      assert(FS.syncFSRequests > 0);
      FS.syncFSRequests--;
      return callback(err);
    }

    function done(err) {
      if (err) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(err);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }

    // sync all mounts
    mounts.forEach(function (mount) {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount: function (type, opts, mountpoint) {
    var root = mountpoint === "/";
    var pseudo = !mountpoint;
    var node;

    if (root && FS.root) {
      throw new FS.ErrnoError(16);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });

      mountpoint = lookup.path; // use the absolute path
      node = lookup.node;

      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(16);
      }

      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(20);
      }
    }

    var mount = {
      type: type,
      opts: opts,
      mountpoint: mountpoint,
      mounts: [],
    };

    // create a root node for the fs
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;

    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      // set as a mountpoint
      node.mounted = mount;

      // add the new mount to the current mount's children
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }

    return mountRoot;
  },
  unmount: function (mountpoint) {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false });

    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(22);
    }

    // destroy the nodes for this mount, and all its child mounts
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);

    Object.keys(FS.nameTable).forEach(function (hash) {
      var current = FS.nameTable[hash];

      while (current) {
        var next = current.name_next;

        if (mounts.indexOf(current.mount) !== -1) {
          FS.destroyNode(current);
        }

        current = next;
      }
    });

    // no longer a mountpoint
    node.mounted = null;

    // remove this mount from the child mounts
    var idx = node.mount.mounts.indexOf(mount);
    assert(idx !== -1);
    node.mount.mounts.splice(idx, 1);
  },
  lookup: function (parent, name) {
    return parent.node_ops.lookup(parent, name);
  },
  mknod: function (path, mode, dev) {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === "." || name === "..") {
      throw new FS.ErrnoError(22);
    }
    var err = FS.mayCreate(parent, name);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(1);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: function (path, mode) {
    mode = mode !== undefined ? mode : 438 /* 0666 */;
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir: function (path, mode) {
    mode = mode !== undefined ? mode : 511 /* 0777 */;
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree: function (path, mode) {
    var dirs = path.split("/");
    var d = "";
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += "/" + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 17) throw e;
      }
    }
  },
  mkdev: function (path, mode, dev) {
    if (typeof dev === "undefined") {
      dev = mode;
      mode = 438 /* 0666 */;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink: function (oldpath, newpath) {
    if (!PATH.resolve(oldpath)) {
      throw new FS.ErrnoError(2);
    }
    var lookup = FS.lookupPath(newpath, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(2);
    }
    var newname = PATH.basename(newpath);
    var err = FS.mayCreate(parent, newname);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(1);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: function (old_path, new_path) {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    // parents must exist
    var lookup, old_dir, new_dir;
    try {
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
    } catch (e) {
      throw new FS.ErrnoError(16);
    }
    if (!old_dir || !new_dir) throw new FS.ErrnoError(2);
    // need to be part of the same mount
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(18);
    }
    // source must exist
    var old_node = FS.lookupNode(old_dir, old_name);
    // old path should not be an ancestor of the new path
    var relative = PATH.relative(old_path, new_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(22);
    }
    // new path should not be an ancestor of the old path
    relative = PATH.relative(new_path, old_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(39);
    }
    // see if the new path already exists
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {
      // not fatal
    }
    // early out if nothing needs to change
    if (old_node === new_node) {
      return;
    }
    // we'll need to delete the old entry
    var isdir = FS.isDir(old_node.mode);
    var err = FS.mayDelete(old_dir, old_name, isdir);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    // need delete permissions if we'll be overwriting.
    // need create permissions if new doesn't already exist.
    err = new_node
      ? FS.mayDelete(new_dir, new_name, isdir)
      : FS.mayCreate(new_dir, new_name);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(1);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(16);
    }
    // if we are going to change the parent, check write permissions
    if (new_dir !== old_dir) {
      err = FS.nodePermissions(old_dir, "w");
      if (err) {
        throw new FS.ErrnoError(err);
      }
    }
    try {
      if (FS.trackingDelegate["willMovePath"]) {
        FS.trackingDelegate["willMovePath"](old_path, new_path);
      }
    } catch (e) {
      console.log(
        "FS.trackingDelegate['willMovePath']('" +
          old_path +
          "', '" +
          new_path +
          "') threw an exception: " +
          e.message,
      );
    }
    // remove the node from the lookup hash
    FS.hashRemoveNode(old_node);
    // do the underlying fs rename
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
    } catch (e) {
      throw e;
    } finally {
      // add the node back to the hash (in case node_ops.rename
      // changed its name)
      FS.hashAddNode(old_node);
    }
    try {
      if (FS.trackingDelegate["onMovePath"])
        FS.trackingDelegate["onMovePath"](old_path, new_path);
    } catch (e) {
      console.log(
        "FS.trackingDelegate['onMovePath']('" +
          old_path +
          "', '" +
          new_path +
          "') threw an exception: " +
          e.message,
      );
    }
  },
  rmdir: function (path) {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var err = FS.mayDelete(parent, name, true);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(1);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(16);
    }
    try {
      if (FS.trackingDelegate["willDeletePath"]) {
        FS.trackingDelegate["willDeletePath"](path);
      }
    } catch (e) {
      console.log(
        "FS.trackingDelegate['willDeletePath']('" +
          path +
          "') threw an exception: " +
          e.message,
      );
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
    try {
      if (FS.trackingDelegate["onDeletePath"])
        FS.trackingDelegate["onDeletePath"](path);
    } catch (e) {
      console.log(
        "FS.trackingDelegate['onDeletePath']('" +
          path +
          "') threw an exception: " +
          e.message,
      );
    }
  },
  readdir: function (path) {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(20);
    }
    return node.node_ops.readdir(node);
  },
  unlink: function (path) {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var err = FS.mayDelete(parent, name, false);
    if (err) {
      // According to POSIX, we should map EISDIR to EPERM, but
      // we instead do what Linux does (and we must, as we use
      // the musl linux libc).
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(1);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(16);
    }
    try {
      if (FS.trackingDelegate["willDeletePath"]) {
        FS.trackingDelegate["willDeletePath"](path);
      }
    } catch (e) {
      console.log(
        "FS.trackingDelegate['willDeletePath']('" +
          path +
          "') threw an exception: " +
          e.message,
      );
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
    try {
      if (FS.trackingDelegate["onDeletePath"])
        FS.trackingDelegate["onDeletePath"](path);
    } catch (e) {
      console.log(
        "FS.trackingDelegate['onDeletePath']('" +
          path +
          "') threw an exception: " +
          e.message,
      );
    }
  },
  readlink: function (path) {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(2);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(22);
    }
    return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
  },
  stat: function (path, dontFollow) {
    var lookup = FS.lookupPath(path, { follow: !dontFollow });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(2);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(1);
    }
    return node.node_ops.getattr(node);
  },
  lstat: function (path) {
    return FS.stat(path, true);
  },
  chmod: function (path, mode, dontFollow) {
    var node;
    if (typeof path === "string") {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(1);
    }
    node.node_ops.setattr(node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      timestamp: Date.now(),
    });
  },
  lchmod: function (path, mode) {
    FS.chmod(path, mode, true);
  },
  fchmod: function (fd, mode) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(9);
    }
    FS.chmod(stream.node, mode);
  },
  chown: function (path, uid, gid, dontFollow) {
    var node;
    if (typeof path === "string") {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(1);
    }
    node.node_ops.setattr(node, {
      timestamp: Date.now(),
      // we ignore the uid / gid for now
    });
  },
  lchown: function (path, uid, gid) {
    FS.chown(path, uid, gid, true);
  },
  fchown: function (fd, uid, gid) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(9);
    }
    FS.chown(stream.node, uid, gid);
  },
  truncate: function (path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(22);
    }
    var node;
    if (typeof path === "string") {
      var lookup = FS.lookupPath(path, { follow: true });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(1);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(21);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(22);
    }
    var err = FS.nodePermissions(node, "w");
    if (err) {
      throw new FS.ErrnoError(err);
    }
    node.node_ops.setattr(node, {
      size: len,
      timestamp: Date.now(),
    });
  },
  ftruncate: function (fd, len) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(9);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(22);
    }
    FS.truncate(stream.node, len);
  },
  utime: function (path, atime, mtime) {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    node.node_ops.setattr(node, {
      timestamp: Math.max(atime, mtime),
    });
  },
  open: function (path, flags, mode, fd_start, fd_end) {
    if (path === "") {
      throw new FS.ErrnoError(2);
    }
    flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
    mode = typeof mode === "undefined" ? 438 /* 0666 */ : mode;
    if (flags & 64) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path === "object") {
      node = path;
    } else {
      path = PATH.normalize(path);
      try {
        var lookup = FS.lookupPath(path, {
          follow: !(flags & 131072),
        });
        node = lookup.node;
      } catch (e) {
        // ignore
      }
    }
    // perhaps we need to create the node
    var created = false;
    if (flags & 64) {
      if (node) {
        // if O_CREAT and O_EXCL are set, error out if the node already exists
        if (flags & 128) {
          throw new FS.ErrnoError(17);
        }
      } else {
        // node doesn't exist, try to create it
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(2);
    }
    // can't truncate a device
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    // if asked only for a directory, then this must be one
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(20);
    }
    // check permissions, if this is not a file we just created now (it is ok to
    // create and write to a file with read-only permissions; it is read-only
    // for later use)
    if (!created) {
      var err = FS.mayOpen(node, flags);
      if (err) {
        throw new FS.ErrnoError(err);
      }
    }
    // do truncation if necessary
    if (flags & 512) {
      FS.truncate(node, 0);
    }
    // we've already handled these, don't pass down to the underlying vfs
    flags &= ~(128 | 512);

    // register the stream with the filesystem
    var stream = FS.createStream(
      {
        node: node,
        path: FS.getPath(node), // we want the absolute path to the node
        flags: flags,
        seekable: true,
        position: 0,
        stream_ops: node.stream_ops,
        // used by the file family libc calls (fopen, fwrite, ferror, etc.)
        ungotten: [],
        error: false,
      },
      fd_start,
      fd_end,
    );
    // call the new stream's open function
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module["logReadFiles"] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {};
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
        console.log("FS.trackingDelegate error on read file: " + path);
      }
    }
    try {
      if (FS.trackingDelegate["onOpenFile"]) {
        var trackingFlags = 0;
        if ((flags & 2097155) !== 1) {
          trackingFlags |= FS.tracking.openFlags.READ;
        }
        if ((flags & 2097155) !== 0) {
          trackingFlags |= FS.tracking.openFlags.WRITE;
        }
        FS.trackingDelegate["onOpenFile"](path, trackingFlags);
      }
    } catch (e) {
      console.log(
        "FS.trackingDelegate['onOpenFile']('" +
          path +
          "', flags) threw an exception: " +
          e.message,
      );
    }
    return stream;
  },
  close: function (stream) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(9);
    }
    if (stream.getdents) stream.getdents = null; // free readdir state
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed: function (stream) {
    return stream.fd === null;
  },
  llseek: function (stream, offset, whence) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(9);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(29);
    }
    if (
      whence != 0 /* SEEK_SET */ &&
      whence != 1 /* SEEK_CUR */ &&
      whence != 2 /* SEEK_END */
    ) {
      throw new FS.ErrnoError(22);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read: function (stream, buffer, offset, length, position) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(22);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(9);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(9);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(21);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(22);
    }
    var seeking = typeof position !== "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(29);
    }
    var bytesRead = stream.stream_ops.read(
      stream,
      buffer,
      offset,
      length,
      position,
    );
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write: function (stream, buffer, offset, length, position, canOwn) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(22);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(9);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(9);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(21);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(22);
    }
    if (stream.flags & 1024) {
      // seek to the end before writing in append mode
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position !== "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(29);
    }
    var bytesWritten = stream.stream_ops.write(
      stream,
      buffer,
      offset,
      length,
      position,
      canOwn,
    );
    if (!seeking) stream.position += bytesWritten;
    try {
      if (stream.path && FS.trackingDelegate["onWriteToFile"])
        FS.trackingDelegate["onWriteToFile"](stream.path);
    } catch (e) {
      console.log(
        "FS.trackingDelegate['onWriteToFile']('" +
          stream.path +
          "') threw an exception: " +
          e.message,
      );
    }
    return bytesWritten;
  },
  allocate: function (stream, offset, length) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(9);
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(22);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(9);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(19);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(95);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: function (stream, buffer, offset, length, position, prot, flags) {
    // TODO if PROT is PROT_WRITE, make sure we have write access
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(13);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(19);
    }
    return stream.stream_ops.mmap(
      stream,
      buffer,
      offset,
      length,
      position,
      prot,
      flags,
    );
  },
  msync: function (stream, buffer, offset, length, mmapFlags) {
    if (!stream || !stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: function (stream) {
    return 0;
  },
  ioctl: function (stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(25);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: function (path, opts) {
    opts = opts || {};
    opts.flags = opts.flags || "r";
    opts.encoding = opts.encoding || "binary";
    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === "utf8") {
      ret = UTF8ArrayToString(buf, 0);
    } else if (opts.encoding === "binary") {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile: function (path, data, opts) {
    opts = opts || {};
    opts.flags = opts.flags || "w";
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data === "string") {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error("Unsupported data type");
    }
    FS.close(stream);
  },
  cwd: function () {
    return FS.currentPath;
  },
  chdir: function (path) {
    var lookup = FS.lookupPath(path, { follow: true });
    if (lookup.node === null) {
      throw new FS.ErrnoError(2);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(20);
    }
    var err = FS.nodePermissions(lookup.node, "x");
    if (err) {
      throw new FS.ErrnoError(err);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories: function () {
    FS.mkdir("/tmp");
    FS.mkdir("/home");
    FS.mkdir("/home/web_user");
  },
  createDefaultDevices: function () {
    // create /dev
    FS.mkdir("/dev");
    // setup /dev/null
    FS.registerDevice(FS.makedev(1, 3), {
      read: function () {
        return 0;
      },
      write: function (stream, buffer, offset, length, pos) {
        return length;
      },
    });
    FS.mkdev("/dev/null", FS.makedev(1, 3));
    // setup /dev/tty and /dev/tty1
    // stderr needs to print output using Module['printErr']
    // so we register a second tty just for it.
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev("/dev/tty", FS.makedev(5, 0));
    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
    // setup /dev/[u]random
    var random_device;
    if (
      typeof crypto === "object" &&
      typeof crypto["getRandomValues"] === "function"
    ) {
      // for modern web browsers
      var randomBuffer = new Uint8Array(1);
      random_device = function () {
        crypto.getRandomValues(randomBuffer);
        return randomBuffer[0];
      };
    } else if (ENVIRONMENT_IS_NODE) {
      // for nodejs with or without crypto support included
      try {
        var crypto_module = require("crypto");
        // nodejs has crypto support
        random_device = function () {
          return crypto_module["randomBytes"](1)[0];
        };
      } catch (e) {
        // nodejs doesn't have crypto support so fallback to Math.random
        random_device = function () {
          return (Math.random() * 256) | 0;
        };
      }
    } else {
      // default for ES5 platforms
      random_device = function () {
        abort(
          "random_device",
        ); /*Math.random() is not safe for random number generation, so this fallback random_device implementation aborts... see emscripten-core/emscripten/pull/7096 */
      };
    }
    FS.createDevice("/dev", "random", random_device);
    FS.createDevice("/dev", "urandom", random_device);
    // we're not going to emulate the actual shm device,
    // just create the tmp dirs that reside in it commonly
    FS.mkdir("/dev/shm");
    FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories: function () {
    // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the name of the stream for fd 6 (see test_unistd_ttyname)
    FS.mkdir("/proc");
    FS.mkdir("/proc/self");
    FS.mkdir("/proc/self/fd");
    FS.mount(
      {
        mount: function () {
          var node = FS.createNode(
            "/proc/self",
            "fd",
            16384 | 511 /* 0777 */,
            73,
          );
          node.node_ops = {
            lookup: function (parent, name) {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(9);
              var ret = {
                parent: null,
                mount: { mountpoint: "fake" },
                node_ops: {
                  readlink: function () {
                    return stream.path;
                  },
                },
              };
              ret.parent = ret; // make it look like a simple root node
              return ret;
            },
          };
          return node;
        },
      },
      {},
      "/proc/self/fd",
    );
  },
  createStandardStreams: function () {
    // TODO deprecate the old functionality of a single
    // input / output callback and that utilizes FS.createDevice
    // and instead require a unique set of stream ops

    // by default, we symlink the standard streams to the
    // default tty devices. however, if the standard streams
    // have been overwritten we create a unique device for
    // them instead.
    if (Module["stdin"]) {
      FS.createDevice("/dev", "stdin", Module["stdin"]);
    } else {
      FS.symlink("/dev/tty", "/dev/stdin");
    }
    if (Module["stdout"]) {
      FS.createDevice("/dev", "stdout", null, Module["stdout"]);
    } else {
      FS.symlink("/dev/tty", "/dev/stdout");
    }
    if (Module["stderr"]) {
      FS.createDevice("/dev", "stderr", null, Module["stderr"]);
    } else {
      FS.symlink("/dev/tty1", "/dev/stderr");
    }

    // open default streams for the stdin, stdout and stderr devices
    var stdin = FS.open("/dev/stdin", "r");
    assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");

    var stdout = FS.open("/dev/stdout", "w");
    assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");

    var stderr = FS.open("/dev/stderr", "w");
    assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
  },
  ensureErrnoError: function () {
    if (FS.ErrnoError) return;
    FS.ErrnoError = function ErrnoError(errno, node) {
      this.node = node;
      this.setErrno = function (errno) {
        this.errno = errno;
        for (var key in ERRNO_CODES) {
          if (ERRNO_CODES[key] === errno) {
            this.code = key;
            break;
          }
        }
      };
      this.setErrno(errno);
      this.message = ERRNO_MESSAGES[errno];
      // Node.js compatibility: assigning on this.stack fails on Node 4 (but fixed on Node 8)
      if (this.stack)
        Object.defineProperty(this, "stack", {
          value: new Error().stack,
          writable: true,
        });
      if (this.stack) this.stack = demangleAll(this.stack);
    };
    FS.ErrnoError.prototype = new Error();
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
    [2].forEach(function (code) {
      FS.genericErrors[code] = new FS.ErrnoError(code);
      FS.genericErrors[code].stack = "<generic error, no stack>";
    });
  },
  staticInit: function () {
    FS.ensureErrnoError();

    FS.nameTable = new Array(4096);

    FS.mount(MEMFS, {}, "/");

    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();

    FS.filesystems = {
      MEMFS: MEMFS,
      IDBFS: IDBFS,
      NODEFS: NODEFS,
      WORKERFS: WORKERFS,
    };
  },
  init: function (input, output, error) {
    assert(
      !FS.init.initialized,
      "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)",
    );
    FS.init.initialized = true;

    FS.ensureErrnoError();

    // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
    Module["stdin"] = input || Module["stdin"];
    Module["stdout"] = output || Module["stdout"];
    Module["stderr"] = error || Module["stderr"];

    FS.createStandardStreams();
  },
  quit: function () {
    FS.init.initialized = false;
    // force-flush all streams, so we get musl std streams printed out
    var fflush = Module["_fflush"];
    if (fflush) fflush(0);
    // close all of our streams
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  getMode: function (canRead, canWrite) {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  },
  joinPath: function (parts, forceRelative) {
    var path = PATH.join.apply(null, parts);
    if (forceRelative && path[0] == "/") path = path.substr(1);
    return path;
  },
  absolutePath: function (relative, base) {
    return PATH.resolve(base, relative);
  },
  standardizePath: function (path) {
    return PATH.normalize(path);
  },
  findObject: function (path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      ___setErrNo(ret.error);
      return null;
    }
  },
  analyzePath: function (path, dontResolveLastLink) {
    // operate from within the context of the symlink's target
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
    };
    try {
      var lookup = FS.lookupPath(path, { parent: true });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === "/";
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createFolder: function (parent, name, canRead, canWrite) {
    var path = PATH.join2(
      typeof parent === "string" ? parent : FS.getPath(parent),
      name,
    );
    var mode = FS.getMode(canRead, canWrite);
    return FS.mkdir(path, mode);
  },
  createPath: function (parent, path, canRead, canWrite) {
    parent = typeof parent === "string" ? parent : FS.getPath(parent);
    var parts = path.split("/").reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {
        // ignore EEXIST
      }
      parent = current;
    }
    return current;
  },
  createFile: function (parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(
      typeof parent === "string" ? parent : FS.getPath(parent),
      name,
    );
    var mode = FS.getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
    var path = name
      ? PATH.join2(
          typeof parent === "string" ? parent : FS.getPath(parent),
          name,
        )
      : parent;
    var mode = FS.getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data === "string") {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i)
          arr[i] = data.charCodeAt(i);
        data = arr;
      }
      // make sure we can write to the file
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, "w");
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
    return node;
  },
  createDevice: function (parent, name, input, output) {
    var path = PATH.join2(
      typeof parent === "string" ? parent : FS.getPath(parent),
      name,
    );
    var mode = FS.getMode(!!input, !!output);
    if (!FS.createDevice.major) FS.createDevice.major = 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    // Create a fake device that a set of stream ops to emulate
    // the old behavior.
    FS.registerDevice(dev, {
      open: function (stream) {
        stream.seekable = false;
      },
      close: function (stream) {
        // flush any pending line data
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      },
      read: function (stream, buffer, offset, length, pos /* ignored */) {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(5);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(11);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      },
      write: function (stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(5);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      },
    });
    return FS.mkdev(path, mode, dev);
  },
  createLink: function (parent, name, target, canRead, canWrite) {
    var path = PATH.join2(
      typeof parent === "string" ? parent : FS.getPath(parent),
      name,
    );
    return FS.symlink(target, path);
  },
  forceLoadFile: function (obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    var success = true;
    if (typeof XMLHttpRequest !== "undefined") {
      throw new Error(
        "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.",
      );
    } else if (Module["read"]) {
      // Command-line.
      try {
        // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
        //          read() will try to parse UTF8.
        obj.contents = intArrayFromString(Module["read"](obj.url), true);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        success = false;
      }
    } else {
      throw new Error("Cannot load without read() or XMLHttpRequest.");
    }
    if (!success) ___setErrNo(5);
    return success;
  },
  createLazyFile: function (parent, name, url, canRead, canWrite) {
    // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
    function LazyUint8Array() {
      this.lengthKnown = false;
      this.chunks = []; // Loaded chunks. Index is the chunk number
    }

    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined;
      }
      var chunkOffset = idx % this.chunkSize;
      var chunkNum = (idx / this.chunkSize) | 0;
      return this.getter(chunkNum)[chunkOffset];
    };
    LazyUint8Array.prototype.setDataGetter =
      function LazyUint8Array_setDataGetter(getter) {
        this.getter = getter;
      };
    LazyUint8Array.prototype.cacheLength =
      function LazyUint8Array_cacheLength() {
        // Find length
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing =
          (header = xhr.getResponseHeader("Accept-Ranges")) &&
          header === "bytes";
        var usesGzip =
          (header = xhr.getResponseHeader("Content-Encoding")) &&
          header === "gzip";

        var chunkSize = 1024 * 1024; // Chunk size in bytes

        if (!hasByteServing) chunkSize = datalength;

        // Function to get a range from the remote URL.
        var doXHR = function (from, to) {
          if (from > to)
            throw new Error(
              "invalid range (" + from + ", " + to + ") or no bytes requested!",
            );
          if (to > datalength - 1)
            throw new Error(
              "only " + datalength + " bytes available! programmer error!",
            );

          // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          if (datalength !== chunkSize)
            xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);

          // Some hints to the browser that we want binary data.
          if (typeof Uint8Array != "undefined")
            xhr.responseType = "arraybuffer";
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }

          xhr.send(null);
          if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(xhr.response || []);
          } else {
            return intArrayFromString(xhr.responseText || "", true);
          }
        };
        var lazyArray = this;
        lazyArray.setDataGetter(function (chunkNum) {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1; // including this byte
          end = Math.min(end, datalength - 1); // if datalength-1 is selected, this is the last block
          if (typeof lazyArray.chunks[chunkNum] === "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] === "undefined")
            throw new Error("doXHR failed!");
          return lazyArray.chunks[chunkNum];
        });

        if (usesGzip || !datalength) {
          // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
          chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
          datalength = this.getter(0).length;
          chunkSize = datalength;
          console.log(
            "LazyFiles on gzip forces download of the whole file when length is accessed",
          );
        }

        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
    if (typeof XMLHttpRequest !== "undefined") {
      if (!ENVIRONMENT_IS_WORKER)
        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
      var lazyArray = new LazyUint8Array();
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          },
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          },
        },
      });

      var properties = { isDevice: false, contents: lazyArray };
    } else {
      var properties = { isDevice: false, url: url };
    }

    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    // This is a total hack, but I want to get this lazy file code out of the
    // core of MEMFS. If we want to keep this lazy file concept I feel it should
    // be its own thin LAZYFS proxying calls to MEMFS.
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    // Add a function that defers querying the file size until it is asked the first time.
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length;
        },
      },
    });
    // override each stream op with one that tries to force load the lazy file first
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach(function (key) {
      var fn = node.stream_ops[key];
      stream_ops[key] = function forceLoadLazyFile() {
        if (!FS.forceLoadFile(node)) {
          throw new FS.ErrnoError(5);
        }
        return fn.apply(null, arguments);
      };
    });
    // use a custom read function
    stream_ops.read = function stream_ops_read(
      stream,
      buffer,
      offset,
      length,
      position,
    ) {
      if (!FS.forceLoadFile(node)) {
        throw new FS.ErrnoError(5);
      }
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      assert(size >= 0);
      if (contents.slice) {
        // normal array
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          // LazyUint8Array from sync binary XHR
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    };
    node.stream_ops = stream_ops;
    return node;
  },
  createPreloadedFile: function (
    parent,
    name,
    url,
    canRead,
    canWrite,
    onload,
    onerror,
    dontCreateFile,
    canOwn,
    preFinish,
  ) {
    Browser.init(); // XXX perhaps this method should move onto Browser?
    // TODO we should allow people to just pass in a complete filename instead
    // of parent and name being that we just join them anyways
    var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency("cp " + fullname); // might have several active requests for the same fullname
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish();
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        if (onload) onload();
        removeRunDependency(dep);
      }

      var handled = false;
      Module["preloadPlugins"].forEach(function (plugin) {
        if (handled) return;
        if (plugin["canHandle"](fullname)) {
          plugin["handle"](byteArray, fullname, finish, function () {
            if (onerror) onerror();
            removeRunDependency(dep);
          });
          handled = true;
        }
      });
      if (!handled) finish(byteArray);
    }

    addRunDependency(dep);
    if (typeof url == "string") {
      Browser.asyncLoad(
        url,
        function (byteArray) {
          processData(byteArray);
        },
        onerror,
      );
    } else {
      processData(url);
    }
  },
  indexedDB: function () {
    return (
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB
    );
  },
  DB_NAME: function () {
    return "EM_FS_" + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: "FILE_DATA",
  saveFilesToDB: function (paths, onload, onerror) {
    onload = onload || function () {};
    onerror = onerror || function () {};
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
      console.log("creating db");
      var db = openRequest.result;
      db.createObjectStore(FS.DB_STORE_NAME);
    };
    openRequest.onsuccess = function openRequest_onsuccess() {
      var db = openRequest.result;
      var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;

      function finish() {
        if (fail == 0) onload();
        else onerror();
      }

      paths.forEach(function (path) {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path);
        putRequest.onsuccess = function putRequest_onsuccess() {
          ok++;
          if (ok + fail == total) finish();
        };
        putRequest.onerror = function putRequest_onerror() {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
  loadFilesFromDB: function (paths, onload, onerror) {
    onload = onload || function () {};
    onerror = onerror || function () {};
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = onerror; // no database to load from
    openRequest.onsuccess = function openRequest_onsuccess() {
      var db = openRequest.result;
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
      } catch (e) {
        onerror(e);
        return;
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;

      function finish() {
        if (fail == 0) onload();
        else onerror();
      }

      paths.forEach(function (path) {
        var getRequest = files.get(path);
        getRequest.onsuccess = function getRequest_onsuccess() {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path);
          }
          FS.createDataFile(
            PATH.dirname(path),
            PATH.basename(path),
            getRequest.result,
            true,
            true,
            true,
          );
          ok++;
          if (ok + fail == total) finish();
        };
        getRequest.onerror = function getRequest_onerror() {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
};
window.FS = FS;
var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  mappings: {},
  umask: 511,
  calculateAt: function (dirfd, path) {
    if (path[0] !== "/") {
      // relative path
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = FS.getStream(dirfd);
        if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        dir = dirstream.path;
      }
      path = PATH.join2(dir, path);
    }
    return path;
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path);
    } catch (e) {
      if (
        e &&
        e.node &&
        PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
      ) {
        // an error occurred while trying to look up the path; we should just report ENOTDIR
        return -ERRNO_CODES.ENOTDIR;
      }
      throw e;
    }
    HEAP32[buf >> 2] = stat.dev;
    HEAP32[(buf + 4) >> 2] = 0;
    HEAP32[(buf + 8) >> 2] = stat.ino;
    HEAP32[(buf + 12) >> 2] = stat.mode;
    HEAP32[(buf + 16) >> 2] = stat.nlink;
    HEAP32[(buf + 20) >> 2] = stat.uid;
    HEAP32[(buf + 24) >> 2] = stat.gid;
    HEAP32[(buf + 28) >> 2] = stat.rdev;
    HEAP32[(buf + 32) >> 2] = 0;
    HEAP32[(buf + 36) >> 2] = stat.size;
    HEAP32[(buf + 40) >> 2] = 4096;
    HEAP32[(buf + 44) >> 2] = stat.blocks;
    HEAP32[(buf + 48) >> 2] = (stat.atime.getTime() / 1000) | 0;
    HEAP32[(buf + 52) >> 2] = 0;
    HEAP32[(buf + 56) >> 2] = (stat.mtime.getTime() / 1000) | 0;
    HEAP32[(buf + 60) >> 2] = 0;
    HEAP32[(buf + 64) >> 2] = (stat.ctime.getTime() / 1000) | 0;
    HEAP32[(buf + 68) >> 2] = 0;
    HEAP32[(buf + 72) >> 2] = stat.ino;
    return 0;
  },
  doMsync: function (addr, stream, len, flags) {
    var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
    FS.msync(stream, buffer, 0, len, flags);
  },
  doMkdir: function (path, mode) {
    // remove a trailing slash, if one - /a/b/ has basename of '', but
    // we want to create b in the context of this function
    path = PATH.normalize(path);
    if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
    FS.mkdir(path, mode, 0);
    return 0;
  },
  doMknod: function (path, mode, dev) {
    // we don't want this in the JS API as it uses mknod to create all nodes.
    switch (mode & 61440) {
      case 32768:
      case 8192:
      case 24576:
      case 4096:
      case 49152:
        break;
      default:
        return -ERRNO_CODES.EINVAL;
    }
    FS.mknod(path, mode, dev);
    return 0;
  },
  doReadlink: function (path, buf, bufsize) {
    if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
    var ret = FS.readlink(path);

    var len = Math.min(bufsize, lengthBytesUTF8(ret));
    var endChar = HEAP8[buf + len];
    stringToUTF8(ret, buf, bufsize + 1);
    // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
    // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
    HEAP8[buf + len] = endChar;

    return len;
  },
  doAccess: function (path, amode) {
    if (amode & ~7) {
      // need a valid mode
      return -ERRNO_CODES.EINVAL;
    }
    var node;
    var lookup = FS.lookupPath(path, { follow: true });
    node = lookup.node;
    var perms = "";
    if (amode & 4) perms += "r";
    if (amode & 2) perms += "w";
    if (amode & 1) perms += "x";
    if (
      perms /* otherwise, they've just passed F_OK */ &&
      FS.nodePermissions(node, perms)
    ) {
      return -ERRNO_CODES.EACCES;
    }
    return 0;
  },
  doDup: function (path, flags, suggestFD) {
    var suggest = FS.getStream(suggestFD);
    if (suggest) FS.close(suggest);
    return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
  },
  doReadv: function (stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      var curr = FS.read(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
      if (curr < len) break; // nothing more to read
    }
    return ret;
  },
  doWritev: function (stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      var curr = FS.write(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
    }
    return ret;
  },
  varargs: 0,
  get: function (varargs) {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function () {
    var ret = UTF8ToString(SYSCALLS.get());
    return ret;
  },
  getStreamFromFD: function () {
    var stream = FS.getStream(SYSCALLS.get());
    if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    return stream;
  },
  getSocketFromFD: function () {
    var socket = SOCKFS.getSocket(SYSCALLS.get());
    if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    return socket;
  },
  getSocketAddress: function (allowNull) {
    var addrp = SYSCALLS.get(),
      addrlen = SYSCALLS.get();
    if (allowNull && addrp === 0) return null;
    var info = __read_sockaddr(addrp, addrlen);
    if (info.errno) throw new FS.ErrnoError(info.errno);
    info.addr = DNS.lookup_addr(info.addr) || info.addr;
    return info;
  },
  get64: function () {
    var low = SYSCALLS.get(),
      high = SYSCALLS.get();
    if (low >= 0) assert(high === 0);
    else assert(high === -1);
    return low;
  },
  getZero: function () {
    assert(SYSCALLS.get() === 0);
  },
};

function ___syscall10(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // unlink
    var path = SYSCALLS.getStr();
    FS.unlink(path);
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall114(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // wait4
    abort("cannot wait on child processes");
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall140(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // llseek
    var stream = SYSCALLS.getStreamFromFD(),
      offset_high = SYSCALLS.get(),
      offset_low = SYSCALLS.get(),
      result = SYSCALLS.get(),
      whence = SYSCALLS.get();
    // NOTE: offset_high is unused - Emscripten's off_t is 32-bit
    var offset = offset_low;
    FS.llseek(stream, offset, whence);
    HEAP32[result >> 2] = stream.position;
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall145(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // readv
    var stream = SYSCALLS.getStreamFromFD(),
      iov = SYSCALLS.get(),
      iovcnt = SYSCALLS.get();
    return SYSCALLS.doReadv(stream, iov, iovcnt);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall146(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // writev
    var stream = SYSCALLS.getStreamFromFD(),
      iov = SYSCALLS.get(),
      iovcnt = SYSCALLS.get();
    return SYSCALLS.doWritev(stream, iov, iovcnt);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall180(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // pread64
    var stream = SYSCALLS.getStreamFromFD(),
      buf = SYSCALLS.get(),
      count = SYSCALLS.get(),
      zero = SYSCALLS.getZero(),
      offset = SYSCALLS.get64();
    return FS.read(stream, HEAP8, buf, count, offset);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall181(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // pwrite64
    var stream = SYSCALLS.getStreamFromFD(),
      buf = SYSCALLS.get(),
      count = SYSCALLS.get(),
      zero = SYSCALLS.getZero(),
      offset = SYSCALLS.get64();
    return FS.write(stream, HEAP8, buf, count, offset);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall195(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // SYS_stat64
    var path = SYSCALLS.getStr(),
      buf = SYSCALLS.get();
    return SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall197(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // SYS_fstat64
    var stream = SYSCALLS.getStreamFromFD(),
      buf = SYSCALLS.get();
    return SYSCALLS.doStat(FS.stat, stream.path, buf);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall220(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // SYS_getdents64
    var stream = SYSCALLS.getStreamFromFD(),
      dirp = SYSCALLS.get(),
      count = SYSCALLS.get();
    if (!stream.getdents) {
      stream.getdents = FS.readdir(stream.path);
    }
    var pos = 0;
    while (stream.getdents.length > 0 && pos + 268 <= count) {
      var id;
      var type;
      var name = stream.getdents.pop();
      if (name[0] === ".") {
        id = 1;
        type = 4; // DT_DIR
      } else {
        var child = FS.lookupNode(stream.node, name);
        id = child.id;
        type = FS.isChrdev(child.mode)
          ? 2 // DT_CHR, character device.
          : FS.isDir(child.mode)
            ? 4 // DT_DIR, directory.
            : FS.isLink(child.mode)
              ? 10 // DT_LNK, symbolic link.
              : 8; // DT_REG, regular file.
      }
      HEAP32[(dirp + pos) >> 2] = id;
      HEAP32[(dirp + pos + 4) >> 2] = stream.position;
      HEAP16[(dirp + pos + 8) >> 1] = 268;
      HEAP8[(dirp + pos + 10) >> 0] = type;
      stringToUTF8(name, dirp + pos + 11, 256);
      pos += 268;
    }
    return pos;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall221(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // fcntl64
    var stream = SYSCALLS.getStreamFromFD(),
      cmd = SYSCALLS.get();
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get();
        if (arg < 0) {
          return -ERRNO_CODES.EINVAL;
        }
        var newStream;
        newStream = FS.open(stream.path, stream.flags, 0, arg);
        return newStream.fd;
      }
      case 1:
      case 2:
        return 0; // FD_CLOEXEC makes no sense for a single process.
      case 3:
        return stream.flags;
      case 4: {
        var arg = SYSCALLS.get();
        stream.flags |= arg;
        return 0;
      }
      case 12 /* case 12: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */: {
        var arg = SYSCALLS.get();
        var offset = 0;
        // We're always unlocked.
        HEAP16[(arg + offset) >> 1] = 2;
        return 0;
      }
      case 13:
      case 14:
        /* case 13: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 14: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */

        return 0; // Pretend that the locking is successful.
      case 16:
      case 8:
        return -ERRNO_CODES.EINVAL; // These are for sockets. We don't have them fully implemented yet.
      case 9:
        // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      default: {
        return -ERRNO_CODES.EINVAL;
      }
    }
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall3(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // read
    var stream = SYSCALLS.getStreamFromFD(),
      buf = SYSCALLS.get(),
      count = SYSCALLS.get();
    return FS.read(stream, HEAP8, buf, count);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall330(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // dup3
    var old = SYSCALLS.getStreamFromFD(),
      suggestFD = SYSCALLS.get(),
      flags = SYSCALLS.get();
    assert(!flags);
    if (old.fd === suggestFD) return -ERRNO_CODES.EINVAL;
    return SYSCALLS.doDup(old.path, old.flags, suggestFD);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall38(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // rename
    var old_path = SYSCALLS.getStr(),
      new_path = SYSCALLS.getStr();
    FS.rename(old_path, new_path);
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall40(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // rmdir
    var path = SYSCALLS.getStr();
    FS.rmdir(path);
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall41(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // dup
    var old = SYSCALLS.getStreamFromFD();
    return FS.open(old.path, old.flags, 0).fd;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall5(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // open
    var pathname = SYSCALLS.getStr(),
      flags = SYSCALLS.get(),
      mode = SYSCALLS.get(); // optional TODO
    var stream = FS.open(pathname, flags, mode);
    return stream.fd;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall54(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // ioctl
    var stream = SYSCALLS.getStreamFromFD(),
      op = SYSCALLS.get();
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0;
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0; // no-op, not actually adjusting terminal settings
      }
      case 21519: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        var argp = SYSCALLS.get();
        HEAP32[argp >> 2] = 0;
        return 0;
      }
      case 21520: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return -ERRNO_CODES.EINVAL; // not supported
      }
      case 21531: {
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      }
      case 21523: {
        // TODO: in theory we should write to the winsize struct that gets
        // passed in, but for now musl doesn't read anything on it
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0;
      }
      case 21524: {
        // TODO: technically, this ioctl call should change the window size.
        // but, since emscripten doesn't have any concept of a terminal window
        // yet, we'll just silently throw it away as we do TIOCGWINSZ
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0;
      }
      default:
        abort("bad ioctl syscall " + op);
    }
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall6(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // close
    var stream = SYSCALLS.getStreamFromFD();
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall63(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // dup2
    var old = SYSCALLS.getStreamFromFD(),
      suggestFD = SYSCALLS.get();
    if (old.fd === suggestFD) return suggestFD;
    return SYSCALLS.doDup(old.path, old.flags, suggestFD);
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___syscall91(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    // munmap
    var addr = SYSCALLS.get(),
      len = SYSCALLS.get();
    // TODO: support unmmap'ing parts of allocations
    var info = SYSCALLS.mappings[addr];
    if (!info) return 0;
    if (len === info.len) {
      var stream = FS.getStream(info.fd);
      SYSCALLS.doMsync(addr, stream, len, info.flags);
      FS.munmap(stream);
      SYSCALLS.mappings[addr] = null;
      if (info.allocated) {
        _free(info.malloc);
      }
    }
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}

function ___unlock() {}

function _difftime(time1, time0) {
  return time1 - time0;
}

function _emscripten_get_heap_size() {
  return TOTAL_MEMORY;
}

function _longjmp(env, value) {
  _setThrew(env, value || 1);
  throw "longjmp";
}

function _emscripten_longjmp(env, value) {
  _longjmp(env, value);
}

function abortOnCannotGrowMemory(requestedSize) {
  abort(
    "Cannot enlarge memory arrays to size " +
      requestedSize +
      " bytes. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " +
      TOTAL_MEMORY +
      ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ",
  );
}

function emscripten_realloc_buffer(size) {
  var PAGE_MULTIPLE = 65536;
  size = alignUp(size, PAGE_MULTIPLE); // round up to wasm page size
  var old = Module["buffer"];
  var oldSize = old.byteLength;
  // native wasm support
  try {
    var result = wasmMemory.grow((size - oldSize) / 65536); // .grow() takes a delta compared to the previous size
    if (result !== (-1 | 0)) {
      // success in native wasm memory growth, get the buffer from the memory
      return (Module["buffer"] = wasmMemory.buffer);
    } else {
      return null;
    }
  } catch (e) {
    console.error(
      "emscripten_realloc_buffer: Attempted to grow from " +
        oldSize +
        " bytes to " +
        size +
        " bytes, but got error: " +
        e,
    );
    return null;
  }
}

function _emscripten_resize_heap(requestedSize) {
  var oldSize = _emscripten_get_heap_size();
  // TOTAL_MEMORY is the current size of the actual array, and DYNAMICTOP is the new top.
  assert(requestedSize > oldSize); // This function should only ever be called after the ceiling of the dynamic heap has already been bumped to exceed the current total size of the asm.js heap.

  var PAGE_MULTIPLE = 65536;
  var LIMIT = 2147483648 - PAGE_MULTIPLE; // We can do one page short of 2GB as theoretical maximum.

  if (requestedSize > LIMIT) {
    err(
      "Cannot enlarge memory, asked to go up to " +
        requestedSize +
        " bytes, but the limit is " +
        LIMIT +
        " bytes!",
    );
    return false;
  }

  var MIN_TOTAL_MEMORY = 16777216;
  var newSize = Math.max(oldSize, MIN_TOTAL_MEMORY); // So the loop below will not be infinite, and minimum asm.js memory size is 16MB.

  while (newSize < requestedSize) {
    // Keep incrementing the heap size as long as it's less than what is requested.
    if (newSize <= 536870912) {
      newSize = alignUp(2 * newSize, PAGE_MULTIPLE); // Simple heuristic: double until 1GB...
    } else {
      // ..., but after that, add smaller increments towards 2GB, which we cannot reach
      newSize = Math.min(
        alignUp((3 * newSize + 2147483648) / 4, PAGE_MULTIPLE),
        LIMIT,
      );
      if (newSize === oldSize) {
        warnOnce(
          "Cannot ask for more memory since we reached the practical limit in browsers (which is just below 2GB), so the request would have failed. Requesting only " +
            TOTAL_MEMORY,
        );
      }
    }
  }

  var start = Date.now();

  var replacement = emscripten_realloc_buffer(newSize);
  if (!replacement || replacement.byteLength != newSize) {
    err(
      "Failed to grow the heap from " +
        oldSize +
        " bytes to " +
        newSize +
        " bytes, not enough memory!",
    );
    if (replacement) {
      err(
        "Expected to get back a buffer of size " +
          newSize +
          " bytes, but instead got back a buffer of size " +
          replacement.byteLength,
      );
    }
    return false;
  }

  // everything worked
  updateGlobalBuffer(replacement);
  updateGlobalBufferViews();

  TOTAL_MEMORY = newSize;
  HEAPU32[DYNAMICTOP_PTR >> 2] = requestedSize;

  return true;
}

function _exit(status) {
  // void _exit(int status);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
  exit(status);
}

function _getenv(name) {
  // char *getenv(const char *name);
  // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
  if (name === 0) return 0;
  name = UTF8ToString(name);
  if (!ENV.hasOwnProperty(name)) return 0;

  if (_getenv.ret) _free(_getenv.ret);
  _getenv.ret = allocateUTF8(ENV[name]);
  return _getenv.ret;
}

function _gettimeofday(ptr) {
  var now = Date.now();
  HEAP32[ptr >> 2] = (now / 1000) | 0; // seconds
  HEAP32[(ptr + 4) >> 2] = ((now % 1000) * 1000) | 0; // microseconds
  return 0;
}

var ___tm_current = 10348784;

var ___tm_timezone = (stringToUTF8("GMT", 10348832, 4), 10348832);

function _gmtime_r(time, tmPtr) {
  var date = new Date(HEAP32[time >> 2] * 1000);
  HEAP32[tmPtr >> 2] = date.getUTCSeconds();
  HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
  HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
  HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
  HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
  HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
  HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
  HEAP32[(tmPtr + 36) >> 2] = 0;
  HEAP32[(tmPtr + 32) >> 2] = 0;
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;
  HEAP32[(tmPtr + 40) >> 2] = ___tm_timezone;

  return tmPtr;
}

function _gmtime(time) {
  return _gmtime_r(time, ___tm_current);
}

function _llvm_bswap_i64(l, h) {
  var retl = _llvm_bswap_i32(h) >>> 0;
  var reth = _llvm_bswap_i32(l) >>> 0;
  return (setTempRet0(reth), retl) | 0;
}

function _tzset() {
  // TODO: Use (malleable) environment variables instead of system settings.
  if (_tzset.called) return;
  _tzset.called = true;

  // timezone is specified as seconds west of UTC ("The external variable
  // `timezone` shall be set to the difference, in seconds, between
  // Coordinated Universal Time (UTC) and local standard time."), the same
  // as returned by getTimezoneOffset().
  // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
  HEAP32[__get_timezone() >> 2] = new Date().getTimezoneOffset() * 60;

  var winter = new Date(2000, 0, 1);
  var summer = new Date(2000, 6, 1);
  HEAP32[__get_daylight() >> 2] = Number(
    winter.getTimezoneOffset() != summer.getTimezoneOffset(),
  );

  function extractZone(date) {
    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
    return match ? match[1] : "GMT";
  }
  var winterName = extractZone(winter);
  var summerName = extractZone(summer);
  var winterNamePtr = allocate(
    intArrayFromString(winterName),
    "i8",
    ALLOC_NORMAL,
  );
  var summerNamePtr = allocate(
    intArrayFromString(summerName),
    "i8",
    ALLOC_NORMAL,
  );
  if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
    // Northern hemisphere
    HEAP32[__get_tzname() >> 2] = winterNamePtr;
    HEAP32[(__get_tzname() + 4) >> 2] = summerNamePtr;
  } else {
    HEAP32[__get_tzname() >> 2] = summerNamePtr;
    HEAP32[(__get_tzname() + 4) >> 2] = winterNamePtr;
  }
}

function _localtime_r(time, tmPtr) {
  _tzset();
  var date = new Date(HEAP32[time >> 2] * 1000);
  HEAP32[tmPtr >> 2] = date.getSeconds();
  HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
  HEAP32[(tmPtr + 8) >> 2] = date.getHours();
  HEAP32[(tmPtr + 12) >> 2] = date.getDate();
  HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
  HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
  HEAP32[(tmPtr + 24) >> 2] = date.getDay();

  var start = new Date(date.getFullYear(), 0, 1);
  var yday = ((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;
  HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);

  // Attention: DST is in December in South, and some regions don't have DST at all.
  var summerOffset = new Date(2000, 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst =
    (summerOffset != winterOffset &&
      date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  HEAP32[(tmPtr + 32) >> 2] = dst;

  var zonePtr = HEAP32[(__get_tzname() + (dst ? 4 : 0)) >> 2];
  HEAP32[(tmPtr + 40) >> 2] = zonePtr;

  return tmPtr;
}

function _localtime(time) {
  return _localtime_r(time, ___tm_current);
}

function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
}

var _Int8Array = undefined;

var _Int32Array = undefined;

function _mktime(tmPtr) {
  _tzset();
  var date = new Date(
    HEAP32[(tmPtr + 20) >> 2] + 1900,
    HEAP32[(tmPtr + 16) >> 2],
    HEAP32[(tmPtr + 12) >> 2],
    HEAP32[(tmPtr + 8) >> 2],
    HEAP32[(tmPtr + 4) >> 2],
    HEAP32[tmPtr >> 2],
    0,
  );

  // There's an ambiguous hour when the time goes back; the tm_isdst field is
  // used to disambiguate it.  Date() basically guesses, so we fix it up if it
  // guessed wrong, or fill in tm_isdst with the guess if it's -1.
  var dst = HEAP32[(tmPtr + 32) >> 2];
  var guessedOffset = date.getTimezoneOffset();
  var start = new Date(date.getFullYear(), 0, 1);
  var summerOffset = new Date(2000, 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dstOffset = Math.min(winterOffset, summerOffset); // DST is in December in South
  if (dst < 0) {
    // Attention: some regions don't have DST at all.
    HEAP32[(tmPtr + 32) >> 2] = Number(
      summerOffset != winterOffset && dstOffset == guessedOffset,
    );
  } else if (dst > 0 != (dstOffset == guessedOffset)) {
    var nonDstOffset = Math.max(winterOffset, summerOffset);
    var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
    // Don't try setMinutes(date.getMinutes() + ...) -- it's messed up.
    date.setTime(date.getTime() + (trueOffset - guessedOffset) * 60000);
  }

  HEAP32[(tmPtr + 24) >> 2] = date.getDay();
  var yday = ((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;

  return (date.getTime() / 1000) | 0;
}

function _pthread_mutex_destroy() {}

function _pthread_mutex_init() {}

var _Math_floor = undefined;

var _Math_ceil = undefined;

function _time(ptr) {
  var ret = (Date.now() / 1000) | 0;
  if (ptr) {
    HEAP32[ptr >> 2] = ret;
  }
  return ret;
}

function _times(buffer) {
  // clock_t times(struct tms *buffer);
  // http://pubs.opengroup.org/onlinepubs/009695399/functions/times.html
  // NOTE: This is fake, since we can't calculate real CPU time usage in JS.
  if (buffer !== 0) {
    _memset(buffer, 0, 16);
  }
  return 0;
}

if (ENVIRONMENT_IS_NODE) {
  _emscripten_get_now = function _emscripten_get_now_actual() {
    var t = process["hrtime"]();
    return t[0] * 1e3 + t[1] / 1e6;
  };
} else if (typeof dateNow !== "undefined") {
  _emscripten_get_now = dateNow;
} else if (
  typeof self === "object" &&
  self["performance"] &&
  typeof self["performance"]["now"] === "function"
) {
  _emscripten_get_now = function () {
    return self["performance"]["now"]();
  };
} else if (
  typeof performance === "object" &&
  typeof performance["now"] === "function"
) {
  _emscripten_get_now = function () {
    return performance["now"]();
  };
} else {
  _emscripten_get_now = Date.now;
}
FS.staticInit();
__ATINIT__.unshift(function () {
  if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
});
__ATMAIN__.push(function () {
  FS.ignorePermissions = false;
});
__ATEXIT__.push(function () {
  FS.quit();
});
__ATINIT__.unshift(function () {
  TTY.init();
});
__ATEXIT__.push(function () {
  TTY.shutdown();
});
if (ENVIRONMENT_IS_NODE) {
  var fs = require("fs");
  var NODEJS_PATH = require("path");
  NODEFS.staticInit();
}
var ASSERTIONS = true;

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xff) {
      if (ASSERTIONS) {
        assert(
          false,
          "Character code " +
            chr +
            " (" +
            String.fromCharCode(chr) +
            ")  at offset " +
            i +
            " not in 0x00-0xFF.",
        );
      }
      chr &= 0xff;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join("");
}

// ASM_LIBRARY EXTERN PRIMITIVES: Int8Array,Int32Array,Math_floor,Math_ceil

function nullFunc_dd(x) {
  err(
    "Invalid function pointer called with signature 'dd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_ddd(x) {
  err(
    "Invalid function pointer called with signature 'ddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_diiid(x) {
  err(
    "Invalid function pointer called with signature 'diiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_fdd(x) {
  err(
    "Invalid function pointer called with signature 'fdd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_fdi(x) {
  err(
    "Invalid function pointer called with signature 'fdi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_fdii(x) {
  err(
    "Invalid function pointer called with signature 'fdii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_fiii(x) {
  err(
    "Invalid function pointer called with signature 'fiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_i(x) {
  err(
    "Invalid function pointer called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_id(x) {
  err(
    "Invalid function pointer called with signature 'id'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_idii(x) {
  err(
    "Invalid function pointer called with signature 'idii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_ii(x) {
  err(
    "Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iid(x) {
  err(
    "Invalid function pointer called with signature 'iid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiddddddddi(x) {
  err(
    "Invalid function pointer called with signature 'iiddddddddi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiddddi(x) {
  err(
    "Invalid function pointer called with signature 'iiddddi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iidi(x) {
  err(
    "Invalid function pointer called with signature 'iidi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iidiii(x) {
  err(
    "Invalid function pointer called with signature 'iidiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iii(x) {
  err(
    "Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiii(x) {
  err(
    "Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiid(x) {
  err(
    "Invalid function pointer called with signature 'iiiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiifi(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiifi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiiji(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiiiiijj(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiiiiijj'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiijjii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiijjii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiij(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiiiji(x) {
  err(
    "Invalid function pointer called with signature 'iiiiiiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiiijiii(x) {
  err(
    "Invalid function pointer called with signature 'iiiiijiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiiijii(x) {
  err(
    "Invalid function pointer called with signature 'iiiijii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iij(x) {
  err(
    "Invalid function pointer called with signature 'iij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iiji(x) {
  err(
    "Invalid function pointer called with signature 'iiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iijii(x) {
  err(
    "Invalid function pointer called with signature 'iijii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iijj(x) {
  err(
    "Invalid function pointer called with signature 'iijj'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iijjjjjj(x) {
  err(
    "Invalid function pointer called with signature 'iijjjjjj'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_iji(x) {
  err(
    "Invalid function pointer called with signature 'iji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_ji(x) {
  err(
    "Invalid function pointer called with signature 'ji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_jii(x) {
  err(
    "Invalid function pointer called with signature 'jii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_jiiiii(x) {
  err(
    "Invalid function pointer called with signature 'jiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_jiji(x) {
  err(
    "Invalid function pointer called with signature 'jiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_jji(x) {
  err(
    "Invalid function pointer called with signature 'jji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_vi(x) {
  err(
    "Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_vii(x) {
  err(
    "Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viii(x) {
  err(
    "Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiii(x) {
  err(
    "Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiiiiiiiiiiijiiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiiiiiiiiiiijiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_viiiiiiiiijiiii(x) {
  err(
    "Invalid function pointer called with signature 'viiiiiiiiijiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function nullFunc_vijii(x) {
  err(
    "Invalid function pointer called with signature 'vijii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)",
  );
  err("Build with ASSERTIONS=2 for more info.");
  abort(x);
}

function invoke_ii(index, a1) {
  var sp = stackSave();
  try {
    return dynCall_ii(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_iii(index, a1, a2) {
  var sp = stackSave();
  try {
    return dynCall_iii(index, a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return dynCall_iiii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return dynCall_iiiii(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_vi(index, a1) {
  var sp = stackSave();
  try {
    dynCall_vi(index, a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_vii(index, a1, a2) {
  var sp = stackSave();
  try {
    dynCall_vii(index, a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_viii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    dynCall_viii(index, a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    dynCall_viiii(index, a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0 && e !== "longjmp") throw e;
    _setThrew(1, 0);
  }
}

var asmGlobalArg = {};

var asmLibraryArg = {
  abort: abort,
  setTempRet0: setTempRet0,
  getTempRet0: getTempRet0,
  abortStackOverflow: abortStackOverflow,
  nullFunc_dd: nullFunc_dd,
  nullFunc_ddd: nullFunc_ddd,
  nullFunc_diiid: nullFunc_diiid,
  nullFunc_fdd: nullFunc_fdd,
  nullFunc_fdi: nullFunc_fdi,
  nullFunc_fdii: nullFunc_fdii,
  nullFunc_fiii: nullFunc_fiii,
  nullFunc_i: nullFunc_i,
  nullFunc_id: nullFunc_id,
  nullFunc_idii: nullFunc_idii,
  nullFunc_ii: nullFunc_ii,
  nullFunc_iid: nullFunc_iid,
  nullFunc_iiddddddddi: nullFunc_iiddddddddi,
  nullFunc_iiddddi: nullFunc_iiddddi,
  nullFunc_iidi: nullFunc_iidi,
  nullFunc_iidiii: nullFunc_iidiii,
  nullFunc_iii: nullFunc_iii,
  nullFunc_iiii: nullFunc_iiii,
  nullFunc_iiiid: nullFunc_iiiid,
  nullFunc_iiiii: nullFunc_iiiii,
  nullFunc_iiiiii: nullFunc_iiiiii,
  nullFunc_iiiiiii: nullFunc_iiiiiii,
  nullFunc_iiiiiiii: nullFunc_iiiiiiii,
  nullFunc_iiiiiiiifi: nullFunc_iiiiiiiifi,
  nullFunc_iiiiiiiii: nullFunc_iiiiiiiii,
  nullFunc_iiiiiiiiii: nullFunc_iiiiiiiiii,
  nullFunc_iiiiiiiiiii: nullFunc_iiiiiiiiiii,
  nullFunc_iiiiiiiiiiii: nullFunc_iiiiiiiiiiii,
  nullFunc_iiiiiiiiiiiii: nullFunc_iiiiiiiiiiiii,
  nullFunc_iiiiiiiiiiiiii: nullFunc_iiiiiiiiiiiiii,
  nullFunc_iiiiiiiiiiiiiii: nullFunc_iiiiiiiiiiiiiii,
  nullFunc_iiiiiiiiiiiiiiii: nullFunc_iiiiiiiiiiiiiiii,
  nullFunc_iiiiiiiiiiiiiiiii: nullFunc_iiiiiiiiiiiiiiiii,
  nullFunc_iiiiiiiiiiji: nullFunc_iiiiiiiiiiji,
  nullFunc_iiiiiiiiiijj: nullFunc_iiiiiiiiiijj,
  nullFunc_iiiiiiijjii: nullFunc_iiiiiiijjii,
  nullFunc_iiiiiij: nullFunc_iiiiiij,
  nullFunc_iiiiiiji: nullFunc_iiiiiiji,
  nullFunc_iiiiijiii: nullFunc_iiiiijiii,
  nullFunc_iiiijii: nullFunc_iiiijii,
  nullFunc_iij: nullFunc_iij,
  nullFunc_iiji: nullFunc_iiji,
  nullFunc_iijii: nullFunc_iijii,
  nullFunc_iijj: nullFunc_iijj,
  nullFunc_iijjjjjj: nullFunc_iijjjjjj,
  nullFunc_iji: nullFunc_iji,
  nullFunc_ji: nullFunc_ji,
  nullFunc_jii: nullFunc_jii,
  nullFunc_jiiiii: nullFunc_jiiiii,
  nullFunc_jiji: nullFunc_jiji,
  nullFunc_jji: nullFunc_jji,
  nullFunc_vi: nullFunc_vi,
  nullFunc_vii: nullFunc_vii,
  nullFunc_viii: nullFunc_viii,
  nullFunc_viiii: nullFunc_viiii,
  nullFunc_viiiii: nullFunc_viiiii,
  nullFunc_viiiiii: nullFunc_viiiiii,
  nullFunc_viiiiiii: nullFunc_viiiiiii,
  nullFunc_viiiiiiii: nullFunc_viiiiiiii,
  nullFunc_viiiiiiiii: nullFunc_viiiiiiiii,
  nullFunc_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii:
    nullFunc_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii,
  nullFunc_viiiiiiiiiiiiiijiiiii: nullFunc_viiiiiiiiiiiiiijiiiii,
  nullFunc_viiiiiiiiijiiii: nullFunc_viiiiiiiiijiiii,
  nullFunc_vijii: nullFunc_vijii,
  invoke_ii: invoke_ii,
  invoke_iii: invoke_iii,
  invoke_iiii: invoke_iiii,
  invoke_iiiii: invoke_iiiii,
  invoke_vi: invoke_vi,
  invoke_vii: invoke_vii,
  invoke_viii: invoke_viii,
  invoke_viiii: invoke_viiii,
  ___assert_fail: ___assert_fail,
  ___buildEnvironment: ___buildEnvironment,
  ___clock_gettime: ___clock_gettime,
  ___lock: ___lock,
  ___map_file: ___map_file,
  ___setErrNo: ___setErrNo,
  ___syscall10: ___syscall10,
  ___syscall114: ___syscall114,
  ___syscall140: ___syscall140,
  ___syscall145: ___syscall145,
  ___syscall146: ___syscall146,
  ___syscall180: ___syscall180,
  ___syscall181: ___syscall181,
  ___syscall195: ___syscall195,
  ___syscall197: ___syscall197,
  ___syscall220: ___syscall220,
  ___syscall221: ___syscall221,
  ___syscall3: ___syscall3,
  ___syscall330: ___syscall330,
  ___syscall38: ___syscall38,
  ___syscall40: ___syscall40,
  ___syscall41: ___syscall41,
  ___syscall5: ___syscall5,
  ___syscall54: ___syscall54,
  ___syscall6: ___syscall6,
  ___syscall63: ___syscall63,
  ___syscall91: ___syscall91,
  ___unlock: ___unlock,
  _clock_gettime: _clock_gettime,
  _difftime: _difftime,
  _emscripten_get_heap_size: _emscripten_get_heap_size,
  _emscripten_get_now: _emscripten_get_now,
  _emscripten_get_now_is_monotonic: _emscripten_get_now_is_monotonic,
  _emscripten_longjmp: _emscripten_longjmp,
  _emscripten_memcpy_big: _emscripten_memcpy_big,
  _emscripten_resize_heap: _emscripten_resize_heap,
  _exit: _exit,
  _getenv: _getenv,
  _gettimeofday: _gettimeofday,
  _gmtime: _gmtime,
  _gmtime_r: _gmtime_r,
  _llvm_bswap_i64: _llvm_bswap_i64,
  _localtime: _localtime,
  _localtime_r: _localtime_r,
  _longjmp: _longjmp,
  _mktime: _mktime,
  _pthread_mutex_destroy: _pthread_mutex_destroy,
  _pthread_mutex_init: _pthread_mutex_init,
  _time: _time,
  _times: _times,
  _tzset: _tzset,
  abortOnCannotGrowMemory: abortOnCannotGrowMemory,
  emscripten_realloc_buffer: emscripten_realloc_buffer,
  tempDoublePtr: tempDoublePtr,
  DYNAMICTOP_PTR: DYNAMICTOP_PTR,
};
// EMSCRIPTEN_START_ASM
var asm = Module["asm"](
  // EMSCRIPTEN_END_ASM
  asmGlobalArg,
  asmLibraryArg,
  buffer,
);

var real____emscripten_environ_constructor =
  asm["___emscripten_environ_constructor"];
asm["___emscripten_environ_constructor"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real____emscripten_environ_constructor.apply(null, arguments);
};

var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real____errno_location.apply(null, arguments);
};

var real___get_daylight = asm["__get_daylight"];
asm["__get_daylight"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real___get_daylight.apply(null, arguments);
};

var real___get_environ = asm["__get_environ"];
asm["__get_environ"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real___get_environ.apply(null, arguments);
};

var real___get_timezone = asm["__get_timezone"];
asm["__get_timezone"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real___get_timezone.apply(null, arguments);
};

var real___get_tzname = asm["__get_tzname"];
asm["__get_tzname"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real___get_tzname.apply(null, arguments);
};

var real__fflush = asm["_fflush"];
asm["_fflush"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__fflush.apply(null, arguments);
};

var real__free = asm["_free"];
asm["_free"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__free.apply(null, arguments);
};

var real__llvm_bswap_i16 = asm["_llvm_bswap_i16"];
asm["_llvm_bswap_i16"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__llvm_bswap_i16.apply(null, arguments);
};

var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"];
asm["_llvm_bswap_i32"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__llvm_bswap_i32.apply(null, arguments);
};

var real__main = asm["_main"];
asm["_main"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__main.apply(null, arguments);
};

var real__malloc = asm["_malloc"];
asm["_malloc"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__malloc.apply(null, arguments);
};

var real__memmove = asm["_memmove"];
asm["_memmove"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__memmove.apply(null, arguments);
};

var real__pthread_mutex_lock = asm["_pthread_mutex_lock"];
asm["_pthread_mutex_lock"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__pthread_mutex_lock.apply(null, arguments);
};

var real__pthread_mutex_unlock = asm["_pthread_mutex_unlock"];
asm["_pthread_mutex_unlock"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__pthread_mutex_unlock.apply(null, arguments);
};

var real__realloc = asm["_realloc"];
asm["_realloc"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__realloc.apply(null, arguments);
};

var real__rintf = asm["_rintf"];
asm["_rintf"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__rintf.apply(null, arguments);
};

var real__saveSetjmp = asm["_saveSetjmp"];
asm["_saveSetjmp"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__saveSetjmp.apply(null, arguments);
};

var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__sbrk.apply(null, arguments);
};

var real__setThrew = asm["_setThrew"];
asm["_setThrew"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__setThrew.apply(null, arguments);
};

var real__testSetjmp = asm["_testSetjmp"];
asm["_testSetjmp"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real__testSetjmp.apply(null, arguments);
};

var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real_establishStackSpace.apply(null, arguments);
};

var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real_stackAlloc.apply(null, arguments);
};

var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real_stackRestore.apply(null, arguments);
};

var real_stackSave = asm["stackSave"];
asm["stackSave"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return real_stackSave.apply(null, arguments);
};
Module["asm"] = asm;
var ___emscripten_environ_constructor = (Module[
  "___emscripten_environ_constructor"
] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["___emscripten_environ_constructor"].apply(
    null,
    arguments,
  );
});
var ___errno_location = (Module["___errno_location"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["___errno_location"].apply(null, arguments);
});
var __get_daylight = (Module["__get_daylight"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["__get_daylight"].apply(null, arguments);
});
var __get_environ = (Module["__get_environ"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["__get_environ"].apply(null, arguments);
});
var __get_timezone = (Module["__get_timezone"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["__get_timezone"].apply(null, arguments);
});
var __get_tzname = (Module["__get_tzname"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["__get_tzname"].apply(null, arguments);
});
var _emscripten_replace_memory = (Module["_emscripten_replace_memory"] =
  function () {
    assert(
      runtimeInitialized,
      "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
    );
    assert(
      !runtimeExited,
      "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
    );
    return Module["asm"]["_emscripten_replace_memory"].apply(null, arguments);
  });
var _fflush = (Module["_fflush"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_fflush"].apply(null, arguments);
});
var _free = (Module["_free"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_free"].apply(null, arguments);
});
var _llvm_bswap_i16 = (Module["_llvm_bswap_i16"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_llvm_bswap_i16"].apply(null, arguments);
});
var _llvm_bswap_i32 = (Module["_llvm_bswap_i32"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_llvm_bswap_i32"].apply(null, arguments);
});
var _main = (Module["_main"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_main"].apply(null, arguments);
});
var _malloc = (Module["_malloc"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_malloc"].apply(null, arguments);
});
var _memcpy = (Module["_memcpy"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_memcpy"].apply(null, arguments);
});
var _memmove = (Module["_memmove"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_memmove"].apply(null, arguments);
});
var _memset = (Module["_memset"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_memset"].apply(null, arguments);
});
var _pthread_mutex_lock = (Module["_pthread_mutex_lock"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_pthread_mutex_lock"].apply(null, arguments);
});
var _pthread_mutex_unlock = (Module["_pthread_mutex_unlock"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_pthread_mutex_unlock"].apply(null, arguments);
});
var _realloc = (Module["_realloc"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_realloc"].apply(null, arguments);
});
var _rintf = (Module["_rintf"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_rintf"].apply(null, arguments);
});
var _saveSetjmp = (Module["_saveSetjmp"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_saveSetjmp"].apply(null, arguments);
});
var _sbrk = (Module["_sbrk"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_sbrk"].apply(null, arguments);
});
var _setThrew = (Module["_setThrew"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_setThrew"].apply(null, arguments);
});
var _testSetjmp = (Module["_testSetjmp"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["_testSetjmp"].apply(null, arguments);
});
var establishStackSpace = (Module["establishStackSpace"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["establishStackSpace"].apply(null, arguments);
});
var stackAlloc = (Module["stackAlloc"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["stackAlloc"].apply(null, arguments);
});
var stackRestore = (Module["stackRestore"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["stackRestore"].apply(null, arguments);
});
var stackSave = (Module["stackSave"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["stackSave"].apply(null, arguments);
});
var dynCall_dd = (Module["dynCall_dd"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_dd"].apply(null, arguments);
});
var dynCall_ddd = (Module["dynCall_ddd"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_ddd"].apply(null, arguments);
});
var dynCall_diiid = (Module["dynCall_diiid"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_diiid"].apply(null, arguments);
});
var dynCall_fdd = (Module["dynCall_fdd"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_fdd"].apply(null, arguments);
});
var dynCall_fdi = (Module["dynCall_fdi"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_fdi"].apply(null, arguments);
});
var dynCall_fdii = (Module["dynCall_fdii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_fdii"].apply(null, arguments);
});
var dynCall_fiii = (Module["dynCall_fiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_fiii"].apply(null, arguments);
});
var dynCall_i = (Module["dynCall_i"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_i"].apply(null, arguments);
});
var dynCall_id = (Module["dynCall_id"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_id"].apply(null, arguments);
});
var dynCall_idii = (Module["dynCall_idii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_idii"].apply(null, arguments);
});
var dynCall_ii = (Module["dynCall_ii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_ii"].apply(null, arguments);
});
var dynCall_iid = (Module["dynCall_iid"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iid"].apply(null, arguments);
});
var dynCall_iiddddddddi = (Module["dynCall_iiddddddddi"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiddddddddi"].apply(null, arguments);
});
var dynCall_iiddddi = (Module["dynCall_iiddddi"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiddddi"].apply(null, arguments);
});
var dynCall_iidi = (Module["dynCall_iidi"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iidi"].apply(null, arguments);
});
var dynCall_iidiii = (Module["dynCall_iidiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iidiii"].apply(null, arguments);
});
var dynCall_iii = (Module["dynCall_iii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iii"].apply(null, arguments);
});
var dynCall_iiii = (Module["dynCall_iiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiii"].apply(null, arguments);
});
var dynCall_iiiid = (Module["dynCall_iiiid"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiid"].apply(null, arguments);
});
var dynCall_iiiii = (Module["dynCall_iiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiii"].apply(null, arguments);
});
var dynCall_iiiiii = (Module["dynCall_iiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiii"].apply(null, arguments);
});
var dynCall_iiiiiii = (Module["dynCall_iiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiii = (Module["dynCall_iiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiifi = (Module["dynCall_iiiiiiiifi"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiifi"].apply(null, arguments);
});
var dynCall_iiiiiiiii = (Module["dynCall_iiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiii = (Module["dynCall_iiiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiiii = (Module["dynCall_iiiiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiiiiii"] =
  function () {
    assert(
      runtimeInitialized,
      "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
    );
    assert(
      !runtimeExited,
      "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
    );
    return Module["asm"]["dynCall_iiiiiiiiiiiiiiii"].apply(null, arguments);
  });
var dynCall_iiiiiiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiiiiiii"] =
  function () {
    assert(
      runtimeInitialized,
      "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
    );
    assert(
      !runtimeExited,
      "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
    );
    return Module["asm"]["dynCall_iiiiiiiiiiiiiiiii"].apply(null, arguments);
  });
var dynCall_iiiiiiiiiiji = (Module["dynCall_iiiiiiiiiiji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiiji"].apply(null, arguments);
});
var dynCall_iiiiiiiiiijj = (Module["dynCall_iiiiiiiiiijj"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiiiiijj"].apply(null, arguments);
});
var dynCall_iiiiiiijjii = (Module["dynCall_iiiiiiijjii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiijjii"].apply(null, arguments);
});
var dynCall_iiiiiij = (Module["dynCall_iiiiiij"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiij"].apply(null, arguments);
});
var dynCall_iiiiiiji = (Module["dynCall_iiiiiiji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiiiji"].apply(null, arguments);
});
var dynCall_iiiiijiii = (Module["dynCall_iiiiijiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiiijiii"].apply(null, arguments);
});
var dynCall_iiiijii = (Module["dynCall_iiiijii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiiijii"].apply(null, arguments);
});
var dynCall_iij = (Module["dynCall_iij"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iij"].apply(null, arguments);
});
var dynCall_iiji = (Module["dynCall_iiji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iiji"].apply(null, arguments);
});
var dynCall_iijii = (Module["dynCall_iijii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iijii"].apply(null, arguments);
});
var dynCall_iijj = (Module["dynCall_iijj"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iijj"].apply(null, arguments);
});
var dynCall_iijjjjjj = (Module["dynCall_iijjjjjj"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iijjjjjj"].apply(null, arguments);
});
var dynCall_iji = (Module["dynCall_iji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_iji"].apply(null, arguments);
});
var dynCall_ji = (Module["dynCall_ji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_ji"].apply(null, arguments);
});
var dynCall_jii = (Module["dynCall_jii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_jii"].apply(null, arguments);
});
var dynCall_jiiiii = (Module["dynCall_jiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_jiiiii"].apply(null, arguments);
});
var dynCall_jiji = (Module["dynCall_jiji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_jiji"].apply(null, arguments);
});
var dynCall_jji = (Module["dynCall_jji"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_jji"].apply(null, arguments);
});
var dynCall_vi = (Module["dynCall_vi"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_vi"].apply(null, arguments);
});
var dynCall_vii = (Module["dynCall_vii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_vii"].apply(null, arguments);
});
var dynCall_viii = (Module["dynCall_viii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viii"].apply(null, arguments);
});
var dynCall_viiii = (Module["dynCall_viiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiii"].apply(null, arguments);
});
var dynCall_viiiii = (Module["dynCall_viiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiii"].apply(null, arguments);
});
var dynCall_viiiiii = (Module["dynCall_viiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiiii"].apply(null, arguments);
});
var dynCall_viiiiiii = (Module["dynCall_viiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiiiii"].apply(null, arguments);
});
var dynCall_viiiiiiii = (Module["dynCall_viiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiiiiii"].apply(null, arguments);
});
var dynCall_viiiiiiiii = (Module["dynCall_viiiiiiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiiiiiii"].apply(null, arguments);
});
var dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii = (Module[
  "dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii"
] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii"].apply(
    null,
    arguments,
  );
});
var dynCall_viiiiiiiiiiiiiijiiiii = (Module["dynCall_viiiiiiiiiiiiiijiiiii"] =
  function () {
    assert(
      runtimeInitialized,
      "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
    );
    assert(
      !runtimeExited,
      "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
    );
    return Module["asm"]["dynCall_viiiiiiiiiiiiiijiiiii"].apply(
      null,
      arguments,
    );
  });
var dynCall_viiiiiiiiijiiii = (Module["dynCall_viiiiiiiiijiiii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_viiiiiiiiijiiii"].apply(null, arguments);
});
var dynCall_vijii = (Module["dynCall_vijii"] = function () {
  assert(
    runtimeInitialized,
    "you need to wait for the runtime to be ready (e.g. wait for main() to be called)",
  );
  assert(
    !runtimeExited,
    "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)",
  );
  return Module["asm"]["dynCall_vijii"].apply(null, arguments);
});
// === Auto-generated postamble setup entry stuff ===

Module["asm"] = asm;

if (!Module["intArrayFromString"])
  Module["intArrayFromString"] = function () {
    abort(
      "'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["intArrayToString"])
  Module["intArrayToString"] = function () {
    abort(
      "'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["ccall"])
  Module["ccall"] = function () {
    abort(
      "'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["cwrap"])
  Module["cwrap"] = function () {
    abort(
      "'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["setValue"])
  Module["setValue"] = function () {
    abort(
      "'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getValue"])
  Module["getValue"] = function () {
    abort(
      "'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["allocate"])
  Module["allocate"] = function () {
    abort(
      "'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getMemory"])
  Module["getMemory"] = function () {
    abort(
      "'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["AsciiToString"])
  Module["AsciiToString"] = function () {
    abort(
      "'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stringToAscii"])
  Module["stringToAscii"] = function () {
    abort(
      "'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["UTF8ArrayToString"])
  Module["UTF8ArrayToString"] = function () {
    abort(
      "'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["UTF8ToString"])
  Module["UTF8ToString"] = function () {
    abort(
      "'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stringToUTF8Array"])
  Module["stringToUTF8Array"] = function () {
    abort(
      "'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stringToUTF8"])
  Module["stringToUTF8"] = function () {
    abort(
      "'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["lengthBytesUTF8"])
  Module["lengthBytesUTF8"] = function () {
    abort(
      "'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["UTF16ToString"])
  Module["UTF16ToString"] = function () {
    abort(
      "'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stringToUTF16"])
  Module["stringToUTF16"] = function () {
    abort(
      "'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["lengthBytesUTF16"])
  Module["lengthBytesUTF16"] = function () {
    abort(
      "'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["UTF32ToString"])
  Module["UTF32ToString"] = function () {
    abort(
      "'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stringToUTF32"])
  Module["stringToUTF32"] = function () {
    abort(
      "'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["lengthBytesUTF32"])
  Module["lengthBytesUTF32"] = function () {
    abort(
      "'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["allocateUTF8"])
  Module["allocateUTF8"] = function () {
    abort(
      "'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stackTrace"])
  Module["stackTrace"] = function () {
    abort(
      "'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addOnPreRun"])
  Module["addOnPreRun"] = function () {
    abort(
      "'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addOnInit"])
  Module["addOnInit"] = function () {
    abort(
      "'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addOnPreMain"])
  Module["addOnPreMain"] = function () {
    abort(
      "'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addOnExit"])
  Module["addOnExit"] = function () {
    abort(
      "'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addOnPostRun"])
  Module["addOnPostRun"] = function () {
    abort(
      "'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["writeStringToMemory"])
  Module["writeStringToMemory"] = function () {
    abort(
      "'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["writeArrayToMemory"])
  Module["writeArrayToMemory"] = function () {
    abort(
      "'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["writeAsciiToMemory"])
  Module["writeAsciiToMemory"] = function () {
    abort(
      "'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addRunDependency"])
  Module["addRunDependency"] = function () {
    abort(
      "'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["removeRunDependency"])
  Module["removeRunDependency"] = function () {
    abort(
      "'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["ENV"])
  Module["ENV"] = function () {
    abort(
      "'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["FS"])
  Module["FS"] = function () {
    abort(
      "'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["FS_createFolder"])
  Module["FS_createFolder"] = function () {
    abort(
      "'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_createPath"])
  Module["FS_createPath"] = function () {
    abort(
      "'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_createDataFile"])
  Module["FS_createDataFile"] = function () {
    abort(
      "'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_createPreloadedFile"])
  Module["FS_createPreloadedFile"] = function () {
    abort(
      "'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_createLazyFile"])
  Module["FS_createLazyFile"] = function () {
    abort(
      "'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_createLink"])
  Module["FS_createLink"] = function () {
    abort(
      "'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_createDevice"])
  Module["FS_createDevice"] = function () {
    abort(
      "'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["FS_unlink"])
  Module["FS_unlink"] = function () {
    abort(
      "'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you",
    );
  };
if (!Module["GL"])
  Module["GL"] = function () {
    abort(
      "'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["dynamicAlloc"])
  Module["dynamicAlloc"] = function () {
    abort(
      "'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["warnOnce"])
  Module["warnOnce"] = function () {
    abort(
      "'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["loadDynamicLibrary"])
  Module["loadDynamicLibrary"] = function () {
    abort(
      "'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["loadWebAssemblyModule"])
  Module["loadWebAssemblyModule"] = function () {
    abort(
      "'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getLEB"])
  Module["getLEB"] = function () {
    abort(
      "'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getFunctionTables"])
  Module["getFunctionTables"] = function () {
    abort(
      "'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["alignFunctionTables"])
  Module["alignFunctionTables"] = function () {
    abort(
      "'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["registerFunctions"])
  Module["registerFunctions"] = function () {
    abort(
      "'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["addFunction"])
  Module["addFunction"] = function () {
    abort(
      "'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["removeFunction"])
  Module["removeFunction"] = function () {
    abort(
      "'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getFuncWrapper"])
  Module["getFuncWrapper"] = function () {
    abort(
      "'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["prettyPrint"])
  Module["prettyPrint"] = function () {
    abort(
      "'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["makeBigInt"])
  Module["makeBigInt"] = function () {
    abort(
      "'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["dynCall"])
  Module["dynCall"] = function () {
    abort(
      "'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getCompilerSetting"])
  Module["getCompilerSetting"] = function () {
    abort(
      "'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stackSave"])
  Module["stackSave"] = function () {
    abort(
      "'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stackRestore"])
  Module["stackRestore"] = function () {
    abort(
      "'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["stackAlloc"])
  Module["stackAlloc"] = function () {
    abort(
      "'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["establishStackSpace"])
  Module["establishStackSpace"] = function () {
    abort(
      "'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["print"])
  Module["print"] = function () {
    abort(
      "'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["printErr"])
  Module["printErr"] = function () {
    abort(
      "'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["getTempRet0"])
  Module["getTempRet0"] = function () {
    abort(
      "'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["setTempRet0"])
  Module["setTempRet0"] = function () {
    abort(
      "'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["Pointer_stringify"])
  Module["Pointer_stringify"] = function () {
    abort(
      "'Pointer_stringify' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
    );
  };
if (!Module["ALLOC_NORMAL"])
  Object.defineProperty(Module, "ALLOC_NORMAL", {
    get: function () {
      abort(
        "'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
      );
    },
  });
if (!Module["ALLOC_STACK"])
  Object.defineProperty(Module, "ALLOC_STACK", {
    get: function () {
      abort(
        "'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
      );
    },
  });
if (!Module["ALLOC_DYNAMIC"])
  Object.defineProperty(Module, "ALLOC_DYNAMIC", {
    get: function () {
      abort(
        "'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
      );
    },
  });
if (!Module["ALLOC_NONE"])
  Object.defineProperty(Module, "ALLOC_NONE", {
    get: function () {
      abort(
        "'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)",
      );
    },
  });

/**
 * @constructor
 * @extends {Error}
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module["calledRun"]) run();
  if (!Module["calledRun"]) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

Module["callMain"] = function callMain(args) {
  assert(
    runDependencies == 0,
    "cannot call main when async dependencies remain! (listen on __ATMAIN__)",
  );
  assert(
    __ATPRERUN__.length == 0,
    "cannot call main when preRun functions remain to be called",
  );

  args = args || [];

  ensureInitRuntime();

  var argc = args.length + 1;
  var argv = stackAlloc((argc + 1) * 4);
  HEAP32[argv >> 2] = allocateUTF8OnStack(Module["thisProgram"]);
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  }
  HEAP32[(argv >> 2) + argc] = 0;

  try {
    var ret = Module["_main"](argc, argv, 0);

    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
  } catch (e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == "SimulateInfiniteLoop") {
      // running an evented main loop, don't immediately exit
      Module["noExitRuntime"] = true;
      return;
    } else {
      var toLog = e;
      if (e && typeof e === "object" && e.stack) {
        toLog = [e, e.stack];
      }
      err("exception thrown: " + toLog);
      Module["quit"](1, e);
    }
  } finally {
    calledMain = true;
  }
};

/** @type {function(Array=)} */
function run(args) {
  args = args || Module["arguments"];

  if (runDependencies > 0) {
    return;
  }

  writeStackCookie();

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module["calledRun"]) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module["calledRun"]) return; // run may have just been called while the async setStatus time below was happening
    Module["calledRun"] = true;

    if (ABORT) return;

    ensureInitRuntime();

    preMain();

    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();

    if (Module["_main"] && shouldRunNow) Module["callMain"](args);

    postRun();
  }

  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(function () {
      setTimeout(function () {
        Module["setStatus"]("");
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}

Module["run"] = run;

function exit(status, implicit) {
  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && Module["noExitRuntime"] && status === 0) {
    return;
  }

  if (Module["noExitRuntime"]) {
    // if exit() was called, we may warn the user if the runtime isn't actually being shut down
    if (!implicit) {
      err(
        "exit(" +
          status +
          ") called, but noExitRuntime is set due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)",
      );
    }
  } else {
    ABORT = true;
    EXITSTATUS = status;

    exitRuntime();

    if (Module["onExit"]) Module["onExit"](status);
  }

  Module["quit"](status, new ExitStatus(status));
}

var abortDecorators = [];

function abort(what) {
  if (Module["onAbort"]) {
    Module["onAbort"](what);
  }

  if (what !== undefined) {
    out(what);
    err(what);
    what = JSON.stringify(what);
  } else {
    what = "";
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = "";
  var output = "abort(" + what + ") at " + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function (decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}

Module["abort"] = abort;

if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function")
    Module["preInit"] = [Module["preInit"]];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module["noInitialRun"]) {
  shouldRunNow = false;
}

run();

// {{MODULE_ADDITIONS}}
