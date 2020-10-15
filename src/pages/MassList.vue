<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row class="ml-2">
            <b-col class="mb-2">
                <b-card border-variant="dark" class="mb-2">
                    <b-form inline>
                        <b-button variant="outline-dark" class="mr-2" @click="selectAll">Select all</b-button>
                        <b-button variant="outline-dark" class="mr-2" @click="deselectAll">Deselect all</b-button>
                        <b-button v-b-modal.sellModal variant="outline-success">Sell</b-button>
                    </b-form>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2">
            <b-col>
                <b-card border-variant="dark" align="left">
                    <b-form-select
                            v-model="type"
                            :options="typeOptions"
                            @change="getPacks(1)">
                        <template v-slot:first>
                            <b-form-select-option :value="null" disabled>-- Type --</b-form-select-option>
                        </template>
                    </b-form-select>
                    <CollectionSelect
                        v-if="type === 'Cards'"
                        @collectionChange="value => loadCards(value)"
                    />
                </b-card>
            </b-col>
            <b-col cols="9">
                <b-card border-variant="dark" v-if="type === 'Packs'">
                    <b-row :align-h="spinner.cardImages ? 'center' : 'start'">
                        <b-spinner v-if="spinner.cardImages"/>
                        <b-col lg="2" md="4" sm="6" v-else v-for="pack in packs" :key="pack.templateId" class="mb-3" @click="selectPack(pack)">
                            <b-card>
                                <b-badge>x{{pack.count}}</b-badge>
                                <b-card-img :src="pack.templateImage"/>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
                <b-card border-variant="dark" v-else>
                    <b-row :align-h="spinner.cardImages ? 'center' : 'start'">
                        <b-spinner v-if="spinner.cardImages"/>
                        <b-row v-else align-h="start">
                            <b-col lg="2" md="4" sm="6" v-for="card in cards" :key="card.id" class="mb-3">
                                <b-card @click="selectItem(card, 'card')" no-body>
                                    <Checkmark v-if="card.selected" style="position: absolute;"/>
                                    <b-badge variant="info">{{card.amount}}x</b-badge>
                                    <b-card-img :src="card.images['size402']"/>
                                </b-card>
                            </b-col>
                            <b-col lg="2" md="4" sm="6" v-for="sticker in stickers" :key="sticker.id" class="mb-3">
                                <b-card @click="selectItem(sticker, 'sticker')" no-body>
                                    <Checkmark v-if="sticker.selected" style="position: absolute;"/>
                                    <b-badge variant="info">{{sticker.amount}}x</b-badge>
                                    <b-card-img :src="`${$store.state.cdnUrl}${sticker.images[1].url}`"/>
                                </b-card>
                            </b-col>
                        </b-row>
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
        </b-row>

        <b-modal id="progressModal" :title="spinner.selling ? 'Selling in progress...' : 'Done!'" hide-footer>
            <b-progress :value="itemsSold" :max="totalItems" show-progress/>
        </b-modal>

        <SellModal
            id="sellModal"
            :selected="selected"
            @hide="$bvModal.hide('sellModal')"
        />
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import axios from "axios";
    import CollectionSelect from "@/components/CollectionSelect";
    import Checkmark from "@/components/Checkmark";
    import {getCardsByTemplate, getCardTemplates, getStickersByTemplate, getStickerTemplates} from "@/api";
    import SellModal from "@/components/SellModal";

    export default {
        name: "MassList",
        components: {SellModal, CollectionSelect, Sidebar, Checkmark},
        data() {
            return {
                season: null,
                type: null,
                typeOptions: [
                    {text: 'Cards / Stickers', value: 'Cards', disabled: false},
                    'Packs'
                ],
                collection: [],
                collectionOptions: [],
                cards: [],
                stickers: [],
                packs: [],
                selected: {
                    packs: [],
                    cards: [],
                    stickers: []
                },
                spinner: {
                    cardImages: false,
                    collections: false,
                    selling: false
                },
                packSellOptions: ['newest', 'oldest'],
                packSellType: ['newest'],
                itemsSold: 0
            }
        },
        computed: {
            totalItems() {
                // let total = 0
                // this.selected.forEach(template => {
                //     total += template.sellCount
                // })
                return 0;
            }
        },
        methods: {
            getPacks(page) {
                this.spinner.cardImages = true
                if (page === 1) {
                    this.packs = []
                }
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
                    let template = sorted.find(s => {return s.templateId === pack['packTemplate'].id})
                    if (template) {
                        template.packs.push({
                            id: pack.id,
                            created: new Date(pack.created)
                        })
                        template.count++
                    } else {
                        sorted.push({
                            disabled: false,
                            templateId: pack['packTemplate'].id,
                            templateImage: `https://cdn.epics.gg${pack['packTemplate'].images[0].url}`,
                            name: pack['packTemplate'].name,
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
            async loadCards(coll) {
                this.collection = coll
                this.spinner.cardImages = true
                let entities = coll.entities
                this.selected = {
                    packs: [],
                    cards: [],
                    stickers: []
                }
                this.cards = []
                this.stickers = []
                let promises = []
                if (entities.includes('card')) {
                    await getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, this.collection.id).then(res => {
                        res.data.success ? this.cards = res.data.data : this.cards = []
                    })
                    for (let card of this.cards) {
                        promises.push(getCardsByTemplate(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id, card.id).then(res => {
                            if (res.data.success && res.data.data.length > 0) {
                                card.amount = res.data.data.length
                                card.items = res.data.data.sort((a,b) => {
                                    if (a.mintBatch === b.mintBatch)
                                        return b.mintNumber - a.mintNumber
                                    else
                                        return b.mintBatch.localeCompare(a.mintBatch)
                                })
                                card.selected = false
                            } else {
                                this.cards.splice(this.cards.indexOf(card), 1)
                            }
                        }))
                    }
                    this.cards.sort((a,b) => {
                        return a.id - b.id
                    })
                }
                if (entities.includes('sticker')) {
                    await getStickerTemplates(this.$store.state.userdata.jwt, this.$store.state.category, this.collection.id).then(res => {
                        res.data.success ? this.stickers = res.data.data : this.stickers = []
                    })
                    for (let sticker of this.stickers) {
                        promises.push(getStickersByTemplate(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id, sticker.id).then(res => {
                            if (res.data.success && res.data.data.length > 0) {
                                sticker.amount = res.data.data.length
                                sticker.items = res.data.data.sort((a,b) => {
                                    if (a.mintBatch === b.mintBatch)
                                        return b.mintNumber - a.mintNumber
                                    else
                                        return b.mintBatch.localeCompare(a.mintBatch)
                                })
                                sticker.selected = false
                            } else {
                                this.stickers.splice(this.stickers.indexOf(sticker), 1)
                            }
                        }))
                    }
                    this.stickers.sort((a,b) => {
                        return a.id - b.id
                    })
                }
                Promise.all(promises).then(() => {this.spinner.cardImages = false})
            },
            selectAll() {
                if (this.type === "Packs") {
                    this.packs.forEach(pack => {
                        if (!pack.selected)
                            this.selectPack(pack)
                    })
                } else {
                    this.cards.forEach(card => {
                        if (!card.selected)
                            this.selectItem(card, "card")
                    })
                    this.stickers.forEach(sticker => {
                        if (!sticker.selected)
                            this.selectItem(sticker, "sticker")
                    })
                }
            },
            deselectAll() {
                if (this.type === "Packs") {
                    this.selected.packs.forEach(pack => {
                        pack.selected = false
                    })
                    this.selected.packs = []
                } else {
                    this.cards.forEach(card => {
                        card.selected = false
                    })
                    this.selected.cards = []

                    this.stickers.forEach(sticker => {
                        sticker.selected = false
                    })
                    this.selected.stickers = []
                }
                this.$forceUpdate();
            },
            selectItem(item, type) {
                let obj = {
                    name: item.title,
                    items: item.items,
                    max: item.amount,
                    templateId: item.id,
                    amount: 1
                }
                item.selected = !item.selected
                switch (type) {
                    case "card":
                        if (item.selected)
                            this.selected.cards.push(obj)
                        else
                            this.selected.cards.splice(this.selected.cards.indexOf(item), 1)
                        break;
                    case "sticker":
                        if (item.selected)
                            this.selected.stickers.push(obj)
                        else
                            this.selected.stickers.splice(this.selected.stickers.indexOf(item), 1)
                        break;
                }
                this.$forceUpdate();
            },
            selectPack(pack) {
                if (!pack.disabled) {
                    this.selected.push(pack)
                    pack.disabled = true
                }
            },
            sellPacks() {
                this.itemsSold = 0
                this.spinner.selling = true
                this.$bvModal.show('progressModal')
                if (this.packSellType === 'newest') {
                    this.selected.forEach(async template => {
                        for (let i = 0; i < template.sellCount; i++) {
                            let pack = template.packs[i]
                            await this.sellItem(pack.id, 'pack', template.price, null)
                            this.itemsSold += 1
                        }
                    })
                } else {
                    this.selected.forEach(async template => {
                        for (let i = template.count - 1; i > (template.count - template.sellCount); i--) {
                            let pack = template.packs[i]
                            await this.sellItem(pack.id, 'pack', template.price, null)
                            this.itemsSold++
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