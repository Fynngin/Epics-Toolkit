<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row class="mb-2" v-if="$store.getters.isAdmin">
            <b-col>
                <b-card border-variant="dark">
                    <b-row>
                        <b-col>
                            <b-button variant="outline-primary" class="mr-2" @click="getRequests">Load Requests</b-button>
                            <b-button variant="outline-success" class="mr-2" @click="approveRequest">Approve</b-button>
                            <b-button variant="outline-danger" @click="removeRequest">Reject</b-button>
                        </b-col>
                        <b-col>
                            <b-list-group>
                                <b-list-group-item
                                    v-for="(req, idx) in requests" :key="idx"
                                    href="#"
                                    @click="selectRequest(req)"
                                    :active="selectedRequest === req"
                                >
                                    {{req.mint}} - {{req.player}}: {{req.owner}}
                                </b-list-group-item>
                            </b-list-group>
                        </b-col>
                        <b-col v-if="selectedRequest.url">
                            <b-card-img class="requestImg mr-2" :src="selectedRequest.url"/>
                            <b-button variant="outline-dark" v-if="selectedRequest.url" @click="openImgModal">
                                <font-awesome-icon icon="search-plus"/>
                            </b-button>

                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-5 mr-2">
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
                        v-for="(card, idx) in selectedPlayer.cards" :key="idx"
                        @click="selectCard(card)"
                        :active="selectedCard.mint === card.mint"
                    >
                        {{card.mint}} / {{Object.keys(selectedPlayer.cards).length}}
                    </b-list-group-item>
                </b-list-group>
            </b-col>

            <b-col v-if="selectedCard.mint">
                <b-row class="mb-2" align-v="center">
                    <b-col>
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
                    </b-col>
                    <b-col>
                        <b-card-img class="ownerImg" v-if="selectedCard.url" :src="selectedCard.url"/>
                    </b-col>
                </b-row>

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

        <b-modal
            id="requestImg" hide-footer
            :title="`${selectedRequest.mint} - ${selectedRequest.player}: ${selectedRequest.owner}`"
        >
            <b-card-img v-if="selectedRequest.url" :src="selectedRequest.url"/>
        </b-modal>
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
            selectedRequest: {},
            newOwnerDialogue: false,
            fileToUpload: null,
            fileUploadInProgress: false,
            requests: []
        }
    },
    async created() {
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
            if (card['owner'] !== "" && !card['owner'].avatar) {
                card['owner'] = (await card['owner'].get()).data()
                let img = storage.ref().child(card.img);
                img.getDownloadURL().then(url => {
                    card.url = url;
                    this.$forceUpdate();
                })
            }
            this.selectedCard = card
        },
        selectRequest(req) {
            this.selectedRequest = req
            let img = storage.ref().child(req.img);
            img.getDownloadURL().then(url => {
                this.selectedRequest.url = url;
                this.$forceUpdate();
            })
        },
        async submitNewOwner() {
            this.fileUploadInProgress = true;
            const filename = uuidv4();
            const playername = this.selectedPlayer.name;
            const mint = this.selectedCard.mint;
            let file = this.fileToUpload;
            await storage.ref().child(`kato2020sigs/${playername}/${mint}/${filename}`).put(file);

            const username = this.$store.state.userdata.username;
            const userId = this.$store.state.userdata.id;
            await db.collection("kato2020sigs_requests").doc(`${mint}_${playername}_${username}`).set({
                owner_name: username,
                owner: userId,
                mint: mint,
                player: playername,
                img: `kato2020sigs/${playername}/${mint}/${filename}`
            })

            this.fileUploadInProgress = false;
        },
        getRequests() {
            this.requests = []
            db.collection("kato2020sigs_requests").get().then(snap => {
                snap.forEach(async request => {
                    const data = await request.data()
                    this.requests.push(data)
                })
            })
        },
        openImgModal() {
            this.$bvModal.show('requestImg')
        },
        async approveRequest() {
            const userId = this.selectedRequest.owner;
            const userRef = db.collection('users').doc(userId.toString())
            const playername = this.selectedRequest.player
            const mint = this.selectedRequest.mint
            const filename = this.selectedRequest.img

            await db.collection("kato2020sigs")
                .doc(playername)
                .update({[mint]: {
                    owner: userRef,
                    mint: mint,
                    player: playername,
                    img: filename
                }})
            await this.removeRequest()
        },
        async removeRequest() {
            const req = this.selectedRequest
            await db.collection("kato2020sigs_requests")
                .doc(`${req.mint}_${req.player}_${req.owner_name}`)
                .delete()
            this.requests.splice(this.requests.indexOf(req), 1)
        }
    }
}
</script>

<style scoped>
    .requestImg {
        height: 100px;
        width: auto;
    }

    .ownerImg {
        max-height: 250px;
        width: auto;
    }
</style>