self.onmessage = ({ data }) => {
  console.log('SRC')
  const order = data[0];
  const columnKey = data[1];
  const dataTable = data[2];
  const initData = data[3];

  let result = [];
  const prevData = initData;
  if (order === "ascend") {
    result = dataTable.sort((a, b) => String(a[columnKey]) > String(b[columnKey]) ? 1 : -1);
  } else {
    result = dataTable.sort((a, b) => String(a[columnKey]) > String(b[columnKey]) ? 1 : -1).reverse();
  }
  if (order === "base") {
    result = prevData;
  }
  postMessage(result);
};
