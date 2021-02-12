<template>
  <div class="container">
    <a-row>
      <h1 @click="equality3()">Excel Viewer</h1>
      <div>
        <img src="@/assets/VkTV.gif" width="200" height="150" alt="chu" />
      </div>
      <div></div>
    </a-row>
    <a-row>
      <a-upload
        ref="uploadFile"
        name="file"
        :multiple="false"
        :beforeUpload="reset"
        accept=".xlx, .xlsx"
        maxCount="{1}"
        action="https://run.mocky.io/v3/8e6f45c6-60da-4dea-9908-0c26e51a7dad"
        @change="handleChange"
        class="upload-component"
      >
        <a-button>
          <a-icon type="upload" />
          Click to Upload
        </a-button>
      </a-upload>
    </a-row>
    <a-row>
      <a-col span="24">
        <a-input
          v-model="filterStr"
          placeholder="Filter"
          @change="changeFilter"
        />
      </a-col>
    </a-row>
    <a-row>
      {{ dataTable }}
      <a-col span="24">
        <a-table
          v-if="loaded"
          :columns="getColumns"
          :data-source="dataTable"
          bordered
          :loading="!loaded"
          :pagination="false"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import XLSX from "xlsx";

@Component({})
export default class ExcelViewer extends Vue {
  jsonData: any = [];
  fileList = [];
  columns = [];
  dataTable = [];
  data = [];
  loaded = false;

  filterStr = "";

  equality3() {
    const params = new Map();
    // params.set("x", { value: "25", key: "A" });
    // params.set("y", { value: "11", key: "B" });
    // params.set("operator", "OR");

    // params.set("x", { value: "25", key: "A" });
    // params.set("y", { value: "11", key: "B" });
    // params.set("operator", "OR");

    // params.set("x", "A");
    // params.set("y", "25");
    // params.set("operator", "=");

    // params.set("x", "A");
    // params.set("y", "1");
    // params.set("operator", "LIKE");
    //
    // this.equality2(params);
  }

  // равенство
  equality2(params) {
    const x = params.get("x");
    const y = params.get("y");
    const operator = params.get("operator");

    switch (operator) {
      case "AND":
        console.log(
          this.data.filter(
            item => item[x["key"]] == x["value"] && item[y["key"]] == y["value"]
          )
        );
        break;
      case "OR":
        console.log(
          this.data.filter(
            item => item[x["key"]] == x["value"] || item[y["key"]] == y["value"]
          )
        );
        break;
      case "LIKE":
        console.log(this.data.filter(item => item[x].toString().startsWith(y)));
        break;
      case "=":
        console.log(this.data.filter(item => item[x] == y));
        break;
    }
  }

  // равенство
  equality(str) {
    if (str.includes("=")) {
      const columnName = str.split("=")[0];
      const value = str.split("=")[1];
      return this.data.filter(item => item[columnName] == value);
    }
  }

  // Строка фильтра
  changeFilter() {
    if (this.filterStr) {
      const str = this.filterStr.split("");
      this.dataTable = this.equality(str);
    } else {
      this.dataTable = this.data;
    }
  }

  sortWithWorker(a: any, b: any, key: string) {
    const worker = new Worker("sort.worker.js");
    const res = this.workerTask(worker, a, b, key);
    worker.terminate();
    return res;
  }

  workerTask(worker: Worker, a: any, b: any, key: string) {
    let result = -1;
    worker.onmessage = ({ data }) => {
      result = data;
    };
    worker.postMessage([a[key], b[key]]);
    return result;
  }

  reset() {
    this.jsonData = [];
    this.fileList = [];
    this.columns = [];
  }

  async handleChange(info) {
    if (info.file.status === "done") {
      this.jsonData = await this.convert(info.file.originFileObj);
      this.data = await this.dataFormatting(this.jsonData);
      this.dataTable = this.data;
      this.loaded = true;
    } else {
      if (info.file.status === "error") {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    }
  }

  // Подгоняем под данные таблицы
  dataFormatting(data) {
    const res = data.map((item, index) => {
      return {
        key: index,
        ...item
      };
    });
    return res;
  }

  get getColumns() {
    return this.getColumnsList() || [];
  }

  // Получаем заголовки
  getColumnsList() {
    const raw = this.jsonData[0];
    const tmp = [];

    let index = 0;
    for (const key in raw) {
      tmp.push({
        title: key,
        key: key.toString(),
        dataIndex: key,
        sorter: (a, b) => {
          return this.sortWithWorker(a, b, key);
        },
        //sorter: (a, b) => String(a[key]) > String(b[key]),
        ellipsis: true
      });
      index++;
    }
    this.columns = tmp;
    return tmp;
  }

  // Достаём данные из файла
  convert(selectedFile: any) {
    return new Promise(resolve => {
      const fileReader = new FileReader();
      let result = undefined;
      fileReader.onload = (e: any) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        workbook.SheetNames.forEach((sheet: any) => {
          //const jsonObject = JSON.stringify(rowObject);
          result = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
          resolve(result);
        });
      };
      fileReader.readAsBinaryString(selectedFile);
    });
  }
}
</script>

<style scoped lang="scss">
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 25px 0;
}

.upload-component {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}
</style>
