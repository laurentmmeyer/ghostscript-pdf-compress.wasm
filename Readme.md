# Ghostscript-pdf-compress.wasm

## Context
This project is a demo of another usage of the `gs.wasm` that [@ochachacha](https://github.com/ochachacha) compiled. It takes any PDF and compress it via ghostscript.

The applied command is:

```
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```

## Run the project

To run the project, simply do the following steps

```bash
git clone git@github.com:laurentmmeyer/ghostscript-pdf-compress.wasm.git
cd ghostscript-pdf-compress.wasm
yarn
yarn dev
```

## Demo
