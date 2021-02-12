import XLSX from "xlsx";

onmessage = function(e) {
  const fileReader = new FileReader();
  let result = undefined;
  fileReader.onload = e => {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: "binary" });
    workbook.SheetNames.forEach(sheet => {
      result = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
    });
  };
  fileReader.readAsBinaryString(e.data[0]);
  postMessage(result);
};
