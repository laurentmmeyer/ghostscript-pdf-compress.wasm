import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { _GSPS2PDF } from "./lib/worker-init.js";
import LoadingButton from "./LoadingButton.jsx";
import initQPDF from "./lib/qpdf-init.js";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#ffffff",
  color: "#bdbdbd",
  cursor: "pointer",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2d0896ff",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

function loadPDFData(response, filename) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", response);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      window.URL.revokeObjectURL(response);
      const blob = new Blob([xhr.response], { type: "application/pdf" });
      const pdfURL = window.URL.createObjectURL(blob);
      const size = xhr.response.byteLength;
      resolve({ pdfURL, size });
    };
    xhr.send();
  });
}

const minFilename = (filename) => filename.replace(".pdf", "-min.pdf");

function DropZone({ onLimitReached, user }) {
  const [files, setFiles] = useState([]);
  const [converted, setConverted] = useState([]);
  const [state, setState] = useState("selection");

  const onDrop = useCallback(
    (acceptedFiles) => {
      const addedFiles = acceptedFiles.map((file) => {
        const url = window.URL.createObjectURL(file);
        const url2 = window.URL.createObjectURL(file);
        return { name: file.name, size: file.size, url, url2 };
      });
      setFiles((files) => [...files, ...addedFiles]);
    },
    [files],
  );

  async function compressPDFs(files) {
    if (files[0]) {
      const { name, url, size, url2 } = files[0];
      const dataObject = { psDataURL: url };
      const { blob: element, cleanup } = await _GSPS2PDF(dataObject);
      const { pdfURL, size: newSize } = await loadPDFData(element, name);
      let finalUrl = pdfURL;
      let finalSize = newSize;
      if (finalSize >= size) {
        const qPDFURL = await initQPDF(url2);
        const { pdfURL, size: newSize } = await loadPDFData(qPDFURL, name);
        finalUrl = pdfURL;
        finalSize = newSize;
      }
      setConverted((converted) => [
        ...converted,
        {
          name,
          pdfURL: finalUrl,
          downloadName: minFilename(name),
          newSize: finalSize,
          reduction: (size - finalSize) / size,
        },
      ]);
      const newFiles = files.filter((e) => e.name !== name);
      setFiles((files) => newFiles);
      if (!newFiles.length) {
        setState("selection");
      }
      setTimeout(() => {
        cleanup();
        compressPDFs(files.filter((_, index) => index > 0));
      }, 600);
    }
  }

  async function launchCompression() {
    try {
      if (!user?.firestoreUser?.mode) {
        await fetch("https://ip-limit.laurent-2b0.workers.dev/", {
          method: "PUT",
          body: files.length,
        }).then((e) => {
          if (!e.ok) {
            throw new Error("Nope");
          }
        });
      }
      if (window.gtag) {
        window.gtag("event", "conversion", { files_count: files.length });
      }
      setState((_) => "converting");
      compressPDFs(files);
    } catch (e) {
      onLimitReached();
    }
  }

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: { "application/pdf": [] },
      onDrop,
      disabled: state === "converting",
    });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );
  return (
    <>
      <div className="container app-mb-5">
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p className={"app-py-5 app-my-5"}>
            Drop your files here, or click to select files
          </p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="app-mt-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="app-flex app-items-center font-dm app-rounded app-border-2 app-border-purple-900	app-pl-4 app-py-1 app-my-1"
            >
              <span className="font-dm">{file.name}</span> -{" "}
              {(file.size / 1048576).toFixed(2)} MB
              <button
                onClick={() =>
                  setFiles((files) => files.filter((e, i) => i !== index))
                }
                className="app-text-red-500 hover:app-text-red-700 app-ml-2 app-p-1"
              >
                <svg
                  className="app-w-5 app-h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <button
          className="app-w-full app-my-5 font-dm app-text-purple-100 app-bg-purple-900 app-text-white app-py-2 app-px-4 app-rounded focus:app-outline-none focus:app-shadow-outline app-transform app-transition app-duration-500 app-ease-out"
          type="button"
          disabled={state === "converting"}
          onClick={launchCompression}
        >
          {state === "converting" ? <LoadingButton /> : "Compress 🚀"}
        </button>
      )}
      {converted.length > 0 && (
        <>
          {converted.map((file, index) => (
            <a
              key={index}
              className="shrink-0 app-transform app-transition app-duration-500 app-ease-out app-scale-0 "
              style={{ animation: `popIn ${index * 0.2 + 0.5}s forwards` }}
              download={file.downloadName}
              href={file.pdfURL}
            >
              <div className="app-flex app-flex-row app-items-center app-justify-between app-my-1 app-p-3 app-border-2 app-border-purple-900 hover:app-bg-white app-rounded-lg">
                <div className="app-text-sm app-text-center app-truncate font-dm ">
                  {file.name}
                </div>
                <div
                  className={
                    "app-flex app-flex-row app-min-w-24 app-justify-end app-items-center"
                  }
                >
                  <div className="app-text-xs font-dm app-mr-2">
                    <div>{(file.newSize / 1048576).toFixed(2)} MB</div>
                    <div>{(file.reduction * 100).toFixed(0)}% less</div>
                  </div>
                  <img className="app-max-h-6 !m-0" src="./cloud.svg" />
                </div>
              </div>
            </a>
          ))}
        </>
      )}
    </>
  );
}

export default DropZone;
