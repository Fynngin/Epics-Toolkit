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
                        {{card.mint}} / {{Object.keys(selectedPlayer.cards).length}}
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
                <b-button variant="outline-primary" class="mb-2" @click="newOwnerDialogue = true">I own this!</b-button>
                <b-row v-if="newOwnerDialogue">
                    <p style="text-align: left">
                        If you own this card, you can submit a request to appear on this page.
                        You have to upload a genuine picture of the card to prove, that you indeed own it.<br>
                        The image must include <strong>the card</strong> and <strong>your username</strong> (for
                        example written on a piece of paper).<br>
                        The request will then be reviewed by me (Fynngin) and eventually accepted.
                    </p>
                    <b-form-file class="mb-2" v-model="fileToUpload"/>
                    <b-button
                        @click="submitNewOwner"
                        :variant="fileToUpload ? 'outline-success' : 'secondary'"
                        :disabled="!fileToUpload"
                    >
                        <b-spinner v-if="fileUploadInProgress"/>
                        <span v-else>
                                <font-awesome-icon icon="upload"/>
                                Upload and submit
                            </span>
                    </b-button>
                </b-row>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import Sidebar from "../components/Sidebar";
import firebase from "../firebaseConfig";
import uuidv4 from 'uuid';
const db = firebase.firestore();
const storage = firebase.storage();

export default {
    name: "PhysicalTracker",
    components: {Sidebar},
    data() {
        return {
            players: [],
            selectedPlayer: {},
            selectedCard: {},
            newOwnerDialogue: false,
            fileToUpload: null,
            fileUploadInProgress: false
        }
    },
    async created() {
        // let img = storage.ref().child('Screenshot_2020-11-10_at_21.38.22_2.png');
        // img.getDownloadURL().then(url => {
        //     console.log(url)
        // })
        await this.getPlayersFromDB()
        this.players.sort((a,b) => a.name - b.name)
    },
    methods: {
        async getPlayersFromDB() {
            await db.collection('kato2020sigs').get().then(snap => {
                snap.forEach(async player => {
                    const playername = player.id
                    const playerRef = db.collection("kato2020sigs").doc(playername);
                    const cards = (await playerRef.get()).data();
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
        },
        async submitNewOwner() {
            this.fileUploadInProgress = true;
            const filename = uuidv4();
            const playername = this.selectedPlayer.name;
            const mint = this.selectedCard.mint;
            let file = this.fileToUpload;
            await storage.ref().child(`kato2020sigs/${playername}/${mint}/${filename}`).put(file);

            const username = this.$store.state.userdata.username;
            await db.collection("kato2020sigs_requests").doc(`${mint}_${playername}_${username}`).set({
                owner: username,
                mint: mint,
                player: playername,
                img: `kato2020sigs/${playername}/${mint}/${filename}`
            })

            this.fileUploadInProgress = false;
        }
    }
}
</script>

<style scoped>

</style>