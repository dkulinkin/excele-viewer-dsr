<template>
  <div class="container">
    <a-row>
      <h1>Excel Viewer</h1>
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
          v-if="loaded"
        />
      </a-col>
    </a-row>
    <a-row>
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
  columns = [];
  dataTable: any = [];
  data = [];
  loaded = false;
  filterStr = "";

  reset() {
    this.jsonData = [];
    this.columns = [];
    this.dataTable = [];
    this.filterStr = "";
    this.loaded = false;
  }

  // Фильтруем данные
  filterTableData(params) {
    const x = params.get("x");
    const y = params.get("y");
    const operator = params.get("operator");

    let result = undefined;

    switch (operator) {
      case "AND":
        result = this.data.filter(
          (item) => item[x["key"]] == x["value"] && item[y["key"]] == y["value"]
        );
        break;
      case "OR":
        result = this.data.filter(
          (item) => item[x["key"]] == x["value"] || item[y["key"]] == y["value"]
        );
        break;
      case "LIKE":
        result = this.data.filter((item) => item[x].toString().startsWith(y));
        break;
      case "=":
        result = this.data.filter((item) => item[x] == y);
        break;
    }
    return result;
  }

  // Строка фильтра
  changeFilter() {
    const params = new Map();
    if (this.filterStr) {
      if (this.filterStr.includes("=")) {
        const x = this.filterStr.split("=")[0].trim();
        const y = this.filterStr.split("=")[1].trim();
        if (x && y) {
          params.set("x", x.toString());
          params.set("y", y.toString());
          params.set("operator", "=");

          this.dataTable = this.filterTableData(params);
        }
      }
      if (this.filterStr.includes("LIKE")) {
        const x = this.filterStr.split("LIKE")[0].trim();
        const y = this.filterStr.split("LIKE")[1].trim().replace(/"/g, "");
        if (x && y) {
          params.set("x", x.toString());
          params.set("y", y.toString());
          params.set("operator", "LIKE");
          this.dataTable = this.filterTableData(params);
        }
      }
      if (this.filterStr.includes("AND")) {
        this.operatorANDWithOR(params, "AND");
      }

      if (this.filterStr.includes("OR")) {
        this.operatorANDWithOR(params, "OR");
      }
    } else {
      this.dataTable = this.data;
    }
  }

  // AND, OR
  operatorANDWithOR(params, operator) {
    if (this.filterStr.includes(operator)) {
      const x = this.filterStr.split(operator)[0].trim();
      const y = this.filterStr.split(operator)[1].trim();

      if (x && y) {
        if (x.includes("=") && y.includes("=")) {
          params.set("x", {
            key: this.split(x, "=").left,
            value: this.split(x, "=").right
          });
          params.set("y", {
            key: this.split(y, "=").left,
            value: this.split(y, "=").right
          });
          params.set("operator", operator);
        }
      }
      this.dataTable = this.filterTableData(params);
    }
  }

  split(str: string, separator: string) {
    return {
      left: str.length > 0 ? str.split(separator)[0].toString() : "",
      right: str.length > 0 ? str.split(separator)[1].toString() : ""
    };
  }

  sortWithWorker(a: any, b: any, key: string) {
    const worker = new Worker("sort.worker.js");
    let result = -1;
    worker.onmessage = ({ data }) => {
      result = data;
    };
    worker.postMessage([a[key], b[key]]);
    worker.terminate();
    return result;
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

  // Форматируем данные для таблицы
  dataFormatting(data) {
    return data.map((item, index) => {
      return {
        key: index,
        ...item
      };
    });
  }

  get getColumns() {
    return this.getColumnsList() || [];
  }

  // Работаем с колонками
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
        ellipsis: true
      });
      index++;
    }
    this.columns = tmp;
    return tmp;
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
