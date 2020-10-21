import Start from "./pages/Start";
import Home from "./pages/Home";
import VueRouter from "vue-router";
import Vue from "vue";
import store from "./store";
import MassList from "./pages/MassList";
import MintSearch from "./pages/MintSearch";
import TeamBuilder from "@/pages/TeamBuilder";
import AccountTransfer from "@/pages/AccountTransfer";
import RushWeeklies from "@/pages/RushWeeklies";
import PackOpener from "@/pages/PackOpener";

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
        },
        {
            path: '/rushweeklies',
            component: RushWeeklies,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/accounttransfer',
            component: AccountTransfer,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/packopener',
            component: PackOpener,
            meta: {
                requiresAuth: true
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (store.getters.isAuthenticated) {
            if (to['path'] === '/masslist') {
                if (store.getters.isMassListWhitelisted) {
                    next()
                    return
                } else {
                    return
                }
            } else {
                next()
                return
            }
        }
        next('/login')
    } else {
        next()
    }
})

export default router