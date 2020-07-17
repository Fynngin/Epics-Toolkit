import Start from "./pages/Start";
import VueRouter from "vue-router";
import Vue from "vue";

Vue.use(VueRouter)

export default new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Start
        }
    ]
})