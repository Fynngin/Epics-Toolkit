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
                <b-progress
                    v-if="sellingInProgress && itemsSold.cards[card.templateId]"
                    class="mt-2"
                    :value="itemsSold.cards[card.templateId].success"
                    :max="card.amount"
                    animated
                    :variant="(itemsSold.cards[card.templateId].success + itemsSold.cards[card.templateId].err) < card.amount ? 'primary' : (itemsSold.cards[card.templateId].err > 0) ? 'danger' : 'success'"
                />
                <b-button v-b-toggle="`collapse-${card.templateId}`" variant="outline-dark" class="mt-2" size="sm">Show mints</b-button>
                <span>
                    <b-spinner v-if="sellingSpinner.includes(card.templateId)" class="mt-2" style="float: right"/>
                    <font-awesome-icon v-else-if="sellingInProgress && itemsSold.cards[card.templateId].err === 0" icon="check-circle" class="mt-2" style="float: right; color: forestgreen" size="lg"/>
                    <font-awesome-icon v-else-if="sellingInProgress" icon="times-circle" class="mt-2" style="float: right; color: red" size="lg"/>
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
            <b-list-group-item v-for="sticker in selected.stickers" :key="sticker.templateId">
                <p class="font-weight-bold" style="display: inline;">{{sticker.name}}</p>
                <b-badge v-if="sticker.marketPrice" style="float: right;" variant="success">Price: {{sticker.marketPrice}}</b-badge>
                <b-input-group prepend="Amount" :append="`max: ${sticker.max}`">
                    <b-form-input type="number" v-model="sticker.amount" :max="sticker.max" min="0"/>
                </b-input-group>
                <b-progress
                    v-if="sellingInProgress && itemsSold.stickers[sticker.templateId]"
                    class="mt-2"
                    :value="itemsSold.stickers[sticker.templateId].success"
                    :max="sticker.amount"
                    animated
                    :variant="(itemsSold.stickers[sticker.templateId].success + itemsSold.stickers[sticker.templateId].err) < sticker.amount ? 'primary' : (itemsSold.stickers[sticker.templateId].err > 0) ? 'danger' : 'success'"
                />
                <b-button v-b-toggle="`collapse-${sticker.templateId}`" variant="outline-dark" class="mt-2" size="sm">Show mints</b-button>
                <span>
                    <b-spinner v-if="sellingSpinner.includes(sticker.templateId)" class="mt-2" style="float: right"/>
                    <font-awesome-icon v-else-if="sellingInProgress && itemsSold.stickers[sticker.templateId].err === 0" icon="check-circle" class="mt-2" style="float: right; color: forestgreen" size="lg"/>
                    <font-awesome-icon v-else-if="sellingInProgress" icon="times-circle" class="mt-2" style="float: right; color: red" size="lg"/>
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
                <b-progress
                    v-if="sellingInProgress && itemsSold.packs[pack.templateId]"
                    class="mt-2"
                    :value="itemsSold.packs[pack.templateId].success"
                    :max="pack.amount"
                    animated
                    :variant="(itemsSold.packs[pack.templateId].success + itemsSold.packs[pack.templateId].err) < pack.amount ? 'primary' : (itemsSold.packs[pack.templateId].err > 0) ? 'danger' : 'success'"
                />
                <span>
                    <b-spinner v-if="sellingSpinner.includes(pack.templateId)" class="mt-2" style="float: right"/>
                    <font-awesome-icon v-else-if="sellingInProgress && itemsSold.packs[pack.templateId].err === 0" icon="check-circle" class="mt-2" style="float: right; color: forestgreen" size="lg"/>
                    <font-awesome-icon v-else-if="sellingInProgress" icon="times-circle" class="mt-2" style="float: right; color: red" size="lg"/>
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
            Successfully listed {{totalSuccess}} items!
        </h2>
        <h2 v-if="sellingDone && totalError > 0">
            Failed to list {{totalError}} items!
        </h2>

        <template v-slot:modal-footer>
            <b-button v-if="!sellingDone" variant="outline-dark" @click="getLowestPrices">
                <b-spinner v-if="showPriceSpinner"/>
                <span v-else>
                    Show prices
                </span>
            </b-button>
            <b-button v-if="!sellingDone" variant="outline-success" @click="sellItems">Sell</b-button>
            <b-button v-if="sellingDone" variant="primary" @click="$emit('saleDone')">Done</b-button>
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
            itemsSold: {
                cards: {},
                stickers: {},
                packs: {}
            },
            totalSuccess: 0,
            totalError: 0,
            types: ['cards', 'stickers', 'packs']
        }
    },
    mounted() {
        this.$root.$on('bv::modal::show', () => {
            this.reset()
        })
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
        reset() {
            this.sets = 1
            this.showPriceWarning = false
            this.showPriceSpinner = false
            this.sellingInProgress = false
            this.sellingDone = false
            this.itemsSold = {
                cards: {},
                stickers: {},
                packs: {}
            }
            this.totalError = 0
            this.totalSuccess = 0
        },
        selectSets() {
            this.selected.cards.forEach(card => card.amount = this.sets)
            this.selected.stickers.forEach(sticker => sticker.amount = this.sets)
            this.selected.packs.forEach(pack => pack.amount = this.sets)
        },
        getLowestPrices() {
            this.showPriceSpinner = true
            let promises = []
            this.types.forEach(type => {
                this.selected[type].forEach(item => {
                    let itemType = type.substring(0, type.length - 1);
                    promises.push(getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, item.templateId, itemType, 1).then(res => {
                        if (res.data.success)
                            if (res.data.data.total > 0)
                                item.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                    }))
                })
            })
            Promise.all(promises).then(() => {
                this.showPriceWarning = true
                this.showPriceSpinner = false
                this.$forceUpdate()
            })
        },
        async sellItems() {
            this.totalError = 0
            this.totalSuccess = 0
            this.sellingInProgress = true
            this.sellingDone = false
            this.itemsSold = {
                cards: {},
                stickers: {},
                packs: {}
            }

            for (const type of this.types) {
                let itemType = type.substring(0, type.length - 1);
                this.sellingSpinner = this.selected[type].map(el => el.templateId)
                for (let item of this.selected[type]) {
                    let promises = []
                    this.itemsSold[type][item.templateId] = {
                        success: 0,
                        err: 0
                    }
                    for (let i = 0; i < item.amount; i++) {
                        let it = item.items[i]
                        if (!item.marketPrice) {
                            await getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, item.templateId, itemType, 1).then(res => {
                                if (res.data.success)
                                    if (res.data.data.total > 0)
                                        item.marketPrice = res.data.data.market[0][0].price > 3 ? res.data.data.market[0][0].price - 1 : res.data.data.market[0][0].price
                            })
                        }
                        promises.push(listItem(this.$store.state.userdata.jwt, this.$store.state.category, it.id, null, item.marketPrice, itemType).then(() => {
                            this.totalSuccess++
                            this.itemsSold[type][item.templateId].success++
                        }).catch(() => {
                            this.totalError++
                            this.itemsSold[type][item.templateId].err++
                        }))
                    }
                    Promise.all(promises).then(() => {
                        this.sellingSpinner.splice(this.sellingSpinner.indexOf(item.templateId), 1)
                        if (this.sellingSpinner.length === 0) {
                            this.sellingInProgress = false
                            this.sellingDone = true
                        }
                    })
                }
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