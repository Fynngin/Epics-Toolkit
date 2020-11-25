<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-row class="mb-2">
            <b-button v-b-toggle.sidebar style="float: left" class="ml-4 bg-transparent border-transparent">
                <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
            </b-button>
        </b-row>

        <b-row>
            <b-col cols="2">
                <b-card class="mb-2 ml-2" border-variant="dark" title="Basic functions">
                    <b-button variant="outline-dark" class="w-100 mb-2" @click="reloadTeamDatabase">Reload Teams</b-button>
                    <b-button variant="outline-dark" class="w-100" @click="reloadPlayerDatabase">Reload Players</b-button>
                </b-card>
            </b-col>
            <b-col cols="3">
                <b-card class="mb-2 ml-2" border-variant="dark" title="Insert collection">
                    <b-form-input class="mb-2" v-model="newCollectionId" placeholder="Collection ID"/>
                    <b-button variant="outline-dark" class="w-100" @click="insertCollection(newCollectionId)">
                        Insert / Reload Collection
                    </b-button>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-card border-variant="dark" class="mb-2 ml-2">
                    <b-button variant="primary" @click="testquery">Test query</b-button>
                    <b-button variant="primary" class="ml-2" @click="reloadTemplateDatabase">Reload Card Templates</b-button>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar";
import {getCardTemplates, getCollections, getPlayers, getStickerTemplates, getTeams} from "@/api";
import firebase from "../firebaseConfig";
const db = firebase.firestore();

export default {
    name: "Admin",
    components: {Sidebar},
    data() {
        return {
            newCollectionId: ""
        }
    },
    methods: {
        reloadTeamDatabase() {
            getTeams(this.$store.state.userdata.jwt).then(res => {
                if (res.data.success) {
                    let teams = res.data.data.teams
                    for (const team of teams) {
                        if (!team.cardTemplates) {
                            team.cardTemplates = []
                        }
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
                        if (!player.cardTemplates) {
                            player.cardTemplates = []
                        }
                        db.collection("players")
                            .doc(player.id.toString())
                            .set(player, {merge: true})
                    }
                }
            })
        },
        async insertCollection(collectionId) {
            let cards;
            let stickers;
            await getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, collectionId).then(res => {
                if (res.data.success) {
                    cards = res.data.data;
                }
            })
            await getStickerTemplates(this.$store.state.userdata.jwt, this.$store.state.category, collectionId).then(res => {
                if (res.data.success) {
                    stickers = res.data.data;
                }
            })
            for (const card of cards) {
                await this.insertCard(card);
            }
            for (const sticker of stickers) {
                this.insertSticker(sticker);
            }
            // console.log(cards);
            // console.log(stickers);
        },
        async insertCard(card) {
            let templatePath = 'cardTemplates/' + card.id;
            if (card['cardType'] === "player") {
                card.player = db.doc('players/' + card.player.id)
                let playerTemplates = (await card.player.get()).data().cardTemplates.map(el => el.path);
                if (!playerTemplates.includes(templatePath)) {
                    playerTemplates.push(db.doc(templatePath));
                    await card.player.set({cardTemplates: playerTemplates}, {merge: true})
                }
            } else if (card['cardType'] === "team") {
                card.team = db.doc('teams/' + card.team.id)
                let teamTemplates = (await card.team.get()).data().cardTemplates.map(el => el.path);
                if (!teamTemplates.includes(templatePath)) {
                    teamTemplates.push(db.doc(templatePath));
                    await card.team.set({cardTemplates: teamTemplates}, {merge: true})
                }
            }
            await db.collection("cardTemplates")
                .doc(card.id.toString())
                .set(card, {merge: true})
        },
        insertSticker(sticker) {
            console.log(sticker);
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