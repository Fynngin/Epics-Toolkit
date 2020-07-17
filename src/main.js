import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import VueRouter from "vue-router";
import BootstrapVue from "bootstrap-vue";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(BootstrapVue)

new Vue({
  render: h => h(App), router, store,
}).$mount('#app')
