
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
        Object.getOwnPropertyDescriptor(ca, a) || Object.defineProperty(ca, a, {get:() => k("You are getting " + a + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"), set:() => k("You are setting " + a + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")});
      });
      var da = Object.assign({}, f), ea = [], fa = "./this.program", l = "", ha, ia;
      l = self.location.href;
      _scriptName && (l = _scriptName);
      l.startsWith("blob:") ? l = "" : l = l.substr(0, l.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      if ("object" != typeof window && "function" != typeof importScripts) {
        throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      }
      ia = a => {
        var b = new XMLHttpRequest();
        b.open("GET", a, !1);
        b.responseType = "arraybuffer";
        b.send(null);
        return new Uint8Array(b.response);
      };
      ha = a => {
        n(!ka(a), "readAsync does not work with file:// URLs");
        return fetch(a, {credentials:"same-origin"}).then(b => b.ok ? b.arrayBuffer() : Promise.reject(Error(b.status + " : " + b.url)));
      };
      var la = f.print || console.log.bind(console), r = f.printErr || console.error.bind(console);
      Object.assign(f, da);
      da = null;
      Object.getOwnPropertyDescriptor(f, "fetchSettings") && k("`Module.fetchSettings` was supplied but `fetchSettings` not included in INCOMING_MODULE_JS_API");
      f.arguments && (ea = f.arguments);
      t("arguments", "arguments_");
      f.thisProgram && (fa = f.thisProgram);
      t("thisProgram", "thisProgram");
      n("undefined" == typeof f.memoryInitializerPrefixURL, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
      n("undefined" == typeof f.pthreadMainPrefixURL, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
      n("undefined" == typeof f.cdInitializerPrefixURL, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
      n("undefined" == typeof f.filePackagePrefixURL, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
      n("undefined" == typeof f.read, "Module.read option was removed");
      n("undefined" == typeof f.readAsync, "Module.readAsync option was removed (modify readAsync in JS)");
      n("undefined" == typeof f.readBinary, "Module.readBinary option was removed (modify readBinary in JS)");
      n("undefined" == typeof f.setWindowTitle, "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
      n("undefined" == typeof f.TOTAL_MEMORY, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
      t("asm", "wasmExports");
      t("readAsync", "readAsync");
      t("readBinary", "readBinary");
      t("setWindowTitle", "setWindowTitle");
      n(!0, "web environment detected but not enabled at build time.  Add `web` to `-sENVIRONMENT` to enable.");
      n(!0, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");
      n(!0, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
      var ma = f.wasmBinary;
      t("wasmBinary", "wasmBinary");
      "object" != typeof WebAssembly && r("no native wasm support detected");
      var na, oa = !1, pa;
      function n(a, b) {
        a || k("Assertion failed" + (b ? ": " + b : ""));
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
      n(!f.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
      n("undefined" != typeof Int32Array && "undefined" !== typeof Float64Array && void 0 != Int32Array.prototype.subarray && void 0 != Int32Array.prototype.set, "JS engine does not provide full typed array support");
      n(!f.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
      n(!f.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
      function ta() {
        var a = ua();
        n(0 == (a & 3));
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
          34821223 == b && 2310721022 == c || k(`Stack overflow! Stack cookie has been overwritten at ${wa(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${wa(c)} ${wa(b)}`);
          1668509029 != y[0] && k("Runtime error: The application has corrupted its heap memory area (address zero)!");
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
      n(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      n(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      n(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      n(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      var A = 0, Ga = null, Ha = null, Ia = {};
      function Ja(a) {
        for (var b = a;;) {
          if (!Ia[a]) {
            return a;
          }
          a = b + Math.random();
        }
      }
      function Ka(a) {
        A++;
        f.monitorRunDependencies?.(A);
        a ? (n(!Ia[a]), Ia[a] = 1, null === Ga && "undefined" != typeof setInterval && (Ga = setInterval(() => {
          if (oa) {
            clearInterval(Ga), Ga = null;
          } else {
            var b = !1, c;
            for (c in Ia) {
              b || (b = !0, r("still waiting on run dependencies:")), r(`dependency: ${c}`);
            }
            b && r("(end of list)");
          }
        }, 10000))) : r("warning: run dependency added without ID");
      }
      function La(a) {
        A--;
        f.monitorRunDependencies?.(A);
        a ? (n(Ia[a]), delete Ia[a]) : r("warning: run dependency removed without ID");
        0 == A && (null !== Ga && (clearInterval(Ga), Ga = null), Ha && (a = Ha, Ha = null, a()));
      }
      function k(a) {
        f.onAbort?.(a);
        a = "Aborted(" + a + ")";
        r(a);
        oa = !0;
        a = new WebAssembly.RuntimeError(a);
        ba(a);
        throw a;
      }
      var Ma = a => a.startsWith("data:application/octet-stream;base64,"), ka = a => a.startsWith("file://");
      function E(a, b) {
        return (...c) => {
          n(Ba, `native function \`${a}\` called before runtime initialization`);
          var d = F[a];
          n(d, `exported native function \`${a}\` not found`);
          n(c.length <= b, `native function \`${a}\` called with ${c.length} args but expects ${b}`);
          return d(...c);
        };
      }
      var Na;
      function Oa(a) {
        if (a == Na && ma) {
          return new Uint8Array(ma);
        }
        if (ia) {
          return ia(a);
        }
        throw "both async and sync fetching of the wasm failed";
      }
      function Pa(a) {
        return ma ? Promise.resolve().then(() => Oa(a)) : ha(a).then(b => new Uint8Array(b), () => Oa(a));
      }
      function Qa(a, b, c) {
        return Pa(a).then(d => WebAssembly.instantiate(d, b)).then(c, d => {
          r(`failed to asynchronously prepare wasm: ${d}`);
          ka(Na) && r(`warning: Loading from a file URI (${Na}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
          k(d);
        });
      }
      function Ra(a, b) {
        var c = Na;
        return ma || "function" != typeof WebAssembly.instantiateStreaming || Ma(c) || "function" != typeof fetch ? Qa(c, a, b) : fetch(c, {credentials:"same-origin"}).then(d => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
          r(`wasm streaming compile failed: ${e}`);
          r("falling back to ArrayBuffer instantiation");
          return Qa(c, a, b);
        }));
      }
      var Sa = new Int16Array(1), Ta = new Int8Array(Sa.buffer);
      Sa[0] = 25459;
      if (115 !== Ta[0] || 99 !== Ta[1]) {
        throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
      }
      if (f.ENVIRONMENT) {
        throw Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
      }
      function t(a, b) {
        Object.getOwnPropertyDescriptor(f, a) || Object.defineProperty(f, a, {configurable:!0, get() {
            k(`\`Module.${a}\` has been replaced by \`${b}\`` + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
          }});
      }
      function Ua(a) {
        return "FS_createPath" === a || "FS_createDataFile" === a || "FS_createPreloadedFile" === a || "FS_unlink" === a || "addRunDependency" === a || "FS_createLazyFile" === a || "FS_createDevice" === a || "removeRunDependency" === a;
      }
      function Va(a, b) {
        "undefined" == typeof globalThis || Object.getOwnPropertyDescriptor(globalThis, a) || Object.defineProperty(globalThis, a, {configurable:!0, get() {
            b();
          }});
      }
      function Wa(a, b) {
        Va(a, () => {
          H(`\`${a}\` is not longer defined by emscripten. ${b}`);
        });
      }
      Wa("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");
      Wa("asm", "Please use wasmExports instead");
      function Xa(a) {
        Object.getOwnPropertyDescriptor(f, a) || Object.defineProperty(f, a, {configurable:!0, get() {
            var b = `'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
            Ua(a) && (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
            k(b);
          }});
      }
      function Ya(a) {
        this.name = "ExitStatus";
        this.message = `Program terminated with exit(${a})`;
        this.status = a;
      }
      var Ea = a => {
        a.forEach(b => b(f));
      }, Za = f.noExitRuntime || !0, wa = a => {
        n("number" === typeof a);
        return "0x" + (a >>> 0).toString(16).padStart(8, "0");
      }, H = a => {
        H.ua || (H.ua = {});
        H.ua[a] || (H.ua[a] = 1, r(a));
      }, $a = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, ab = (a, b = 0) => {
        for (var c = b + NaN, d = b; a[d] && !(d >= c);) {
          ++d;
        }
        if (16 < d - b && a.buffer && $a) {
          return $a.decode(a.subarray(b, d));
        }
        for (c = ""; b < d;) {
          var e = a[b++];
          if (e & 128) {
            var g = a[b++] & 63;
            if (192 == (e & 224)) {
              c += String.fromCharCode((e & 31) << 6 | g);
            } else {
              var h = a[b++] & 63;
              224 == (e & 240) ? e = (e & 15) << 12 | g << 6 | h : (240 != (e & 248) && H("Invalid UTF-8 leading byte " + wa(e) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), e = (e & 7) << 18 | g << 12 | h << 6 | a[b++] & 63);
              65536 > e ? c += String.fromCharCode(e) : (e -= 65536, c += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
            }
          } else {
            c += String.fromCharCode(e);
          }
        }
        return c;
      }, I = a => {
        n("number" == typeof a, `UTF8ToString expects a number (got ${typeof a})`);
        return a ? ab(qa, a) : "";
      }, bb = (a, b) => {
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
      }, J = a => {
        var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
        (a = bb(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      }, cb = a => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b) {
          return ".";
        }
        b &&= b.substr(0, b.length - 1);
        return a + b;
      }, db = a => {
        if ("/" === a) {
          return "/";
        }
        a = J(a);
        a = a.replace(/\/$/, "");
        var b = a.lastIndexOf("/");
        return -1 === b ? a : a.substr(b + 1);
      }, eb = (a, b) => J(a + "/" + b), fb = () => {
        if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) {
          return a => crypto.getRandomValues(a);
        }
        k("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
      }, gb = a => (gb = fb())(a), hb = (...a) => {
        for (var b = "", c = !1, d = a.length - 1; -1 <= d && !c; d--) {
          c = 0 <= d ? a[d] : K.la();
          if ("string" != typeof c) {
            throw new TypeError("Arguments to path.resolve must be strings");
          }
          if (!c) {
            return "";
          }
          b = c + "/" + b;
          c = "/" === c.charAt(0);
        }
        b = bb(b.split("/").filter(e => !!e), !c).join("/");
        return (c ? "/" : "") + b || ".";
      }, ib = (a, b) => {
        function c(h) {
          for (var m = 0; m < h.length && "" === h[m]; m++) {
          }
          for (var p = h.length - 1; 0 <= p && "" === h[p]; p--) {
          }
          return m > p ? [] : h.slice(m, p - m + 1);
        }
        a = hb(a).substr(1);
        b = hb(b).substr(1);
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
      }, jb = [], kb = a => {
        for (var b = 0, c = 0; c < a.length; ++c) {
          var d = a.charCodeAt(c);
          127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
        }
        return b;
      }, lb = (a, b, c, d) => {
        n("string" === typeof a, `stringToUTF8Array expects a string (got ${typeof a})`);
        if (!(0 < d)) {
          return 0;
        }
        var e = c;
        d = c + d - 1;
        for (var g = 0; g < a.length; ++g) {
          var h = a.charCodeAt(g);
          if (55296 <= h && 57343 >= h) {
            var m = a.charCodeAt(++g);
            h = 65536 + ((h & 1023) << 10) | m & 1023;
          }
          if (127 >= h) {
            if (c >= d) {
              break;
            }
            b[c++] = h;
          } else {
            if (2047 >= h) {
              if (c + 1 >= d) {
                break;
              }
              b[c++] = 192 | h >> 6;
            } else {
              if (65535 >= h) {
                if (c + 2 >= d) {
                  break;
                }
                b[c++] = 224 | h >> 12;
              } else {
                if (c + 3 >= d) {
                  break;
                }
                1114111 < h && H("Invalid Unicode code point " + wa(h) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
                b[c++] = 240 | h >> 18;
                b[c++] = 128 | h >> 12 & 63;
              }
              b[c++] = 128 | h >> 6 & 63;
            }
            b[c++] = 128 | h & 63;
          }
        }
        b[c] = 0;
        return c - e;
      }, mb = [];
      function nb(a, b) {
        mb[a] = {input:[], output:[], N:b};
        ob(a, pb);
      }
      var pb = {open(a) {
          var b = mb[a.node.Y];
          if (!b) {
            throw new K.g(43);
          }
          a.m = b;
          a.seekable = !1;
        }, close(a) {
          a.m.N.ba(a.m);
        }, ba(a) {
          a.m.N.ba(a.m);
        }, read(a, b, c, d) {
          if (!a.m || !a.m.N.Da) {
            throw new K.g(60);
          }
          for (var e = 0, g = 0; g < d; g++) {
            try {
              var h = a.m.N.Da(a.m);
            } catch (m) {
              throw new K.g(29);
            }
            if (void 0 === h && 0 === e) {
              throw new K.g(6);
            }
            if (null === h || void 0 === h) {
              break;
            }
            e++;
            b[c + g] = h;
          }
          e && (a.node.timestamp = Date.now());
          return e;
        }, write(a, b, c, d) {
          if (!a.m || !a.m.N.sa) {
            throw new K.g(60);
          }
          try {
            for (var e = 0; e < d; e++) {
              a.m.N.sa(a.m, b[c + e]);
            }
          } catch (g) {
            throw new K.g(29);
          }
          d && (a.node.timestamp = Date.now());
          return e;
        }}, qb = {Da() {
          return jb.length ? jb.shift() : null;
        }, sa(a, b) {
          null === b || 10 === b ? (la(ab(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, ba(a) {
          a.output && 0 < a.output.length && (la(ab(a.output)), a.output = []);
        }, eb() {
          return {ub:25856, wb:5, tb:191, vb:35387, sb:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
        }, fb() {
          return 0;
        }, gb() {
          return [24, 80];
        }}, rb = {sa(a, b) {
          null === b || 10 === b ? (r(ab(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, ba(a) {
          a.output && 0 < a.output.length && (r(ab(a.output)), a.output = []);
        }}, sb = () => {
        k("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
      };
      function tb(a, b) {
        var c = a.j ? a.j.length : 0;
        c >= b || (b = Math.max(b, c * (1048576 > c ? 2.0 : 1.125) >>> 0), 0 != c && (b = Math.max(b, 256)), c = a.j, a.j = new Uint8Array(b), 0 < a.o && a.j.set(c.subarray(0, a.o), 0));
      }
      var M = {J:null, u() {
          return M.createNode(null, "/", 16895, 0);
        }, createNode(a, b, c, d) {
          var e;
          (e = 24576 === (c & 61440)) || (e = 4096 === (c & 61440));
          if (e) {
            throw new K.g(63);
          }
          M.J || (M.J = {dir:{node:{H:M.h.H, A:M.h.A, S:M.h.S, M:M.h.M, $:M.h.$, P:M.h.P, W:M.h.W, Z:M.h.Z, O:M.h.O}, stream:{B:M.i.B}}, file:{node:{H:M.h.H, A:M.h.A}, stream:{B:M.i.B, read:M.i.read, write:M.i.write, aa:M.i.aa, X:M.i.X, da:M.i.da}}, link:{node:{H:M.h.H, A:M.h.A, V:M.h.V}, stream:{}}, wa:{node:{H:M.h.H, A:M.h.A}, stream:K.Va}});
          c = K.createNode(a, b, c, d);
          N(c.mode) ? (c.h = M.J.dir.node, c.i = M.J.dir.stream, c.j = {}) : K.isFile(c.mode) ? (c.h = M.J.file.node, c.i = M.J.file.stream, c.o = 0, c.j = null) : 40960 === (c.mode & 61440) ? (c.h = M.J.link.node, c.i = M.J.link.stream) : 8192 === (c.mode & 61440) && (c.h = M.J.wa.node, c.i = M.J.wa.stream);
          c.timestamp = Date.now();
          a && (a.j[b] = c, a.timestamp = c.timestamp);
          return c;
        }, Fb(a) {
          return a.j ? a.j.subarray ? a.j.subarray(0, a.o) : new Uint8Array(a.j) : new Uint8Array(0);
        }, h:{H(a) {
            var b = {};
            b.Ya = 8192 === (a.mode & 61440) ? a.id : 1;
            b.cb = a.id;
            b.mode = a.mode;
            b.kb = 1;
            b.uid = 0;
            b.bb = 0;
            b.Y = a.Y;
            N(a.mode) ? b.size = 4096 : K.isFile(a.mode) ? b.size = a.o : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
            b.Ra = new Date(a.timestamp);
            b.ib = new Date(a.timestamp);
            b.Xa = new Date(a.timestamp);
            b.Sa = 4096;
            b.Ta = Math.ceil(b.size / b.Sa);
            return b;
          }, A(a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            if (void 0 !== b.size && (b = b.size, a.o != b)) {
              if (0 == b) {
                a.j = null, a.o = 0;
              } else {
                var c = a.j;
                a.j = new Uint8Array(b);
                c && a.j.set(c.subarray(0, Math.min(b, a.o)));
                a.o = b;
              }
            }
          }, S() {
            throw K.na[44];
          }, M(a, b, c, d) {
            return M.createNode(a, b, c, d);
          }, $(a, b, c) {
            if (N(a.mode)) {
              try {
                var d = O(b, c);
              } catch (g) {
              }
              if (d) {
                for (var e in d.j) {
                  throw new K.g(55);
                }
              }
            }
            delete a.parent.j[a.name];
            a.parent.timestamp = Date.now();
            a.name = c;
            b.j[c] = a;
            b.timestamp = a.parent.timestamp;
          }, P(a, b) {
            delete a.j[b];
            a.timestamp = Date.now();
          }, W(a, b) {
            var c = O(a, b), d;
            for (d in c.j) {
              throw new K.g(55);
            }
            delete a.j[b];
            a.timestamp = Date.now();
          }, Z(a) {
            var b = [".", ".."], c;
            for (c of Object.keys(a.j)) {
              b.push(c);
            }
            return b;
          }, O(a, b, c) {
            a = M.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          }, V(a) {
            if (40960 !== (a.mode & 61440)) {
              throw new K.g(28);
            }
            return a.link;
          }}, i:{read(a, b, c, d, e) {
            var g = a.node.j;
            if (e >= a.node.o) {
              return 0;
            }
            a = Math.min(a.node.o - e, d);
            n(0 <= a);
            if (8 < a && g.subarray) {
              b.set(g.subarray(e, e + a), c);
            } else {
              for (d = 0; d < a; d++) {
                b[c + d] = g[e + d];
              }
            }
            return a;
          }, write(a, b, c, d, e, g) {
            n(!(b instanceof ArrayBuffer));
            b.buffer === w.buffer && (g = !1);
            if (!d) {
              return 0;
            }
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.j || a.j.subarray)) {
              if (g) {
                return n(0 === e, "canOwn must imply no weird position inside the file"), a.j = b.subarray(c, c + d), a.o = d;
              }
              if (0 === a.o && 0 === e) {
                return a.j = b.slice(c, c + d), a.o = d;
              }
              if (e + d <= a.o) {
                return a.j.set(b.subarray(c, c + d), e), d;
              }
            }
            tb(a, e + d);
            if (a.j.subarray && b.subarray) {
              a.j.set(b.subarray(c, c + d), e);
            } else {
              for (g = 0; g < d; g++) {
                a.j[e + g] = b[c + g];
              }
            }
            a.o = Math.max(a.o, e + d);
            return d;
          }, B(a, b, c) {
            1 === c ? b += a.position : 2 === c && K.isFile(a.node.mode) && (b += a.node.o);
            if (0 > b) {
              throw new K.g(28);
            }
            return b;
          }, aa(a, b, c) {
            tb(a.node, b + c);
            a.node.o = Math.max(a.node.o, b + c);
          }, X(a, b, c, d, e) {
            if (!K.isFile(a.node.mode)) {
              throw new K.g(43);
            }
            a = a.node.j;
            if (e & 2 || !a || a.buffer !== w.buffer) {
              d = !0;
              e = sb();
              if (!e) {
                throw new K.g(48);
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
            return {ob:e, Qa:d};
          }, da(a, b, c, d) {
            M.i.write(a, b, 0, d, c, !1);
            return 0;
          }}}, ub = (a, b, c) => {
        var d = Ja(`al ${a}`);
        ha(a).then(e => {
          n(e, `Loading data file "${a}" failed (no arrayBuffer).`);
          b(new Uint8Array(e));
          d && La(d);
        }, () => {
          if (c) {
            c();
          } else {
            throw `Loading data file "${a}" failed.`;
          }
        });
        d && Ka(d);
      }, vb = f.preloadPlugins || [], xb = (a, b, c, d) => {
        "undefined" != typeof Browser && wb();
        var e = !1;
        vb.forEach(g => {
          !e && g.canHandle(b) && (g.handle(a, b, c, d), e = !0);
        });
        return e;
      }, yb = (a, b, c, d, e, g, h, m, p, u) => {
        function q(D) {
          function B(G) {
            u?.();
            m || K.ka(a, b, G, d, e, p);
            g?.();
            La(C);
          }
          xb(D, v, B, () => {
            h?.();
            La(C);
          }) || B(D);
        }
        var v = b ? hb(J(a + "/" + b)) : a, C = Ja(`cp ${v}`);
        Ka(C);
        "string" == typeof c ? ub(c, q, h) : q(c);
      }, zb = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      }, Ab = {EPERM:63, ENOENT:44, ESRCH:71, EINTR:27, EIO:29, ENXIO:60, E2BIG:1, ENOEXEC:45, EBADF:8, ECHILD:12, EAGAIN:6, EWOULDBLOCK:6, ENOMEM:48, EACCES:2, EFAULT:21, ENOTBLK:105, EBUSY:10, EEXIST:20, EXDEV:75, ENODEV:43, ENOTDIR:54, EISDIR:31, EINVAL:28, ENFILE:41, EMFILE:33, ENOTTY:59, ETXTBSY:74, EFBIG:22, ENOSPC:51, ESPIPE:70, EROFS:69, EMLINK:34, EPIPE:64, EDOM:18, ERANGE:68, ENOMSG:49, EIDRM:24, ECHRNG:106, EL2NSYNC:156, EL3HLT:107, EL3RST:108, ELNRNG:109, EUNATCH:110, ENOCSI:111, EL2HLT:112,
        EDEADLK:16, ENOLCK:46, EBADE:113, EBADR:114, EXFULL:115, ENOANO:104, EBADRQC:103, EBADSLT:102, EDEADLOCK:16, EBFONT:101, ENOSTR:100, ENODATA:116, ETIME:117, ENOSR:118, ENONET:119, ENOPKG:120, EREMOTE:121, ENOLINK:47, EADV:122, ESRMNT:123, ECOMM:124, EPROTO:65, EMULTIHOP:36, EDOTDOT:125, EBADMSG:9, ENOTUNIQ:126, EBADFD:127, EREMCHG:128, ELIBACC:129, ELIBBAD:130, ELIBSCN:131, ELIBMAX:132, ELIBEXEC:133, ENOSYS:52, ENOTEMPTY:55, ENAMETOOLONG:37, ELOOP:32, EOPNOTSUPP:138, EPFNOSUPPORT:139, ECONNRESET:15,
        ENOBUFS:42, EAFNOSUPPORT:5, EPROTOTYPE:67, ENOTSOCK:57, ENOPROTOOPT:50, ESHUTDOWN:140, ECONNREFUSED:14, EADDRINUSE:3, ECONNABORTED:13, ENETUNREACH:40, ENETDOWN:38, ETIMEDOUT:73, EHOSTDOWN:142, EHOSTUNREACH:23, EINPROGRESS:26, EALREADY:7, EDESTADDRREQ:17, EMSGSIZE:35, EPROTONOSUPPORT:66, ESOCKTNOSUPPORT:137, EADDRNOTAVAIL:4, ENETRESET:39, EISCONN:30, ENOTCONN:53, ETOOMANYREFS:141, EUSERS:136, EDQUOT:19, ESTALE:72, ENOTSUP:138, ENOMEDIUM:148, EILSEQ:25, EOVERFLOW:61, ECANCELED:11, ENOTRECOVERABLE:56,
        EOWNERDEAD:62, ESTRPIPE:135};
      function wb() {
        n(!K.ha, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
        K.ha = !0;
        b ??= f.stdin;
        c ??= f.stdout;
        a ??= f.stderr;
        b ? K.K("/dev", "stdin", b) : K.O("/dev/tty", "/dev/stdin");
        c ? K.K("/dev", "stdout", null, c) : K.O("/dev/tty", "/dev/stdout");
        a ? K.K("/dev", "stderr", null, a) : K.O("/dev/tty1", "/dev/stderr");
        var a = K.open("/dev/stdin", 0);
        var b = K.open("/dev/stdout", 1);
        var c = K.open("/dev/stderr", 1);
        n(0 === a.s, `invalid handle for stdin (${a.s})`);
        n(1 === b.s, `invalid handle for stdout (${b.s})`);
        n(2 === c.s, `invalid handle for stderr (${c.s})`);
      }
      function ob(a, b) {
        K.Aa[a] = {i:b};
      }
      function N(a) {
        return 16384 === (a & 61440);
      }
      function O(a, b) {
        var c = N(a.mode) ? (c = P(a, "x")) ? c : a.h.S ? 0 : 2 : 54;
        if (c) {
          throw new K.g(c);
        }
        for (c = K.I[Bb(a.id, b)]; c; c = c.U) {
          var d = c.name;
          if (c.parent.id === a.id && d === b) {
            return c;
          }
        }
        return K.S(a, b);
      }
      function R(a, b = {}) {
        a = hb(a);
        if (!a) {
          return {path:"", node:null};
        }
        b = Object.assign({ma:!0, ta:0}, b);
        if (8 < b.ta) {
          throw new K.g(32);
        }
        a = a.split("/").filter(h => !!h);
        for (var c = K.root, d = "/", e = 0; e < a.length; e++) {
          var g = e === a.length - 1;
          if (g && b.parent) {
            break;
          }
          c = O(c, a[e]);
          d = J(d + "/" + a[e]);
          c.F && (!g || g && b.ma) && (c = c.F.root);
          if (!g || b.D) {
            for (g = 0; 40960 === (c.mode & 61440);) {
              if (c = K.V(d), d = hb(cb(d), c), c = R(d, {ta:b.ta + 1}).node, 40 < g++) {
                throw new K.g(32);
              }
            }
          }
        }
        return {path:d, node:c};
      }
      function Cb(a) {
        for (var b;;) {
          if (K.ja(a)) {
            return a = a.u.Ja, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
          }
          b = b ? `${a.name}/${b}` : a.name;
          a = a.parent;
        }
      }
      function Bb(a, b) {
        for (var c = 0, d = 0; d < b.length; d++) {
          c = (c << 5) - c + b.charCodeAt(d) | 0;
        }
        return (a + c >>> 0) % K.I.length;
      }
      function Db(a) {
        var b = Bb(a.parent.id, a.name);
        a.U = K.I[b];
        K.I[b] = a;
      }
      function Eb(a) {
        var b = Bb(a.parent.id, a.name);
        if (K.I[b] === a) {
          K.I[b] = a.U;
        } else {
          for (b = K.I[b]; b;) {
            if (b.U === a) {
              b.U = a.U;
              break;
            }
            b = b.U;
          }
        }
      }
      function Fb(a) {
        var b = ["r", "w", "rw"][a & 3];
        a & 512 && (b += "w");
        return b;
      }
      function P(a, b) {
        if (K.Ea) {
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
      function Gb(a, b) {
        try {
          return O(a, b), 20;
        } catch (c) {
        }
        return P(a, "wx");
      }
      function Hb(a, b, c) {
        try {
          var d = O(a, b);
        } catch (e) {
          return e.l;
        }
        if (a = P(a, "wx")) {
          return a;
        }
        if (c) {
          if (!N(d.mode)) {
            return 54;
          }
          if (K.ja(d) || Cb(d) === K.la()) {
            return 10;
          }
        } else {
          if (N(d.mode)) {
            return 31;
          }
        }
        return 0;
      }
      function S(a) {
        a = K.Ca(a);
        if (!a) {
          throw new K.g(8);
        }
        return a;
      }
      function Ib(a, b = -1) {
        n(-1 <= b);
        a = Object.assign(new K.Pa(), a);
        if (-1 == b) {
          a: {
            for (b = 0; b <= K.va; b++) {
              if (!K.streams[b]) {
                break a;
              }
            }
            throw new K.g(33);
          }
        }
        a.s = b;
        return K.streams[b] = a;
      }
      function Jb(a, b = -1) {
        a = Ib(a, b);
        a.i?.Ab?.(a);
        return a;
      }
      function Kb(a) {
        var b = [];
        for (a = [a]; a.length;) {
          var c = a.pop();
          b.push(c);
          a.push(...c.ca);
        }
        return b;
      }
      function T(a, b) {
        return K.M(a, (void 0 !== b ? b : 511) & 1023 | 16384, 0);
      }
      function Lb(a, b, c) {
        "undefined" == typeof c && (c = b, b = 438);
        return K.M(a, b | 8192, c);
      }
      function Mb(a, b, c) {
        a = "string" == typeof a ? R(a, {D:!c}).node : a;
        if (!a.h.A) {
          throw new K.g(63);
        }
        a.h.A(a, {mode:b & 4095 | a.mode & -4096, timestamp:Date.now()});
      }
      function Nb(a, b) {
        a = "string" == typeof a ? R(a, {D:!b}).node : a;
        if (!a.h.A) {
          throw new K.g(63);
        }
        a.h.A(a, {timestamp:Date.now()});
      }
      function Ob(a, b) {
        try {
          var c = R(a, {D:!b});
          a = c.path;
        } catch (e) {
        }
        var d = {ja:!1, Ba:!1, error:0, name:null, path:null, object:null, lb:!1, nb:null, mb:null};
        try {
          c = R(a, {parent:!0}), d.lb = !0, d.nb = c.path, d.mb = c.node, d.name = db(a), c = R(a, {D:!b}), d.Ba = !0, d.path = c.path, d.object = c.node, d.name = c.node.name, d.ja = "/" === c.path;
        } catch (e) {
          d.error = e.l;
        }
        return d;
      }
      function Pb(a, b, c, d) {
        a = "string" == typeof a ? a : Cb(a);
        b = J(a + "/" + b);
        return K.create(b, zb(c, d));
      }
      function Qb(a) {
        if (!(a.qa || a.hb || a.link || a.j)) {
          if ("undefined" != typeof XMLHttpRequest) {
            throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
          }
          try {
            a.j = ia(a.url), a.o = a.j.length;
          } catch (b) {
            throw new K.g(29);
          }
        }
      }
      var K = {root:null, ca:[], Aa:{}, streams:[], jb:1, I:null, za:"/", ha:!1, Ea:!0, g:class extends Error {
          constructor(a) {
            super(Ba ? I(Rb(a)) : "");
            this.name = "ErrnoError";
            this.l = a;
            for (var b in Ab) {
              if (Ab[b] === a) {
                this.code = b;
                break;
              }
            }
          }
        }, na:{}, $a:null, ga:0, La:{}, Pa:class {
          constructor() {
            this.L = {};
            this.node = null;
          }
          get object() {
            return this.node;
          }
          set object(a) {
            this.node = a;
          }
          get flags() {
            return this.L.flags;
          }
          set flags(a) {
            this.L.flags = a;
          }
          get position() {
            return this.L.position;
          }
          set position(a) {
            this.L.position = a;
          }
        }, Oa:class {
          constructor(a, b, c, d) {
            a ||= this;
            this.parent = a;
            this.u = a.u;
            this.F = null;
            this.id = K.jb++;
            this.name = b;
            this.mode = c;
            this.h = {};
            this.i = {};
            this.Y = d;
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
          get hb() {
            return N(this.mode);
          }
          get qa() {
            return 8192 === (this.mode & 61440);
          }
        }, createNode(a, b, c, d) {
          n("object" == typeof a);
          a = new K.Oa(a, b, c, d);
          Db(a);
          return a;
        }, ja(a) {
          return a === a.parent;
        }, isFile(a) {
          return 32768 === (a & 61440);
        }, Gb(a) {
          return 49152 === (a & 49152);
        }, va:4096, Ca:a => K.streams[a], Va:{open(a) {
            a.i = K.ab(a.node.Y).i;
            a.i.open?.(a);
          }, B() {
            throw new K.g(70);
          }}, ra:a => a >> 8, Kb:a => a & 255, T:(a, b) => a << 8 | b, ab:a => K.Aa[a], Na(a, b) {
          function c(h) {
            n(0 < K.ga);
            K.ga--;
            return b(h);
          }
          function d(h) {
            if (h) {
              if (!d.Za) {
                return d.Za = !0, c(h);
              }
            } else {
              ++g >= e.length && c(null);
            }
          }
          "function" == typeof a && (b = a, a = !1);
          K.ga++;
          1 < K.ga && r(`warning: ${K.ga} FS.syncfs operations in flight at once, probably just doing extra work`);
          var e = Kb(K.root.u), g = 0;
          e.forEach(h => {
            if (!h.type.Na) {
              return d(null);
            }
            h.type.Na(h, a, d);
          });
        }, u(a, b, c) {
          if ("string" == typeof a) {
            throw a;
          }
          var d = "/" === c, e = !c;
          if (d && K.root) {
            throw new K.g(10);
          }
          if (!d && !e) {
            var g = R(c, {ma:!1});
            c = g.path;
            g = g.node;
            if (g.F) {
              throw new K.g(10);
            }
            if (!N(g.mode)) {
              throw new K.g(54);
            }
          }
          b = {type:a, Nb:b, Ja:c, ca:[]};
          a = a.u(b);
          a.u = b;
          b.root = a;
          d ? K.root = a : g && (g.F = b, g.u && g.u.ca.push(b));
          return a;
        }, Sb(a) {
          a = R(a, {ma:!1});
          if (!a.node.F) {
            throw new K.g(28);
          }
          a = a.node;
          var b = a.F, c = Kb(b);
          Object.keys(K.I).forEach(d => {
            for (d = K.I[d]; d;) {
              var e = d.U;
              c.includes(d.u) && Eb(d);
              d = e;
            }
          });
          a.F = null;
          b = a.u.ca.indexOf(b);
          n(-1 !== b);
          a.u.ca.splice(b, 1);
        }, S(a, b) {
          return a.h.S(a, b);
        }, M(a, b, c) {
          var d = R(a, {parent:!0}).node;
          a = db(a);
          if (!a || "." === a || ".." === a) {
            throw new K.g(28);
          }
          var e = Gb(d, a);
          if (e) {
            throw new K.g(e);
          }
          if (!d.h.M) {
            throw new K.g(63);
          }
          return d.h.M(d, a, b, c);
        }, create(a, b) {
          return K.M(a, (void 0 !== b ? b : 438) & 4095 | 32768, 0);
        }, Lb(a, b) {
          a = a.split("/");
          for (var c = "", d = 0; d < a.length; ++d) {
            if (a[d]) {
              c += "/" + a[d];
              try {
                T(c, b);
              } catch (e) {
                if (20 != e.l) {
                  throw e;
                }
              }
            }
          }
        }, O(a, b) {
          if (!hb(a)) {
            throw new K.g(44);
          }
          var c = R(b, {parent:!0}).node;
          if (!c) {
            throw new K.g(44);
          }
          b = db(b);
          var d = Gb(c, b);
          if (d) {
            throw new K.g(d);
          }
          if (!c.h.O) {
            throw new K.g(63);
          }
          return c.h.O(c, b, a);
        }, $(a, b) {
          var c = cb(a), d = cb(b), e = db(a), g = db(b);
          var h = R(a, {parent:!0});
          var m = h.node;
          h = R(b, {parent:!0});
          h = h.node;
          if (!m || !h) {
            throw new K.g(44);
          }
          if (m.u !== h.u) {
            throw new K.g(75);
          }
          var p = O(m, e);
          a = ib(a, d);
          if ("." !== a.charAt(0)) {
            throw new K.g(28);
          }
          a = ib(b, c);
          if ("." !== a.charAt(0)) {
            throw new K.g(55);
          }
          try {
            var u = O(h, g);
          } catch (q) {
          }
          if (p !== u) {
            b = N(p.mode);
            if (e = Hb(m, e, b)) {
              throw new K.g(e);
            }
            if (e = u ? Hb(h, g, b) : Gb(h, g)) {
              throw new K.g(e);
            }
            if (!m.h.$) {
              throw new K.g(63);
            }
            if (p.F || u && u.F) {
              throw new K.g(10);
            }
            if (h !== m && (e = P(m, "w"))) {
              throw new K.g(e);
            }
            Eb(p);
            try {
              m.h.$(p, h, g), p.parent = h;
            } catch (q) {
              throw q;
            } finally {
              Db(p);
            }
          }
        }, W(a) {
          var b = R(a, {parent:!0}).node;
          a = db(a);
          var c = O(b, a), d = Hb(b, a, !0);
          if (d) {
            throw new K.g(d);
          }
          if (!b.h.W) {
            throw new K.g(63);
          }
          if (c.F) {
            throw new K.g(10);
          }
          b.h.W(b, a);
          Eb(c);
        }, Z(a) {
          a = R(a, {D:!0}).node;
          if (!a.h.Z) {
            throw new K.g(54);
          }
          return a.h.Z(a);
        }, P(a) {
          var b = R(a, {parent:!0}).node;
          if (!b) {
            throw new K.g(44);
          }
          a = db(a);
          var c = O(b, a), d = Hb(b, a, !1);
          if (d) {
            throw new K.g(d);
          }
          if (!b.h.P) {
            throw new K.g(63);
          }
          if (c.F) {
            throw new K.g(10);
          }
          b.h.P(b, a);
          Eb(c);
        }, V(a) {
          a = R(a).node;
          if (!a) {
            throw new K.g(44);
          }
          if (!a.h.V) {
            throw new K.g(28);
          }
          return hb(Cb(a.parent), a.h.V(a));
        }, stat(a, b) {
          a = R(a, {D:!b}).node;
          if (!a) {
            throw new K.g(44);
          }
          if (!a.h.H) {
            throw new K.g(63);
          }
          return a.h.H(a);
        }, Ha(a) {
          return K.stat(a, !0);
        }, Ib(a, b) {
          Mb(a, b, !0);
        }, Bb(a, b) {
          a = S(a);
          Mb(a.node, b);
        }, Jb(a) {
          Nb(a, !0);
        }, Cb(a) {
          a = S(a);
          Nb(a.node);
        }, truncate(a, b) {
          if (0 > b) {
            throw new K.g(28);
          }
          a = "string" == typeof a ? R(a, {D:!0}).node : a;
          if (!a.h.A) {
            throw new K.g(63);
          }
          if (N(a.mode)) {
            throw new K.g(31);
          }
          if (!K.isFile(a.mode)) {
            throw new K.g(28);
          }
          var c = P(a, "w");
          if (c) {
            throw new K.g(c);
          }
          a.h.A(a, {size:b, timestamp:Date.now()});
        }, Eb(a, b) {
          a = S(a);
          if (0 === (a.flags & 2097155)) {
            throw new K.g(28);
          }
          K.truncate(a.node, b);
        }, Tb(a, b, c) {
          a = R(a, {D:!0}).node;
          a.h.A(a, {timestamp:Math.max(b, c)});
        }, open(a, b, c) {
          if ("" === a) {
            throw new K.g(44);
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
            a = J(a);
            try {
              e = R(a, {D:!(b & 131072)}).node;
            } catch (g) {
            }
          }
          d = !1;
          if (b & 64) {
            if (e) {
              if (b & 128) {
                throw new K.g(20);
              }
            } else {
              e = K.M(a, c, 0), d = !0;
            }
          }
          if (!e) {
            throw new K.g(44);
          }
          8192 === (e.mode & 61440) && (b &= -513);
          if (b & 65536 && !N(e.mode)) {
            throw new K.g(54);
          }
          if (!d && (c = e ? 40960 === (e.mode & 61440) ? 32 : N(e.mode) && ("r" !== Fb(b) || b & 512) ? 31 : P(e, Fb(b)) : 44)) {
            throw new K.g(c);
          }
          b & 512 && !d && K.truncate(e, 0);
          b &= -131713;
          e = Ib({node:e, path:Cb(e), flags:b, seekable:!0, position:0, i:e.i, qb:[], error:!1});
          e.i.open && e.i.open(e);
          !f.logReadFiles || b & 1 || a in K.La || (K.La[a] = 1);
          return e;
        }, close(a) {
          if (null === a.s) {
            throw new K.g(8);
          }
          a.R && (a.R = null);
          try {
            a.i.close && a.i.close(a);
          } catch (b) {
            throw b;
          } finally {
            K.streams[a.s] = null;
          }
          a.s = null;
        }, B(a, b, c) {
          if (null === a.s) {
            throw new K.g(8);
          }
          if (!a.seekable || !a.i.B) {
            throw new K.g(70);
          }
          if (0 != c && 1 != c && 2 != c) {
            throw new K.g(28);
          }
          a.position = a.i.B(a, b, c);
          a.qb = [];
          return a.position;
        }, read(a, b, c, d, e) {
          n(0 <= c);
          if (0 > d || 0 > e) {
            throw new K.g(28);
          }
          if (null === a.s) {
            throw new K.g(8);
          }
          if (1 === (a.flags & 2097155)) {
            throw new K.g(8);
          }
          if (N(a.node.mode)) {
            throw new K.g(31);
          }
          if (!a.i.read) {
            throw new K.g(28);
          }
          var g = "undefined" != typeof e;
          if (!g) {
            e = a.position;
          } else if (!a.seekable) {
            throw new K.g(70);
          }
          b = a.i.read(a, b, c, d, e);
          g || (a.position += b);
          return b;
        }, write(a, b, c, d, e, g) {
          n(0 <= c);
          if (0 > d || 0 > e) {
            throw new K.g(28);
          }
          if (null === a.s) {
            throw new K.g(8);
          }
          if (0 === (a.flags & 2097155)) {
            throw new K.g(8);
          }
          if (N(a.node.mode)) {
            throw new K.g(31);
          }
          if (!a.i.write) {
            throw new K.g(28);
          }
          a.seekable && a.flags & 1024 && K.B(a, 0, 2);
          var h = "undefined" != typeof e;
          if (!h) {
            e = a.position;
          } else if (!a.seekable) {
            throw new K.g(70);
          }
          b = a.i.write(a, b, c, d, e, g);
          h || (a.position += b);
          return b;
        }, aa(a, b, c) {
          if (null === a.s) {
            throw new K.g(8);
          }
          if (0 > b || 0 >= c) {
            throw new K.g(28);
          }
          if (0 === (a.flags & 2097155)) {
            throw new K.g(8);
          }
          if (!K.isFile(a.node.mode) && !N(a.node.mode)) {
            throw new K.g(43);
          }
          if (!a.i.aa) {
            throw new K.g(138);
          }
          a.i.aa(a, b, c);
        }, X(a, b, c, d, e) {
          if (0 !== (d & 2) && 0 === (e & 2) && 2 !== (a.flags & 2097155)) {
            throw new K.g(2);
          }
          if (1 === (a.flags & 2097155)) {
            throw new K.g(2);
          }
          if (!a.i.X) {
            throw new K.g(43);
          }
          if (!b) {
            throw new K.g(28);
          }
          return a.i.X(a, b, c, d, e);
        }, da(a, b, c, d, e) {
          n(0 <= c);
          return a.i.da ? a.i.da(a, b, c, d, e) : 0;
        }, ia(a, b, c) {
          if (!a.i.ia) {
            throw new K.g(59);
          }
          return a.i.ia(a, b, c);
        }, Qb(a, b = {}) {
          b.flags = b.flags || 0;
          b.encoding = b.encoding || "binary";
          if ("utf8" !== b.encoding && "binary" !== b.encoding) {
            throw Error(`Invalid encoding type "${b.encoding}"`);
          }
          var c, d = K.open(a, b.flags);
          a = K.stat(a).size;
          var e = new Uint8Array(a);
          K.read(d, e, 0, a, 0);
          "utf8" === b.encoding ? c = ab(e) : "binary" === b.encoding && (c = e);
          K.close(d);
          return c;
        }, Ub(a, b, c = {}) {
          c.flags = c.flags || 577;
          a = K.open(a, c.flags, c.mode);
          if ("string" == typeof b) {
            var d = new Uint8Array(kb(b) + 1);
            b = lb(b, d, 0, d.length);
            K.write(a, d, 0, b, void 0, c.Ua);
          } else if (ArrayBuffer.isView(b)) {
            K.write(a, b, 0, b.byteLength, void 0, c.Ua);
          } else {
            throw Error("Unsupported data type");
          }
          K.close(a);
        }, la:() => K.za, xb(a) {
          a = R(a, {D:!0});
          if (null === a.node) {
            throw new K.g(44);
          }
          if (!N(a.node.mode)) {
            throw new K.g(54);
          }
          var b = P(a.node, "x");
          if (b) {
            throw new K.g(b);
          }
          K.za = a.path;
        }, Pb() {
          K.ha = !1;
          Sb(0);
          for (var a = 0; a < K.streams.length; a++) {
            var b = K.streams[a];
            b && K.close(b);
          }
        }, Db(a, b) {
          a = Ob(a, b);
          return a.Ba ? a.object : null;
        }, ya(a, b) {
          a = "string" == typeof a ? a : Cb(a);
          for (b = b.split("/").reverse(); b.length;) {
            var c = b.pop();
            if (c) {
              var d = J(a + "/" + c);
              try {
                T(d);
              } catch (e) {
              }
              a = d;
            }
          }
          return d;
        }, ka(a, b, c, d, e, g) {
          var h = b;
          a && (a = "string" == typeof a ? a : Cb(a), h = b ? J(a + "/" + b) : a);
          a = zb(d, e);
          h = K.create(h, a);
          if (c) {
            if ("string" == typeof c) {
              b = Array(c.length);
              d = 0;
              for (e = c.length; d < e; ++d) {
                b[d] = c.charCodeAt(d);
              }
              c = b;
            }
            Mb(h, a | 146);
            b = K.open(h, 577);
            K.write(b, c, 0, c.length, 0, g);
            K.close(b);
            Mb(h, a);
          }
        }, K(a, b, c, d) {
          a = eb("string" == typeof a ? a : Cb(a), b);
          b = zb(!!c, !!d);
          var e;
          (e = K.K).ra ?? (e.ra = 64);
          e = K.T(K.K.ra++, 0);
          ob(e, {open(g) {
              g.seekable = !1;
            }, close() {
              d?.buffer?.length && d(10);
            }, read(g, h, m, p) {
              for (var u = 0, q = 0; q < p; q++) {
                try {
                  var v = c();
                } catch (C) {
                  throw new K.g(29);
                }
                if (void 0 === v && 0 === u) {
                  throw new K.g(6);
                }
                if (null === v || void 0 === v) {
                  break;
                }
                u++;
                h[m + q] = v;
              }
              u && (g.node.timestamp = Date.now());
              return u;
            }, write(g, h, m, p) {
              for (var u = 0; u < p; u++) {
                try {
                  d(h[m + u]);
                } catch (q) {
                  throw new K.g(29);
                }
              }
              p && (g.node.timestamp = Date.now());
              return u;
            }});
          return Lb(a, b, e);
        }, xa(a, b, c, d, e) {
          function g(q, v, C, D, B) {
            q = q.node.j;
            if (B >= q.length) {
              return 0;
            }
            D = Math.min(q.length - B, D);
            n(0 <= D);
            if (q.slice) {
              for (var G = 0; G < D; G++) {
                v[C + G] = q[B + G];
              }
            } else {
              for (G = 0; G < D; G++) {
                v[C + G] = q.get(B + G);
              }
            }
            return D;
          }
          class h {
            constructor() {
              this.pa = !1;
              this.L = [];
              this.oa = void 0;
              this.Fa = this.Ga = 0;
            }
            get(q) {
              if (!(q > this.length - 1 || 0 > q)) {
                var v = q % this.Ka;
                return this.oa(q / this.Ka | 0)[v];
              }
            }
            pb(q) {
              this.oa = q;
            }
            Ia() {
              var q = new XMLHttpRequest();
              q.open("HEAD", c, !1);
              q.send(null);
              if (!(200 <= q.status && 300 > q.status || 304 === q.status)) {
                throw Error("Couldn't load " + c + ". Status: " + q.status);
              }
              var v = Number(q.getResponseHeader("Content-length")), C, D = (C = q.getResponseHeader("Accept-Ranges")) && "bytes" === C;
              q = (C = q.getResponseHeader("Content-Encoding")) && "gzip" === C;
              var B = 1048576;
              D || (B = v);
              var G = this;
              G.pb(ja => {
                var V = ja * B, Q = (ja + 1) * B - 1;
                Q = Math.min(Q, v - 1);
                if ("undefined" == typeof G.L[ja]) {
                  var oc = G.L;
                  if (V > Q) {
                    throw Error("invalid range (" + V + ", " + Q + ") or no bytes requested!");
                  }
                  if (Q > v - 1) {
                    throw Error("only " + v + " bytes available! programmer error!");
                  }
                  var L = new XMLHttpRequest();
                  L.open("GET", c, !1);
                  v !== B && L.setRequestHeader("Range", "bytes=" + V + "-" + Q);
                  L.responseType = "arraybuffer";
                  L.overrideMimeType && L.overrideMimeType("text/plain; charset=x-user-defined");
                  L.send(null);
                  if (!(200 <= L.status && 300 > L.status || 304 === L.status)) {
                    throw Error("Couldn't load " + c + ". Status: " + L.status);
                  }
                  void 0 !== L.response ? V = new Uint8Array(L.response || []) : (Q = L.responseText || "", V = Array(kb(Q) + 1), Q = lb(Q, V, 0, V.length), V.length = Q);
                  oc[ja] = V;
                }
                if ("undefined" == typeof G.L[ja]) {
                  throw Error("doXHR failed!");
                }
                return G.L[ja];
              });
              if (q || !v) {
                B = v = 1, B = v = this.oa(0).length, la("LazyFiles on gzip forces download of the whole file when length is accessed");
              }
              this.Ga = v;
              this.Fa = B;
              this.pa = !0;
            }
            get length() {
              this.pa || this.Ia();
              return this.Ga;
            }
            get Ka() {
              this.pa || this.Ia();
              return this.Fa;
            }
          }
          var m = "undefined" != typeof XMLHttpRequest ? {qa:!1, j:new h()} : {qa:!1, url:c}, p = Pb(a, b, d, e);
          m.j ? p.j = m.j : m.url && (p.j = null, p.url = m.url);
          Object.defineProperties(p, {o:{get:function() {
                return this.j.length;
              }}});
          var u = {};
          Object.keys(p.i).forEach(q => {
            var v = p.i[q];
            u[q] = (...C) => {
              Qb(p);
              return v(...C);
            };
          });
          u.read = (q, v, C, D, B) => {
            Qb(p);
            return g(q, v, C, D, B);
          };
          u.X = (q, v, C) => {
            Qb(p);
            var D = sb();
            if (!D) {
              throw new K.g(48);
            }
            g(q, w, D, v, C);
            return {ob:D, Qa:!0};
          };
          p.i = u;
          return p;
        }, rb() {
          k("FS.absolutePath has been removed; use PATH_FS.resolve instead");
        }, yb() {
          k("FS.createFolder has been removed; use FS.mkdir instead");
        }, zb() {
          k("FS.createLink has been removed; use FS.symlink instead");
        }, Hb() {
          k("FS.joinPath has been removed; use PATH.join instead");
        }, Mb() {
          k("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
        }, Rb() {
          k("FS.standardizePath has been removed; use PATH.normalize instead");
        }};
      function Tb(a, b, c) {
        if ("/" === b.charAt(0)) {
          return b;
        }
        a = -100 === a ? K.la() : S(a).path;
        if (0 == b.length) {
          if (!c) {
            throw new K.g(44);
          }
          return a;
        }
        return J(a + "/" + b);
      }
      function Ub(a, b, c) {
        a = a(b);
        x[c >> 2] = a.Ya;
        x[c + 4 >> 2] = a.mode;
        y[c + 8 >> 2] = a.kb;
        x[c + 12 >> 2] = a.uid;
        x[c + 16 >> 2] = a.bb;
        x[c + 20 >> 2] = a.Y;
        z[c + 24 >> 3] = BigInt(a.size);
        x[c + 32 >> 2] = 4096;
        x[c + 36 >> 2] = a.Ta;
        b = a.Ra.getTime();
        var d = a.ib.getTime(), e = a.Xa.getTime();
        z[c + 40 >> 3] = BigInt(Math.floor(b / 1000));
        y[c + 48 >> 2] = b % 1000 * 1E6;
        z[c + 56 >> 3] = BigInt(Math.floor(d / 1000));
        y[c + 64 >> 2] = d % 1000 * 1E6;
        z[c + 72 >> 3] = BigInt(Math.floor(e / 1000));
        y[c + 80 >> 2] = e % 1000 * 1E6;
        z[c + 88 >> 3] = BigInt(a.cb);
        return 0;
      }
      var Vb = void 0;
      function U() {
        n(void 0 != Vb);
        var a = x[+Vb >> 2];
        Vb += 4;
        return a;
      }
      var Wb = (a, b, c) => {
        n("number" == typeof c, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
        lb(a, qa, b, c);
      }, W = {C:8192, u() {
          return K.createNode(null, "/", 16895, 0);
        }, i:{Ob(a) {
            var b = a.node.fa;
            if (1 === (a.flags & 2097155)) {
              return 260;
            }
            if (0 < b.v.length) {
              for (a = 0; a < b.v.length; a++) {
                var c = b.v[a];
                if (0 < c.offset - c.G) {
                  return 65;
                }
              }
            }
            return 0;
          }, ia() {
            return 28;
          }, ba() {
            return 28;
          }, read(a, b, c, d) {
            a = a.node.fa;
            for (var e = 0, g = 0; g < a.v.length; g++) {
              var h = a.v[g];
              e += h.offset - h.G;
            }
            n(b instanceof ArrayBuffer || ArrayBuffer.isView(b));
            b = b.subarray(c, c + d);
            if (0 >= d) {
              return 0;
            }
            if (0 == e) {
              throw new K.g(6);
            }
            c = d = Math.min(e, d);
            for (g = e = 0; g < a.v.length; g++) {
              h = a.v[g];
              var m = h.offset - h.G;
              if (d <= m) {
                var p = h.buffer.subarray(h.G, h.offset);
                d < m ? (p = p.subarray(0, d), h.G += d) : e++;
                b.set(p);
                break;
              } else {
                p = h.buffer.subarray(h.G, h.offset), b.set(p), b = b.subarray(p.byteLength), d -= p.byteLength, e++;
              }
            }
            e && e == a.v.length && (e--, a.v[e].offset = 0, a.v[e].G = 0);
            a.v.splice(0, e);
            return c;
          }, write(a, b, c, d) {
            a = a.node.fa;
            n(b instanceof ArrayBuffer || ArrayBuffer.isView(b));
            b = b.subarray(c, c + d);
            c = b.byteLength;
            if (0 >= c) {
              return 0;
            }
            0 == a.v.length ? (d = {buffer:new Uint8Array(W.C), offset:0, G:0}, a.v.push(d)) : d = a.v[a.v.length - 1];
            n(d.offset <= W.C);
            var e = W.C - d.offset;
            if (e >= c) {
              return d.buffer.set(b, d.offset), d.offset += c, c;
            }
            0 < e && (d.buffer.set(b.subarray(0, e), d.offset), d.offset += e, b = b.subarray(e, b.byteLength));
            d = b.byteLength / W.C | 0;
            e = b.byteLength % W.C;
            for (var g = 0; g < d; g++) {
              var h = {buffer:new Uint8Array(W.C), offset:W.C, G:0};
              a.v.push(h);
              h.buffer.set(b.subarray(0, W.C));
              b = b.subarray(W.C, b.byteLength);
            }
            0 < e && (h = {buffer:new Uint8Array(W.C), offset:b.byteLength, G:0}, a.v.push(h), h.buffer.set(b));
            return c;
          }, close(a) {
            a = a.node.fa;
            a.Ma--;
            0 === a.Ma && (a.v = null);
          }}, ea() {
          W.ea.current || (W.ea.current = 0);
          return "pipe[" + W.ea.current++ + "]";
        }}, Xb = a => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), Yb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Zb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], $b = {}, bc = () => {
        if (!ac) {
          var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _:fa || "./this.program"}, b;
          for (b in $b) {
            void 0 === $b[b] ? delete a[b] : a[b] = $b[b];
          }
          var c = [];
          for (b in a) {
            c.push(`${b}=${a[b]}`);
          }
          ac = c;
        }
        return ac;
      }, ac, dc = (a, b) => {
        pa = a;
        cc();
        Za && !b && (b = `program exited (with status: ${a}), but keepRuntimeAlive() is set (counter=${0}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`, ba(b), r(b));
        pa = a;
        Za || (f.onExit?.(a), oa = !0);
        throw new Ya(a);
      }, ec = (a, b, c, d) => {
        for (var e = 0, g = 0; g < c; g++) {
          var h = y[b >> 2], m = y[b + 4 >> 2];
          b += 8;
          h = K.read(a, w, h, m, d);
          if (0 > h) {
            return -1;
          }
          e += h;
          if (h < m) {
            break;
          }
          "undefined" != typeof d && (d += h);
        }
        return e;
      }, fc = (a, b, c, d) => {
        for (var e = 0, g = 0; g < c; g++) {
          var h = y[b >> 2], m = y[b + 4 >> 2];
          b += 8;
          h = K.write(a, w, h, m, d);
          if (0 > h) {
            return -1;
          }
          e += h;
          if (h < m) {
            break;
          }
          "undefined" != typeof d && (d += h);
        }
        return e;
      }, gc = a => {
        if (a instanceof Ya || "unwind" == a) {
          return pa;
        }
        va();
        a instanceof WebAssembly.RuntimeError && 0 >= X() && r("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 262144)");
        throw a;
      }, hc, ic = K.ya, jc = K.xa, kc = K.K;
      K.Wa = yb;
      [44].forEach(a => {
        K.na[a] = new K.g(a);
        K.na[a].stack = "<generic error, no stack>";
      });
      K.I = Array(4096);
      K.u(M, {}, "/");
      T("/tmp");
      T("/home");
      T("/home/web_user");
      (function() {
        T("/dev");
        ob(K.T(1, 3), {read:() => 0, write:(d, e, g, h) => h});
        Lb("/dev/null", K.T(1, 3));
        nb(K.T(5, 0), qb);
        nb(K.T(6, 0), rb);
        Lb("/dev/tty", K.T(5, 0));
        Lb("/dev/tty1", K.T(6, 0));
        var a = new Uint8Array(1024), b = 0, c = () => {
          0 === b && (b = gb(a).byteLength);
          return a[--b];
        };
        K.K("/dev", "random", c);
        K.K("/dev", "urandom", c);
        T("/dev/shm");
        T("/dev/shm/tmp");
      })();
      (function() {
        T("/proc");
        var a = T("/proc/self");
        T("/proc/self/fd");
        K.u({u() {
            var b = K.createNode(a, "fd", 16895, 73);
            b.h = {S(c, d) {
                var e = S(+d);
                c = {parent:null, u:{Ja:"fake"}, h:{V:() => e.path}};
                return c.parent = c;
              }};
            return b;
          }}, {}, "/proc/self/fd");
      })();
      K.$a = {MEMFS:M};
      f.FS_createPath = K.ya;
      f.FS_createDataFile = K.ka;
      f.FS_createPreloadedFile = K.Wa;
      f.FS_unlink = K.P;
      f.FS_createLazyFile = K.xa;
      f.FS_createDevice = K.K;
      var zc = {__assert_fail:(a, b, c, d) => {
          k(`Assertion failed: ${I(a)}, at: ` + [b ? I(b) : "unknown filename", c, d ? I(d) : "unknown function"]);
        }, __syscall_dup:function(a) {
          try {
            var b = S(a);
            return Jb(b).s;
          } catch (c) {
            if ("undefined" == typeof K || "ErrnoError" !== c.name) {
              throw c;
            }
            return -c.l;
          }
        }, __syscall_dup3:function(a, b, c) {
          try {
            var d = S(a);
            n(!c);
            if (d.s === b) {
              return -28;
            }
            if (0 > b || b >= K.va) {
              return -8;
            }
            var e = K.Ca(b);
            e && K.close(e);
            return Jb(d, b).s;
          } catch (g) {
            if ("undefined" == typeof K || "ErrnoError" !== g.name) {
              throw g;
            }
            return -g.l;
          }
        }, __syscall_faccessat:function(a, b, c, d) {
          try {
            b = I(b);
            n(0 === d || 512 == d);
            b = Tb(a, b);
            if (c & -8) {
              return -28;
            }
            var e = R(b, {D:!0}).node;
            if (!e) {
              return -44;
            }
            a = "";
            c & 4 && (a += "r");
            c & 2 && (a += "w");
            c & 1 && (a += "x");
            return a && P(e, a) ? -2 : 0;
          } catch (g) {
            if ("undefined" == typeof K || "ErrnoError" !== g.name) {
              throw g;
            }
            return -g.l;
          }
        }, __syscall_fcntl64:function(a, b, c) {
          Vb = c;
          try {
            var d = S(a);
            switch(b) {
              case 0:
                var e = U();
                if (0 > e) {
                  break;
                }
                for (; K.streams[e];) {
                  e++;
                }
                return Jb(d, e).s;
              case 1:
              case 2:
                return 0;
              case 3:
                return d.flags;
              case 4:
                return e = U(), d.flags |= e, 0;
              case 12:
                return e = U(), ra[e + 0 >> 1] = 2, 0;
              case 13:
              case 14:
                return 0;
            }
            return -28;
          } catch (g) {
            if ("undefined" == typeof K || "ErrnoError" !== g.name) {
              throw g;
            }
            return -g.l;
          }
        }, __syscall_fstat64:function(a, b) {
          try {
            var c = S(a);
            return Ub(K.stat, c.path, b);
          } catch (d) {
            if ("undefined" == typeof K || "ErrnoError" !== d.name) {
              throw d;
            }
            return -d.l;
          }
        }, __syscall_getdents64:function(a, b, c) {
          try {
            var d = S(a);
            d.R || (d.R = K.Z(d.path));
            a = 0;
            for (var e = K.B(d, 0, 1), g = Math.floor(e / 280); g < d.R.length && a + 280 <= c;) {
              var h = d.R[g];
              if ("." === h) {
                var m = d.node.id;
                var p = 4;
              } else if (".." === h) {
                m = R(d.path, {parent:!0}).node.id, p = 4;
              } else {
                var u = O(d.node, h);
                m = u.id;
                p = 8192 === (u.mode & 61440) ? 2 : N(u.mode) ? 4 : 40960 === (u.mode & 61440) ? 10 : 8;
              }
              n(m);
              z[b + a >> 3] = BigInt(m);
              z[b + a + 8 >> 3] = BigInt(280 * (g + 1));
              ra[b + a + 16 >> 1] = 280;
              w[b + a + 18] = p;
              Wb(h, b + a + 19, 256);
              a += 280;
              g += 1;
            }
            K.B(d, 280 * g, 0);
            return a;
          } catch (q) {
            if ("undefined" == typeof K || "ErrnoError" !== q.name) {
              throw q;
            }
            return -q.l;
          }
        }, __syscall_ioctl:function(a, b, c) {
          Vb = c;
          try {
            var d = S(a);
            switch(b) {
              case 21509:
                return d.m ? 0 : -59;
              case 21505:
                if (!d.m) {
                  return -59;
                }
                if (d.m.N.eb) {
                  a = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                  var e = U();
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
                return d.m ? 0 : -59;
              case 21506:
              case 21507:
              case 21508:
                if (!d.m) {
                  return -59;
                }
                if (d.m.N.fb) {
                  for (e = U(), a = [], g = 0; 32 > g; g++) {
                    a.push(w[e + g + 17]);
                  }
                }
                return 0;
              case 21519:
                if (!d.m) {
                  return -59;
                }
                e = U();
                return x[e >> 2] = 0;
              case 21520:
                return d.m ? -28 : -59;
              case 21531:
                return e = U(), K.ia(d, b, e);
              case 21523:
                if (!d.m) {
                  return -59;
                }
                d.m.N.gb && (g = [24, 80], e = U(), ra[e >> 1] = g[0], ra[e + 2 >> 1] = g[1]);
                return 0;
              case 21524:
                return d.m ? 0 : -59;
              case 21515:
                return d.m ? 0 : -59;
              default:
                return -28;
            }
          } catch (h) {
            if ("undefined" == typeof K || "ErrnoError" !== h.name) {
              throw h;
            }
            return -h.l;
          }
        }, __syscall_lstat64:function(a, b) {
          try {
            return a = I(a), Ub(K.Ha, a, b);
          } catch (c) {
            if ("undefined" == typeof K || "ErrnoError" !== c.name) {
              throw c;
            }
            return -c.l;
          }
        }, __syscall_newfstatat:function(a, b, c, d) {
          try {
            b = I(b);
            var e = d & 256, g = d & 4096;
            d &= -6401;
            n(!d, `unknown flags in __syscall_newfstatat: ${d}`);
            b = Tb(a, b, g);
            return Ub(e ? K.Ha : K.stat, b, c);
          } catch (h) {
            if ("undefined" == typeof K || "ErrnoError" !== h.name) {
              throw h;
            }
            return -h.l;
          }
        }, __syscall_openat:function(a, b, c, d) {
          Vb = d;
          try {
            b = I(b);
            b = Tb(a, b);
            var e = d ? U() : 0;
            return K.open(b, c, e).s;
          } catch (g) {
            if ("undefined" == typeof K || "ErrnoError" !== g.name) {
              throw g;
            }
            return -g.l;
          }
        }, __syscall_pipe:function(a) {
          try {
            if (0 == a) {
              throw new K.g(21);
            }
            var b = {v:[], Ma:2};
            b.v.push({buffer:new Uint8Array(W.C), offset:0, G:0});
            var c = W.ea(), d = W.ea(), e = K.createNode(W.root, c, 4096, 0), g = K.createNode(W.root, d, 4096, 0);
            e.fa = b;
            g.fa = b;
            var h = Ib({path:c, node:e, flags:0, seekable:!1, i:W.i});
            e.stream = h;
            var m = Ib({path:d, node:g, flags:1, seekable:!1, i:W.i});
            g.stream = m;
            var p = h.s;
            var u = m.s;
            x[a >> 2] = p;
            x[a + 4 >> 2] = u;
            return 0;
          } catch (q) {
            if ("undefined" == typeof K || "ErrnoError" !== q.name) {
              throw q;
            }
            return -q.l;
          }
        }, __syscall_renameat:function(a, b, c, d) {
          try {
            return b = I(b), d = I(d), b = Tb(a, b), d = Tb(c, d), K.$(b, d), 0;
          } catch (e) {
            if ("undefined" == typeof K || "ErrnoError" !== e.name) {
              throw e;
            }
            return -e.l;
          }
        }, __syscall_rmdir:function(a) {
          try {
            return a = I(a), K.W(a), 0;
          } catch (b) {
            if ("undefined" == typeof K || "ErrnoError" !== b.name) {
              throw b;
            }
            return -b.l;
          }
        }, __syscall_stat64:function(a, b) {
          try {
            return a = I(a), Ub(K.stat, a, b);
          } catch (c) {
            if ("undefined" == typeof K || "ErrnoError" !== c.name) {
              throw c;
            }
            return -c.l;
          }
        }, __syscall_unlinkat:function(a, b, c) {
          try {
            return b = I(b), b = Tb(a, b), 0 === c ? K.P(b) : 512 === c ? K.W(b) : k("Invalid flags passed to unlinkat"), 0;
          } catch (d) {
            if ("undefined" == typeof K || "ErrnoError" !== d.name) {
              throw d;
            }
            return -d.l;
          }
        }, _abort_js:() => {
          k("native code called abort()");
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
          x[b + 28 >> 2] = (Xb(a.getFullYear()) ? Yb : Zb)[a.getMonth()] + a.getDate() - 1 | 0;
          x[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
          var c = (new Date(a.getFullYear(), 6, 1)).getTimezoneOffset(), d = (new Date(a.getFullYear(), 0, 1)).getTimezoneOffset();
          x[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
        }, _mktime_js:function(a) {
          var b = new Date(x[a + 20 >> 2] + 1900, x[a + 16 >> 2], x[a + 12 >> 2], x[a + 8 >> 2], x[a + 4 >> 2], x[a >> 2], 0), c = x[a + 32 >> 2], d = b.getTimezoneOffset(), e = (new Date(b.getFullYear(), 6, 1)).getTimezoneOffset(), g = (new Date(b.getFullYear(), 0, 1)).getTimezoneOffset(), h = Math.min(g, e);
          0 > c ? x[a + 32 >> 2] = Number(e != g && h == d) : 0 < c != (h == d) && (e = Math.max(g, e), b.setTime(b.getTime() + 60000 * ((0 < c ? h : e) - d)));
          x[a + 24 >> 2] = b.getDay();
          x[a + 28 >> 2] = (Xb(b.getFullYear()) ? Yb : Zb)[b.getMonth()] + b.getDate() - 1 | 0;
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
          b = h => {
            var m = Math.abs(h);
            return `UTC${0 <= h ? "-" : "+"}${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}`;
          };
          a = b(g);
          b = b(e);
          n(a);
          n(b);
          n(16 >= kb(a), `timezone name truncated to fit in TZNAME_MAX (${a})`);
          n(16 >= kb(b), `timezone name truncated to fit in TZNAME_MAX (${b})`);
          e < g ? (Wb(a, c, 17), Wb(b, d, 17)) : (Wb(a, d, 17), Wb(b, c, 17));
        }, emscripten_date_now:() => Date.now(), emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
          var b = qa.length;
          a >>>= 0;
          n(a > b);
          if (2147483648 < a) {
            return r(`Cannot enlarge memory, requested ${a} bytes, but the limit is ${2147483648} bytes!`), !1;
          }
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            var e = Math, g = e.min;
            d = Math.max(a, d);
            n(65536, "alignment argument is required");
            e = g.call(e, 2147483648, 65536 * Math.ceil(d / 65536));
            a: {
              g = e;
              d = na.buffer;
              var h = (g - d.byteLength + 65535) / 65536 | 0;
              try {
                na.grow(h);
                sa();
                var m = 1;
                break a;
              } catch (p) {
                r(`growMemory: Attempted to grow heap from ${d.byteLength} bytes to ${g} bytes, but got error: ${p}`);
              }
              m = void 0;
            }
            if (m) {
              return !0;
            }
          }
          r(`Failed to grow the heap from ${b} bytes to ${e} bytes, not enough memory!`);
          return !1;
        }, environ_get:(a, b) => {
          var c = 0;
          bc().forEach((d, e) => {
            var g = b + c;
            e = y[a + 4 * e >> 2] = g;
            for (g = 0; g < d.length; ++g) {
              n(d.charCodeAt(g) === (d.charCodeAt(g) & 255)), w[e++] = d.charCodeAt(g);
            }
            w[e] = 0;
            c += d.length + 1;
          });
          return 0;
        }, environ_sizes_get:(a, b) => {
          var c = bc();
          y[a >> 2] = c.length;
          var d = 0;
          c.forEach(e => d += e.length + 1);
          y[b >> 2] = d;
          return 0;
        }, exit:dc, fd_close:function(a) {
          try {
            var b = S(a);
            K.close(b);
            return 0;
          } catch (c) {
            if ("undefined" == typeof K || "ErrnoError" !== c.name) {
              throw c;
            }
            return c.l;
          }
        }, fd_fdstat_get:function(a, b) {
          try {
            var c = S(a);
            w[b] = c.m ? 2 : N(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
            ra[b + 2 >> 1] = 0;
            z[b + 8 >> 3] = BigInt(0);
            z[b + 16 >> 3] = BigInt(0);
            return 0;
          } catch (d) {
            if ("undefined" == typeof K || "ErrnoError" !== d.name) {
              throw d;
            }
            return d.l;
          }
        }, fd_pread:function(a, b, c, d, e) {
          d = -9007199254740992 > d || 9007199254740992 < d ? NaN : Number(d);
          try {
            if (isNaN(d)) {
              return 61;
            }
            var g = S(a), h = ec(g, b, c, d);
            y[e >> 2] = h;
            return 0;
          } catch (m) {
            if ("undefined" == typeof K || "ErrnoError" !== m.name) {
              throw m;
            }
            return m.l;
          }
        }, fd_pwrite:function(a, b, c, d, e) {
          d = -9007199254740992 > d || 9007199254740992 < d ? NaN : Number(d);
          try {
            if (isNaN(d)) {
              return 61;
            }
            var g = S(a), h = fc(g, b, c, d);
            y[e >> 2] = h;
            return 0;
          } catch (m) {
            if ("undefined" == typeof K || "ErrnoError" !== m.name) {
              throw m;
            }
            return m.l;
          }
        }, fd_read:function(a, b, c, d) {
          try {
            var e = S(a), g = ec(e, b, c);
            y[d >> 2] = g;
            return 0;
          } catch (h) {
            if ("undefined" == typeof K || "ErrnoError" !== h.name) {
              throw h;
            }
            return h.l;
          }
        }, fd_seek:function(a, b, c, d) {
          b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
          try {
            if (isNaN(b)) {
              return 61;
            }
            var e = S(a);
            K.B(e, b, c);
            z[d >> 3] = BigInt(e.position);
            e.R && 0 === b && 0 === c && (e.R = null);
            return 0;
          } catch (g) {
            if ("undefined" == typeof K || "ErrnoError" !== g.name) {
              throw g;
            }
            return g.l;
          }
        }, fd_write:function(a, b, c, d) {
          try {
            var e = S(a), g = fc(e, b, c);
            y[d >> 2] = g;
            return 0;
          } catch (h) {
            if ("undefined" == typeof K || "ErrnoError" !== h.name) {
              throw h;
            }
            return h.l;
          }
        }, invoke_ii:lc, invoke_iii:mc, invoke_iiii:nc, invoke_iiiii:pc, invoke_iiiiiii:qc, invoke_iiiiiiiiiiiii:rc, invoke_iiji:sc, invoke_vi:tc, invoke_vii:uc, invoke_viii:vc, invoke_viiii:wc, invoke_viiiii:xc, invoke_viiiiii:yc}, F = function() {
        function a(d) {
          F = d.exports;
          na = F.memory;
          n(na, "memory not found in wasm exports");
          sa();
          hc = F.__indirect_function_table;
          n(hc, "table not found in wasm exports");
          ya.unshift(F.__wasm_call_ctors);
          La("wasm-instantiate");
          return F;
        }
        var b = {env:zc, wasi_snapshot_preview1:zc};
        Ka("wasm-instantiate");
        var c = f;
        if (f.instantiateWasm) {
          try {
            return f.instantiateWasm(b, a);
          } catch (d) {
            r(`Module.instantiateWasm callback failed with error: ${d}`), ba(d);
          }
        }
        Na ??= f.locateFile ? Ma("gs.wasm") ? "gs.wasm" : f.locateFile ? f.locateFile("gs.wasm", l) : l + "gs.wasm" : (new URL("gs.wasm", import.meta.url)).href;
        Ra(b, function(d) {
          n(f === c, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
          c = null;
          a(d.instance);
        }).catch(ba);
        return {};
      }(), Ac = f._main = E("__main_argc_argv", 2), Rb = E("strerror", 1), Sb = E("fflush", 1), Y = E("setThrew", 2), Bc = () => (Bc = F.emscripten_stack_init)(), ua = () => (ua = F.emscripten_stack_get_end)(), Z = a => (Z = F._emscripten_stack_restore)(a), Cc = a => (Cc = F._emscripten_stack_alloc)(a), X = () => (X = F.emscripten_stack_get_current)();
      f.dynCall_jiji = E("dynCall_jiji", 4);
      var Dc = f.dynCall_iiii = E("dynCall_iiii", 4), Ec = f.dynCall_ii = E("dynCall_ii", 2);
      f.dynCall_iidiiii = E("dynCall_iidiiii", 7);
      var dynCall_vii = f.dynCall_vii = E("dynCall_vii", 3), dynCall_v = f.dynCall_v = E("dynCall_v", 1);
      f.dynCall_iiiiii = E("dynCall_iiiiii", 6);
      f.dynCall_iiiiiiii = E("dynCall_iiiiiiii", 8);
      var dynCall_iii = f.dynCall_iii = E("dynCall_iii", 3), Fc = f.dynCall_viii = E("dynCall_viii", 4), dynCall_vi = f.dynCall_vi = E("dynCall_vi", 2), Gc = f.dynCall_iiiii = E("dynCall_iiiii", 5), Hc = f.dynCall_iiiiiii = E("dynCall_iiiiiii", 7);
      f.dynCall_iiiiiiiii = E("dynCall_iiiiiiiii", 9);
      f.dynCall_iiiiiiiiiiii = E("dynCall_iiiiiiiiiiii", 12);
      f.dynCall_iiiiiiiiiii = E("dynCall_iiiiiiiiiii", 11);
      f.dynCall_iiiiiiiiiiiiiiiii = E("dynCall_iiiiiiiiiiiiiiiii", 17);
      f.dynCall_iiiiiiiiii = E("dynCall_iiiiiiiiii", 10);
      var Ic = f.dynCall_iiji = E("dynCall_iiji", 4);
      f.dynCall_jii = E("dynCall_jii", 3);
      f.dynCall_iiiiiiijjii = E("dynCall_iiiiiiijjii", 11);
      f.dynCall_iiiiiiiiiiji = E("dynCall_iiiiiiiiiiji", 12);
      f.dynCall_iiiiiiiiiijj = E("dynCall_iiiiiiiiiijj", 12);
      f.dynCall_iiiiiij = E("dynCall_iiiiiij", 7);
      f.dynCall_iiiiiiiiiiiiii = E("dynCall_iiiiiiiiiiiiii", 14);
      f.dynCall_iddii = E("dynCall_iddii", 5);
      f.dynCall_fdi = E("dynCall_fdi", 3);
      f.dynCall_fdii = E("dynCall_fdii", 4);
      f.dynCall_viiiiiiiiijiiii = E("dynCall_viiiiiiiiijiiii", 15);
      f.dynCall_iiijiii = E("dynCall_iiijiii", 7);
      f.dynCall_iijiii = E("dynCall_iijiii", 6);
      f.dynCall_iij = E("dynCall_iij", 3);
      var Jc = f.dynCall_viiii = E("dynCall_viiii", 5);
      f.dynCall_iidiii = E("dynCall_iidiii", 6);
      var Kc = f.dynCall_viiiii = E("dynCall_viiiii", 6);
      f.dynCall_viiiiiii = E("dynCall_viiiiiii", 8);
      var Lc = f.dynCall_viiiiii = E("dynCall_viiiiii", 7);
      f.dynCall_idii = E("dynCall_idii", 4);
      f.dynCall_iiiiiiiiiiiiiii = E("dynCall_iiiiiiiiiiiiiii", 15);
      f.dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii = E("dynCall_viiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiijiiiiii", 40);
      f.dynCall_viiiiiiiiiiiiiijiiiii = E("dynCall_viiiiiiiiiiiiiijiiiii", 21);
      f.dynCall_viiiiiiiii = E("dynCall_viiiiiiiii", 10);
      f.dynCall_iiiiiiiiiiiiiiii = E("dynCall_iiiiiiiiiiiiiiii", 16);
      f.dynCall_iji = E("dynCall_iji", 3);
      f.dynCall_jji = E("dynCall_jji", 3);
      f.dynCall_viij = E("dynCall_viij", 4);
      f.dynCall_ji = E("dynCall_ji", 2);
      var Mc = f.dynCall_iiiiiiiiiiiii = E("dynCall_iiiiiiiiiiiii", 13);
      f.dynCall_id = E("dynCall_id", 2);
      f.dynCall_dd = E("dynCall_dd", 2);
      f.dynCall_viiiiiiii = E("dynCall_viiiiiiii", 9);
      f.dynCall_iijii = E("dynCall_iijii", 5);
      f.dynCall_fdd = E("dynCall_fdd", 3);
      f.dynCall_iiiij = E("dynCall_iiiij", 5);
      f.dynCall_iiiijj = E("dynCall_iiiijj", 6);
      f.dynCall_iiiiijiiii = E("dynCall_iiiiijiiii", 10);
      f.dynCall_iiiiiiiifi = E("dynCall_iiiiiiiifi", 10);
      f.dynCall_iiiijii = E("dynCall_iiiijii", 7);
      f.dynCall_iiiiijiiiii = E("dynCall_iiiiijiiiii", 11);
      f.dynCall_vijii = E("dynCall_vijii", 5);
      f.dynCall_diiid = E("dynCall_diiid", 5);
      f.dynCall_iidi = E("dynCall_iidi", 4);
      f.dynCall_iid = E("dynCall_iid", 3);
      f.dynCall_iiiid = E("dynCall_iiiid", 5);
      f.dynCall_iiddddi = E("dynCall_iiddddi", 7);
      f.dynCall_iiddddddddi = E("dynCall_iiddddddddi", 11);
      f.dynCall_ddd = E("dynCall_ddd", 3);
      f.dynCall_iijj = E("dynCall_iijj", 4);
      f.dynCall_iiiji = E("dynCall_iiiji", 5);
      f.dynCall_iijjjjjj = E("dynCall_iijjjjjj", 8);
      f.dynCall_iiijii = E("dynCall_iiijii", 6);
      f.dynCall_iiiijiiii = E("dynCall_iiiijiiii", 9);
      function lc(a, b) {
        var c = X();
        try {
          return Ec(a, b);
        } catch (d) {
          Z(c);
          if (d !== d + 0) {
            throw d;
          }
          Y(1, 0);
        }
      }
      function uc(a, b, c) {
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
      function mc(a, b, c) {
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
      function nc(a, b, c, d) {
        var e = X();
        try {
          return Dc(a, b, c, d);
        } catch (g) {
          Z(e);
          if (g !== g + 0) {
            throw g;
          }
          Y(1, 0);
        }
      }
      function tc(a, b) {
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
      function vc(a, b, c, d) {
        var e = X();
        try {
          Fc(a, b, c, d);
        } catch (g) {
          Z(e);
          if (g !== g + 0) {
            throw g;
          }
          Y(1, 0);
        }
      }
      function pc(a, b, c, d, e) {
        var g = X();
        try {
          return Gc(a, b, c, d, e);
        } catch (h) {
          Z(g);
          if (h !== h + 0) {
            throw h;
          }
          Y(1, 0);
        }
      }
      function qc(a, b, c, d, e, g, h) {
        var m = X();
        try {
          return Hc(a, b, c, d, e, g, h);
        } catch (p) {
          Z(m);
          if (p !== p + 0) {
            throw p;
          }
          Y(1, 0);
        }
      }
      function wc(a, b, c, d, e) {
        var g = X();
        try {
          Jc(a, b, c, d, e);
        } catch (h) {
          Z(g);
          if (h !== h + 0) {
            throw h;
          }
          Y(1, 0);
        }
      }
      function sc(a, b, c, d) {
        var e = X();
        try {
          return Ic(a, b, c, d);
        } catch (g) {
          Z(e);
          if (g !== g + 0) {
            throw g;
          }
          Y(1, 0);
        }
      }
      function xc(a, b, c, d, e, g) {
        var h = X();
        try {
          Kc(a, b, c, d, e, g);
        } catch (m) {
          Z(h);
          if (m !== m + 0) {
            throw m;
          }
          Y(1, 0);
        }
      }
      function yc(a, b, c, d, e, g, h) {
        var m = X();
        try {
          Lc(a, b, c, d, e, g, h);
        } catch (p) {
          Z(m);
          if (p !== p + 0) {
            throw p;
          }
          Y(1, 0);
        }
      }
      function rc(a, b, c, d, e, g, h, m, p, u, q, v, C) {
        var D = X();
        try {
          return Mc(a, b, c, d, e, g, h, m, p, u, q, v, C);
        } catch (B) {
          Z(D);
          if (B !== B + 0) {
            throw B;
          }
          Y(1, 0);
        }
      }
      f.addRunDependency = Ka;
      f.removeRunDependency = La;
      f.callMain = Nc;
      f.FS_createPreloadedFile = yb;
      f.FS_unlink = a => K.P(a);
      f.FS_createPath = ic;
      f.FS_createDevice = kc;
      f.FS = K;
      f.FS_createDataFile = (a, b, c, d, e, g) => {
        K.ka(a, b, c, d, e, g);
      };
      f.FS_createLazyFile = jc;
      "writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 getTempRet0 setTempRet0 inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr emscriptenLog readEmAsmArgs jstoi_q listenOnce autoResumeAudioContext dynCallLegacy getDynCaller dynCall runtimeKeepalivePush runtimeKeepalivePop callUserCallback maybeExit asmjsMangle HandleAllocator getNativeTypeSize STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS getCFunc ccall cwrap uleb128Encode sigToWasmTypes generateFuncType convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction reallyNegative unSign strLen reSign formatString intArrayToString AsciiToString UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 stringToNewUTF8 writeArrayToMemory registerKeyEventCallback maybeCStringToJsString findEventTarget getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData battery registerBatteryEventCallback setCanvasElementSize getCanvasElementSize jsStackTrace getCallstack convertPCtoSourceLocation checkWasiClock wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags createDyncallWrapper safeSetTimeout setImmediateWrapped clearImmediateWrapped polyfillSetImmediate registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback ExceptionInfo findMatchingCatch Browser_asyncPrepareDataCounter safeRequestAnimationFrame arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback heapObjectForWebGLType toTypedArrayIndex webgl_enable_ANGLE_instanced_arrays webgl_enable_OES_vertex_array_object webgl_enable_WEBGL_draw_buffers webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode emscriptenWebGLGet computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData emscriptenWebGLGetUniform webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory setErrNo demangle stackTrace".split(" ").forEach(function(a) {
        Va(a, () => {
          var b = `\`${a}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`, c = a;
          c.startsWith("_") || (c = "$" + a);
          b += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${c}')`;
          Ua(a) && (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
          H(b);
        });
        Xa(a);
      });
      "run addOnPreRun addOnInit addOnPreMain addOnExit addOnPostRun out err abort wasmMemory wasmExports writeStackCookie checkStackCookie INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore stackAlloc ptrToString zeroMemory exitJS getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets initRandomFill randomFill timers warnOnce readEmAsmArgsArray jstoi_s getExecutableName handleException keepRuntimeAlive asyncLoad alignMemory mmapAlloc wasmTable noExitRuntime freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString UTF8ToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString stringToAscii UTF16Decoder stringToUTF8OnStack JSEvents specialHTMLTargets findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle UNWIND_CACHE ExitStatus getEnvStrings doReadv doWritev promiseMap uncaughtExceptionCount exceptionLast exceptionCaught Browser getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE isLeapYear ydayFromDate SYSCALLS preloadPlugins FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers GL AL GLUT EGL GLEW IDBStore SDL SDL_gfx allocateUTF8 allocateUTF8OnStack print printErr".split(" ").forEach(Xa);
      var Oc, Pc;
      Ha = function Qc() {
        Oc || Rc();
        Oc || (Ha = Qc);
      };
      function Nc(a = []) {
        n(0 == A, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
        n(Pc, "cannot call main without calling preRun first");
        a.unshift(fa);
        var b = a.length, c = Cc(4 * (b + 1)), d = c;
        a.forEach(g => {
          var h = y, m = d >> 2, p = kb(g) + 1, u = Cc(p);
          Wb(g, u, p);
          h[m] = u;
          d += 4;
        });
        y[d >> 2] = 0;
        try {
          var e = Ac(b, c);
          dc(e, !0);
          return e;
        } catch (g) {
          return gc(g);
        }
      }
      function Rc() {
        var a = ea;
        function b() {
          if (!Oc && (Oc = 1, f.calledRun = 1, !oa)) {
            n(!Ba);
            Ba = !0;
            va();
            f.noFSInit || K.ha || wb();
            K.Ea = !1;
            W.root = K.u(W, {}, null);
            Ea(ya);
            va();
            Ea(za);
            aa(f);
            f.onRuntimeInitialized?.();
            Sc && Nc(a);
            va();
            var c = f.postRun;
            c && ("function" == typeof c && (c = [c]), c.forEach(Fa));
            Ea(Aa);
          }
        }
        if (!(0 < A)) {
          Bc();
          ta();
          if (!Pc && (Pc = 1, Ca(), 0 < A)) {
            return;
          }
          f.setStatus ? (f.setStatus("Running..."), setTimeout(() => {
            setTimeout(() => f.setStatus(""), 1);
            b();
          }, 1)) : b();
          va();
        }
      }
      function cc() {
        var a = la, b = r, c = !1;
        la = r = () => {
          c = !0;
        };
        try {
          Sb(0), ["stdout", "stderr"].forEach(d => {
            (d = Ob("/dev/" + d)) && mb[d.object.Y]?.output?.length && (c = !0);
          });
        } catch (d) {
        }
        la = a;
        r = b;
        c && H("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
      }
      if (f.preInit) {
        for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length;) {
          f.preInit.pop()();
        }
      }
      var Sc = !1;
      f.noInitialRun && (Sc = !1);
      Rc();
      moduleRtn = ca;
      for (const a of Object.keys(f)) {
        a in moduleArg || Object.defineProperty(moduleArg, a, {configurable:!0, get() {
            k(`Access to module property ('${a}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
          }});
      }
      ;


      return moduleRtn;
    }
  );
})();
export default gs;
