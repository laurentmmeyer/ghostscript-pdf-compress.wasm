
var gs = (() => {
  var _scriptName = import.meta.url;
  
  return (
function(moduleArg = {}) {
  var moduleRtn;

var f = moduleArg, aa, ba, ca = new Promise((a, b) => {
  aa = a;
  ba = b;
});
["_memory", "___indirect_function_table", "_main", "onRuntimeInitialized"].forEach(a => {
  Object.getOwnPropertyDescriptor(ca, a) || Object.defineProperty(ca, a, {get:() => h("You are getting " + a + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"), set:() => h("You are setting " + a + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")});
});
var da = Object.assign({}, f), ea = [], fa = "./this.program", l = "", ia, ja;
l = self.location.href;
_scriptName && (l = _scriptName);
l.startsWith("blob:") ? l = "" : l = l.substr(0, l.replace(/[?#].*/, "").lastIndexOf("/") + 1);
if ("object" != typeof window && "function" != typeof importScripts) {
  throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
}
ja = a => {
  var b = new XMLHttpRequest();
  b.open("GET", a, !1);
  b.responseType = "arraybuffer";
  b.send(null);
  return new Uint8Array(b.response);
};
ia = a => {
  m(!ka(a), "readAsync does not work with file:// URLs");
  return fetch(a, {credentials:"same-origin"}).then(b => b.ok ? b.arrayBuffer() : Promise.reject(Error(b.status + " : " + b.url)));
};
var la = f.print || console.log.bind(console), p = f.printErr || console.error.bind(console);
Object.assign(f, da);
da = null;
Object.getOwnPropertyDescriptor(f, "fetchSettings") && h("`Module.fetchSettings` was supplied but `fetchSettings` not included in INCOMING_MODULE_JS_API");
f.arguments && (ea = f.arguments);
t("arguments", "arguments_");
f.thisProgram && (fa = f.thisProgram);
t("thisProgram", "thisProgram");
m("undefined" == typeof f.memoryInitializerPrefixURL, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
m("undefined" == typeof f.pthreadMainPrefixURL, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
m("undefined" == typeof f.cdInitializerPrefixURL, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
m("undefined" == typeof f.filePackagePrefixURL, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
m("undefined" == typeof f.read, "Module.read option was removed");
m("undefined" == typeof f.readAsync, "Module.readAsync option was removed (modify readAsync in JS)");
m("undefined" == typeof f.readBinary, "Module.readBinary option was removed (modify readBinary in JS)");
m("undefined" == typeof f.setWindowTitle, "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
m("undefined" == typeof f.TOTAL_MEMORY, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
t("asm", "wasmExports");
t("readAsync", "readAsync");
t("readBinary", "readBinary");
t("setWindowTitle", "setWindowTitle");
m(!0, "web environment detected but not enabled at build time.  Add `web` to `-sENVIRONMENT` to enable.");
m(!0, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");
m(!0, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
var ma = f.wasmBinary;
t("wasmBinary", "wasmBinary");
"object" != typeof WebAssembly && p("no native wasm support detected");
var na, oa = !1, pa;
function m(a, b) {
  a || h("Assertion failed" + (b ? ": " + b : ""));
}
var w, qa, ra, x, y, z;
function sa() {
  var a = na.buffer;
  f.HEAP8 = w = new Int8Array(a);
  f.HEAP16 = ra = new Int16Array(a);
  f.HEAPU8 = qa = new Uint8Array(a);
  f.HEAPU16 = new Uint16Array(a);
  f.HEAP32 = x = new Int32Array(a);
  f.HEAPU32 = y = new Uint32Array(a);
  f.HEAPF32 = new Float32Array(a);
  f.HEAPF64 = new Float64Array(a);
  f.HEAP64 = z = new BigInt64Array(a);
  f.HEAPU64 = new BigUint64Array(a);
}
m(!f.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
m("undefined" != typeof Int32Array && "undefined" !== typeof Float64Array && void 0 != Int32Array.prototype.subarray && void 0 != Int32Array.prototype.set, "JS engine does not provide full typed array support");
m(!f.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
m(!f.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
function ta() {
  var a = ua();
  m(0 == (a & 3));
  0 == a && (a += 4);
  y[a >> 2] = 34821223;
  y[a + 4 >> 2] = 2310721022;
  y[0] = 1668509029;
}
function va() {
  if (!oa) {
    var a = ua();
    0 == a && (a += 4);
    var b = y[a >> 2], c = y[a + 4 >> 2];
    34821223 == b && 2310721022 == c || h(`Stack overflow! Stack cookie has been overwritten at ${wa(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${wa(c)} ${wa(b)}`);
    1668509029 != y[0] && h("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}
var xa = [], ya = [], za = [], Aa = [], Ba = !1;
function Ca() {
  var a = f.preRun;
  a && ("function" == typeof a && (a = [a]), a.forEach(Da));
  Ea(xa);
}
function Da(a) {
  xa.unshift(a);
}
function Fa(a) {
  Aa.unshift(a);
}
m(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
m(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
m(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
m(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
var B = 0, F = null, Ga = null, Ha = {};
function Ia(a) {
  for (var b = a;;) {
    if (!Ha[a]) {
      return a;
    }
    a = b + Math.random();
  }
}
function Ja(a) {
  B++;
  f.monitorRunDependencies?.(B);
  a ? (m(!Ha[a]), Ha[a] = 1, null === F && "undefined" != typeof setInterval && (F = setInterval(() => {
    if (oa) {
      clearInterval(F), F = null;
    } else {
      var b = !1, c;
      for (c in Ha) {
        b || (b = !0, p("still waiting on run dependencies:")), p(`dependency: ${c}`);
      }
      b && p("(end of list)");
    }
  }, 10000))) : p("warning: run dependency added without ID");
}
function Ka(a) {
  B--;
  f.monitorRunDependencies?.(B);
  a ? (m(Ha[a]), delete Ha[a]) : p("warning: run dependency removed without ID");
  0 == B && (null !== F && (clearInterval(F), F = null), Ga && (a = Ga, Ga = null, a()));
}
function h(a) {
  f.onAbort?.(a);
  a = "Aborted(" + a + ")";
  p(a);
  oa = !0;
  a = new WebAssembly.RuntimeError(a);
  ba(a);
  throw a;
}
var La = a => a.startsWith("data:application/octet-stream;base64,"), ka = a => a.startsWith("file://");
function H(a, b) {
  return (...c) => {
    m(Ba, `native function \`${a}\` called before runtime initialization`);
    var d = I[a];
    m(d, `exported native function \`${a}\` not found`);
    m(c.length <= b, `native function \`${a}\` called with ${c.length} args but expects ${b}`);
    return d(...c);
  };
}
var Ma;
function Na(a) {
  if (a == Ma && ma) {
    return new Uint8Array(ma);
  }
  if (ja) {
    return ja(a);
  }
  throw "both async and sync fetching of the wasm failed";
}
function Oa(a) {
  return ma ? Promise.resolve().then(() => Na(a)) : ia(a).then(b => new Uint8Array(b), () => Na(a));
}
function Pa(a, b, c) {
  return Oa(a).then(d => WebAssembly.instantiate(d, b)).then(c, d => {
    p(`failed to asynchronously prepare wasm: ${d}`);
    ka(Ma) && p(`warning: Loading from a file URI (${Ma}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    h(d);
  });
}
function Qa(a, b) {
  var c = Ma;
  return ma || "function" != typeof WebAssembly.instantiateStreaming || La(c) || "function" != typeof fetch ? Pa(c, a, b) : fetch(c, {credentials:"same-origin"}).then(d => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
    p(`wasm streaming compile failed: ${e}`);
    p("falling back to ArrayBuffer instantiation");
    return Pa(c, a, b);
  }));
}
var Ra = new Int16Array(1), Sa = new Int8Array(Ra.buffer);
Ra[0] = 25459;
if (115 !== Sa[0] || 99 !== Sa[1]) {
  throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
}
if (f.ENVIRONMENT) {
  throw Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}
function t(a, b) {
  Object.getOwnPropertyDescriptor(f, a) || Object.defineProperty(f, a, {configurable:!0, get() {
    h(`\`Module.${a}\` has been replaced by \`${b}\`` + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }});
}
function Ta(a) {
  return "FS_createPath" === a || "FS_createDataFile" === a || "FS_createPreloadedFile" === a || "FS_unlink" === a || "addRunDependency" === a || "FS_createLazyFile" === a || "FS_createDevice" === a || "removeRunDependency" === a;
}
function Ua(a, b) {
  "undefined" == typeof globalThis || Object.getOwnPropertyDescriptor(globalThis, a) || Object.defineProperty(globalThis, a, {configurable:!0, get() {
    b();
  }});
}
function Va(a, b) {
  Ua(a, () => {
    J(`\`${a}\` is not longer defined by emscripten. ${b}`);
  });
}
Va("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");
Va("asm", "Please use wasmExports instead");
function Wa(a) {
  Object.getOwnPropertyDescriptor(f, a) || Object.defineProperty(f, a, {configurable:!0, get() {
    var b = `'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    Ta(a) && (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    h(b);
  }});
}
function Xa(a) {
  this.name = "ExitStatus";
  this.message = `Program terminated with exit(${a})`;
  this.status = a;
}
var Ea = a => {
  a.forEach(b => b(f));
}, Ya = f.noExitRuntime || !0, wa = a => {
  m("number" === typeof a);
  return "0x" + (a >>> 0).toString(16).padStart(8, "0");
}, J = a => {
  J.pa || (J.pa = {});
  J.pa[a] || (J.pa[a] = 1, p(a));
}, Za = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, $a = (a, b = 0) => {
  for (var c = b + NaN, d = b; a[d] && !(d >= c);) {
    ++d;
  }
  if (16 < d - b && a.buffer && Za) {
    return Za.decode(a.subarray(b, d));
  }
  for (c = ""; b < d;) {
    var e = a[b++];
    if (e & 128) {
      var g = a[b++] & 63;
      if (192 == (e & 224)) {
        c += String.fromCharCode((e & 31) << 6 | g);
      } else {
        var k = a[b++] & 63;
        224 == (e & 240) ? e = (e & 15) << 12 | g << 6 | k : (240 != (e & 248) && J("Invalid UTF-8 leading byte " + wa(e) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), e = (e & 7) << 18 | g << 12 | k << 6 | a[b++] & 63);
        65536 > e ? c += String.fromCharCode(e) : (e -= 65536, c += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      c += String.fromCharCode(e);
    }
  }
  return c;
}, K = a => {
  m("number" == typeof a, `UTF8ToString expects a number (got ${typeof a})`);
  return a ? $a(qa, a) : "";
}, ab = (a, b) => {
  for (var c = 0, d = a.length - 1; 0 <= d; d--) {
    var e = a[d];
    "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
  }
  if (b) {
    for (; c; c--) {
      a.unshift("..");
    }
  }
  return a;
}, M = a => {
  var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
  (a = ab(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}, bb = a => {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b &&= b.substr(0, b.length - 1);
  return a + b;
}, N = a => {
  if ("/" === a) {
    return "/";
  }
  a = M(a);
  a = a.replace(/\/$/, "");
  var b = a.lastIndexOf("/");
  return -1 === b ? a : a.substr(b + 1);
}, cb = (a, b) => M(a + "/" + b), db = () => {
  if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) {
    return a => crypto.getRandomValues(a);
  }
  h("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
}, eb = a => (eb = db())(a), fb = (...a) => {
  for (var b = "", c = !1, d = a.length - 1; -1 <= d && !c; d--) {
    c = 0 <= d ? a[d] : O.fa();
    if ("string" != typeof c) {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (!c) {
      return "";
    }
    b = c + "/" + b;
    c = "/" === c.charAt(0);
  }
  b = ab(b.split("/").filter(e => !!e), !c).join("/");
  return (c ? "/" : "") + b || ".";
}, gb = (a, b) => {
  function c(k) {
    for (var n = 0; n < k.length && "" === k[n]; n++) {
    }
    for (var r = k.length - 1; 0 <= r && "" === k[r]; r--) {
    }
    return n > r ? [] : k.slice(n, r - n + 1);
  }
  a = fb(a).substr(1);
  b = fb(b).substr(1);
  a = c(a.split("/"));
  b = c(b.split("/"));
  for (var d = Math.min(a.length, b.length), e = d, g = 0; g < d; g++) {
    if (a[g] !== b[g]) {
      e = g;
      break;
    }
  }
  d = [];
  for (g = e; g < a.length; g++) {
    d.push("..");
  }
  d = d.concat(b.slice(e));
  return d.join("/");
}, hb = [], ib = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, jb = (a, b, c, d) => {
  m("string" === typeof a, `stringToUTF8Array expects a string (got ${typeof a})`);
  if (!(0 < d)) {
    return 0;
  }
  var e = c;
  d = c + d - 1;
  for (var g = 0; g < a.length; ++g) {
    var k = a.charCodeAt(g);
    if (55296 <= k && 57343 >= k) {
      var n = a.charCodeAt(++g);
      k = 65536 + ((k & 1023) << 10) | n & 1023;
    }
    if (127 >= k) {
      if (c >= d) {
        break;
      }
      b[c++] = k;
    } else {
      if (2047 >= k) {
        if (c + 1 >= d) {
          break;
        }
        b[c++] = 192 | k >> 6;
      } else {
        if (65535 >= k) {
          if (c + 2 >= d) {
            break;
          }
          b[c++] = 224 | k >> 12;
        } else {
          if (c + 3 >= d) {
            break;
          }
          1114111 < k && J("Invalid Unicode code point " + wa(k) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
          b[c++] = 240 | k >> 18;
          b[c++] = 128 | k >> 12 & 63;
        }
        b[c++] = 128 | k >> 6 & 63;
      }
      b[c++] = 128 | k & 63;
    }
  }
  b[c] = 0;
  return c - e;
}, kb = [];
function lb(a, b) {
  kb[a] = {input:[], output:[], K:b};
  mb(a, nb);
}
var nb = {open(a) {
  var b = kb[a.node.V];
  if (!b) {
    throw new O.g(43);
  }
  a.l = b;
  a.seekable = !1;
}, close(a) {
  a.l.K.ba(a.l);
}, ba(a) {
  a.l.K.ba(a.l);
}, read(a, b, c, d) {
  if (!a.l || !a.l.K.ya) {
    throw new O.g(60);
  }
  for (var e = 0, g = 0; g < d; g++) {
    try {
      var k = a.l.K.ya(a.l);
    } catch (n) {
      throw new O.g(29);
    }
    if (void 0 === k && 0 === e) {
      throw new O.g(6);
    }
    if (null === k || void 0 === k) {
      break;
    }
    e++;
    b[c + g] = k;
  }
  e && (a.node.timestamp = Date.now());
  return e;
}, write(a, b, c, d) {
  if (!a.l || !a.l.K.na) {
    throw new O.g(60);
  }
  try {
    for (var e = 0; e < d; e++) {
      a.l.K.na(a.l, b[c + e]);
    }
  } catch (g) {
    throw new O.g(29);
  }
  d && (a.node.timestamp = Date.now());
  return e;
}}, ob = {ya() {
  return hb.length ? hb.shift() : null;
}, na(a, b) {
  null === b || 10 === b ? (la($a(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ba(a) {
  a.output && 0 < a.output.length && (la($a(a.output)), a.output = []);
}, Ya() {
  return {ob:25856, qb:5, nb:191, pb:35387, mb:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
}, Za() {
  return 0;
}, $a() {
  return [24, 80];
}}, pb = {na(a, b) {
  null === b || 10 === b ? (p($a(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ba(a) {
  a.output && 0 < a.output.length && (p($a(a.output)), a.output = []);
}}, qb = () => {
  h("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
};
function rb(a, b) {
  var c = a.i ? a.i.length : 0;
  c >= b || (b = Math.max(b, c * (1048576 > c ? 2.0 : 1.125) >>> 0), 0 != c && (b = Math.max(b, 256)), c = a.i, a.i = new Uint8Array(b), 0 < a.o && a.i.set(c.subarray(0, a.o), 0));
}
var P = {G:null, u() {
  return P.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  var e;
  (e = 24576 === (c & 61440)) || (e = 4096 === (c & 61440));
  if (e) {
    throw new O.g(63);
  }
  P.G || (P.G = {dir:{node:{D:P.h.D, v:P.h.v, O:P.h.O, J:P.h.J, X:P.h.X, M:P.h.M, T:P.h.T, W:P.h.W, L:P.h.L}, stream:{A:P.j.A}}, file:{node:{D:P.h.D, v:P.h.v}, stream:{A:P.j.A, read:P.j.read, write:P.j.write, Y:P.j.Y, U:P.j.U, $:P.j.$}}, link:{node:{D:P.h.D, v:P.h.v, S:P.h.S}, stream:{}}, ra:{node:{D:P.h.D, v:P.h.v}, stream:O.Pa}});
  c = O.createNode(a, b, c, d);
  Q(c.mode) ? (c.h = P.G.dir.node, c.j = P.G.dir.stream, c.i = {}) : O.isFile(c.mode) ? (c.h = P.G.file.node, c.j = P.G.file.stream, c.o = 0, c.i = null) : 40960 === (c.mode & 61440) ? (c.h = P.G.link.node, c.j = P.G.link.stream) : 8192 === (c.mode & 61440) && (c.h = P.G.ra.node, c.j = P.G.ra.stream);
  c.timestamp = Date.now();
  a && (a.i[b] = c, a.timestamp = c.timestamp);
  return c;
}, zb(a) {
  return a.i ? a.i.subarray ? a.i.subarray(0, a.o) : new Uint8Array(a.i) : new Uint8Array(0);
}, h:{D(a) {
  var b = {};
  b.Sa = 8192 === (a.mode & 61440) ? a.id : 1;
  b.Xa = a.id;
  b.mode = a.mode;
  b.eb = 1;
  b.uid = 0;
  b.Wa = 0;
  b.V = a.V;
  Q(a.mode) ? b.size = 4096 : O.isFile(a.mode) ? b.size = a.o : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.La = new Date(a.timestamp);
  b.bb = new Date(a.timestamp);
  b.Ra = new Date(a.timestamp);
  b.Ma = 4096;
  b.Na = Math.ceil(b.size / b.Ma);
  return b;
}, v(a, b) {
  void 0 !== b.mode && (a.mode = b.mode);
  void 0 !== b.timestamp && (a.timestamp = b.timestamp);
  if (void 0 !== b.size && (b = b.size, a.o != b)) {
    if (0 == b) {
      a.i = null, a.o = 0;
    } else {
      var c = a.i;
      a.i = new Uint8Array(b);
      c && a.i.set(c.subarray(0, Math.min(b, a.o)));
      a.o = b;
    }
  }
}, O() {
  throw O.ha[44];
}, J(a, b, c, d) {
  return P.createNode(a, b, c, d);
}, X(a, b, c) {
  if (Q(a.mode)) {
    try {
      var d = R(b, c);
    } catch (g) {
    }
    if (d) {
      for (var e in d.i) {
        throw new O.g(55);
      }
    }
  }
  delete a.parent.i[a.name];
  a.parent.timestamp = Date.now();
  a.name = c;
  b.i[c] = a;
  b.timestamp = a.parent.timestamp;
}, M(a, b) {
  delete a.i[b];
  a.timestamp = Date.now();
}, T(a, b) {
  var c = R(a, b), d;
  for (d in c.i) {
    throw new O.g(55);
  }
  delete a.i[b];
  a.timestamp = Date.now();
}, W(a) {
  var b = [".", ".."], c;
  for (c of Object.keys(a.i)) {
    b.push(c);
  }
  return b;
}, L(a, b, c) {
  a = P.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, S(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new O.g(28);
  }
  return a.link;
}}, j:{read(a, b, c, d, e) {
  var g = a.node.i;
  if (e >= a.node.o) {
    return 0;
  }
  a = Math.min(a.node.o - e, d);
  m(0 <= a);
  if (8 < a && g.subarray) {
    b.set(g.subarray(e, e + a), c);
  } else {
    for (d = 0; d < a; d++) {
      b[c + d] = g[e + d];
    }
  }
  return a;
}, write(a, b, c, d, e, g) {
  m(!(b instanceof ArrayBuffer));
  b.buffer === w.buffer && (g = !1);
  if (!d) {
    return 0;
  }
  a = a.node;
  a.timestamp = Date.now();
  if (b.subarray && (!a.i || a.i.subarray)) {
    if (g) {
      return m(0 === e, "canOwn must imply no weird position inside the file"), a.i = b.subarray(c, c + d), a.o = d;
    }
    if (0 === a.o && 0 === e) {
      return a.i = b.slice(c, c + d), a.o = d;
    }
    if (e + d <= a.o) {
      return a.i.set(b.subarray(c, c + d), e), d;
    }
  }
  rb(a, e + d);
  if (a.i.subarray && b.subarray) {
    a.i.set(b.subarray(c, c + d), e);
  } else {
    for (g = 0; g < d; g++) {
      a.i[e + g] = b[c + g];
    }
  }
  a.o = Math.max(a.o, e + d);
  return d;
}, A(a, b, c) {
  1 === c ? b += a.position : 2 === c && O.isFile(a.node.mode) && (b += a.node.o);
  if (0 > b) {
    throw new O.g(28);
  }
  return b;
}, Y(a, b, c) {
  rb(a.node, b + c);
  a.node.o = Math.max(a.node.o, b + c);
}, U(a, b, c, d, e) {
  if (!O.isFile(a.node.mode)) {
    throw new O.g(43);
  }
  a = a.node.i;
  if (e & 2 || !a || a.buffer !== w.buffer) {
    d = !0;
    e = qb();
    if (!e) {
      throw new O.g(48);
    }
    if (a) {
      if (0 < c || c + b < a.length) {
        a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
      }
      w.set(a, e);
    }
  } else {
    d = !1, e = a.byteOffset;
  }
  return {ib:e, Ka:d};
}, $(a, b, c, d) {
  P.j.write(a, b, 0, d, c, !1);
  return 0;
}}}, sb = (a, b, c) => {
  var d = Ia(`al ${a}`);
  ia(a).then(e => {
    m(e, `Loading data file "${a}" failed (no arrayBuffer).`);
    b(new Uint8Array(e));
    d && Ka(d);
  }, () => {
    if (c) {
      c();
    } else {
      throw `Loading data file "${a}" failed.`;
    }
  });
  d && Ja(d);
}, tb = f.preloadPlugins || [], vb = (a, b, c, d) => {
  "undefined" != typeof Browser && ub();
  var e = !1;
  tb.forEach(g => {
    !e && g.canHandle(b) && (g.handle(a, b, c, d), e = !0);
  });
  return e;
}, wb = (a, b, c, d, e, g, k, n, r, u) => {
  function q(C) {
    function D(E) {
      u?.();
      n || O.ea(a, b, E, d, e, r);
      g?.();
      Ka(A);
    }
    vb(C, v, D, () => {
      k?.();
      Ka(A);
    }) || D(C);
  }
  var v = b ? fb(M(a + "/" + b)) : a, A = Ia(`cp ${v}`);
  Ja(A);
  "string" == typeof c ? sb(c, q, k) : q(c);
}, xb = (a, b) => {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}, yb = {EPERM:63, ENOENT:44, ESRCH:71, EINTR:27, EIO:29, ENXIO:60, E2BIG:1, ENOEXEC:45, EBADF:8, ECHILD:12, EAGAIN:6, EWOULDBLOCK:6, ENOMEM:48, EACCES:2, EFAULT:21, ENOTBLK:105, EBUSY:10, EEXIST:20, EXDEV:75, ENODEV:43, ENOTDIR:54, EISDIR:31, EINVAL:28, ENFILE:41, EMFILE:33, ENOTTY:59, ETXTBSY:74, EFBIG:22, ENOSPC:51, ESPIPE:70, EROFS:69, EMLINK:34, EPIPE:64, EDOM:18, ERANGE:68, ENOMSG:49, EIDRM:24, ECHRNG:106, EL2NSYNC:156, EL3HLT:107, EL3RST:108, ELNRNG:109, EUNATCH:110, ENOCSI:111, EL2HLT:112, 
EDEADLK:16, ENOLCK:46, EBADE:113, EBADR:114, EXFULL:115, ENOANO:104, EBADRQC:103, EBADSLT:102, EDEADLOCK:16, EBFONT:101, ENOSTR:100, ENODATA:116, ETIME:117, ENOSR:118, ENONET:119, ENOPKG:120, EREMOTE:121, ENOLINK:47, EADV:122, ESRMNT:123, ECOMM:124, EPROTO:65, EMULTIHOP:36, EDOTDOT:125, EBADMSG:9, ENOTUNIQ:126, EBADFD:127, EREMCHG:128, ELIBACC:129, ELIBBAD:130, ELIBSCN:131, ELIBMAX:132, ELIBEXEC:133, ENOSYS:52, ENOTEMPTY:55, ENAMETOOLONG:37, ELOOP:32, EOPNOTSUPP:138, EPFNOSUPPORT:139, ECONNRESET:15, 
ENOBUFS:42, EAFNOSUPPORT:5, EPROTOTYPE:67, ENOTSOCK:57, ENOPROTOOPT:50, ESHUTDOWN:140, ECONNREFUSED:14, EADDRINUSE:3, ECONNABORTED:13, ENETUNREACH:40, ENETDOWN:38, ETIMEDOUT:73, EHOSTDOWN:142, EHOSTUNREACH:23, EINPROGRESS:26, EALREADY:7, EDESTADDRREQ:17, EMSGSIZE:35, EPROTONOSUPPORT:66, ESOCKTNOSUPPORT:137, EADDRNOTAVAIL:4, ENETRESET:39, EISCONN:30, ENOTCONN:53, ETOOMANYREFS:141, EUSERS:136, EDQUOT:19, ESTALE:72, ENOTSUP:138, ENOMEDIUM:148, EILSEQ:25, EOVERFLOW:61, ECANCELED:11, ENOTRECOVERABLE:56, 
EOWNERDEAD:62, ESTRPIPE:135};
function ub() {
  m(!O.ca, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  O.ca = !0;
  b ??= f.stdin;
  c ??= f.stdout;
  a ??= f.stderr;
  b ? O.H("/dev", "stdin", b) : O.L("/dev/tty", "/dev/stdin");
  c ? O.H("/dev", "stdout", null, c) : O.L("/dev/tty", "/dev/stdout");
  a ? O.H("/dev", "stderr", null, a) : O.L("/dev/tty1", "/dev/stderr");
  var a = O.open("/dev/stdin", 0);
  var b = O.open("/dev/stdout", 1);
  var c = O.open("/dev/stderr", 1);
  m(0 === a.s, `invalid handle for stdin (${a.s})`);
  m(1 === b.s, `invalid handle for stdout (${b.s})`);
  m(2 === c.s, `invalid handle for stderr (${c.s})`);
}
function mb(a, b) {
  O.va[a] = {j:b};
}
function Q(a) {
  return 16384 === (a & 61440);
}
function R(a, b) {
  var c = Q(a.mode) ? (c = zb(a, "x")) ? c : a.h.O ? 0 : 2 : 54;
  if (c) {
    throw new O.g(c);
  }
  for (c = O.F[Ab(a.id, b)]; c; c = c.R) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return O.O(a, b);
}
function S(a, b = {}) {
  a = fb(a);
  if (!a) {
    return {path:"", node:null};
  }
  b = Object.assign({ga:!0, oa:0}, b);
  if (8 < b.oa) {
    throw new O.g(32);
  }
  a = a.split("/").filter(k => !!k);
  for (var c = O.root, d = "/", e = 0; e < a.length; e++) {
    var g = e === a.length - 1;
    if (g && b.parent) {
      break;
    }
    c = R(c, a[e]);
    d = M(d + "/" + a[e]);
    c.B && (!g || g && b.ga) && (c = c.B.root);
    if (!g || b.C) {
      for (g = 0; 40960 === (c.mode & 61440);) {
        if (c = O.S(d), d = fb(bb(d), c), c = S(d, {oa:b.oa + 1}).node, 40 < g++) {
          throw new O.g(32);
        }
      }
    }
  }
  return {path:d, node:c};
}
function Bb(a) {
  for (var b;;) {
    if (O.da(a)) {
      return a = a.u.Ea, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}
function Ab(a, b) {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % O.F.length;
}
function Cb(a) {
  var b = Ab(a.parent.id, a.name);
  a.R = O.F[b];
  O.F[b] = a;
}
function Db(a) {
  var b = Ab(a.parent.id, a.name);
  if (O.F[b] === a) {
    O.F[b] = a.R;
  } else {
    for (b = O.F[b]; b;) {
      if (b.R === a) {
        b.R = a.R;
        break;
      }
      b = b.R;
    }
  }
}
function Eb(a) {
  var b = ["r", "w", "rw"][a & 3];
  a & 512 && (b += "w");
  return b;
}
function zb(a, b) {
  if (O.za) {
    return 0;
  }
  if (!b.includes("r") || a.mode & 292) {
    if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) {
      return 2;
    }
  } else {
    return 2;
  }
  return 0;
}
function Fb(a, b) {
  try {
    return R(a, b), 20;
  } catch (c) {
  }
  return zb(a, "wx");
}
function Gb(a, b, c) {
  try {
    var d = R(a, b);
  } catch (e) {
    return e.m;
  }
  if (a = zb(a, "wx")) {
    return a;
  }
  if (c) {
    if (!Q(d.mode)) {
      return 54;
    }
    if (O.da(d) || Bb(d) === O.fa()) {
      return 10;
    }
  } else {
    if (Q(d.mode)) {
      return 31;
    }
  }
  return 0;
}
function U(a) {
  a = O.xa(a);
  if (!a) {
    throw new O.g(8);
  }
  return a;
}
function Hb(a, b = -1) {
  m(-1 <= b);
  a = Object.assign(new O.Ja(), a);
  if (-1 == b) {
    a: {
      for (b = 0; b <= O.qa; b++) {
        if (!O.streams[b]) {
          break a;
        }
      }
      throw new O.g(33);
    }
  }
  a.s = b;
  return O.streams[b] = a;
}
function Ib(a, b = -1) {
  a = Hb(a, b);
  a.j?.ub?.(a);
  return a;
}
function Jb(a) {
  var b = [];
  for (a = [a]; a.length;) {
    var c = a.pop();
    b.push(c);
    a.push(...c.Z);
  }
  return b;
}
function V(a, b) {
  return O.J(a, (void 0 !== b ? b : 511) & 1023 | 16384, 0);
}
function Kb(a, b, c) {
  "undefined" == typeof c && (c = b, b = 438);
  return O.J(a, b | 8192, c);
}
function Lb(a, b, c) {
  a = "string" == typeof a ? S(a, {C:!c}).node : a;
  if (!a.h.v) {
    throw new O.g(63);
  }
  a.h.v(a, {mode:b & 4095 | a.mode & -4096, timestamp:Date.now()});
}
function Mb(a, b) {
  a = "string" == typeof a ? S(a, {C:!b}).node : a;
  if (!a.h.v) {
    throw new O.g(63);
  }
  a.h.v(a, {timestamp:Date.now()});
}
function Nb(a, b) {
  try {
    var c = S(a, {C:!b});
    a = c.path;
  } catch (e) {
  }
  var d = {da:!1, wa:!1, error:0, name:null, path:null, object:null, fb:!1, hb:null, gb:null};
  try {
    c = S(a, {parent:!0}), d.fb = !0, d.hb = c.path, d.gb = c.node, d.name = N(a), c = S(a, {C:!b}), d.wa = !0, d.path = c.path, d.object = c.node, d.name = c.node.name, d.da = "/" === c.path;
  } catch (e) {
    d.error = e.m;
  }
  return d;
}
function Ob(a, b, c, d) {
  a = "string" == typeof a ? a : Bb(a);
  b = M(a + "/" + b);
  return O.create(b, xb(c, d));
}
function Pb(a) {
  if (!(a.la || a.ab || a.link || a.i)) {
    if ("undefined" != typeof XMLHttpRequest) {
      throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    }
    try {
      a.i = ja(a.url), a.o = a.i.length;
    } catch (b) {
      throw new O.g(29);
    }
  }
}
var O = {root:null, Z:[], va:{}, streams:[], cb:1, F:null, ua:"/", ca:!1, za:!0, g:class extends Error {
  constructor(a) {
    super(Ba ? K(Qb(a)) : "");
    this.name = "ErrnoError";
    this.m = a;
    for (var b in yb) {
      if (yb[b] === a) {
        this.code = b;
        break;
      }
    }
  }
}, ha:{}, Ua:null, aa:0, Ga:{}, Ja:class {
  constructor() {
    this.I = {};
    this.node = null;
  }
  get object() {
    return this.node;
  }
  set object(a) {
    this.node = a;
  }
  get flags() {
    return this.I.flags;
  }
  set flags(a) {
    this.I.flags = a;
  }
  get position() {
    return this.I.position;
  }
  set position(a) {
    this.I.position = a;
  }
}, Ia:class {
  constructor(a, b, c, d) {
    a ||= this;
    this.parent = a;
    this.u = a.u;
    this.B = null;
    this.id = O.cb++;
    this.name = b;
    this.mode = c;
    this.h = {};
    this.j = {};
    this.V = d;
  }
  get read() {
    return 365 === (this.mode & 365);
  }
  set read(a) {
    a ? this.mode |= 365 : this.mode &= -366;
  }
  get write() {
    return 146 === (this.mode & 146);
  }
  set write(a) {
    a ? this.mode |= 146 : this.mode &= -147;
  }
  get ab() {
    return Q(this.mode);
  }
  get la() {
    return 8192 === (this.mode & 61440);
  }
}, createNode(a, b, c, d) {
  m("object" == typeof a);
  a = new O.Ia(a, b, c, d);
  Cb(a);
  return a;
}, da(a) {
  return a === a.parent;
}, isFile(a) {
  return 32768 === (a & 61440);
}, Ab(a) {
  return 49152 === (a & 49152);
}, qa:4096, xa:a => O.streams[a], Pa:{open(a) {
  a.j = O.Va(a.node.V).j;
  a.j.open?.(a);
}, A() {
  throw new O.g(70);
}}, ma:a => a >> 8, Eb:a => a & 255, P:(a, b) => a << 8 | b, Va:a => O.va[a], Ha(a, b) {
  function c(k) {
    m(0 < O.aa);
    O.aa--;
    return b(k);
  }
  function d(k) {
    if (k) {
      if (!d.Ta) {
        return d.Ta = !0, c(k);
      }
    } else {
      ++g >= e.length && c(null);
    }
  }
  "function" == typeof a && (b = a, a = !1);
  O.aa++;
  1 < O.aa && p(`warning: ${O.aa} FS.syncfs operations in flight at once, probably just doing extra work`);
  var e = Jb(O.root.u), g = 0;
  e.forEach(k => {
    if (!k.type.Ha) {
      return d(null);
    }
    k.type.Ha(k, a, d);
  });
}, u(a, b, c) {
  if ("string" == typeof a) {
    throw a;
  }
  var d = "/" === c, e = !c;
  if (d && O.root) {
    throw new O.g(10);
  }
  if (!d && !e) {
    var g = S(c, {ga:!1});
    c = g.path;
    g = g.node;
    if (g.B) {
      throw new O.g(10);
    }
    if (!Q(g.mode)) {
      throw new O.g(54);
    }
  }
  b = {type:a, Hb:b, Ea:c, Z:[]};
  a = a.u(b);
  a.u = b;
  b.root = a;
  d ? O.root = a : g && (g.B = b, g.u && g.u.Z.push(b));
  return a;
}, Lb(a) {
  a = S(a, {ga:!1});
  if (!a.node.B) {
    throw new O.g(28);
  }
  a = a.node;
  var b = a.B, c = Jb(b);
  Object.keys(O.F).forEach(d => {
    for (d = O.F[d]; d;) {
      var e = d.R;
      c.includes(d.u) && Db(d);
      d = e;
    }
  });
  a.B = null;
  b = a.u.Z.indexOf(b);
  m(-1 !== b);
  a.u.Z.splice(b, 1);
}, O(a, b) {
  return a.h.O(a, b);
}, J(a, b, c) {
  var d = S(a, {parent:!0}).node;
  a = N(a);
  if (!a || "." === a || ".." === a) {
    throw new O.g(28);
  }
  var e = Fb(d, a);
  if (e) {
    throw new O.g(e);
  }
  if (!d.h.J) {
    throw new O.g(63);
  }
  return d.h.J(d, a, b, c);
}, create(a, b) {
  return O.J(a, (void 0 !== b ? b : 438) & 4095 | 32768, 0);
}, Fb(a, b) {
  a = a.split("/");
  for (var c = "", d = 0; d < a.length; ++d) {
    if (a[d]) {
      c += "/" + a[d];
      try {
        V(c, b);
      } catch (e) {
        if (20 != e.m) {
          throw e;
        }
      }
    }
  }
}, L(a, b) {
  if (!fb(a)) {
    throw new O.g(44);
  }
  var c = S(b, {parent:!0}).node;
  if (!c) {
    throw new O.g(44);
  }
  b = N(b);
  var d = Fb(c, b);
  if (d) {
    throw new O.g(d);
  }
  if (!c.h.L) {
    throw new O.g(63);
  }
  return c.h.L(c, b, a);
}, X(a, b) {
  var c = bb(a), d = bb(b), e = N(a), g = N(b);
  var k = S(a, {parent:!0});
  var n = k.node;
  k = S(b, {parent:!0});
  k = k.node;
  if (!n || !k) {
    throw new O.g(44);
  }
  if (n.u !== k.u) {
    throw new O.g(75);
  }
  var r = R(n, e);
  a = gb(a, d);
  if ("." !== a.charAt(0)) {
    throw new O.g(28);
  }
  a = gb(b, c);
  if ("." !== a.charAt(0)) {
    throw new O.g(55);
  }
  try {
    var u = R(k, g);
  } catch (q) {
  }
  if (r !== u) {
    b = Q(r.mode);
    if (e = Gb(n, e, b)) {
      throw new O.g(e);
    }
    if (e = u ? Gb(k, g, b) : Fb(k, g)) {
      throw new O.g(e);
    }
    if (!n.h.X) {
      throw new O.g(63);
    }
    if (r.B || u && u.B) {
      throw new O.g(10);
    }
    if (k !== n && (e = zb(n, "w"))) {
      throw new O.g(e);
    }
    Db(r);
    try {
      n.h.X(r, k, g), r.parent = k;
    } catch (q) {
      throw q;
    } finally {
      Cb(r);
    }
  }
}, T(a) {
  var b = S(a, {parent:!0}).node;
  a = N(a);
  var c = R(b, a), d = Gb(b, a, !0);
  if (d) {
    throw new O.g(d);
  }
  if (!b.h.T) {
    throw new O.g(63);
  }
  if (c.B) {
    throw new O.g(10);
  }
  b.h.T(b, a);
  Db(c);
}, W(a) {
  a = S(a, {C:!0}).node;
  if (!a.h.W) {
    throw new O.g(54);
  }
  return a.h.W(a);
}, M(a) {
  var b = S(a, {parent:!0}).node;
  if (!b) {
    throw new O.g(44);
  }
  a = N(a);
  var c = R(b, a), d = Gb(b, a, !1);
  if (d) {
    throw new O.g(d);
  }
  if (!b.h.M) {
    throw new O.g(63);
  }
  if (c.B) {
    throw new O.g(10);
  }
  b.h.M(b, a);
  Db(c);
}, S(a) {
  a = S(a).node;
  if (!a) {
    throw new O.g(44);
  }
  if (!a.h.S) {
    throw new O.g(28);
  }
  return fb(Bb(a.parent), a.h.S(a));
}, stat(a, b) {
  a = S(a, {C:!b}).node;
  if (!a) {
    throw new O.g(44);
  }
  if (!a.h.D) {
    throw new O.g(63);
  }
  return a.h.D(a);
}, Ca(a) {
  return O.stat(a, !0);
}, Cb(a, b) {
  Lb(a, b, !0);
}, vb(a, b) {
  a = U(a);
  Lb(a.node, b);
}, Db(a) {
  Mb(a, !0);
}, wb(a) {
  a = U(a);
  Mb(a.node);
}, truncate(a, b) {
  if (0 > b) {
    throw new O.g(28);
  }
  a = "string" == typeof a ? S(a, {C:!0}).node : a;
  if (!a.h.v) {
    throw new O.g(63);
  }
  if (Q(a.mode)) {
    throw new O.g(31);
  }
  if (!O.isFile(a.mode)) {
    throw new O.g(28);
  }
  var c = zb(a, "w");
  if (c) {
    throw new O.g(c);
  }
  a.h.v(a, {size:b, timestamp:Date.now()});
}, yb(a, b) {
  a = U(a);
  if (0 === (a.flags & 2097155)) {
    throw new O.g(28);
  }
  O.truncate(a.node, b);
}, Mb(a, b, c) {
  a = S(a, {C:!0}).node;
  a.h.v(a, {timestamp:Math.max(b, c)});
}, open(a, b, c) {
  if ("" === a) {
    throw new O.g(44);
  }
  if ("string" == typeof b) {
    var d = {r:0, "r+":2, w:577, "w+":578, a:1089, "a+":1090}[b];
    if ("undefined" == typeof d) {
      throw Error(`Unknown file open mode: ${b}`);
    }
    b = d;
  }
  c = b & 64 ? ("undefined" == typeof c ? 438 : c) & 4095 | 32768 : 0;
  if ("object" == typeof a) {
    var e = a;
  } else {
    a = M(a);
    try {
      e = S(a, {C:!(b & 131072)}).node;
    } catch (g) {
    }
  }
  d = !1;
  if (b & 64) {
    if (e) {
      if (b & 128) {
        throw new O.g(20);
      }
    } else {
      e = O.J(a, c, 0), d = !0;
    }
  }
  if (!e) {
    throw new O.g(44);
  }
  8192 === (e.mode & 61440) && (b &= -513);
  if (b & 65536 && !Q(e.mode)) {
    throw new O.g(54);
  }
  if (!d && (c = e ? 40960 === (e.mode & 61440) ? 32 : Q(e.mode) && ("r" !== Eb(b) || b & 512) ? 31 : zb(e, Eb(b)) : 44)) {
    throw new O.g(c);
  }
  b & 512 && !d && O.truncate(e, 0);
  b &= -131713;
  e = Hb({node:e, path:Bb(e), flags:b, seekable:!0, position:0, j:e.j, kb:[], error:!1});
  e.j.open && e.j.open(e);
  !f.logReadFiles || b & 1 || a in O.Ga || (O.Ga[a] = 1);
  return e;
}, close(a) {
  if (null === a.s) {
    throw new O.g(8);
  }
  a.N && (a.N = null);
  try {
    a.j.close && a.j.close(a);
  } catch (b) {
    throw b;
  } finally {
    O.streams[a.s] = null;
  }
  a.s = null;
}, A(a, b, c) {
  if (null === a.s) {
    throw new O.g(8);
  }
  if (!a.seekable || !a.j.A) {
    throw new O.g(70);
  }
  if (0 != c && 1 != c && 2 != c) {
    throw new O.g(28);
  }
  a.position = a.j.A(a, b, c);
  a.kb = [];
  return a.position;
}, read(a, b, c, d, e) {
  m(0 <= c);
  if (0 > d || 0 > e) {
    throw new O.g(28);
  }
  if (null === a.s) {
    throw new O.g(8);
  }
  if (1 === (a.flags & 2097155)) {
    throw new O.g(8);
  }
  if (Q(a.node.mode)) {
    throw new O.g(31);
  }
  if (!a.j.read) {
    throw new O.g(28);
  }
  var g = "undefined" != typeof e;
  if (!g) {
    e = a.position;
  } else if (!a.seekable) {
    throw new O.g(70);
  }
  b = a.j.read(a, b, c, d, e);
  g || (a.position += b);
  return b;
}, write(a, b, c, d, e, g) {
  m(0 <= c);
  if (0 > d || 0 > e) {
    throw new O.g(28);
  }
  if (null === a.s) {
    throw new O.g(8);
  }
  if (0 === (a.flags & 2097155)) {
    throw new O.g(8);
  }
  if (Q(a.node.mode)) {
    throw new O.g(31);
  }
  if (!a.j.write) {
    throw new O.g(28);
  }
  a.seekable && a.flags & 1024 && O.A(a, 0, 2);
  var k = "undefined" != typeof e;
  if (!k) {
    e = a.position;
  } else if (!a.seekable) {
    throw new O.g(70);
  }
  b = a.j.write(a, b, c, d, e, g);
  k || (a.position += b);
  return b;
}, Y(a, b, c) {
  if (null === a.s) {
    throw new O.g(8);
  }
  if (0 > b || 0 >= c) {
    throw new O.g(28);
  }
  if (0 === (a.flags & 2097155)) {
    throw new O.g(8);
  }
  if (!O.isFile(a.node.mode) && !Q(a.node.mode)) {
    throw new O.g(43);
  }
  if (!a.j.Y) {
    throw new O.g(138);
  }
  a.j.Y(a, b, c);
}, U(a, b, c, d, e) {
  if (0 !== (d & 2) && 0 === (e & 2) && 2 !== (a.flags & 2097155)) {
    throw new O.g(2);
  }
  if (1 === (a.flags & 2097155)) {
    throw new O.g(2);
  }
  if (!a.j.U) {
    throw new O.g(43);
  }
  if (!b) {
    throw new O.g(28);
  }
  return a.j.U(a, b, c, d, e);
}, $(a, b, c, d, e) {
  m(0 <= c);
  return a.j.$ ? a.j.$(a, b, c, d, e) : 0;
}, ka(a, b, c) {
  if (!a.j.ka) {
    throw new O.g(59);
  }
  return a.j.ka(a, b, c);
}, Jb(a, b = {}) {
  b.flags = b.flags || 0;
  b.encoding = b.encoding || "binary";
  if ("utf8" !== b.encoding && "binary" !== b.encoding) {
    throw Error(`Invalid encoding type "${b.encoding}"`);
  }
  var c, d = O.open(a, b.flags);
  a = O.stat(a).size;
  var e = new Uint8Array(a);
  O.read(d, e, 0, a, 0);
  "utf8" === b.encoding ? c = $a(e) : "binary" === b.encoding && (c = e);
  O.close(d);
  return c;
}, Nb(a, b, c = {}) {
  c.flags = c.flags || 577;
  a = O.open(a, c.flags, c.mode);
  if ("string" == typeof b) {
    var d = new Uint8Array(ib(b) + 1);
    b = jb(b, d, 0, d.length);
    O.write(a, d, 0, b, void 0, c.Oa);
  } else if (ArrayBuffer.isView(b)) {
    O.write(a, b, 0, b.byteLength, void 0, c.Oa);
  } else {
    throw Error("Unsupported data type");
  }
  O.close(a);
}, fa:() => O.ua, rb(a) {
  a = S(a, {C:!0});
  if (null === a.node) {
    throw new O.g(44);
  }
  if (!Q(a.node.mode)) {
    throw new O.g(54);
  }
  var b = zb(a.node, "x");
  if (b) {
    throw new O.g(b);
  }
  O.ua = a.path;
}, Ib() {
  O.ca = !1;
  Rb(0);
  for (var a = 0; a < O.streams.length; a++) {
    var b = O.streams[a];
    b && O.close(b);
  }
}, xb(a, b) {
  a = Nb(a, b);
  return a.wa ? a.object : null;
}, ta(a, b) {
  a = "string" == typeof a ? a : Bb(a);
  for (b = b.split("/").reverse(); b.length;) {
    var c = b.pop();
    if (c) {
      var d = M(a + "/" + c);
      try {
        V(d);
      } catch (e) {
      }
      a = d;
    }
  }
  return d;
}, ea(a, b, c, d, e, g) {
  var k = b;
  a && (a = "string" == typeof a ? a : Bb(a), k = b ? M(a + "/" + b) : a);
  a = xb(d, e);
  k = O.create(k, a);
  if (c) {
    if ("string" == typeof c) {
      b = Array(c.length);
      d = 0;
      for (e = c.length; d < e; ++d) {
        b[d] = c.charCodeAt(d);
      }
      c = b;
    }
    Lb(k, a | 146);
    b = O.open(k, 577);
    O.write(b, c, 0, c.length, 0, g);
    O.close(b);
    Lb(k, a);
  }
}, H(a, b, c, d) {
  a = cb("string" == typeof a ? a : Bb(a), b);
  b = xb(!!c, !!d);
  var e;
  (e = O.H).ma ?? (e.ma = 64);
  e = O.P(O.H.ma++, 0);
  mb(e, {open(g) {
    g.seekable = !1;
  }, close() {
    d?.buffer?.length && d(10);
  }, read(g, k, n, r) {
    for (var u = 0, q = 0; q < r; q++) {
      try {
        var v = c();
      } catch (A) {
        throw new O.g(29);
      }
      if (void 0 === v && 0 === u) {
        throw new O.g(6);
      }
      if (null === v || void 0 === v) {
        break;
      }
      u++;
      k[n + q] = v;
    }
    u && (g.node.timestamp = Date.now());
    return u;
  }, write(g, k, n, r) {
    for (var u = 0; u < r; u++) {
      try {
        d(k[n + u]);
      } catch (q) {
        throw new O.g(29);
      }
    }
    r && (g.node.timestamp = Date.now());
    return u;
  }});
  return Kb(a, b, e);
}, sa(a, b, c, d, e) {
  function g(q, v, A, C, D) {
    q = q.node.i;
    if (D >= q.length) {
      return 0;
    }
    C = Math.min(q.length - D, C);
    m(0 <= C);
    if (q.slice) {
      for (var E = 0; E < C; E++) {
        v[A + E] = q[D + E];
      }
    } else {
      for (E = 0; E < C; E++) {
        v[A + E] = q.get(D + E);
      }
    }
    return C;
  }
  class k {
    constructor() {
      this.ja = !1;
      this.I = [];
      this.ia = void 0;
      this.Aa = this.Ba = 0;
    }
    get(q) {
      if (!(q > this.length - 1 || 0 > q)) {
        var v = q % this.Fa;
        return this.ia(q / this.Fa | 0)[v];
      }
    }
    jb(q) {
      this.ia = q;
    }
    Da() {
      var q = new XMLHttpRequest();
      q.open("HEAD", c, !1);
      q.send(null);
      if (!(200 <= q.status && 300 > q.status || 304 === q.status)) {
        throw Error("Couldn't load " + c + ". Status: " + q.status);
      }
      var v = Number(q.getResponseHeader("Content-length")), A, C = (A = q.getResponseHeader("Accept-Ranges")) && "bytes" === A;
      q = (A = q.getResponseHeader("Content-Encoding")) && "gzip" === A;
      var D = 1048576;
      C || (D = v);
      var E = this;
      E.jb(ha => {
        var T = ha * D, L = (ha + 1) * D - 1;
        L = Math.min(L, v - 1);
        if ("undefined" == typeof E.I[ha]) {
          var nc = E.I;
          if (T > L) {
            throw Error("invalid range (" + T + ", " + L + ") or no bytes requested!");
          }
          if (L > v - 1) {
            throw Error("only " + v + " bytes available! programmer error!");
          }
          var G = new XMLHttpRequest();
          G.open("GET", c, !1);
          v !== D && G.setRequestHeader("Range", "bytes=" + T + "-" + L);
          G.responseType = "arraybuffer";
          G.overrideMimeType && G.overrideMimeType("text/plain; charset=x-user-defined");
          G.send(null);
          if (!(200 <= G.status && 300 > G.status || 304 === G.status)) {
            throw Error("Couldn't load " + c + ". Status: " + G.status);
          }
          void 0 !== G.response ? T = new Uint8Array(G.response || []) : (L = G.responseText || "", T = Array(ib(L) + 1), L = jb(L, T, 0, T.length), T.length = L);
          nc[ha] = T;
        }
        if ("undefined" == typeof E.I[ha]) {
          throw Error("doXHR failed!");
        }
        return E.I[ha];
      });
      if (q || !v) {
        D = v = 1, D = v = this.ia(0).length, la("LazyFiles on gzip forces download of the whole file when length is accessed");
      }
      this.Ba = v;
      this.Aa = D;
      this.ja = !0;
    }
    get length() {
      this.ja || this.Da();
      return this.Ba;
    }
    get Fa() {
      this.ja || this.Da();
      return this.Aa;
    }
  }
  var n = "undefined" != typeof XMLHttpRequest ? {la:!1, i:new k()} : {la:!1, url:c}, r = Ob(a, b, d, e);
  n.i ? r.i = n.i : n.url && (r.i = null, r.url = n.url);
  Object.defineProperties(r, {o:{get:function() {
    return this.i.length;
  }}});
  var u = {};
  Object.keys(r.j).forEach(q => {
    var v = r.j[q];
    u[q] = (...A) => {
      Pb(r);
      return v(...A);
    };
  });
  u.read = (q, v, A, C, D) => {
    Pb(r);
    return g(q, v, A, C, D);
  };
  u.U = (q, v, A) => {
    Pb(r);
    var C = qb();
    if (!C) {
      throw new O.g(48);
    }
    g(q, w, C, v, A);
    return {ib:C, Ka:!0};
  };
  r.j = u;
  return r;
}, lb() {
  h("FS.absolutePath has been removed; use PATH_FS.resolve instead");
}, sb() {
  h("FS.createFolder has been removed; use FS.mkdir instead");
}, tb() {
  h("FS.createLink has been removed; use FS.symlink instead");
}, Bb() {
  h("FS.joinPath has been removed; use PATH.join instead");
}, Gb() {
  h("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
}, Kb() {
  h("FS.standardizePath has been removed; use PATH.normalize instead");
}};
function Sb(a, b, c) {
  if ("/" === b.charAt(0)) {
    return b;
  }
  a = -100 === a ? O.fa() : U(a).path;
  if (0 == b.length) {
    if (!c) {
      throw new O.g(44);
    }
    return a;
  }
  return M(a + "/" + b);
}
function Tb(a, b, c) {
  a = a(b);
  x[c >> 2] = a.Sa;
  x[c + 4 >> 2] = a.mode;
  y[c + 8 >> 2] = a.eb;
  x[c + 12 >> 2] = a.uid;
  x[c + 16 >> 2] = a.Wa;
  x[c + 20 >> 2] = a.V;
  z[c + 24 >> 3] = BigInt(a.size);
  x[c + 32 >> 2] = 4096;
  x[c + 36 >> 2] = a.Na;
  b = a.La.getTime();
  var d = a.bb.getTime(), e = a.Ra.getTime();
  z[c + 40 >> 3] = BigInt(Math.floor(b / 1000));
  y[c + 48 >> 2] = b % 1000 * 1E6;
  z[c + 56 >> 3] = BigInt(Math.floor(d / 1000));
  y[c + 64 >> 2] = d % 1000 * 1E6;
  z[c + 72 >> 3] = BigInt(Math.floor(e / 1000));
  y[c + 80 >> 2] = e % 1000 * 1E6;
  z[c + 88 >> 3] = BigInt(a.Xa);
  return 0;
}
var Ub = void 0;
function W() {
  m(void 0 != Ub);
  var a = x[+Ub >> 2];
  Ub += 4;
  return a;
}
var Vb = (a, b, c) => {
  m("number" == typeof c, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  jb(a, qa, b, c);
}, Wb = a => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), Xb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Yb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Zb = {}, ac = () => {
  if (!$b) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _:fa || "./this.program"}, b;
    for (b in Zb) {
      void 0 === Zb[b] ? delete a[b] : a[b] = Zb[b];
    }
    var c = [];
    for (b in a) {
      c.push(`${b}=${a[b]}`);
    }
    $b = c;
  }
  return $b;
}, $b, cc = (a, b) => {
  pa = a;
  bc();
  Ya && !b && (b = `program exited (with status: ${a}), but keepRuntimeAlive() is set (counter=${0}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`, ba(b), p(b));
  pa = a;
  Ya || (f.onExit?.(a), oa = !0);
  throw new Xa(a);
}, dc = (a, b, c, d) => {
  for (var e = 0, g = 0; g < c; g++) {
    var k = y[b >> 2], n = y[b + 4 >> 2];
    b += 8;
    k = O.read(a, w, k, n, d);
    if (0 > k) {
      return -1;
    }
    e += k;
    if (k < n) {
      break;
    }
    "undefined" != typeof d && (d += k);
  }
  return e;
}, ec = (a, b, c, d) => {
  for (var e = 0, g = 0; g < c; g++) {
    var k = y[b >> 2], n = y[b + 4 >> 2];
    b += 8;
    k = O.write(a, w, k, n, d);
    if (0 > k) {
      return -1;
    }
    e += k;
    if (k < n) {
      break;
    }
    "undefined" != typeof d && (d += k);
  }
  return e;
}, fc = a => {
  if (a instanceof Xa || "unwind" == a) {
    return pa;
  }
  va();
  a instanceof WebAssembly.RuntimeError && 0 >= X() && p("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 262144)");
  throw a;
}, gc, hc = O.ta, ic = O.sa, jc = O.H;
O.Qa = wb;
[44].forEach(a => {
  O.ha[a] = new O.g(a);
  O.ha[a].stack = "<generic error, no stack>";
});
O.F = Array(4096);
O.u(P, {}, "/");
V("/tmp");
V("/home");
V("/home/web_user");
(function() {
  V("/dev");
  mb(O.P(1, 3), {read:() => 0, write:(d, e, g, k) => k});
  Kb("/dev/null", O.P(1, 3));
  lb(O.P(5, 0), ob);
  lb(O.P(6, 0), pb);
  Kb("/dev/tty", O.P(5, 0));
  Kb("/dev/tty1", O.P(6, 0));
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (b = eb(a).byteLength);
    return a[--b];
  };
  O.H("/dev", "random", c);
  O.H("/dev", "urandom", c);
  V("/dev/shm");
  V("/dev/shm/tmp");
})();
(function() {
  V("/proc");
  var a = V("/proc/self");
  V("/proc/self/fd");
  O.u({u() {
    var b = O.createNode(a, "fd", 16895, 73);
    b.h = {O(c, d) {
      var e = U(+d);
      c = {parent:null, u:{Ea:"fake"}, h:{S:() => e.path}};
      return c.parent = c;
    }};
    return b;
  }}, {}, "/proc/self/fd");
})();
O.Ua = {MEMFS:P};
f.FS_createPath = O.ta;
f.FS_createDataFile = O.ea;
f.FS_createPreloadedFile = O.Qa;
f.FS_unlink = O.M;
f.FS_createLazyFile = O.sa;
f.FS_createDevice = O.H;
var uc = {__assert_fail:(a, b, c, d) => {
  h(`Assertion failed: ${K(a)}, at: ` + [b ? K(b) : "unknown filename", c, d ? K(d) : "unknown function"]);
}, __syscall_dup:function(a) {
  try {
    var b = U(a);
    return Ib(b).s;
  } catch (c) {
    if ("undefined" == typeof O || "ErrnoError" !== c.name) {
      throw c;
    }
    return -c.m;
  }
}, __syscall_dup3:function(a, b, c) {
  try {
    var d = U(a);
    m(!c);
    if (d.s === b) {
      return -28;
    }
    if (0 > b || b >= O.qa) {
      return -8;
    }
    var e = O.xa(b);
    e && O.close(e);
    return Ib(d, b).s;
  } catch (g) {
    if ("undefined" == typeof O || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.m;
  }
}, __syscall_fcntl64:function(a, b, c) {
  Ub = c;
  try {
    var d = U(a);
    switch(b) {
      case 0:
        var e = W();
        if (0 > e) {
          break;
        }
        for (; O.streams[e];) {
          e++;
        }
        return Ib(d, e).s;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = W(), d.flags |= e, 0;
      case 12:
        return e = W(), ra[e + 0 >> 1] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch (g) {
    if ("undefined" == typeof O || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.m;
  }
}, __syscall_fstat64:function(a, b) {
  try {
    var c = U(a);
    return Tb(O.stat, c.path, b);
  } catch (d) {
    if ("undefined" == typeof O || "ErrnoError" !== d.name) {
      throw d;
    }
    return -d.m;
  }
}, __syscall_getdents64:function(a, b, c) {
  try {
    var d = U(a);
    d.N || (d.N = O.W(d.path));
    a = 0;
    for (var e = O.A(d, 0, 1), g = Math.floor(e / 280); g < d.N.length && a + 280 <= c;) {
      var k = d.N[g];
      if ("." === k) {
        var n = d.node.id;
        var r = 4;
      } else if (".." === k) {
        n = S(d.path, {parent:!0}).node.id, r = 4;
      } else {
        var u = R(d.node, k);
        n = u.id;
        r = 8192 === (u.mode & 61440) ? 2 : Q(u.mode) ? 4 : 40960 === (u.mode & 61440) ? 10 : 8;
      }
      m(n);
      z[b + a >> 3] = BigInt(n);
      z[b + a + 8 >> 3] = BigInt(280 * (g + 1));
      ra[b + a + 16 >> 1] = 280;
      w[b + a + 18] = r;
      Vb(k, b + a + 19, 256);
      a += 280;
      g += 1;
    }
    O.A(d, 280 * g, 0);
    return a;
  } catch (q) {
    if ("undefined" == typeof O || "ErrnoError" !== q.name) {
      throw q;
    }
    return -q.m;
  }
}, __syscall_ioctl:function(a, b, c) {
  Ub = c;
  try {
    var d = U(a);
    switch(b) {
      case 21509:
        return d.l ? 0 : -59;
      case 21505:
        if (!d.l) {
          return -59;
        }
        if (d.l.K.Ya) {
          a = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var e = W();
          x[e >> 2] = 25856;
          x[e + 4 >> 2] = 5;
          x[e + 8 >> 2] = 191;
          x[e + 12 >> 2] = 35387;
          for (var g = 0; 32 > g; g++) {
            w[e + g + 17] = a[g] || 0;
          }
        }
        return 0;
      case 21510:
      case 21511:
      case 21512:
        return d.l ? 0 : -59;
      case 21506:
      case 21507:
      case 21508:
        if (!d.l) {
          return -59;
        }
        if (d.l.K.Za) {
          for (e = W(), a = [], g = 0; 32 > g; g++) {
            a.push(w[e + g + 17]);
          }
        }
        return 0;
      case 21519:
        if (!d.l) {
          return -59;
        }
        e = W();
        return x[e >> 2] = 0;
      case 21520:
        return d.l ? -28 : -59;
      case 21531:
        return e = W(), O.ka(d, b, e);
      case 21523:
        if (!d.l) {
          return -59;
        }
        d.l.K.$a && (g = [24, 80], e = W(), ra[e >> 1] = g[0], ra[e + 2 >> 1] = g[1]);
        return 0;
      case 21524:
        return d.l ? 0 : -59;
      case 21515:
        return d.l ? 0 : -59;
      default:
        return -28;
    }
  } catch (k) {
    if ("undefined" == typeof O || "ErrnoError" !== k.name) {
      throw k;
    }
    return -k.m;
  }
}, __syscall_lstat64:function(a, b) {
  try {
    return a = K(a), Tb(O.Ca, a, b);
  } catch (c) {
    if ("undefined" == typeof O || "ErrnoError" !== c.name) {
      throw c;
    }
    return -c.m;
  }
}, __syscall_newfstatat:function(a, b, c, d) {
  try {
    b = K(b);
    var e = d & 256, g = d & 4096;
    d &= -6401;
    m(!d, `unknown flags in __syscall_newfstatat: ${d}`);
    b = Sb(a, b, g);
    return Tb(e ? O.Ca : O.stat, b, c);
  } catch (k) {
    if ("undefined" == typeof O || "ErrnoError" !== k.name) {
      throw k;
    }
    return -k.m;
  }
}, __syscall_openat:function(a, b, c, d) {
  Ub = d;
  try {
    b = K(b);
    b = Sb(a, b);
    var e = d ? W() : 0;
    return O.open(b, c, e).s;
  } catch (g) {
    if ("undefined" == typeof O || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.m;
  }
}, __syscall_renameat:function(a, b, c, d) {
  try {
    return b = K(b), d = K(d), b = Sb(a, b), d = Sb(c, d), O.X(b, d), 0;
  } catch (e) {
    if ("undefined" == typeof O || "ErrnoError" !== e.name) {
      throw e;
    }
    return -e.m;
  }
}, __syscall_rmdir:function(a) {
  try {
    return a = K(a), O.T(a), 0;
  } catch (b) {
    if ("undefined" == typeof O || "ErrnoError" !== b.name) {
      throw b;
    }
    return -b.m;
  }
}, __syscall_stat64:function(a, b) {
  try {
    return a = K(a), Tb(O.stat, a, b);
  } catch (c) {
    if ("undefined" == typeof O || "ErrnoError" !== c.name) {
      throw c;
    }
    return -c.m;
  }
}, __syscall_unlinkat:function(a, b, c) {
  try {
    return b = K(b), b = Sb(a, b), 0 === c ? O.M(b) : 512 === c ? O.T(b) : h("Invalid flags passed to unlinkat"), 0;
  } catch (d) {
    if ("undefined" == typeof O || "ErrnoError" !== d.name) {
      throw d;
    }
    return -d.m;
  }
}, _emscripten_get_now_is_monotonic:() => 1, _emscripten_throw_longjmp:() => {
  throw Infinity;
}, _gmtime_js:function(a, b) {
  a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
  a = new Date(1000 * a);
  x[b >> 2] = a.getUTCSeconds();
  x[b + 4 >> 2] = a.getUTCMinutes();
  x[b + 8 >> 2] = a.getUTCHours();
  x[b + 12 >> 2] = a.getUTCDate();
  x[b + 16 >> 2] = a.getUTCMonth();
  x[b + 20 >> 2] = a.getUTCFullYear() - 1900;
  x[b + 24 >> 2] = a.getUTCDay();
  x[b + 28 >> 2] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864E5 | 0;
}, _localtime_js:function(a, b) {
  a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
  a = new Date(1000 * a);
  x[b >> 2] = a.getSeconds();
  x[b + 4 >> 2] = a.getMinutes();
  x[b + 8 >> 2] = a.getHours();
  x[b + 12 >> 2] = a.getDate();
  x[b + 16 >> 2] = a.getMonth();
  x[b + 20 >> 2] = a.getFullYear() - 1900;
  x[b + 24 >> 2] = a.getDay();
  x[b + 28 >> 2] = (Wb(a.getFullYear()) ? Xb : Yb)[a.getMonth()] + a.getDate() - 1 | 0;
  x[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
  var c = (new Date(a.getFullYear(), 6, 1)).getTimezoneOffset(), d = (new Date(a.getFullYear(), 0, 1)).getTimezoneOffset();
  x[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
}, _mktime_js:function(a) {
  var b = new Date(x[a + 20 >> 2] + 1900, x[a + 16 >> 2], x[a + 12 >> 2], x[a + 8 >> 2], x[a + 4 >> 2], x[a >> 2], 0), c = x[a + 32 >> 2], d = b.getTimezoneOffset(), e = (new Date(b.getFullYear(), 6, 1)).getTimezoneOffset(), g = (new Date(b.getFullYear(), 0, 1)).getTimezoneOffset(), k = Math.min(g, e);
  0 > c ? x[a + 32 >> 2] = Number(e != g && k == d) : 0 < c != (k == d) && (e = Math.max(g, e), b.setTime(b.getTime() + 60000 * ((0 < c ? k : e) - d)));
  x[a + 24 >> 2] = b.getDay();
  x[a + 28 >> 2] = (Wb(b.getFullYear()) ? Xb : Yb)[b.getMonth()] + b.getDate() - 1 | 0;
  x[a >> 2] = b.getSeconds();
  x[a + 4 >> 2] = b.getMinutes();
  x[a + 8 >> 2] = b.getHours();
  x[a + 12 >> 2] = b.getDate();
  x[a + 16 >> 2] = b.getMonth();
  x[a + 20 >> 2] = b.getYear();
  a = b.getTime();
  return BigInt(isNaN(a) ? -1 : a / 1000);
}, _tzset_js:(a, b, c, d) => {
  var e = (new Date()).getFullYear(), g = (new Date(e, 0, 1)).getTimezoneOffset();
  e = (new Date(e, 6, 1)).getTimezoneOffset();
  y[a >> 2] = 60 * Math.max(g, e);
  x[b >> 2] = Number(g != e);
  b = k => {
    var n = Math.abs(k);
    return `UTC${0 <= k ? "-" : "+"}${String(Math.floor(n / 60)).padStart(2, "0")}${String(n % 60).padStart(2, "0")}`;
  };
  a = b(g);
  b = b(e);
  m(a);
  m(b);
  m(16 >= ib(a), `timezone name truncated to fit in TZNAME_MAX (${a})`);
  m(16 >= ib(b), `timezone name truncated to fit in TZNAME_MAX (${b})`);
  e < g ? (Vb(a, c, 17), Vb(b, d, 17)) : (Vb(a, d, 17), Vb(b, c, 17));
}, emscripten_date_now:() => Date.now(), emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
  var b = qa.length;
  a >>>= 0;
  m(a > b);
  if (2147483648 < a) {
    return p(`Cannot enlarge memory, requested ${a} bytes, but the limit is ${2147483648} bytes!`), !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = b * (1 + 0.2 / c);
    d = Math.min(d, a + 100663296);
    var e = Math, g = e.min;
    d = Math.max(a, d);
    m(65536, "alignment argument is required");
    e = g.call(e, 2147483648, 65536 * Math.ceil(d / 65536));
    a: {
      g = e;
      d = na.buffer;
      var k = (g - d.byteLength + 65535) / 65536 | 0;
      try {
        na.grow(k);
        sa();
        var n = 1;
        break a;
      } catch (r) {
        p(`growMemory: Attempted to grow heap from ${d.byteLength} bytes to ${g} bytes, but got error: ${r}`);
      }
      n = void 0;
    }
    if (n) {
      return !0;
    }
  }
  p(`Failed to grow the heap from ${b} bytes to ${e} bytes, not enough memory!`);
  return !1;
}, environ_get:(a, b) => {
  var c = 0;
  ac().forEach((d, e) => {
    var g = b + c;
    e = y[a + 4 * e >> 2] = g;
    for (g = 0; g < d.length; ++g) {
      m(d.charCodeAt(g) === (d.charCodeAt(g) & 255)), w[e++] = d.charCodeAt(g);
    }
    w[e] = 0;
    c += d.length + 1;
  });
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = ac();
  y[a >> 2] = c.length;
  var d = 0;
  c.forEach(e => d += e.length + 1);
  y[b >> 2] = d;
  return 0;
}, exit:cc, fd_close:function(a) {
  try {
    var b = U(a);
    O.close(b);
    return 0;
  } catch (c) {
    if ("undefined" == typeof O || "ErrnoError" !== c.name) {
      throw c;
    }
    return c.m;
  }
}, fd_pread:function(a, b, c, d, e) {
  d = -9007199254740992 > d || 9007199254740992 < d ? NaN : Number(d);
  try {
    if (isNaN(d)) {
      return 61;
    }
    var g = U(a), k = dc(g, b, c, d);
    y[e >> 2] = k;
    return 0;
  } catch (n) {
    if ("undefined" == typeof O || "ErrnoError" !== n.name) {
      throw n;
    }
    return n.m;
  }
}, fd_pwrite:function(a, b, c, d, e) {
  d = -9007199254740992 > d || 9007199254740992 < d ? NaN : Number(d);
  try {
    if (isNaN(d)) {
      return 61;
    }
    var g = U(a), k = ec(g, b, c, d);
    y[e >> 2] = k;
    return 0;
  } catch (n) {
    if ("undefined" == typeof O || "ErrnoError" !== n.name) {
      throw n;
    }
    return n.m;
  }
}, fd_read:function(a, b, c, d) {
  try {
    var e = U(a), g = dc(e, b, c);
    y[d >> 2] = g;
    return 0;
  } catch (k) {
    if ("undefined" == typeof O || "ErrnoError" !== k.name) {
      throw k;
    }
    return k.m;
  }
}, fd_seek:function(a, b, c, d) {
  b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
  try {
    if (isNaN(b)) {
      return 61;
    }
    var e = U(a);
    O.A(e, b, c);
    z[d >> 3] = BigInt(e.position);
    e.N && 0 === b && 0 === c && (e.N = null);
    return 0;
  } catch (g) {
    if ("undefined" == typeof O || "ErrnoError" !== g.name) {
      throw g;
    }
    return g.m;
  }
}, fd_write:function(a, b, c, d) {
  try {
    var e = U(a), g = ec(e, b, c);
    y[d >> 2] = g;
    return 0;
  } catch (k) {
    if ("undefined" == typeof O || "ErrnoError" !== k.name) {
      throw k;
    }
    return k.m;
  }
}, invoke_ii:kc, invoke_iii:lc, invoke_iiii:mc, invoke_iiiii:oc, invoke_iiiiiii:pc, invoke_vi:qc, invoke_vii:rc, invoke_viii:sc, invoke_viiii:tc}, I = function() {
  function a(d) {
    I = d.exports;
    na = I.memory;
    m(na, "memory not found in wasm exports");
    sa();
    gc = I.__indirect_function_table;
    m(gc, "table not found in wasm exports");
    ya.unshift(I.__wasm_call_ctors);
    Ka("wasm-instantiate");
    return I;
  }
  var b = {env:uc, wasi_snapshot_preview1:uc};
  Ja("wasm-instantiate");
  var c = f;
  if (f.instantiateWasm) {
    try {
      return f.instantiateWasm(b, a);
    } catch (d) {
      p(`Module.instantiateWasm callback failed with error: ${d}`), ba(d);
    }
  }
  Ma ??= f.locateFile ? La("gs.wasm") ? "gs.wasm" : f.locateFile ? f.locateFile("gs.wasm", l) : l + "gs.wasm" : (new URL("gs.wasm", import.meta.url)).href;
  Qa(b, function(d) {
    m(f === c, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
    c = null;
    a(d.instance);
  }).catch(ba);
  return {};
}(), vc = f._main = H("__main_argc_argv", 2), Qb = H("strerror", 1), Rb = H("fflush", 1), Y = H("setThrew", 2), wc = () => (wc = I.emscripten_stack_init)(), ua = () => (ua = I.emscripten_stack_get_end)(), Z = a => (Z = I._emscripten_stack_restore)(a), xc = a => (xc = I._emscripten_stack_alloc)(a), X = () => (X = I.emscripten_stack_get_current)();
f.dynCall_jiji = H("dynCall_jiji", 4);
var yc = f.dynCall_iiii = H("dynCall_iiii", 4), zc = f.dynCall_ii = H("dynCall_ii", 2);
f.dynCall_iidiiii = H("dynCall_iidiiii", 7);
var dynCall_vii = f.dynCall_vii = H("dynCall_vii", 3), dynCall_v = f.dynCall_v = H("dynCall_v", 1);
f.dynCall_iiiiii = H("dynCall_iiiiii", 6);
f.dynCall_iiiiiiii = H("dynCall_iiiiiiii", 8);
var dynCall_iii = f.dynCall_iii = H("dynCall_iii", 3), Ac = f.dynCall_viii = H("dynCall_viii", 4), dynCall_vi = f.dynCall_vi = H("dynCall_vi", 2), Bc = f.dynCall_iiiii = H("dynCall_iiiii", 5), Cc = f.dynCall_iiiiiii = H("dynCall_iiiiiii", 7);
f.dynCall_iiiiiiiii = H("dynCall_iiiiiiiii", 9);
f.dynCall_iiiiiiiiiiii = H("dynCall_iiiiiiiiiiii", 12);
f.dynCall_iiiiiiiiiii = H("dynCall_iiiiiiiiiii", 11);
f.dynCall_iiiiiiiiiiiiiiiii = H("dynCall_iiiiiiiiiiiiiiiii", 17);
f.dynCall_iiiiiiiiii = H("dynCall_iiiiiiiiii", 10);
f.dynCall_iiji = H("dynCall_iiji", 4);
f.dynCall_jii = H("dynCall_jii", 3);
f.dynCall_iiiiiiijjii = H("dynCall_iiiiiiijjii", 11);
f.dynCall_iiiiiiiiiiji = H("dynCall_iiiiiiiiiiji", 12);
f.dynCall_iiiiiiiiiijj = H("dynCall_iiiiiiiiiijj", 12);
f.dynCall_iiiiiij = H("dynCall_iiiiiij", 7);
f.dynCall_iiiiiiiiiiiiii = H("dynCall_iiiiiiiiiiiiii", 14);
f.dynCall_iddii = H("dynCall_iddii", 5);
f.dynCall_fdi = H("dynCall_fdi", 3);
f.dynCall_fdii = H("dynCall_fdii", 4);
f.dynCall_viiiiiiiiijiiii = H("dynCall_viiiiiiiiijiiii", 15);
f.dynCall_iiijiii = H("dynCall_iiijiii", 7);
f.dynCall_iijiii = H("dynCall_iijiii", 6);
f.dynCall_iij = H("dynCall_iij", 3);
var Dc = f.dynCall_viiii = H("dynCall_viiii", 5);
f.dynCall_iidiii = H("dynCall_iidiii", 6);
f.dynCall_viiiii = H("dynCall_viiiii", 6);
f.dynCall_viiiiiii = H("dynCall_viiiiiii", 8);
f.dynCall_viiiiii = H("dynCall_viiiiii", 7);
f.dynCall_idii = H("dynCall_idii", 4);
f.dynCall_iiiiiiiiiiiiiii = H("dynCall_iiiiiiiiiiiiiii", 15);
f.dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii = H("dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii", 40);
f.dynCall_viiiiiiiiiiiiiijiiiii = H("dynCall_viiiiiiiiiiiiiijiiiii", 21);
f.dynCall_viiiiiiiii = H("dynCall_viiiiiiiii", 10);
f.dynCall_iiiiiiiiiiiiiiii = H("dynCall_iiiiiiiiiiiiiiii", 16);
f.dynCall_iji = H("dynCall_iji", 3);
f.dynCall_jji = H("dynCall_jji", 3);
f.dynCall_iiiiiiiiiiiii = H("dynCall_iiiiiiiiiiiii", 13);
f.dynCall_id = H("dynCall_id", 2);
f.dynCall_dd = H("dynCall_dd", 2);
f.dynCall_viiiiiiii = H("dynCall_viiiiiiii", 9);
f.dynCall_iijii = H("dynCall_iijii", 5);
f.dynCall_fdd = H("dynCall_fdd", 3);
f.dynCall_iiiij = H("dynCall_iiiij", 5);
f.dynCall_iiiijj = H("dynCall_iiiijj", 6);
f.dynCall_iiiiijiiii = H("dynCall_iiiiijiiii", 10);
f.dynCall_iiiiiiiifi = H("dynCall_iiiiiiiifi", 10);
f.dynCall_iiiijii = H("dynCall_iiiijii", 7);
f.dynCall_iiiiijiiiii = H("dynCall_iiiiijiiiii", 11);
f.dynCall_vijii = H("dynCall_vijii", 5);
f.dynCall_ji = H("dynCall_ji", 2);
f.dynCall_diiid = H("dynCall_diiid", 5);
f.dynCall_iidi = H("dynCall_iidi", 4);
f.dynCall_iid = H("dynCall_iid", 3);
f.dynCall_iiiid = H("dynCall_iiiid", 5);
f.dynCall_iiddddi = H("dynCall_iiddddi", 7);
f.dynCall_iiddddddddi = H("dynCall_iiddddddddi", 11);
f.dynCall_ddd = H("dynCall_ddd", 3);
f.dynCall_iijj = H("dynCall_iijj", 4);
f.dynCall_iiiji = H("dynCall_iiiji", 5);
f.dynCall_iijjjjjj = H("dynCall_iijjjjjj", 8);
f.dynCall_iiijii = H("dynCall_iiijii", 6);
f.dynCall_iiiijiiii = H("dynCall_iiiijiiii", 9);
function kc(a, b) {
  var c = X();
  try {
    return zc(a, b);
  } catch (d) {
    Z(c);
    if (d !== d + 0) {
      throw d;
    }
    Y(1, 0);
  }
}
function rc(a, b, c) {
  var d = X();
  try {
    dynCall_vii(a, b, c);
  } catch (e) {
    Z(d);
    if (e !== e + 0) {
      throw e;
    }
    Y(1, 0);
  }
}
function lc(a, b, c) {
  var d = X();
  try {
    return dynCall_iii(a, b, c);
  } catch (e) {
    Z(d);
    if (e !== e + 0) {
      throw e;
    }
    Y(1, 0);
  }
}
function mc(a, b, c, d) {
  var e = X();
  try {
    return yc(a, b, c, d);
  } catch (g) {
    Z(e);
    if (g !== g + 0) {
      throw g;
    }
    Y(1, 0);
  }
}
function qc(a, b) {
  var c = X();
  try {
    dynCall_vi(a, b);
  } catch (d) {
    Z(c);
    if (d !== d + 0) {
      throw d;
    }
    Y(1, 0);
  }
}
function sc(a, b, c, d) {
  var e = X();
  try {
    Ac(a, b, c, d);
  } catch (g) {
    Z(e);
    if (g !== g + 0) {
      throw g;
    }
    Y(1, 0);
  }
}
function oc(a, b, c, d, e) {
  var g = X();
  try {
    return Bc(a, b, c, d, e);
  } catch (k) {
    Z(g);
    if (k !== k + 0) {
      throw k;
    }
    Y(1, 0);
  }
}
function pc(a, b, c, d, e, g, k) {
  var n = X();
  try {
    return Cc(a, b, c, d, e, g, k);
  } catch (r) {
    Z(n);
    if (r !== r + 0) {
      throw r;
    }
    Y(1, 0);
  }
}
function tc(a, b, c, d, e) {
  var g = X();
  try {
    Dc(a, b, c, d, e);
  } catch (k) {
    Z(g);
    if (k !== k + 0) {
      throw k;
    }
    Y(1, 0);
  }
}
f.addRunDependency = Ja;
f.removeRunDependency = Ka;
f.callMain = Ec;
f.FS_createPreloadedFile = wb;
f.FS_unlink = a => O.M(a);
f.FS_createPath = hc;
f.FS_createDevice = jc;
f.FS = O;
f.FS_createDataFile = (a, b, c, d, e, g) => {
  O.ea(a, b, c, d, e, g);
};
f.FS_createLazyFile = ic;
"writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 getTempRet0 setTempRet0 inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr emscriptenLog readEmAsmArgs jstoi_q listenOnce autoResumeAudioContext dynCallLegacy getDynCaller dynCall runtimeKeepalivePush runtimeKeepalivePop callUserCallback maybeExit asmjsMangle HandleAllocator getNativeTypeSize STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS getCFunc ccall cwrap uleb128Encode sigToWasmTypes generateFuncType convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction reallyNegative unSign strLen reSign formatString intArrayToString AsciiToString UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 stringToNewUTF8 writeArrayToMemory registerKeyEventCallback maybeCStringToJsString findEventTarget getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData battery registerBatteryEventCallback setCanvasElementSize getCanvasElementSize jsStackTrace getCallstack convertPCtoSourceLocation checkWasiClock wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags createDyncallWrapper safeSetTimeout setImmediateWrapped clearImmediateWrapped polyfillSetImmediate registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback ExceptionInfo findMatchingCatch Browser_asyncPrepareDataCounter safeRequestAnimationFrame arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback heapObjectForWebGLType toTypedArrayIndex webgl_enable_ANGLE_instanced_arrays webgl_enable_OES_vertex_array_object webgl_enable_WEBGL_draw_buffers webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode emscriptenWebGLGet computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData emscriptenWebGLGetUniform webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory setErrNo demangle stackTrace".split(" ").forEach(function(a) {
  Ua(a, () => {
    var b = `\`${a}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`, c = a;
    c.startsWith("_") || (c = "$" + a);
    b += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${c}')`;
    Ta(a) && (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    J(b);
  });
  Wa(a);
});
"run addOnPreRun addOnInit addOnPreMain addOnExit addOnPostRun out err abort wasmMemory wasmExports writeStackCookie checkStackCookie INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore stackAlloc ptrToString zeroMemory exitJS getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets initRandomFill randomFill timers warnOnce readEmAsmArgsArray jstoi_s getExecutableName handleException keepRuntimeAlive asyncLoad alignMemory mmapAlloc wasmTable noExitRuntime freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString UTF8ToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString stringToAscii UTF16Decoder stringToUTF8OnStack JSEvents specialHTMLTargets findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle UNWIND_CACHE ExitStatus getEnvStrings doReadv doWritev promiseMap uncaughtExceptionCount exceptionLast exceptionCaught Browser getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE isLeapYear ydayFromDate SYSCALLS preloadPlugins FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers GL AL GLUT EGL GLEW IDBStore SDL SDL_gfx allocateUTF8 allocateUTF8OnStack print printErr".split(" ").forEach(Wa);
var Fc, Gc;
Ga = function Hc() {
  Fc || Ic();
  Fc || (Ga = Hc);
};
function Ec(a = []) {
  m(0 == B, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  m(Gc, "cannot call main without calling preRun first");
  a.unshift(fa);
  var b = a.length, c = xc(4 * (b + 1)), d = c;
  a.forEach(g => {
    var k = y, n = d >> 2, r = ib(g) + 1, u = xc(r);
    Vb(g, u, r);
    k[n] = u;
    d += 4;
  });
  y[d >> 2] = 0;
  try {
    var e = vc(b, c);
    cc(e, !0);
    return e;
  } catch (g) {
    return fc(g);
  }
}
function Ic() {
  var a = ea;
  function b() {
    if (!Fc && (Fc = 1, f.calledRun = 1, !oa)) {
      m(!Ba);
      Ba = !0;
      va();
      f.noFSInit || O.ca || ub();
      O.za = !1;
      Ea(ya);
      va();
      Ea(za);
      aa(f);
      f.onRuntimeInitialized?.();
      Jc && Ec(a);
      va();
      var c = f.postRun;
      c && ("function" == typeof c && (c = [c]), c.forEach(Fa));
      Ea(Aa);
    }
  }
  if (!(0 < B)) {
    wc();
    ta();
    if (!Gc && (Gc = 1, Ca(), 0 < B)) {
      return;
    }
    f.setStatus ? (f.setStatus("Running..."), setTimeout(() => {
      setTimeout(() => f.setStatus(""), 1);
      b();
    }, 1)) : b();
    va();
  }
}
function bc() {
  var a = la, b = p, c = !1;
  la = p = () => {
    c = !0;
  };
  try {
    Rb(0), ["stdout", "stderr"].forEach(d => {
      (d = Nb("/dev/" + d)) && kb[d.object.V]?.output?.length && (c = !0);
    });
  } catch (d) {
  }
  la = a;
  p = b;
  c && J("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
}
if (f.preInit) {
  for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length;) {
    f.preInit.pop()();
  }
}
var Jc = !1;
f.noInitialRun && (Jc = !1);
Ic();
moduleRtn = ca;
for (const a of Object.keys(f)) {
  a in moduleArg || Object.defineProperty(moduleArg, a, {configurable:!0, get() {
    h(`Access to module property ('${a}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
  }});
}
;


  return moduleRtn;
}
);
})();
export default gs;
