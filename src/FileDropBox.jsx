import React, {useCallback, useMemo, useState} from "react";
import {useDropzone} from "react-dropzone";
import {_GSPS2PDF} from "./lib/worker-init.js";

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
      const blob = new Blob([xhr.response], {type: "application/pdf"});
      const pdfURL = window.URL.createObjectURL(blob);
      const size = xhr.response.byteLength;
      resolve({pdfURL, size});
    };
    xhr.send();
  });
}

const minFilename = (filename) => filename.replace(".pdf", "-min.pdf");

function DropZone({onLimitReached, user}) {
  const [files, setFiles] = useState([]);
  const [converted, setConverted] = useState([]);
  const [state, setState] = useState("selection");

  const onDrop = useCallback(
    (acceptedFiles) => {
      const addedFiles = acceptedFiles.map((file) => {
        const url = window.URL.createObjectURL(file);
        return {name: file.name, size: file.size, url};
      });
      setFiles((files) => [...files, ...addedFiles]);
    },
    [files],
  );

  async function compressPDFs(files) {
    if (files[0]) {
      const {name, url, size} = files[0];
      const dataObject = {psDataURL: url};
      // _GSPS2PDF(
      //   dataObject,
      //   (element) => {
      //     console.log(element);
      //     console.log("_GSPS2PDF", "callback");
      //     // setState("toBeDownloaded");
      //     loadPDFData(element, name).then(({ pdfURL, size: newSize }) => {
      //       setConverted((converted) => [
      //         ...converted,
      //         {
      //           name,
      //           pdfURL,
      //           downloadName: minFilename(name),
      //           newSize,
      //           reduction: (size - newSize) / size,
      //         },
      //       ]);
      //       const newFiles = files.filter((e) => e.name !== name);
      //       setFiles((files) => newFiles);
      //       if (!newFiles.length) {
      //         setState("selection");
      //       }
      //       // recursive call with some time to draw the interface
      //       setTimeout(
      //         () => compressPDFs(files.filter((_, index) => index > 0)),
      //         600,
      //       );
      //     });
      //   },
      //   (...args) => console.log("Progress:", JSON.stringify(args)),
      //   (element) => console.log("Status Update:", JSON.stringify(element)),
      // );
      const element = await _GSPS2PDF(dataObject)
      const {pdfURL, size: newSize} = await loadPDFData(element, name)
      setConverted((converted) => [
        ...converted,
        {
          name,
          pdfURL,
          downloadName: minFilename(name),
          newSize,
          reduction: (size - newSize) / size,
        },
      ]);
      const newFiles = files.filter((e) => e.name !== name);
      setFiles((files) => newFiles);
      if (!newFiles.length) {
        setState("selection");
      }
      setTimeout(
        () => compressPDFs(files.filter((_, index) => index > 0)),
        600,
      );
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
      setState((_) => "converting");
      compressPDFs(files);
    } catch (e) {
      onLimitReached();
    }
  }

  const {getRootProps, getInputProps, isFocused, isDragAccept, isDragReject} =
    useDropzone({
      accept: {"application/pdf": []},
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
      <div className="container mb-5">
        <div {...getRootProps({style})}>
          <input {...getInputProps()} />
          <p className={"py-5 my-5"}>
            Drop your files here, or click to select files
          </p>
        </div>
      </div>
      {files.length > 0 && (
        <ul className="mt-4">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center font-dm rounded border-2 border-purple-900	pl-4 py-1 my-1"
            >
              <span className="font-dm">{file.name}</span> -{" "}
              {(file.size / 1048576).toFixed(2)} MB
              <button
                onClick={() =>
                  setFiles((files) => files.filter((e, i) => i !== index))
                }
                className="text-red-500 hover:text-red-700 ml-2 p-1"
              >
                <svg
                  className="w-5 h-5"
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
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <button
          className="w-full mt-5 font-dm text-purple-100 bg-purple-900 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition duration-500 ease-out"
          type="button"
          disabled={state === "converting"}
          onClick={launchCompression}
        >
          {state === "converting" ? "Loading..." : "Compress 🚀"}
        </button>
      )}
      {converted.length > 0 && (
        <>
          {converted.map((file, index) => (
            <a
              key={index}
              className="shrink-0 transform transition duration-500 ease-out scale-0 "
              style={{animation: `popIn ${index * 0.2 + 0.5}s forwards`}}
              download={file.downloadName}
              href={file.pdfURL}
            >
              <div
                className="flex flex-row items-center justify-between my-1 p-3 border-2 border-purple-900 hover:bg-white rounded-lg">
                <p className="text-sm text-center truncate font-dm ">
                  {file.name}
                </p>
                <div
                  className={"flex flex-row min-w-24 justify-end items-center"}
                >
                  <div className="text-xs font-dm mr-2">
                    <p>{(file.newSize / 1048576).toFixed(2)} MB</p>
                    <p>{(file.reduction * 100).toFixed(0)}% less</p>
                  </div>
                  <img className="max-h-6" src="./cloud.svg"/>
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
