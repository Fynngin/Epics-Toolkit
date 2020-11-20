<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row>
            <b-col>
                <b-card border-variant="dark" class="mb-2 ml-2">
                    <b-button variant="primary" @click="testquery">Test query</b-button>
                    <b-button variant="primary" @click="reloadTeamDatabase">Reload Teams</b-button>
                    <b-button variant="primary" class="ml-2" @click="reloadPlayerDatabase">Reload Players</b-button>
                    <b-button variant="primary" class="ml-2" @click="reloadTemplateDatabase">Reload Card Templates</b-button>
                </b-card>
            </b-col>
        </b-row>

        <b-row align-h="center">
            <b-col lg="5" sm="10" class="mb-2">
                <b-card border-variant="dark" header-bg-variant="light">
                    <template v-slot:header>
                        Spinner Odds
                        <b-button style="float: right" variant="outline-dark" @click="keys.spinnerodds++">
                            <font-awesome-icon icon="redo-alt"/>
                        </b-button>
                    </template>
                    <b-spinner v-if="spinner.spinnerOdds"/>
                    <SpinnerOddsChart
                        :key="keys.spinnerodds"
                        :hidden="spinner.spinnerOdds"
                        :category="$store.state.category"
                        @loading="value => {value ? this.spinner.spinnerOdds = true : this.spinner.spinnerOdds = false}"
                    ></SpinnerOddsChart>
                </b-card>
            </b-col>
            <b-col lg="5" sm="10" class="mb-2">
                <b-card border-variant="dark" header="Pack Stock" header-bg-variant="light">
                    <template v-slot:header>
                        Pack Stock
                        <b-button style="float: right" variant="outline-dark" @click="keys.packstock++">
                            <font-awesome-icon icon="redo-alt"/>
                        </b-button>
                    </template>
                    <b-spinner v-if="spinner.packStock"/>
                    <PackStock
                        :key="keys.packstock"
                        :hidden="spinner.packStock"
                        :category="$store.state.category"
                        @loading="value => {value ? this.spinner.packStock = true : this.spinner.packStock = false}"
                    ></PackStock>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import SpinnerOddsChart from "../components/SpinnerOddsChart";
    import PackStock from "../components/PackStock";
    import {mapActions} from "vuex";
    import {getCardTemplates, getCollections, getPlayers, getTeams} from "@/api";
    import firebase from "../firebaseConfig";
    const db = firebase.firestore();

    export default {
        name: "Home",
        components: {PackStock, SpinnerOddsChart, Sidebar},
        data() {
            return {
                spinner: {
                    spinnerOdds: true,
                    packStock: true
                },
                keys: {
                    packstock: 0,
                    spinnerodds: 0
                }
            }
        },
        created() {
            this.changeCategory(this.$store.state.category)
        },
        methods: {
            ...mapActions(['changeCategory']),
            reloadTeamDatabase() {
                getTeams(this.$store.state.userdata.jwt).then(res => {
                    if (res.data.success) {
                        let teams = res.data.data.teams
                        for (const team of teams) {
                            db.collection("teams")
                                .doc(team.id.toString())
                                .set(team, {merge: true})
                        }
                    }
                })
            },
            reloadPlayerDatabase() {
                getPlayers(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                    if (res.data.success) {
                        let players = res.data.data.players
                        for (const player of players) {
                            player.cardTemplates = []
                            db.collection("players")
                                .doc(player.id.toString())
                                .set(player, {merge: true})
                        }
                    }
                })
            },
            reloadTemplateDatabase() {
                for (const season of ['2020']) {
                    getCollections(this.$store.state.userdata.jwt, this.$store.state.category, season, this.$store.state.userdata.id).then(res => {
                        if (res.data.success) {
                            for (const collection of res.data.data) {
                                let collId = collection.collection.id
                                let collCardTemplates = []
                                getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, collId).then(async res => {
                                    if (res.data.success) {
                                        let templates = res.data.data
                                        for (const template of templates) {
                                            if (template['cardType'] === "player") {
                                                template.player = db.doc('players/' + template.player.id)
                                            } else if (template['cardType'] === "team") {
                                                template.team = db.doc('teams/' + template.team.id)
                                            }

                                            await db.collection("cardTemplates")
                                                .doc(template.id.toString())
                                                .set(template, {merge: true})

                                            let newTemplates = await (template.player.get()).data().cardTemplates
                                            newTemplates.push(db.doc('cardTemplates/' + template.id))
                                            await template.player.set({cardTemplates: newTemplates}, {merge: true})

                                            collCardTemplates.push(db.doc('cardTemplates/' + template.id))
                                        }

                                        collection.collection.cardTemplates = collCardTemplates
                                        await db.collection("collections")
                                            .doc(collId.toString())
                                            .set(collection.collection, {merge: true})

                                        console.log(collection.id)
                                    }
                                })
                            }
                        }
                    })
                }
            },
            async testquery() {
                // let player = db.collection('players').doc('33')
                // let query = db.collection("cardTemplates").where("player", "==", player)
                // query.get().then(res => {
                //     console.log(res.docs.map(el => el.data()))
                // })

                let template = (await db.collection("cardTemplates").doc("1").get()).data()
                console.log((await template.player.get()).data().cardTemplates[0])
                let player = (await template.player.get())
                template.player.set({cardTemplates: [db.doc('cardTemplates/' + template.id)]}, {merge: true})
                console.log(player)
            }
        }
    }
</script>

<style scoped>

</style>