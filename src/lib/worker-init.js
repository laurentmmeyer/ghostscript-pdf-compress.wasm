export async function _GSPS2PDF(dataStruct) {
  const worker = new Worker(
    new URL('./background-worker.js', import.meta.url),
    {type: 'module'}
  );
  worker.postMessage({ data: dataStruct, target: 'wasm'});
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      setTimeout(() => worker.terminate(), 0);
    };
    const onMessage = (e) => {
      if (e.data && e.data.error) {
        cleanup();
        reject(new Error(e.data.error));
      } else {
        cleanup();
        resolve(e.data);
      }
    };
    const onError = (e) => {
      cleanup();
      reject(new Error(e.message || "Worker error"));
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
  });
}



