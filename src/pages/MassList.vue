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
                    <b-form-select v-model="type" :options="typeOptions" @change="getPacks(1)"/>
                    <b-form-select
                            class="mt-2"
                            v-if="type === 'Cards'"
                            v-model="season"
                            :options="$store.state.seasons"
                            @change="getCollections"/>
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
            <b-col cols="8" v-if="type === 'Packs'">
                <b-card border-variant="dark">
                    <b-row :align-h="spinner.cardImages ? 'center' : 'start'">
                        <b-spinner v-if="spinner.cardImages"/>
                        <b-col cols="3" v-else v-for="pack in packs" :key="pack.templateId" class="mb-3" @click="selectPack(pack)">
                            <b-card>
                                <b-badge>x{{pack.count}}</b-badge>
                                <b-card-img :src="pack.templateImage"/>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
            <b-col cols="8" v-else>
                <b-card border-variant="dark">
                    <b-row :align-h="spinner.cardImages ? 'center' : 'start'">
                        <b-spinner v-if="spinner.cardImages"/>
                        <b-col :cols="card.showMints ? 6 : 3" v-for="card in cards" :key="card.templateId" class="mb-3">
                            <b-card>
                                <b-row>
                                    <b-col>
                                        <b-card-img :src="card.templateImage" @click="showMints(card)"/>
                                    </b-col>

                                    <b-col v-show="card.showMints">
                                        <select v-model="selected" style="overflow:scroll;" multiple class="w-100 h-100">
                                            <option :id="`list_card_${c.id}`" v-for="c in card.cards" :key="c.id" :value="c">
                                                {{c.mintBatch}}{{c.mintNumber}}
                                            </option>
                                        </select>
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
            <b-col v-if="type === 'Packs'" cols="2" class="mr-2">
                <b-card border-variant="dark">
                    <b-card v-for="pack in selected" :key="pack.templateId">
                        <span class="font-weight-bold">
                            {{pack.name}}
                        </span>
                        <b-form-group label="Amount: ">
                            <b-form-input v-model="pack.sellCount" number></b-form-input>
                        </b-form-group>
                        <b-form-group label="Price: ">
                            <b-form-input v-model="pack.price" number></b-form-input>
                        </b-form-group>

                    </b-card>
                </b-card>
                <b-card v-if="selected.length > 0">
                    <b-form-radio-group v-model="packSellType" :options="packSellOptions"/>
                    <b-button variant="primary" @click="sellPacks">
                        <b-spinner v-if="spinner.selling === true"/>
                        <span v-else>Sell</span>
                    </b-button>
                </b-card>
            </b-col>
            <b-col v-else cols="2" class="mr-2">
                <b-card border-variant="dark">
                    <b-card v-for="card in selected" :key="card.id">
                        <p class="font-weight-bold">{{`${card.mintBatch}${card.mintNumber}`}}</p>
                        <span>
                            {{card.name}}
                        </span>
                    </b-card>
                </b-card>
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
                type: null,
                typeOptions: [
                    'Cards',
                    'Packs'
                ],
                collection: [],
                collectionOptions: [],
                cards: [],
                packs: [],
                selected: [],
                spinner: {
                    cardImages: false,
                    collections: false,
                    selling: false
                },
                packSellOptions: ['newest', 'oldest'],
                packSellType: ['newest']
            }
        },
        methods: {
            getPacks(page) {
                this.spinner.cardImages = true
                if (this.type === 'Packs') {
                    axios("https://api.epics.gg/api/v1/packs/user", {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-jwt': this.$store.state.userdata.jwt
                        },
                        params: {
                            'categoryId': this.category,
                            page: page
                        }
                    }).then(response => {
                        if (response.data.success) {
                            if (response.data.data.count > 0) {
                                this.packs = this.packs.concat(response.data.data.packs)
                                this.getPacks(++page)
                            } else {
                                this.sortPacks();
                            }
                        }
                    })
                }
            },
            sortPacks() {
                let sorted = []
                this.packs.forEach(pack => {
                    let template = sorted.find(s => {return s.templateId === pack.packTemplate.id})
                    if (template) {
                        template.packs.push({
                            id: pack.id,
                            created: new Date(pack.created)
                        })
                        template.count++
                    } else {
                        sorted.push({
                            disabled: false,
                            templateId: pack.packTemplate.id,
                            templateImage: `http://cdn.epics.gg${pack.packTemplate.images[0].url}`,
                            name: pack.packTemplate.name,
                            count: 1,
                            sellCount: 0,
                            price: 1,
                            packs: [{
                                id: pack.id,
                                created: new Date(pack.created)
                            }],
                        })
                    }
                })
                this.packs = sorted
                this.packs.forEach(template => {
                    template.packs.sort((a,b) => {
                        return b.created - a.created    //oldest first
                    })
                })
                this.spinner.cardImages = false
            },
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
                            name: card.cardTemplate.title,
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
                                name: card.cardTemplate.title,
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
            },
            selectPack(pack) {
                if (!pack.disabled) {
                    this.selected.push(pack)
                    pack.disabled = true
                }
            },
            sellPacks() {
                this.spinner.selling = true
                if (this.packSellType === 'newest') {
                    this.selected.forEach(async template => {
                        for (let i = 0; i <= template.sellCount; i++) {
                            let pack = template.packs[i]
                            await this.sellItem(pack.id, 'pack', template.price, null)
                        }
                    })
                } else {
                    this.selected.forEach(template => {
                        for (let i = template.count - 1; i >= (template.count - template.sellCount); i--) {
                            let pack = template.packs[i]
                            this.sellItem(pack.id, 'pack', template.price, null)
                        }
                    })
                }
                this.spinner.selling = false
            },
            async sellItem(id, type, price, minOffer) {
                await axios("https://api.epics.gg/api/v1/market/list", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-jwt': this.$store.state.userdata.jwt
                    },
                    params: {
                        'categoryId': this.$store.state.category
                    },
                    data: {
                        'id': id,
                        'minOffer': minOffer,
                        'price': price,
                        'type': type
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>