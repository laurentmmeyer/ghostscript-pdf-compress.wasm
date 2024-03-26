import React, {useCallback, useMemo, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {_GSPS2PDF} from "./lib/background.js";

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#ffffff',
  color: '#bdbdbd',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle = {
  borderColor: '#2d0896ff'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

function loadPDFData(response, filename) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", response.pdfDataURL);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      window.URL.revokeObjectURL(response.pdfDataURL);
      const blob = new Blob([xhr.response], {type: "application/pdf"});
      const pdfURL = window.URL.createObjectURL(blob);
      const size = xhr.response.byteLength;
      resolve({pdfURL, size});
    };
    xhr.send();
  });
}

const minFilename = (filename) => filename.replace(".pdf", "-min.pdf");

function DropZone() {

  const [files, setFiles] = useState([]);
  const [converted, setConverted] = useState([]);
  const [state, setState] = useState("selection")

  const onDrop = useCallback((acceptedFiles) => {
    const addedFiles = acceptedFiles.map((file) => {
      const url = window.URL.createObjectURL(file);
      return {name: file.name, size: file.size, url}
    })
    setFiles(files => [...files, ...addedFiles])

  }, [files])

  function compressPDFs(files) {
    if (files[0]) {
      const {name, url, size} = files[0];
      console.log("Converting", name, "...")
      const dataObject = {psDataURL: url};
      _GSPS2PDF(
        dataObject,
        (element) => {
          console.log(element);
          console.log("_GSPS2PDF", "callback");
          // setState("toBeDownloaded");
          loadPDFData(element, name).then(({pdfURL, size: newSize}) => {
            setConverted(converted => [...converted, {
              name, pdfURL,
              downloadName: minFilename(name),
              newSize,
              reduction: (size - newSize) / size
            }])
            const newFiles = files.filter((e) => e.name !== name)
            setFiles(files => newFiles);
            if (!newFiles.length) {
              setState("selection");
            }
            // recursive call
            compressPDFs(files.filter((_, index) => index > 0));
          });
        },
        (...args) => console.log("Progress:", JSON.stringify(args)),
        (element) => console.log("Status Update:", JSON.stringify(element)),
      );
    }
  }

  function launchCompression() {
    setState("converting")
    compressPDFs(files)
  }


  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({accept: {'application/pdf': []}, onDrop, disabled: state === 'converting'});

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);
  return (
    <>
      <div className="container">
        <div {...getRootProps({style})}>
          <input {...getInputProps()} />
          <p className={"py-5 my-5"}>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </div>
      {files.length > 0 &&
        <ul className="mt-4">
          {files.map((file, index) => (
            <li key={index}>
              <span className="font-dm">{file.name}</span> - {(file.size / 1048576).toFixed(2)} MB
            </li>
          ))}
        </ul>
      }
      {files.length > 0 && <button
        className="w-full mt-5 font-dm text-purple-100 bg-purple-900 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition duration-500 ease-out"
        type="button"
        disabled={state === "converting"}
        onClick={launchCompression}>
        {state === "converting" ?
          "Loading...": "Compress 🚀"}
      </button>}
      {converted.length > 0 &&
        <div className="grid grid-cols-3 gap-4 mt-5">
          {converted.map((file, index) => (
            <a key={index} className="shrink-0 transform transition duration-500 ease-out scale-0 "
               style={{animation: `popIn ${index * 0.2 + 0.5}s forwards`}} download={file.downloadName}
               href={file.pdfURL}>
              <div
                className="flex flex-col items-center justify-center p-3 border-2 border-purple-900 hover:bg-white rounded-lg">
                <p className="text-sm w-full text-center truncate font-dm text-purple-900 mb-2">{file.name}</p>
                <img className="max-h-10" src="./cloud.svg"/>
                <p className="text-xs font-dm text-purple-900 mt-2">{(file.newSize / 1048576).toFixed(2)} MB
                  - {(file.reduction * 100).toFixed(0)}% less</p>
              </div>
            </a>
          ))}
        </div>
      }
    </>
  );
}

export default DropZone;
