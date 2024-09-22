import {useState} from "react";
import "./App.css";
import {_GSPS2PDF} from "./lib/worker-init.js";


function loadPDFData(response, filename) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", response);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      window.URL.revokeObjectURL(response);
      const blob = new Blob([xhr.response], {type: "application/pdf"});
      const pdfURL = window.URL.createObjectURL(blob);
      const size = xhr.response.byteLength;
      resolve({pdfURL, size});
    };
    xhr.send();
  });
}

function App() {
  const [state, setState] = useState("init");
  const [file, setFile] = useState(undefined);
  const [downloadLink, setDownloadLink] = useState(undefined);

  async function compressPDF(pdf, filename) {
    const dataObject = {psDataURL: pdf};
    const element = await _GSPS2PDF(dataObject)
    const {pdfURL, size: newSize} = await loadPDFData(element, filename)
    setDownloadLink(pdfURL);
    setState("toBeDownloaded");
  }

  const changeHandler = (event) => {
    const file = event.target.files[0];
    const url = window.URL.createObjectURL(file);
    setFile({filename: file.name, url});
    setState("selected");
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const {filename, url} = file;
    compressPDF(url, filename);
    setState("loading");
    return false;
  };

  let minFileName =
    file && file.filename && file.filename.replace(".pdf", "-min.pdf");
  return (
    <>
      <h1>Free Browser side PDF-Compressor</h1>
      <p>
        The best tool I know to compress PDF is{" "}
        <a target={"_blank"} href={"https://ghostscript.com/"}>
          Ghostscript
        </a>{" "}
        but this was not running in the browser. Until{" "}
        <a target={"_blank"} href={"https://github.com/ochachacha/ps-wasm"}>
          Ochachacha
        </a>{" "}
        ported the lib in{" "}
        <a target={"_blank"} href={"https://webassembly.org/"}>
          Webassembly
        </a>
        .
      </p>
      <p>
        Based on his amazing work, I built this{" "}
        <a
          href={
            "https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm"
          }
          target={"_blank"}
        >
          demo
        </a>
        . It's running on Vite and React. It imports the WASM on the fly when
        you want compress a PDF.
      </p>
      <p>
        Be aware that the Webassembly binary is weighting <b>10MB</b>.
      </p>
      <p>
        <i>
          Secure and private by design: the data never leaves your computer.
        </i>
      </p>
      {state !== "loading" && state !== "toBeDownloaded" && (
        <form onSubmit={onSubmit}>
          <input
            type="file"
            accept={"application/pdf"}
            name="file"
            onChange={changeHandler}
            id={"file"}
          />
          <div className={"label padded-button"}>
            <label htmlFor={"file"}>
              {!file || !file.filename
                ? `Choose PDF to compress`
                : file.filename}
            </label>
          </div>
          {state === "selected" && (
            <div className={"success-button padded-button padding-top"}>
              <input
                className={"button"}
                type="submit"
                value={"🚀 Compress this PDF in the browser! 🚀"}
              />
            </div>
          )}
        </form>
      )}
      {state === "loading" && "Loading...."}
      {state === "toBeDownloaded" && (
        <>
          <div className={"success-button padded-button"}>
            <a href={downloadLink} download={minFileName}>
              {`📄 Download ${minFileName} 📄`}
            </a>
          </div>
          <div className={"blue padded-button padding-top"}>
            <a href={"./"}>{`🔁 Compress another PDF 🔁`}</a>
          </div>
        </>
      )}
      <p>
        Everything is open-source and you can contribute{" "}
        <a
          href={
            "https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm"
          }
          target={"_blank"}
        >
          here
        </a>
        .
      </p>
      <br/>
      <p>
        <i>This website uses no tracking, no cookies, no adtech.</i>
      </p>
      <p>
        <a target={"_blank"} href={"https://meyer-laurent.com"}>
          About me
        </a>
      </p>
    </>
  );
}

export default App;
