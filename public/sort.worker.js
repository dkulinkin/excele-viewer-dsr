onmessage = function({ data }) {
  const workerResult = () => {
    if (String(data[0]) > String(data[1])) return 1;
    else if (String(data[0]) < String(data[1])) return -1;
    else return 0;
  };
  postMessage(workerResult);
};
