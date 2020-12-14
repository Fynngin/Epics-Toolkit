<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row>
            <b-col cols="2">
                <b-list-group>
                    <b-list-group-item
                        href="#"
                        v-for="player in players" :key="player.name"
                        @click="selectedPlayer = player"
                        :active="selectedPlayer.name === player.name"
                    >
                        {{player.name}}
                    </b-list-group-item>
                </b-list-group>
            </b-col>

            <b-col align-self="center">
                <h1 v-if="!selectedPlayer.name">No player selected.</h1>
                <b-list-group>
                    <b-list-group-item
                        href="#"
                        v-for="card in selectedPlayer.cards" :key="card.mint"
                        @click="selectCard(card)"
                        :active="selectedCard.mint === card.mint"
                    >
                        {{card.mint}} / {{selectedPlayer.cards.length}}
                    </b-list-group-item>
                </b-list-group>
            </b-col>

            <b-col v-if="selectedCard.mint">
                <h1>{{selectedCard.mint}} / {{selectedPlayer.cards.length}} {{selectedPlayer.name}}</h1>
                <p v-if="selectedCard['owner'] !== ''">
                    <strong>Owner: </strong>
                    <b-avatar :src="selectedCard['owner']['avatar']"/>
                    <span>
                        {{selectedCard['owner']['username']}}
                    </span>
                </p>
                <p v-else>
                    <strong>Owner: </strong>-
                </p>
                <b-button variant="outline-primary" @click="newOwnerDialogue = true">I own this!</b-button>
                <b-form-file v-if="newOwnerDialogue" v-model="fileToUpload"/>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import Sidebar from "../components/Sidebar";
import firebase from "../firebaseConfig";
const db = firebase.firestore();
// const storage = firebase.storage();

export default {
    name: "PhysicalTracker",
    components: {Sidebar},
    data() {
        return {
            players: [],
            selectedPlayer: {},
            selectedCard: {},
            newOwnerDialogue: false,
            fileToUpload: null
        }
    },
    async created() {
        // let img = storage.ref().child('Screenshot_2020-11-10_at_21.38.22_2.png');
        // img.getDownloadURL().then(url => {
        //     console.log(url)
        // })
        if (this.players.length === 0) {
            await this.getPlayersFromDB();
            this.players.sort((a,b) => a.name - b.name)
        }
    },
    methods: {
        getPlayersFromDB() {
            db.collection('kato2020sigs').get().then(snap => {
                snap.forEach(async player => {
                    const playername = player.id
                    const cardCollection = await db.collection(`kato2020sigs/${playername}/cards`).get()
                    let cards = []
                    await cardCollection.forEach(async card => {
                        let obj = await card.data();
                        obj.mint = parseInt(card.id)
                        cards.push(obj);
                    })
                    cards.sort((a,b) => a.mint - b.mint)
                    this.players.push({
                        name: playername,
                        cards: cards
                    })
                })
            })
        },
        async selectCard(card) {
            if (card['owner'] !== "") {
                card['owner'] = (await card['owner'].get()).data()
            }
            this.selectedCard = card
        }
    }
}
</script>

<style scoped>

</style>