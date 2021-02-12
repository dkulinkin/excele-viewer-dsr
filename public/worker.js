onmessage = function(e) {
  console.log("Inner");
  const arr = [];
  for (let i = 0; i < 1e1000; i++) {
    const rand = e.data[0] + Math.random() * (e.data[1] + 1 - e.data[0]);
    arr.push(Math.floor(rand));
  }
  postMessage(arr);
  self.close();
};
