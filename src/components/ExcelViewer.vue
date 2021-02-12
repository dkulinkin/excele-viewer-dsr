<template>
  <div class="container">
    <a-row>
      <h1>Excel Viewer {{ counter }}</h1>
      <div>
        <img src="@/assets/VkTV.gif" width="200" height="150" alt="chu" />
      </div>
      <div>
      </div>
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
        <a-input v-model="filterStr" placeholder="Filter" @change="changeFilter" />
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
          :loading="loading"
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
  disabled = false;
  loading = false;
  loaded = false;

  counter = 0;
  filterStr = "";

  equality(str) {
    if (str.includes("=")) {
      const columnName = this.filterStr.split("=")[0];
      const value = this.filterStr.split("=")[1];
      console.log("Param", columnName, value);
      const data = this.dataTable.filter(item => {
        console.log("Item", item[columnName] == value);
        return item[columnName] == value;
      });
      console.log("I`m Finder!", data);
    }
  }

  changeFilter() {
    if (this.filterStr) {
      const str = this.filterStr.split("");
      this.equality(str);
    }
  };


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
    this.loading = true;
    if (info.file.status === "done") {
      this.$message.success(`${info.file.name} file uploaded successfully`);
      this.jsonData = await this.convert(info.file.originFileObj);
      this.dataTable = await this.getData(this.jsonData);
      this.loaded = true;
    } else if (info.file.status === "error") {
      this.$message.error(`${info.file.name} file upload failed.`);
    }
    this.loading = false;
    this.disabled = true;
  }

  getData(data) {
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
