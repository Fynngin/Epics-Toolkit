import Start from "./pages/Start";
import Home from "./pages/Home";
import VueRouter from "vue-router";
import Vue from "vue";
import store from "./store";
import MassList from "./pages/MassList";
import MintSearch from "./pages/MintSearch";
import TeamBuilder from "@/pages/TeamBuilder";

Vue.use(VueRouter)

const router = new VueRouter({
    // mode: 'history',
    routes: [
        {
            path: '/login',
            component: Start
        },
        {
            path: '/',
            component: Home,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/masslist',
            component: MassList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/mintsearch',
            component: MintSearch,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/teambuilder',
            component: TeamBuilder,
            meta: {
                requiresAuth: true
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (store.getters.isAuthenticated) {
            next()
            return
        }
        next('/login')
    } else {
        next()
    }
})

export default router