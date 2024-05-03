const initQPDF = async (fileURL) => {
  const QPDF = await import("./qpdf.mjs");
  return QPDF.default({
    print: function (text) {
      console.log("stdout: " + text);
    },
    printErr: function (text) {
      console.error("stderr: " + text);
    },
  })
    .then((qpdf) => {
      qpdf.callMain(["--help"]);
      return new Promise((res) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", fileURL);
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
          // release the URL
          window.URL.revokeObjectURL(fileURL);
          res({ data: new Uint8Array(xhr.response), qpdf });
        };
        xhr.send();
      });
    })
    .then(({ data, qpdf }) => {
      qpdf.FS.writeFile("input.pdf", data);
      qpdf.callMain([
        "--compress-streams=y",
        "--object-streams=generate",
        "--compression-level=9",
        "input.pdf",
        "output.pdf",
      ]);
      const removed = qpdf.FS.readFile("output.pdf");
      const blob = new Blob([removed], {
        type: "application/pdf",
      });
      return URL.createObjectURL(blob);
    });
};

export default initQPDF;
