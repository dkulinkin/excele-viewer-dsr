<template>
  <div class="home">
    <ExcelViewer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ExcelViewer from "@/components/ExcelViewer.vue"; // @ is an alias to /src

@Component({
  components: {
    ExcelViewer
  }
})
export default class Home extends Vue {
}
</script>
