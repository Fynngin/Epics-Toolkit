<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row>
            <b-col class="ml-2">
                <b-card border-variant="dark" align="left">
                    <b-form-select
                            class="mt-2"
                            v-model="season"
                            :options="$store.state.seasons"
                            @change="loadCollections"/>
                    <b-form-radio-group
                            stacked
                            class="mt-2"
                            v-model="collection"
                            :options="collectionOptions"
                            text-field="collection.name"
                            value-field="collection.id"
                            @input="loadCards"
                    />
                </b-card>
            </b-col>
            <b-col cols="8">
                <b-card border-variant="dark">
                    <b-row class="mb-2 ml-0">
                        <b-button v-if="!allSelected" @click="selectAll">Select All</b-button>
                        <b-button @click="deselectAll">Deselect All</b-button>
                    </b-row>
                    <b-row align-h="start">
                        <b-col lg="2" md="4" sm="6" v-for="card in cards" :key="card.id" class="mb-3">
                            <b-card>
                                <Checkmark v-if="card.selected" style="position: absolute;" class="overlay"/>
                                <b-card-img :src="card.images.size402" @click="selectCard(card)"/>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
            <b-col cols="2" class="mr-2">
                <b-card border-variant="dark">
                    <b-input-group prepend="MintBatch">
                        <b-form-input v-model="mintBatch"></b-form-input>
                    </b-input-group>
                    <b-input-group prepend="Min">
                        <b-form-input type="number" v-model="minMint"></b-form-input>
                    </b-input-group>
                    <b-input-group prepend="Max">
                        <b-form-input type="number" v-model="maxMint"></b-form-input>
                    </b-input-group>
                    <b-button variant="primary" @click="startSearch">Search</b-button>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import {getCardTemplates, getCollections, getItems, getLeaderboard} from '../api';
    import Sidebar from "../components/Sidebar";
    import Checkmark from "../components/Checkmark";

    export default {
        name: "MintSearch",
        components: {Checkmark, Sidebar},
        data() {
            return {
                season: null,
                cards: [],
                cardIds: [], //templateIds
                collection: null,
                collectionOptions: [],
                selected: [],
                minMint: 1,
                maxMint: 10,
                mintBatch: 'A',
                cardsFound: 0
            }
        },
        computed: {
            allSelected() {
                return this.cards.length === this.selected.length
            },
            totalCards() {
                return this.selected.length * (this.maxMint - this.minMint + 1)
            }
        },
        methods: {
            loadCollections() {
                getCollections(this.$store.state.userdata.jwt, this.$store.state.category,
                    this.season, this.$store.state.userdata.id).then(res => {
                    res.data.success ? this.collectionOptions = res.data.data : this.collectionOptions = []
                })
            },
            loadCards() {
                getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, this.collection).then(res => {
                    res.data.success ? this.cards = res.data.data : this.cards = []
                })
            },
            async startSearch() {
                let page = 1
                let users = []
                let continueSearch = true
                while (this.cardsFound < this.totalCards && continueSearch === true) {
                    await getLeaderboard(this.$store.state.userdata.jwt, this.$store.state.category, this.collection, page).then(res => {
                        if (res.data.success && res.data.data.length > 0) {
                            users = res.data.data
                            page++
                            users.forEach(user => {
                                this.checkUser(user.user)
                            })
                        } else {
                            console.log(res.data)
                            continueSearch = false
                        }
                    })
                }
            },
            checkUser(user) {
                getItems(this.$store.state.userdata.jwt, this.$store.state.category, this.collection, user.id).then(res => {
                    if (res.data.success) {
                        let cards = res.data.data.cards
                        cards.forEach(card => {
                            if (this.selected.includes(card.cardTemplate.id)
                                && card.mintBatch === this.mintBatch
                                && card.mintNumber >= this.minMint
                                && card.mintNumber <= this.maxMint) {
                                this.cardsFound++
                                console.log(`${card.mintBatch}${card.mintNumber} ${card.cardTemplate.title}: ${user.username}`)
                            }
                        })
                    }
                })
            },
            selectAll() {
                this.selected = []
                this.cards.forEach(card => {
                    card.selected = true
                    this.selected.push(card.id)
                })
                this.$forceUpdate()
            },
            deselectAll() {
                this.selected = []
                this.cards.forEach(card => {
                    card.selected = false
                })
                this.$forceUpdate()
            },
            selectCard(card) {
                if (card.selected) {
                    card.selected = false
                    this.selected.splice(this.selected.indexOf(card.id), 1)
                } else {
                    this.selected.push(card.id)
                    card.selected = true
                }
                this.$forceUpdate()
            }
        }
    }
</script>

<style scoped>
    .overlay {
        height:0;
        overflow:visible;
        pointer-events:none;
        background:none !important;
    }
</style>