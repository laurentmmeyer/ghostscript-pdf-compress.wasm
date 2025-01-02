import gs from "./gs.js";

let Module;

function _GSPS2PDF(
  dataStruct,
  responseCallback,
  progressCallback,
  statusUpdateCallback,
) {
  // first download the ps data
  var xhr = new XMLHttpRequest();
  xhr.open("GET", dataStruct.psDataURL);
  xhr.responseType = "arraybuffer";
  xhr.onload = async function () {
    // release the URL
    self.URL.revokeObjectURL(dataStruct.psDataURL);
    // load module
    Module = {
      print: function (text) {
        statusUpdateCallback(text);
      },
      printErr: function (text) {
        statusUpdateCallback("Error: " + text);
        console.error(text);
      },
      setStatus: function (text) {
        if (!Module.setStatus.last)
          Module.setStatus.last = {time: Date.now(), text: ""};
        if (text === Module.setStatus.last.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Module.setStatus.last.time < 30)
          // if this is a progress update, skip it if too soon
          return;
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;
        if (m) {
          text = m[1];
          if (progressCallback)
            progressCallback(false, parseInt(m[2]) * 100, parseInt(m[4]) * 100);
        } else {
          if (progressCallback)
            progressCallback(true, 0, 0);
        }
        if (statusUpdateCallback)
          statusUpdateCallback(text);
      },
      totalDependencies: 0,
    };
    Module.setStatus("Loading Ghostscript...");
    const wasmModule = await gs();
    // copy source file to virtual filesystem
    const FS = wasmModule.FS;
    FS.writeFile = (path, content) => {
      const stream = FS.open(path, 'w');
      FS.write(stream, new Uint8Array([...content]), 0, content.length, 0);
      FS.close(stream);
    };
    FS.readFile = (path, options = { encoding: 'utf8' }) => {
      const stream = FS.open(path, 'r');
      const buffer = new Uint8Array(FS.stat(path).size);
      FS.read(stream, buffer, 0, buffer.length, 0);
      FS.close(stream);

      return options.encoding === 'utf8'
        ? new TextDecoder('utf8').decode(buffer)
        : buffer;
    };
    FS.writeFile("input.pdf", new Uint8Array(xhr.response));
    // ghostscript arguments and run ghostscript
    var gsargs = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.5",
      "-dPDFSETTINGS=/ebook",
      "-DNOPAUSE",
      //"-dQUIET",
      "-dBATCH",
      "-sOutputFile=output.pdf",
      "input.pdf",
    ]
    wasmModule.callMain(gsargs);
    // make output file on virtual filesystem downloadable
    var uarray = FS.readFile("output.pdf", {encoding: "binary"}); //Uint8Array
    var blob = new Blob([uarray], {type: "application/octet-stream"});
    var pdfDataURL = self.URL.createObjectURL(blob);
    responseCallback({pdfDataURL: pdfDataURL, url: dataStruct.url});
  };
  xhr.send();
}

self.addEventListener('message', function ({data: e}) {
  console.log("message", e)
  // e.data contains the message sent to the worker.
  if (e.target !== 'wasm') {
    return;
  }
  console.log('Message received from main script', e.data);
  _GSPS2PDF(e.data, ({pdfDataURL}) => self.postMessage(pdfDataURL))
});

console.log("Worker ready")
