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
import {faEdit, faUserPlus, faSave, faMagic, faAlignJustify, faEllipsisV, faCogs, faExchangeAlt, faLink, faTrashAlt,
  faPlusCircle, faCaretRight, faCaretDown, faRandom, faArrowUp, faArrowDown, faWindowClose, faChartLine, faTimesCircle,
  faHistory, faSearch, faArrowLeft, faArrowRight, faRedoAlt} from '@fortawesome/free-solid-svg-icons'
import VueFlags from '@growthbunker/vueflags';

library.add(faUserPlus, faEdit, faSave, faMagic, faAlignJustify, faEllipsisV, faCogs, faExchangeAlt, faLink, faTrashAlt,
    faPlusCircle, faCaretRight, faCaretDown, faRandom,faArrowUp, faArrowDown, faWindowClose, faChartLine, faTimesCircle,
    faHistory, faSearch, faArrowLeft, faArrowRight, faRedoAlt)

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.use(VueFlags, {
  iconPath: process.env.NODE_ENV === 'production'
      ? '/Epics-Toolkit/flags'
      : '/flags'
})
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  render: h => h(App), router, store,
}).$mount('#app')
