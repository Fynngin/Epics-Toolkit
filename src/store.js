import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        authenticated: false,
        userdata: {
            jwt: null,
            username: null,
            id: null,
            avatar: null
        }
    },
    getters: {
        isAuthenticated: (state) => {
            return state.authenticated
        }
    },
    actions: {
        requestToken({commit}, auth) {
            return new Promise((resolve, reject) => {
                axios("https://api.epics.gg/api/v1/auth/login", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(auth)
                }).then(response => {
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
        }
    }
})