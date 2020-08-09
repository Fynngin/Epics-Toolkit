<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row class="ml-2">
            <b-col class="mb-2">
                <b-card border-variant="dark">
                    <b-form inline>
                        <b-input-group prepend="MintBatch" class="mr-2">
                            <b-form-input v-model="mintBatch"></b-form-input>
                        </b-input-group>
                        <b-input-group prepend="Min" class="mr-2">
                            <b-form-input type="number" v-model="minMint"></b-form-input>
                        </b-input-group>
                        <b-input-group prepend="Max" class="mr-2">
                            <b-form-input type="number" v-model="maxMint"></b-form-input>
                        </b-input-group>
                        <b-button variant="primary" @click="startSearch">Search</b-button>
                    </b-form>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="ml-2">
            <b-col>
                <b-card border-variant="dark" align="left">
                    <CollectionSelect @collectionChange="value => loadCards(value)"/>
                </b-card>
            </b-col>
            <b-col cols="9">
                <b-card border-variant="dark">
                    <b-row class="mb-2 ml-0">
                        <b-button v-if="!allSelected" @click="selectAll" class="mr-2" variant="outline-dark">Select All</b-button>
                        <b-button @click="deselectAll" variant="outline-dark">Deselect All</b-button>
                    </b-row>
                    <b-row align-h="start">
                        <b-col lg="2" md="4" sm="6" v-for="card in cards" :key="card.id" class="mb-3">
                            <b-card @click="selectCard(card)">
                                <Checkmark v-if="card.selected" style="position: absolute;"/>
                                <b-card-img :src="card.images.size402"/>
                            </b-card>
                        </b-col>
                        <b-col lg="2" md="4" sm="6" v-for="sticker in stickers" :key="sticker.id" class="mb-3">
                            <b-card @click="selectSticker(sticker)">
                                <Checkmark v-if="sticker.selected" style="position: absolute;"/>
                                <b-card-img :src="`${$store.state.cdnUrl}${sticker.images[1].url}`"/>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <SearchResults
            id="resultsModal"
            @hidden="resetSearch"
            :found="found"
            :progress="cardsFound"
            :max="totalCards"
            :done="searchDone"/>
    </div>
</template>

<script>
import {getCardTemplates, getCollections, getItems, getLeaderboard, getStickerTemplates} from '@/api';
    import Sidebar from "../components/Sidebar";
    import Checkmark from "../components/Checkmark";
    import SearchResults from "../components/SearchResults";
    import CollectionSelect from "@/components/CollectionSelect";

    export default {
        name: "MintSearch",
        components: {CollectionSelect, SearchResults, Checkmark, Sidebar},
        data() {
            return {
                season: null,
                cards: [],
                stickers: [],
                collection: null,
                collectionOptions: [],
                selected: {
                    cards: [],
                    stickers: []
                },
                minMint: 1,
                maxMint: 10,
                mintBatch: 'A',
                cardsFound: 0,
                searchDone: false,
                found: []
            }
        },
        computed: {
            allSelected() {
                return this.cards.length === this.selected.length && this.stickers.length === this.selected.length
            },
            totalCards() {
                return (this.selected.cards.length + this.selected.stickers.length) * (this.maxMint - this.minMint + 1)
            }
        },
        methods: {
            timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms))
            },
            loadCollections() {
                getCollections(this.$store.state.userdata.jwt, this.$store.state.category,
                    this.season, this.$store.state.userdata.id).then(res => {
                    res.data.success ? this.collectionOptions = res.data.data : this.collectionOptions = []
                })
            },
            loadCards(collection) {
                this.collection = collection.id
                let entities = collection.entities
                this.selected = {
                    cards: [],
                    stickers: []
                }
                if (entities.includes('card')) {
                    getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, this.collection).then(res => {
                        res.data.success ? this.cards = res.data.data : this.cards = []
                    })
                }
                if (entities.includes('sticker')) {
                    getStickerTemplates(this.$store.state.userdata.jwt, this.$store.state.category, this.collection).then(res => {
                        res.data.success ? this.stickers = res.data.data : this.stickers = []
                    })
                }
            },
            async startSearch() {
                this.found = []
                this.cardsFound = 0
                this.searchDone = false
                this.$bvModal.show('resultsModal')
                let page = 1
                let users = []
                while (this.cardsFound < this.totalCards && !this.searchDone) {
                    await getLeaderboard(this.$store.state.userdata.jwt, this.$store.state.category, this.collection, page).then(res => {
                        if (res.data.success && res.data.data.length > 0) {
                            users = res.data.data
                            page++
                            for (const user of users) {
                                this.checkUser(user.user)
                            }
                        } else {
                            this.searchDone = true
                        }
                    }).catch(async () => {
                        await this.timeout(60000);
                        getLeaderboard(this.$store.state.userdata.jwt, this.$store.state.category, this.collection, page).then(res => {
                            if (res.data.success && res.data.data.length > 0) {
                                users = res.data.data
                                page++
                                for (const user of users) {
                                    this.checkUser(user.user)
                                }
                            } else {
                                this.searchDone = true
                            }
                        })
                    })
                }
            },
            checkUser(user) {
                getItems(this.$store.state.userdata.jwt, this.$store.state.category, this.collection, user.id).then(res => {
                    if (res.data.success) {
                        let cards = res.data.data.cards
                        let stickers = res.data.data.stickers
                        for (const card of cards) {
                            if (this.selected.cards.includes(card.cardTemplate.id)
                                && card.mintBatch === this.mintBatch
                                && card.mintNumber >= this.minMint
                                && card.mintNumber <= this.maxMint) {
                                this.cardsFound++
                                this.found.push({
                                    mint: `${card.mintBatch}${card.mintNumber}`,
                                    name: card.cardTemplate.title,
                                    user: user.username
                                })
                            }
                        }
                        for (const sticker of stickers) {
                            if (this.selected.stickers.includes(sticker.stickerTemplate.id)
                                && sticker.mintBatch === this.mintBatch
                                && sticker.mintNumber >= this.minMint
                                && sticker.mintNumber <= this.maxMint) {
                                this.cardsFound++
                                this.found.push({
                                    mint: `${sticker.mintBatch}${sticker.mintNumber}`,
                                    name: sticker.stickerTemplate.title,
                                    user: user.username
                                })
                            }
                        }
                        if (this.cardsFound === this.totalCards) {
                            this.searchDone = true
                        }
                    }
                }).catch(async () => {
                    await this.timeout(60000);
                    getItems(this.$store.state.userdata.jwt, this.$store.state.category, this.collection, user.id).then(res => {
                        if (res.data.success) {
                            let cards = res.data.data.cards
                            let stickers = res.data.data.stickers
                            for (const card of cards) {
                                if (this.selected.cards.includes(card.cardTemplate.id)
                                    && card.mintBatch === this.mintBatch
                                    && card.mintNumber >= this.minMint
                                    && card.mintNumber <= this.maxMint) {
                                    this.cardsFound++
                                    this.found.push({
                                        mint: `${card.mintBatch}${card.mintNumber}`,
                                        name: card.cardTemplate.title,
                                        user: user.username
                                    })
                                }
                            }
                            for (const sticker of stickers) {
                                if (this.selected.stickers.includes(sticker.stickerTemplate.id)
                                    && sticker.mintBatch === this.mintBatch
                                    && sticker.mintNumber >= this.minMint
                                    && sticker.mintNumber <= this.maxMint) {
                                    this.cardsFound++
                                    this.found.push({
                                        mint: `${sticker.mintBatch}${sticker.mintNumber}`,
                                        name: sticker.stickerTemplate.title,
                                        user: user.username
                                    })
                                }
                            }
                        }
                    })
                })
            },
            selectAll() {
                this.selected = {
                    cards: [],
                    stickers: []
                }
                this.cards.forEach(card => {
                    card.selected = true
                    this.selected.cards.push(card.id)
                })
                this.stickers.forEach(sticker => {
                    sticker.selected = true
                    this.selected.stickers.push(sticker.id)
                })
                this.$forceUpdate()
            },
            deselectAll() {
                this.selected = {
                    cards: [],
                    stickers: []
                }
                this.cards.forEach(card => {
                    card.selected = false
                })
                this.stickers.forEach(sticker => {
                    sticker.selected = false
                })
                this.$forceUpdate()
            },
            selectCard(card) {
                if (card.selected) {
                    card.selected = false
                    this.selected.cards.splice(this.selected.cards.indexOf(card.id), 1)
                } else {
                    this.selected.cards.push(card.id)
                    card.selected = true
                }
                this.$forceUpdate()
            },
            selectSticker(sticker) {
                if (sticker.selected) {
                    sticker.selected = false
                    this.selected.stickers.splice(this.selected.stickers.indexOf(sticker.id), 1)
                } else {
                    this.selected.stickers.push(sticker.id)
                    sticker.selected = true
                }
                this.$forceUpdate()
            },
            resetSearch() {
                this.searchDone = true
                this.found = []
                this.cardsFound = 0
            }
        }
    }
</script>

<style scoped>

</style>