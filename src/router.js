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
import PhysicalTracker from "./pages/PhysicalTracker";
import firebase from "./firebaseConfig";
import {getUserInfo} from "@/api";
import Betting from "@/pages/Betting";
const db = firebase.firestore();

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
        },
        {
            path: '/physicaltracker',
            component: PhysicalTracker,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/betting',
            component: Betting,
            meta: {
                requiresAuth: true
            }
        }
    ]
})

async function isMassListWhitelisted(userId) {
    let res = await db.collection("users").doc(userId.toString()).get()
    let data = await res.data()
    return data['isMasslistWhitelisted'];
}

router.beforeEach(async (to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (store.getters.isAuthenticated) {
            if (to['path'] === '/masslist') {
                await getUserInfo(store.state.userdata.jwt, store.state.category).then(async res => {
                    if (res.data.success) {
                        let userId = res.data.data.id;
                        let whitelisted = await isMassListWhitelisted(userId);
                        if (whitelisted) {
                            next()
                        }
                    }
                })
            } else {
                next()
            }
        } else {
            next('/login')
        }
    } else {
        next()
    }
})

export default router