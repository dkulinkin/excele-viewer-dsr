import Vue from "vue";
import { Button, Table, message, Upload, Icon } from "ant-design-vue";
import Ant from "ant-design-vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import XLSX from "xlsx";

import "ant-design-vue/dist/antd.css";


Vue.use(Button);
Vue.use(Table);
Vue.use(Upload);
Vue.use(Icon);


Vue.use(Ant);

Vue.use(XLSX);


Vue.prototype.$message = message;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
