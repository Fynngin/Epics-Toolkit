import Vue from "vue";
import Vuex from "vuex";
import {getAppInfo, login} from "@/api";
import firebase from "./firebaseConfig";
const db = firebase.firestore();

Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        authenticated: false,
        cdnUrl: 'http://cdn.epics.gg',
        repoUrl: 'https://github.com/Fynngin/Epics-Toolkit',
        userdata: {
            jwt: null,
            username: null,
            id: null,
            avatar: null
        },
        whaleId: 93233,
        category: 1,
        currentSeasons: {
            1: '2020',
            2: 'First Edition'
        },
        rushSeason: '2020',
        coreCircuitId: 35,
        seasons: [],
        savedSearches: [],
        noUndercutMarketAt: 3
    },
    getters: {
        isAuthenticated: (state) => {
            return state.authenticated
        },
        isMassListWhitelisted: (state) => {
            return state.userdata.isMasslistWhitelisted
        },
        isAdmin: (state) => {
            return state.userdata.id === 32876
        }
    },
    actions: {
        requestToken({commit}, auth) {
            return new Promise((resolve, reject) => {
                login(auth).then(async response => {
                    if (response.status === 200 && response.data.success === true) {
                        let data = {
                            username: response.data.data.user.username,
                            id: response.data.data.user.id,
                            avatar: `http://cdn.epics.gg${response.data.data.user.avatar}`,
                            banned: false,
                            isMasslistWhitelisted: false,
                            lastLogin: new Date()
                        }
                        let userDB = db.collection("users").doc(data.id.toString())
                        await userDB.get().then(async res => {
                            if (res.exists) {
                                let userdata = await res.data()
                                data.banned = !!userdata['banned'];
                                data.isMasslistWhitelisted = !!userdata['isMasslistWhitelisted'];
                            }
                            if (data.banned) {
                                reject('user_banned');
                            }
                            await userDB.set(data, {merge: true})
                        })
                        data.jwt = response.data.data.jwt
                        commit('authenticate', data)
                        resolve()
                    } else {
                        commit('authenticate', null)
                        reject()
                    }
                }).catch(() => {
                    commit('authenticate', null)
                    reject()
                })
            })
        },
        changeCategory({commit}, category) {
            getAppInfo(this.state.userdata.jwt, category).then(res => {
                if (res.data.success) {
                    commit('changeCategory', {category: category, seasons: res.data.data.seasons})
                }
            })
        },
        saveMintSearch({commit}, data) {
            commit('saveSearch', data)
        }
    },
    mutations: {
        authenticate(state, auth) {
            if (this.auth !== null) {
                this.state.authenticated = true
                this.state.userdata = auth
            } else {
                this.state.authenticated = false
            }
        },
        changeCategory(category, data) {
            this.state.category = data.category;
            this.state.seasons = data.seasons;
        },
        saveSearch(state, data) {
            if (data[1]) { //is new search?
                this.state.savedSearches.push(data[0])
                if (this.state.savedSearches.length > 20) {
                    this.state.savedSearches.splice(0, 1)
                }
            } else {
                this.state.savedSearches[this.state.savedSearches.length - 1] = data[0]
            }
        }
    }
})

let local = localStorage.getItem('store')
if (local) {
    if (JSON.parse(local)['savedSearches']) {
        store.state.savedSearches = JSON.parse(local)['savedSearches']
    } else {
        store.state.savedSearches = []
    }
}

store.subscribe((mutation, state) => {
    localStorage.setItem('store', JSON.stringify(state));
});

export default store