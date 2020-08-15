import Vue from "vue";
import Vuex from "vuex";
import {getAppInfo, login} from "@/api";

Vue.use(Vuex)

export default new Vuex.Store({
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
        whaleId: 26108,
        category: 1,
        currentSeasons: {
            1: '2020',
            2: 'First Edition'
        },
        rushSeason: '2020',
        seasons: []
    },
    getters: {
        isAuthenticated: (state) => {
            return state.authenticated
        }
    },
    actions: {
        requestToken({commit}, auth) {
            return new Promise((resolve, reject) => {
                login(auth).then(response => {
                    if (response.status === 200 && response.data.success === true) {
                        let data = {
                            jwt: response.data.data.jwt,
                            username: response.data.data.user.username,
                            id: response.data.data.user.id,
                            avatar: `http://cdn.epics.gg${response.data.data.user.avatar}`,
                        }
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
        }
    }
})