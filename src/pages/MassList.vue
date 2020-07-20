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
                    <b-form-select v-model="season" :options="$store.state.seasons" @change="getCollections"/>
                    <b-spinner class="mt-2" v-if="spinner.collections"/>
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
                    <b-row>
                        <b-col :cols="card.showMints ? 6 : 3" v-for="card in cards" :key="card.templateId" class="mb-3">
                            <b-spinner v-if="spinner.cardImages"/>
                            <b-card style="max-height: 300px" >
                                <b-row>
                                    <b-col>
                                        <b-card-img :src="card.templateImage" @click="showMints(card)"/>
                                    </b-col>

                                    <b-col  v-show="card.showMints">
                                        <b-list-group>
                                            <b-list-group-item v-for="c in card.cards" :key="c.id">
                                                {{c.mintBatch}}{{c.mintNumber}}
                                            </b-list-group-item>
                                        </b-list-group>
                                    </b-col>
                                </b-row>

                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
            <b-col cols="2" class="mr-2">
                <b-card border-variant="dark"></b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import axios from "axios";

    export default {
        name: "MassList",
        components: {Sidebar},
        data() {
            return {
                season: null,
                collection: [],
                collectionOptions: [],
                cards: [],
                spinner: {
                    cardImages: false,
                    collections: false
                }
            }
        },
        methods: {
            getCollections() {
                this.collectionOptions = []
                this.spinner.collections = true
                axios("https://api.epics.gg/api/v1/collections/users/32876/user-summary", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-jwt': this.$store.state.userdata.jwt
                    },
                    params: {
                        'categoryId': this.$store.state.category,
                        'seasons': this.season
                    }
                }).then(res => {
                    if (res.data.success) {
                        res.data.data.forEach(arr => {
                            this.collectionOptions = this.collectionOptions.concat(arr)
                        })
                        this.spinner.collections = false
                    }
                })
            },
            loadCards() {
                this.cards = []
                this.spinner.cardImages = true
                axios(`https://api.epics.gg/api/v1/collections/${this.collection}/users/${this.$store.state.userdata.id}/owned2`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-jwt': this.$store.state.userdata.jwt
                    },
                    params: {
                        'categoryId': this.$store.state.category
                    }
                }).then(res => {
                    if (res.data.success) {
                        res.data.data.cards.forEach(arr => {
                            this.cards = this.cards.concat(arr)
                        })
                        this.sortByTemplate()
                    }
                })
            },
            sortByTemplate() {
                let sorted = []
                this.cards.forEach(card => {
                    let template = sorted.find(s => {return s.templateId === card.cardTemplate.id})
                    if (template) {
                        template.cards.push({
                            id: card.id,
                            image: card.images.size402,
                            mintBatch: card.mintBatch,
                            mintNumber: card.mintNumber
                        })
                    } else {
                        sorted.push({
                            templateId: card.cardTemplate.id,
                            templateImage: card.cardTemplate.images.size402,
                            cards: [{
                                id: card.id,
                                image: card.images.size402,
                                mintBatch: card.mintBatch,
                                mintNumber: card.mintNumber
                            }],
                            showMints: false
                        })
                    }
                })
                this.cards = sorted
                this.spinner.cardImages = false
            },
            showMints(card) {
                card.showMints = !card.showMints
            }
        }
    }
</script>

<style scoped>

</style>