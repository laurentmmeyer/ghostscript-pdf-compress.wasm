function loadScript() {
  import("./gs-worker.js");
}

var Module;

function _GSPS2PDF(
  dataStruct,
  responseCallback,
) {
  // first download the ps data
  var xhr = new XMLHttpRequest();
  xhr.open("GET", dataStruct.psDataURL);
  xhr.responseType = "arraybuffer";
  xhr.onload = function () {
    console.log('onload')
    // release the URL
    self.URL.revokeObjectURL(dataStruct.psDataURL);
    //set up EMScripten environment
    Module = {
      preRun: [
        function () {
          self.Module.FS.writeFile("input.pdf", new Uint8Array(xhr.response));
        },
      ],
      postRun: [
        function () {
          var uarray = self.Module.FS.readFile("output.pdf", { encoding: "binary" });
          var blob = new Blob([uarray], { type: "application/octet-stream" });
          var pdfDataURL = self.URL.createObjectURL(blob);
          responseCallback({ pdfDataURL: pdfDataURL, url: dataStruct.url });
        },
      ],
      arguments: [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-DNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-sOutputFile=output.pdf",
        "input.pdf",
      ],
      print: function (text) {
        // statusUpdateCallback(text);
      },
      printErr: function (text) {
        // statusUpdateCallback("Error: " + text);
        // console.error(text);
      },
      // setStatus: function (text) {
      //   if (!Module.setStatus.last)
      //     Module.setStatus.last = { time: Date.now(), text: "" };
      //   if (text === Module.setStatus.last.text) return;
      //   var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
      //   var now = Date.now();
      //   if (m && now - Module.setStatus.last.time < 30)
      //     // if this is a progress update, skip it if too soon
      //     return;
      //   Module.setStatus.last.time = now;
      //   Module.setStatus.last.text = text;
      //   if (m) {
      //     text = m[1];
      //     progressCallback(false, parseInt(m[2]) * 100, parseInt(m[4]) * 100);
      //   } else {
      //     progressCallback(true, 0, 0);
      //   }
      //   statusUpdateCallback(text);
      // },
      totalDependencies: 0,
      noExitRuntime: 1
    };
    // Module.setStatus("Loading Ghostscript...");
    if (!self.Module) {
      self.Module = Module;
      loadScript();
    } else {
      self.Module["calledRun"] = false;
      self.Module["postRun"] = Module.postRun;
      self.Module["preRun"] = Module.preRun;
      self.Module.callMain();
    }
  };
  xhr.send();
}


self.addEventListener('message', function({data:e}) {
  console.log("message", e)
  // e.data contains the message sent to the worker.
  if (e.target !== 'wasm'){
    return;
  }
  console.log('Message received from main script', e.data);
  _GSPS2PDF(e.data, ({pdfDataURL}) => self.postMessage(pdfDataURL))
});

console.log("Worker ready")
