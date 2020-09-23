<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-row class="mb-2">
            <b-button v-b-toggle.sidebar style="float: left" class="ml-4 bg-transparent border-transparent">
                <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
            </b-button>
        </b-row>
        <b-row align-h="center" class="mb-2">
            <b-col cols="10">
                <v-stepper ref="stepper" :steps="steps" v-model="step"/>
            </b-col>
        </b-row>
        <b-button
            variant="outline-dark"
            class="mb-4 button"
            @click="$refs.stepper.previous()"
        ><font-awesome-icon icon="arrow-left"/><br>Previous</b-button>
        <b-button
            variant="outline-dark"
            class="ml-2 mb-4 button"
            @click="$refs.stepper.next()"
            :disabled="checkStepperRequirements"
        ><font-awesome-icon icon="arrow-right"/><br>Next</b-button>

        <div v-if="step === 1">
            <h2>Do you want to send or accept trades?</h2>
            <h5>Sending will send the items from a given account to your account.</h5>
            <h5>Accepting will accept all incoming trades from a given account</h5>
            <b-button
                @click="action = 'send'"
                :variant="action === 'send' ? 'success' : 'outline-success'"
                class="button"
            >Send</b-button>
            <b-button
                @click="action = 'accept'"
                :variant="action === 'accept' ? 'success' : 'outline-success'"
                class="ml-2 button"
            >Accept</b-button>
            <h1 style="color: red" class="mt-4">WARNING!</h1>
            <h3 style="color: red" class="mt-4">Although I'm confident that this tool works, it has yet to be tested with a real transfer.</h3>
            <h3 style="color: red" class="mt-4">If you want to use it, do it at your own risk. Message me on discord for more information.</h3>
        </div>

        <div v-if="step === 2">
            <h2 v-if="action === 'send'">What account do you want to transfer the items from?</h2>
            <h2 v-else>What account do you want to accept the trades from?</h2>

            <p v-if="selectedUser">Selected user: <strong>{{this.selectedUser.username}}</strong></p>

            <b-input-group prepend="Search users:" class="ml-2" v-on:submit.prevent="searchUsers">
                <b-form-input v-model="userSearch" v-on:submit.prevent="searchUsers"></b-form-input>
                <b-input-group-append>
                    <b-button size="sm" variant="outline-dark" @click="searchUsers">Search</b-button>
                </b-input-group-append>
            </b-input-group>

            <b-list-group class="mt-2 ml-2" v-if="showUserList">
                <b-list-group-item v-for="(user, index) in userOptions" :key="index" @click="selectUser(user)" href="#">
                    <b-avatar :src="`${$store.state.cdnUrl}${user.avatar}`"/>
                    {{user.username}}
                </b-list-group-item>
            </b-list-group>
        </div>


        <template v-if="step === 3">
            <div v-if="action === 'accept'">
                <p v-if="selectedUser">There are <strong>{{filteredTrades.length}}</strong> trades from <strong>{{selectedUser.username}}</strong> to accept.</p>
                <b-button class="button" variant="outline-success" v-if="filteredTrades.length > 0" @click="acceptTrades">Accept</b-button>
                <b-spinner v-if="spinner.accepting"/>
                <b-progress v-if="showAcceptProgress" class="mt-2" :max="filteredTrades.length">
                    <b-progress-bar :value="acceptProgress">
                        {{acceptProgress}} / {{filteredTrades.length}}
                    </b-progress-bar>
                </b-progress>
                <p v-if="!spinner.accepting && acceptProgress > 0">Done! <strong v-if="amountFailedAccepts > 0">Failed to accept {{amountFailedAccepts}} trades!</strong></p>
            </div>

            <div v-else>
                <p>Click "Start" to begin the process. The program will start sorting {{selectedUser.username}}'s cards.</p>
                <p>After that, you have to confirm the process one more time.</p>
                <b-button v-if="!progress.seasons" @click="createTradeList" variant="outline-success">Prepare trades</b-button>
                <p v-if="progress.seasons && progress.seasons < $store.state.seasons.length">
                    Getting seasons and collections...
                </p>
                <p v-if="progress.collections.max && progress.collections.progress < progress.collections.max">
                    Getting items...
                </p>
                <p v-if="progress.grouping.max && progress.grouping.progress < progress.grouping.max">
                    Grouping items...
                </p>
                <p v-if="progress.grouping.progress === progress.grouping.max && !progress.sending">
                    Done! You can now start the sending process. The program will send <strong>{{idList.length}}</strong> trades in total.
                </p>
                <p v-if="progress.sending && progress.sending < idList.length">
                    Sending trades...
                </p>
                <p v-if="progress.sending === idList.length">
                    All done! You can now log in with the other account and start accepting the trades.
                </p>
                <b-progress
                    show-progress
                    class="mb-2 ml-2"
                    v-if="progress.seasons"
                    :value="progress.seasons"
                    :max="$store.state.seasons.length"
                    :animated="progress.seasons < $store.state.seasons.length"
                    :variant="progress.seasons < $store.state.seasons.length ? 'primary' : 'success'"
                />
                <b-progress
                    show-progress
                    class="mb-2 ml-2"
                    v-if="progress.collections.max"
                    :value="progress.collections.progress"
                    :max="progress.collections.max"
                    :animated="progress.collections.progress < progress.collections.max"
                    :variant="progress.collections.progress < progress.collections.max ? 'primary' : 'success'"
                />
                <b-progress
                    show-progress
                    class="mb-2 ml-2"
                    v-if="progress.grouping.max"
                    :value="progress.grouping.progress"
                    :max="progress.grouping.progress"
                    :animated="progress.grouping.progress < progress.grouping.max"
                    :variant="progress.grouping.progress < progress.grouping.max ? 'primary' : 'success'"
                />
                <b-progress
                    show-progress
                    class="mb-2 ml-2"
                    v-if="progress.sending"
                    :value="progress.sending"
                    :max="idList.length"
                    :animated="progress.sending < idList.length"
                    :variant="progress.sending < idList.length ? 'primary' : 'success'"
                />
                <b-button v-if="progress.grouping.progress === progress.grouping.max && !progress.sending" @click="sendTrades" variant="outline-success">Send trades</b-button>
            </div>
        </template>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar";
import { VStepper } from 'vue-stepper-component'
import {acceptTrade, getCardIds, getCollections, getStickerIds, getTrades, searchUsers, sendTrade} from "@/api";

export default {
    name: "AccountTransfer",
    components: {Sidebar, VStepper},
    data() {
        return {
            steps: 3,
            step: 1,
            action: null,
            acceptProgress: 0,
            amountFailedAccepts: 0,
            userSearch: '',
            userOptions: [],
            selectedUser: null,
            tradeList: [],
            idList: [],
            showUserList: false,
            showAcceptProgress: false,
            spinner: {
                accepting: false
            },
            progress: {
                seasons: null,
                collections: {
                    progress: 0,
                    max: null
                },
                grouping: {
                    progress: 0,
                    max: null
                },
                sending: null
            },
            purples: []
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
        },
        checkStepperRequirements() {
            switch (this.step) {
                case 1:
                    return this.action === null
                case 2:
                    return this.selectedUser === null
                default:
                    return true
            }
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
        },
        async createTradeList() {
            this.progress.seasons = 0
            let collections = []
            let cardids = []
            let stickerids = []

            for (const season of this.$store.state.seasons) {
                await getCollections(this.$store.state.userdata.jwt, this.$store.state.category, season, this.selectedUser.id).then(res => {
                    if (res.data.success) {
                        collections = collections.concat(res.data.data.filter(coll => {
                            return coll.count > 0
                        }))
                        this.progress.seasons++
                    }
                })
            }

            this.progress.collections.max = collections.length
            for (const coll of collections) {
                if (coll.collection.properties['entity_types'].includes('card')) {
                    await getCardIds(this.$store.state.userdata.jwt, this.$store.state.category, coll.collection.id, this.selectedUser.id).then(res => {
                        if (res.data.success) {
                            res.data.data.forEach(template => {
                                cardids = cardids.concat(template['cardIds'])
                            })
                        }
                    })
                }
                if (coll.collection.properties['entity_types'].includes('sticker')) {
                    await getStickerIds(this.$store.state.userdata.jwt, this.$store.state.category, coll.collection.id, this.selectedUser.id).then(res => {
                        if (res.data.success) {
                            res.data.data.forEach(template => {
                                stickerids = stickerids.concat(template['stickerIds'])
                            })
                        }
                    })
                }
                this.progress.collections.progress++
            }

            this.progress.grouping.progress = 0
            this.progress.grouping.max = Math.ceil(cardids.length / 50) + Math.ceil(stickerids.length / 50)
            let startIdx = 0
            let endIdx = 50
            for (let i = 0; i < (cardids.length / 50); i++) {
                let temp = cardids.slice(startIdx, endIdx)
                this.idList.push(temp.map(elem => {
                    return {id: elem, type: 'card'}
                }))
                this.progress.grouping.progress++
                startIdx += 50
                endIdx += 50
            }
            startIdx = 0
            endIdx = 50
            for (let i = 0; i < (stickerids.length / 50); i++) {
                let temp = stickerids.slice(startIdx, endIdx)
                this.idList.push(temp.map(elem => {
                    return {id: elem, type: 'sticker'}
                }))
                this.progress.grouping.progress++
                startIdx += 50
                endIdx += 50
            }

            // await getCardIds(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.category === 1 ? 2969 : 1883, this.$store.state.userdata.id).then(res => {
            //     if (res.data.success) {
            //         let arr = res.data.data
            //         this.purples = arr.sort((a,b) => {
            //             return b['cardIds'].length - a['cardIds'].length
            //         })
            //     }
            // })
        },
        async sendTrades() {
            this.progress.sending = 0
            for (const batch of this.idList) {
                // let entities = batch.concat([{id: this.purples[0]['cardIds'][0], type: 'card'}])
                let entities = batch
                // this.purples[0]['cardIds'].splice(0, 1)
                await sendTrade(this.$store.state.userdata.jwt, this.$store.state.category, this.selectedUser.id, entities).then(res => {
                    if (res.data.success) {
                        // this.purples = this.purples.sort((a,b) => {
                        //     return b['cardIds'].length - a['cardIds'].length
                        // })
                        this.progress.sending++
                    }
                })
            }
        }
    }
}
</script>

<style scoped>
    .button {
        width: 100px;
    }
</style>