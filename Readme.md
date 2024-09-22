# Ghostscript-pdf-compress.wasm

## Context

This project is a demo of another usage of the `gs.wasm` that [@ochachacha](https://github.com/ochachacha) compiled. It takes any PDF and compress it via ghostscript.

The applied command is:

```
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```

## WebWorker

The compression is now processed in a webworker so that the main thread doesn't become unresponsive and now there is virtually no limit to the size of the PDF that you can compress :tada:  

## Run the project

To run the project, simply do the following steps

```bash
git clone git@github.com:laurentmmeyer/ghostscript-pdf-compress.wasm.git
cd ghostscript-pdf-compress.wasm
yarn
yarn dev
```

## Demo

[https://laurentmmeyer.github.io/ghostscript-pdf-compress.wasm/](https://laurentmmeyer.github.io/ghostscript-pdf-compress.wasm/)

## Blog

I wrote a [post](https://meyer-laurent.com/playing-around-webassembly-and-ghostscript) about the process.
