function getHeaderFromHeaders(headers, headerName) {
    for (var i = 0; i < headers.length; ++i) {
        var header = headers[i];
        if (header.name.toLowerCase() === headerName) {
            return header;
        }
    }
}

function loadScript(url, onLoadCallback) {
    // // Adding the script tag to the head as suggested before
    // var head = document.head;
    // var script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.src = url;
    //
    // // Then bind the event to the callback function.
    // // There are several events for cross browser compatibility.
    // //script.onreadystatechange = callback;
    // script.onload = onLoadCallback;
    //
    // // Fire the loading
    // head.appendChild(script);
    import("./gs.js")
}

// function getRedirectURL(url) {
//     return chrome.runtime.getURL('viewer.html') + "?url=" + url;
// }
//
// chrome.webRequest.onHeadersReceived.addListener(function (details) {
//         var mime_type = getHeaderFromHeaders(details.responseHeaders, 'content-type');
//         if (mime_type.value == 'application/pdf') {
//             // places like arXiv don't have .ps filenames in their URLs,
//             // so we need to check MIME type for requests as well.
//             return {
//                 redirectUrl: getRedirectURL(details.url)
//             }
//         }
//     },
//     {urls: ["<all_urls>"], types: ["main_frame"]},
//     ["blocking", "responseHeaders"]
// );
//
// chrome.webRequest.onBeforeRequest.addListener(function (info) {
//         var urlObject = new URL(info.url);
//         if (
//             (urlObject.pathname.endsWith('.pdf'))
//             &&
//             (info.initiator == null || info.initiator.indexOf(chrome.runtime.id) == -1) // not ourselves
//         ) {
//             return {
//                 redirectUrl: getRedirectURL(info.url)
//             };
//         }
//     },
//     {urls: ["<all_urls>"], types: ["main_frame"]},
//     ["blocking"]
// );

let Module;

export function _GSPS2PDF(dataStruct, responseCallback, progressCallback, statusUpdateCallback) {
    // first download the ps data
    var xhr = new XMLHttpRequest();
    xhr.open("GET", dataStruct.psDataURL);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
        // release the URL
        window.URL.revokeObjectURL(dataStruct.psDataURL);
        //set up EMScripten environment
        Module = {
            preRun: [function () {
                const FS = window.FS;
                var data = FS.writeFile('input.pdf', new Uint8Array(xhr.response));
            }],
            postRun: [function () {
                const FS = window.FS;
                var uarray = FS.readFile('output.pdf', {encoding: 'binary'}); //Uint8Array
                var blob = new Blob([uarray], {type: "application/octet-stream"});
                var pdfDataURL = window.URL.createObjectURL(blob);
                responseCallback({pdfDataURL: pdfDataURL, url: dataStruct.url});
            }],
            arguments: ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-dPDFSETTINGS=/ebook', '-DNOPAUSE', '-dQUIET', '-dBATCH',
                '-sOutputFile=output.pdf', 'input.pdf'],
            print: function (text) {
                statusUpdateCallback(text);
            },
            printErr: function (text) {
                statusUpdateCallback('Error: ' + text);
                console.error(text);
            },
            setStatus: function (text) {
                if (!Module.setStatus.last) Module.setStatus.last = {time: Date.now(), text: ''};
                if (text === Module.setStatus.last.text) return;
                var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
                var now = Date.now();
                if (m && now - Module.setStatus.last.time < 30) // if this is a progress update, skip it if too soon
                    return;
                Module.setStatus.last.time = now;
                Module.setStatus.last.text = text;
                if (m) {
                    text = m[1];
                    progressCallback(false, parseInt(m[2]) * 100, parseInt(m[4]) * 100);
                } else {
                    progressCallback(true, 0, 0);
                }
                statusUpdateCallback(text);
            },
            totalDependencies: 0
        };
        Module.setStatus('Loading Ghostscript...');
        window.Module = Module;
        loadScript('gs.js', null);
    };
    xhr.send();
}

// chrome.runtime.onConnect.addListener(function (port) {
//     if (port.name == 'ps2pdfport') {
//         port.onMessage.addListener(function (msg) {
//             if (msg.requestType == 'ps2pdf') {
//                 requestData = msg.requestData;
//                 _GSPS2PDF(requestData, function (replyData) {
//                         port.postMessage({msgType: 'result', data: replyData});
//                     },
//                     function (is_done, value, max_val) {
//                         port.postMessage({
//                             msgType: 'convprog', isDone: is_done, value: value, maxVal: max_val
//                         });
//                     }, function (status) {
//                         port.postMessage({
//                             msgType: 'status', status: status
//                         });
//                     });
//                 return true;
//             }
//         });
//     }
// });
