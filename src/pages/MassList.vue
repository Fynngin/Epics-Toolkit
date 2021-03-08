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
                        <b-button v-b-modal.sellModal variant="outline-success" class="mr-2">Sell</b-button>
                        <b-button v-b-modal.updateModal variant="outline-success" class="mr-2">Update Listings</b-button>
                        <b-button v-b-modal.removeModal variant="outline-danger">Remove all Listings</b-button>
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
                        <b-col lg="2" md="4" sm="6" v-else v-for="pack in packs" :key="pack.templateId" class="mb-3">
                            <b-card @click="selectItem(pack, 'pack')" no-body>
                                <Checkmark v-if="pack.selected" style="position: absolute;"/>
                                <b-badge variant="info">x{{pack.max}}</b-badge>
                                <b-card-img :src="pack.templateImage"/>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
                <b-card border-variant="dark" v-else>
                    <b-row :align-h="spinner.cardImages ? 'center' : 'start'">
                        <b-spinner v-if="spinner.cardImages"/>
                        <b-row v-else align-h="start">
                            <b-col lg="2" md="4" sm="6" v-for="card in cards" :key="card.templateId" class="mb-3">
                                <b-card @click="selectItem(card, 'card')" no-body>
                                    <Checkmark v-if="card.selected" style="position: absolute;"/>
                                    <b-badge variant="info">{{card.max}}x</b-badge>
                                    <b-card-img :src="card.images['size402']"/>
                                </b-card>
                            </b-col>
                            <b-col lg="2" md="4" sm="6" v-for="sticker in stickers" :key="sticker.templateId" class="mb-3">
                                <b-card @click="selectItem(sticker, 'sticker')" no-body>
                                    <Checkmark v-if="sticker.selected" style="position: absolute;"/>
                                    <b-badge variant="info">{{sticker.max}}x</b-badge>
                                    <b-card-img :src="`${$store.state.cdnUrl}${sticker.images[1].url}`"/>
                                </b-card>
                            </b-col>
                        </b-row>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <SellModal
            id="sellModal"
            :selected="selected"
            @saleDone="reloadItems"
        />
        <UpdateModal
            id="updateModal"
        />
        <RemoveModal
            id="removeModal"
        />
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import CollectionSelect from "@/components/CollectionSelect";
    import Checkmark from "@/components/Checkmark";
    import {
        getCardsByTemplate,
        getCardTemplates,
        getStickersByTemplate,
        getStickerTemplates,
        getUserPacks
    } from "@/api";
    import SellModal from "@/components/SellModal";
    import UpdateModal from "@/components/UpdateModal";
    import RemoveModal from "@/components/MassList/RemoveModal";

    export default {
        name: "MassList",
        components: {RemoveModal, UpdateModal, SellModal, CollectionSelect, Sidebar, Checkmark},
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
        methods: {
            reloadItems() {
                this.$bvModal.hide('sellModal')
                if (this.type === 'Packs')
                    this.getPacks(1)
                else
                    this.loadCards(this.collection)
            },
            getPacks(page) {
                this.spinner.cardImages = true
                if (page === 1) {
                    this.packs = []
                    this.selected = {
                        packs: [],
                        cards: [],
                        stickers: []
                    }
                }
                if (this.type === 'Packs') {
                    getUserPacks(this.$store.state.userdata.jwt, this.$store.state.category, page).then(res => {
                        if (res.data.success) {
                            if (res.data.data.count > 0) {
                                this.packs = this.packs.concat(res.data.data.packs)
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
                        template.items.push({
                            id: pack.id,
                            created: new Date(pack.created)
                        })
                        template.max++
                    } else {
                        sorted.push({
                            selected: false,
                            templateId: pack['packTemplate'].id,
                            templateImage: `https://cdn.epics.gg${pack['packTemplate'].images[0].url}`,
                            name: pack['packTemplate'].name,
                            max: 1,
                            amount: 1,
                            items: [{
                                id: pack.id,
                                created: new Date(pack.created)
                            }],
                        })
                    }
                })
                this.packs = sorted
                this.packs.forEach(template => {
                    template.items.sort((a,b) => {
                        return b.created - a.created    //newest first
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
                        if (res.data.success) {
                            this.cards = res.data.data.map(it => {
                                return {
                                    templateId: it.id,
                                    images: it.images,
                                    name: it.title,
                                    amount: 1
                                }
                            })
                        } else {
                            this.cards = []
                        }
                    })
                    for (let card of this.cards) {
                        promises.push(getCardsByTemplate(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id, card.templateId).then(res => {
                            if (res.data.success && res.data.data.length > 0) {
                                card.items = res.data.data.sort((a,b) => {
                                    if (a.mintBatch === b.mintBatch)
                                        return b.mintNumber - a.mintNumber
                                    else
                                        return b.mintBatch.localeCompare(a.mintBatch)
                                }).filter(it => !it['isMarketList'] && !it['signatureImage']).map(it => {
                                    return {
                                        mintBatch: it.mintBatch,
                                        mintNumber: it.mintNumber,
                                        id: it.id
                                    }
                                })
                                card.max = card.items.length
                                card.selected = false
                                if (card.max === 0) {
                                    this.cards.splice(this.cards.indexOf(card), 1)
                                }
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
                        if (res.data.success) {
                            this.stickers = res.data.data.map(it => {
                                return {
                                    templateId: it.id,
                                    images: it.images,
                                    name: it.title,
                                    amount: 1
                                }
                            })
                        } else {
                            this.stickers = []
                        }
                    })
                    for (let sticker of this.stickers) {
                        promises.push(getStickersByTemplate(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id, sticker.templateId).then(res => {
                            if (res.data.success && res.data.data.length > 0) {
                                sticker.max = res.data.data.length
                                sticker.items = res.data.data.sort((a,b) => {
                                    if (a.mintBatch === b.mintBatch)
                                        return b.mintNumber - a.mintNumber
                                    else
                                        return b.mintBatch.localeCompare(a.mintBatch)
                                }).map(it => {
                                    return {
                                        mintBatch: it.mintBatch,
                                        mintNumber: it.mintNumber,
                                        id: it.id
                                    }
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
                            this.selectItem(pack, "pack")
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
                item.selected = !item.selected
                if (item.selected)
                    this.selected[type+'s'].push(item)
                else {
                    let idx = this.selected[type+'s'].indexOf(this.selected[type+'s'].find(el => el.templateId === item.templateId))
                    this.selected[type+'s'].splice(idx, 1)
                }
                this.$forceUpdate();
            }
        }
    }
</script>

<style scoped>

</style>