self.onmessage = ({ data }) => {
  const result = self.filterTableData(data[0], data[1]);
  postMessage(result);
  //self.close();
};

function filterTableData(params, data) {
  const x = params.get("x");
  const y = params.get("y");
  const operator = params.get("operator");

  let result = undefined;

  switch (operator) {
    case "AND":
      result = data.filter(
        (item) => item[x["key"]] == x["value"] && item[y["key"]] == y["value"]
      );
      break;
    case "OR":
      result = data.filter(
        (item) => item[x["key"]] == x["value"] || item[y["key"]] == y["value"]
      );
      break;
    case "LIKE":
      result = data.filter((item) => item[x].toString().startsWith(y));
      break;
    case "=":
      result = data.filter((item) => item[x] == y);
      break;
  }
  return result;
}
