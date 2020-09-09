<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row>
            <b-col cols="6">
                <h1>Send trades</h1>
                <p>Coming soon...</p>
            </b-col>
            <b-col cols="6">
                <h1>Accept trades</h1>

                <p v-if="selectedUser">There are <strong>{{filteredTrades.length}}</strong> trades from <strong>{{selectedUser.username}}</strong> to accept.</p>

                <b-input-group prepend="Search users:">
                    <b-form-input v-model="userSearch"></b-form-input>
                    <b-input-group-append>
                        <b-button size="sm" variant="outline-dark" @click="searchUsers">Search</b-button>
                    </b-input-group-append>
                </b-input-group>

                <b-list-group class="mt-2" style="overflow: scroll; max-height: 200px;" v-if="showUserList">
                    <b-list-group-item v-for="(user, index) in userOptions" :key="index" @click="selectUser(user)" href="#">
                        <b-avatar :src="`${$store.state.cdnUrl}${user.avatar}`"/>
                        {{user.username}}
                    </b-list-group-item>
                </b-list-group>

                <b-button v-if="selectedUser && filteredTrades.length > 0" class="mt-2" variant="outline-primary" @click="acceptTrades">Accept trades</b-button>

                <b-spinner v-if="spinner.accepting"/>
                <b-progress v-if="showAcceptProgress" class="mt-2" :max="filteredTrades.length">
                    <b-progress-bar :value="acceptProgress">
                        {{acceptProgress}} / {{filteredTrades.length}}
                    </b-progress-bar>
                </b-progress>
                <p v-if="!spinner.accepting && acceptProgress > 0">Done! <strong v-if="amountFailedAccepts > 0">Failed to accept {{amountFailedAccepts}} trades!</strong></p>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar";
import {acceptTrade, getTrades, searchUsers} from "@/api";

export default {
    name: "AccountTransfer",
    components: {Sidebar},
    data() {
        return {
            acceptProgress: 0,
            amountFailedAccepts: 0,
            userSearch: '',
            userOptions: [],
            selectedUser: null,
            tradeList: [],
            showUserList: false,
            showAcceptProgress: false,
            spinner: {
                accepting: false
            }
        }
    },
    async created() {
        let continueTradeList = true
        let page = 1
        while (continueTradeList) {
            await getTrades(this.$store.state.userdata.jwt, this.$store.state.category, page).then(res => {
                if (res.data.success && res.data.data.count > 0) {
                    this.tradeList = this.tradeList.concat(res.data.data['trades'])
                    page++
                } else {
                    continueTradeList = false
                }
            })
        }
    },
    computed: {
        filteredTrades() {
            if (this.selectedUser) {
                return this.tradeList.filter(trade => {
                    return trade['offeredBy'] === this.selectedUser.id
                })
            }
            return []
        }
    },
    methods: {
        searchUsers() {
            searchUsers(this.$store.state.userdata.jwt, this.$store.state.category, this.userSearch).then(res => {
                if (res.data.success) {
                    this.userOptions = res.data.data
                    this.showUserList = true
                }
            })
        },
        selectUser(user) {
            this.selectedUser = user
            this.showUserList = false
        },
        acceptTrades() {
            this.spinner.accepting = true
            this.showAcceptProgress = true
            this.filteredTrades.forEach(trade => {
                acceptTrade(this.$store.state.userdata.jwt, this.$store.state.category, trade.id).then(res => {
                    if (res.data.success) {
                        this.acceptProgress++
                    } else {
                        this.amountFailedAccepts++
                    }
                })
            })
            this.spinner.accepting = false
        }
    }
}
</script>

<style scoped>

</style>