function r(){import("./gs-worker.203e499b.js")}var t;function u(e,n){var o=new XMLHttpRequest;o.open("GET",e.psDataURL),o.responseType="arraybuffer",o.onload=function(){console.log("onload"),self.URL.revokeObjectURL(e.psDataURL),t={preRun:[function(){self.Module.FS.writeFile("input.pdf",new Uint8Array(o.response))}],postRun:[function(){var l=self.Module.FS.readFile("output.pdf",{encoding:"binary"}),s=new Blob([l],{type:"application/octet-stream"}),a=self.URL.createObjectURL(s);n({pdfDataURL:a,url:e.url})}],arguments:["-sDEVICE=pdfwrite","-dCompatibilityLevel=1.4","-dPDFSETTINGS=/ebook","-DNOPAUSE","-dQUIET","-dBATCH","-sOutputFile=output.pdf","input.pdf"],print:function(l){},printErr:function(l){},totalDependencies:0,noExitRuntime:1},self.Module?(self.Module.calledRun=!1,self.Module.postRun=t.postRun,self.Module.preRun=t.preRun,self.Module.callMain()):(self.Module=t,r())},o.send()}self.addEventListener("message",function({data:e}){console.log("message",e),e.target==="wasm"&&(console.log("Message received from main script",e.data),u(e.data,({pdfDataURL:n})=>self.postMessage(n)))});console.log("Worker ready");