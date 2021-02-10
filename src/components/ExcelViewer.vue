<template>
  <div>
    <h1>Excel Viewer</h1>
    <label>
      <a-upload
        name="file"
        :multiple="false"
        accept=".xls,.xlsx"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        @change="handleChange"
      >
        <a-button>
          <a-icon type="upload" />
          Click to Upload
        </a-button>
      </a-upload>
    </label>
    <div>
      {{ columns }}
      <a-table :columns="columns" :data-source="data">
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">

import { ALPHABET } from "../../utils/common";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "Height",
    dataIndex: "height",
    key: "height"
  },
  {
    title: "Weight",
    dataIndex: "weight",
    key: "weight"
  }
];

const data = [
  {
    key: "1",
    name: "John Brown",
    height: 32,
    weight: 60
  },
  {
    key: "2",
    name: "John Brown2",
    height: 432,
    weight: 360
  },
  {
    key: "3",
    name: "John Brown3",
    height: 132,
    weight: 60
  }
];

import { Component, Vue } from "vue-property-decorator";

import XLSX from "xlsx";

@Component({
  data: () => ({
    data
  })
})
export default class ExcelViewer extends Vue {
  private selectedFile: any;
  jsonData = [];
  fileList = [];
  columns = [];

  handleChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      this.$message.success(`${info.file.name} file uploaded successfully`);
      console.log("Done", info.file);
      this.convert(info.file.originFileObj)
        .then((data: any) => {
          this.jsonData = data;
        })
        .then(() => this.getColumnsTitle());
    } else if (info.file.status === "error") {
      this.$message.error(`${info.file.name} file upload failed.`);
    }
  }

  /*onUpload(event: any | null) {
    const file = event.target.files[0];
    console.log("file", file);
    if (file) {
      this.convert(file)
        .then((data: any) => {
          this.jsonData = data;
        })
        .then(() => this.getColumnsTitle());
    }
  }*/

  // Генерируем ключ для колонки
  generateDataIndex() {
    return;
  }

  // Получаем заголовки
  getColumnsTitle() {
    const raw = this.jsonData[0];
    console.log(raw);
    let index = 0;
    for (const key in raw) {
      const obj = {
        title: key,
        dataIndex: "column" + (ALPHABET.split("")[index]).toUpperCase(),
        key: "column" + (ALPHABET.split("")[index]).toUpperCase()
      };
      this.columns.push(obj);
      index++;
    }
  }

  // Достаём данные из файла
  convert(selectedFile: any) {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      let result = undefined;
      fileReader.onload = (e: any) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        workbook.SheetNames.forEach((sheet: any) => {
          //const jsonObject = JSON.stringify(rowObject);
          result = XLSX.utils.sheet_to_row_object_array(
            workbook.Sheets[sheet]
          );
          resolve(result);
        });
      };
      fileReader.readAsBinaryString(selectedFile);
    });
  }
}
</script>

<style scoped lang="scss">
</style>
