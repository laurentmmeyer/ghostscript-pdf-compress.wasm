export async function _GSPS2PDF(
  dataStruct,
) {
  const worker = new Worker(
    new URL("./background-worker.js", import.meta.url),
    { type: "module" },
  );
  worker.postMessage({ data: dataStruct, target: "wasm" });
  return new Promise((resolve, reject) => {
    const listener = (e) => {
      resolve({
        blob: e.data,
        cleanup: () => {
          worker.removeEventListener("message", listener);
          setTimeout(() => worker.terminate(), 0);
        },
      });
    };
    worker.addEventListener("message", listener);
  });
}
