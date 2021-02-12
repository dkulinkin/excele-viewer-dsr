onmessage = function(e) {
  console.log('Sort Worker')
  const workerResult = Array([String(e.data[0]), String(e.data[1])]);
  postMessage(workerResult);
};
