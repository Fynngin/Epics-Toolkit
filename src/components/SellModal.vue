<template>
    <b-modal id="sellModal" title="Sell items">
        <b-button v-if="!sellingDone" variant="outline-dark" class="mb-2" v-b-toggle.setCollapse>
            <font-awesome-icon class="when-opened" icon="angle-down"/>
            <font-awesome-icon class="when-closed" icon="angle-right"/>
            Sell sets
        </b-button>
        <b-collapse v-if="!sellingDone" id="setCollapse">
            <b-form-input
                id="setRange"
                v-model="sets"
                type="range"
                min="0"
                :max="maxSets"
                @input="selectSets"
            ></b-form-input>
            <p>Amount: {{ sets }} {{sets == 1 ? 'set' : 'sets'}}</p>
        </b-collapse>

        <b-list-group v-if="!sellingDone" style="max-height: 300px; overflow: scroll;">
            <b-list-group-item v-for="card in selected.cards" :key="card.templateId">
                <p class="font-weight-bold" style="display: inline;">{{card.name}}</p>
                <b-badge v-if="card.marketPrice" style="float: right;" variant="success">Price: {{card.marketPrice}}</b-badge>
                <b-input-group prepend="Amount" :append="`max: ${card.max}`">
                    <b-form-input type="number" :max="card.max" min="0" v-model="card.amount"/>
                </b-input-group>
                <b-button v-b-toggle="`collapse-${card.templateId}`" variant="outline-dark" class="mt-2" size="sm">Show mints</b-button>
                <span>
                    <b-spinner v-if="sellingSpinner.includes(card.templateId)" class="mt-2" style="float: right"/>
                    <font-awesome-icon v-else-if="sellingInProgress" icon="check-circle" class="mt-2" style="float: right; color: forestgreen" size="lg"/>
                </span>
                <b-collapse :id="`collapse-${card.templateId}`">
                    <p>
                        <span v-for="i in parseInt(card.amount)" :key="i">
                            {{card.items[i-1].mintBatch}}{{card.items[i-1].mintNumber}}
                            <span v-if="i < card.amount">,</span>
                        </span>
                    </p>
                </b-collapse>
            </b-list-group-item>
            <b-list-group-item v-for="sticker in selected.stickers" :key="sticker.id">
                <p class="font-weight-bold" style="display: inline;">{{sticker.name}}</p>
                <b-badge v-if="sticker.marketPrice" style="float: right;" variant="success">Price: {{sticker.marketPrice}}</b-badge>
                <b-input-group prepend="Amount" :append="`max: ${sticker.max}`">
                    <b-form-input type="number" v-model="sticker.amount" :max="sticker.max" min="0"/>
                </b-input-group>
                <b-button v-b-toggle="`collapse-${sticker.templateId}`" variant="outline-dark" class="mt-2" size="sm">Show mints</b-button>
                <span>
                    <b-spinner v-if="sellingSpinner.includes(sticker.templateId)" class="mt-2" style="float: right"/>
                    <font-awesome-icon v-else-if="sellingInProgress" icon="check-circle" class="mt-2" style="float: right; color: forestgreen" size="lg"/>
                </span>
                <b-collapse :id="`collapse-${sticker.templateId}`">
                    <p>
                        <span v-for="i in parseInt(sticker.amount)" :key="i">
                            {{sticker.items[i-1].mintBatch}}{{sticker.items[i-1].mintNumber}}
                            <span v-if="i < sticker.amount">,</span>
                        </span>
                    </p>
                </b-collapse>
            </b-list-group-item>

            <b-list-group-item v-for="pack in selected.packs" :key="pack.id">
                <p class="font-weight-bold" style="display: inline;">{{pack.name}}</p>
                <b-badge v-if="pack.marketPrice" style="float: right;" variant="success">Price: {{pack.marketPrice}}</b-badge>
                <b-input-group prepend="Amount" :append="`max: ${pack.max}`">
                    <b-form-input type="number" v-model="pack.amount" :max="pack.max" min="0"/>
                </b-input-group>
                <span>
                    <b-spinner v-if="sellingSpinner.includes(pack.templateId)" class="mt-2" style="float: right"/>
                    <font-awesome-icon v-else-if="sellingInProgress" icon="check-circle" class="mt-2" style="float: right; color: forestgreen" size="lg"/>
                </span>
            </b-list-group-item>
        </b-list-group>

        <i v-if="showPriceWarning && !sellingDone" class="mt-2">
            Prices shown above are 1c below the current lowest market listing.
        </i>
        <p class="mt-2" v-if="!sellingDone">
            Clicking "Sell" will start the listing process.
        </p>

        <h2 v-if="sellingDone">
            Successfully listed {{itemsSold}} items!
        </h2>

        <template v-slot:modal-footer>
            <b-button v-if="!sellingDone" variant="outline-dark" @click="getLowestPrices">
                <b-spinner v-if="showPriceSpinner"/>
                <span v-else>
                    Show prices
                </span>
            </b-button>
            <b-button v-if="!sellingDone" variant="outline-success" @click="sellItems">Sell</b-button>
            <b-button v-if="sellingDone" variant="primary" @click="$emit('hide')">Done</b-button>
        </template>
    </b-modal>
</template>

<script>
import {getMarketListings, listItem} from "@/api";

export default {
    name: "SellModal",
    props: ['selected'],
    data() {
        return {
            sets: 1,
            showPriceWarning: false,
            showPriceSpinner: false,
            sellingInProgress: false,
            sellingDone: false,
            sellingSpinner: [],
            itemsSold: 0
        }
    },
    computed: {
        maxSets() {
            let temp = this.selected.cards.concat(this.selected.stickers).concat(this.selected.packs).map(el => el.max)
            return temp.reduce((a, b) => {
                return Math.min(a, b)
            }, temp[0])
        }
    },
    methods: {
        selectSets() {
            this.selected.cards.forEach(card => card.amount = this.sets)
            this.selected.stickers.forEach(sticker => sticker.amount = this.sets)
            this.selected.packs.forEach(pack => pack.amount = this.sets)
        },
        getLowestPrices() {
            this.showPriceSpinner = true
            let promises = []
            this.selected.cards.forEach(card => {
                promises.push(getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, card.templateId, "card", 1).then(res => {
                    if (res.data.success)
                        if (res.data.data.total > 0)
                            card.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                }))
            })
            this.selected.stickers.forEach(sticker => {
                promises.push(getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, sticker.templateId, "sticker", 1).then(res => {
                    if (res.data.success)
                        if (res.data.data.total > 0)
                            sticker.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                }))
            })
            this.selected.packs.forEach(pack => {
                promises.push(getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, pack.templateId, "pack", 1).then(res => {
                    if (res.data.success)
                        if (res.data.data.total > 0)
                            pack.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                }))
            })
            Promise.all(promises).then(() => {
                this.showPriceWarning = true
                this.showPriceSpinner = false
                this.$forceUpdate()
            })
        },
        async sellItems() {
            this.sellingInProgress = true
            this.sellingDone = false
            this.itemsSold = 0
            this.sellingSpinner = this.selected.cards.map(el => el.templateId)
            for (let card of this.selected.cards) {
                let promises = []
                for (let i = 0; i < card.amount; i++) {
                    let item = card.items[i]
                    if (!card.marketPrice) {
                        await getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, card.templateId, "card", 1).then(res => {
                            if (res.data.success)
                                if (res.data.data.total > 0)
                                    card.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                        })
                    }
                    promises.push(listItem(this.$store.state.userdata.jwt, this.$store.state.category, item.id, null, card.marketPrice, "card").then(() => {
                        this.itemsSold++
                    }))
                }
                Promise.all(promises).then(() => {
                    this.sellingSpinner.splice(this.sellingSpinner.indexOf(card.templateId), 1)
                    if (this.sellingSpinner.length === 0) {
                        this.sellingInProgress = false
                        this.sellingDone = true
                    }
                })
            }
            for (let sticker of this.selected.stickers) {
                let promises = []
                for (let i = 0; i < sticker.amount; i++) {
                    let item = sticker.items[i]
                    if (!sticker.marketPrice) {
                        await getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, sticker.templateId, "sticker", 1).then(res => {
                            if (res.data.success)
                                if (res.data.data.total > 0)
                                    sticker.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                        })
                    }
                    promises.push(listItem(this.$store.state.userdata.jwt, this.$store.state.category, item.id, null, sticker.marketPrice, "sticker").then(() => {
                        this.itemsSold++
                    }))
                }
                Promise.all(promises).then(() => {
                    this.sellingSpinner.splice(this.sellingSpinner.indexOf(sticker.templateId), 1)
                    if (this.sellingSpinner.length === 0) {
                        this.sellingInProgress = false
                        this.sellingDone = true
                    }
                })
            }
            for (let pack of this.selected.packs) {
                let promises = []
                for (let i = 0; i < pack.amount; i++) {
                    let item = pack.items[i]
                    if (!pack.marketPrice) {
                        await getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, pack.templateId, "pack", 1).then(res => {
                            if (res.data.success)
                                if (res.data.data.total > 0)
                                    pack.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                        })
                    }
                    promises.push(listItem(this.$store.state.userdata.jwt, this.$store.state.category, item.id, null, pack.marketPrice, "pack").then(() => {
                        this.itemsSold++
                    }))
                }
                Promise.all(promises).then(() => {
                    this.sellingSpinner.splice(this.sellingSpinner.indexOf(pack.templateId), 1)
                    if (this.sellingSpinner.length === 0) {
                        this.sellingInProgress = false
                        this.sellingDone = true
                    }
                })
            }
        }
    }
}
</script>

<style scoped>
    .collapsed > .when-opened,
    :not(.collapsed) > .when-closed {
        display: none;
    }
</style>