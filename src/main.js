import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import VueRouter from "vue-router";
import BootstrapVue from "bootstrap-vue";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {faEdit, faUserPlus, faSave, faMagic, faAlignJustify, faEllipsisV, faCogs, faExchangeAlt, faLink, faTrashAlt, faPlusCircle, faCaretRight, faCaretDown, faRandom, faArrowUp, faArrowDown, faWindowClose} from '@fortawesome/free-solid-svg-icons'

library.add(faUserPlus, faEdit, faSave, faMagic, faAlignJustify, faEllipsisV, faCogs, faExchangeAlt, faLink, faTrashAlt, faPlusCircle, faCaretRight, faCaretDown, faRandom,faArrowUp, faArrowDown, faWindowClose)

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  render: h => h(App), router, store,
}).$mount('#app')
