<template>
    <b-modal id="sellModal" title="Sell items">
        <b-button variant="outline-dark" class="mb-2" v-b-toggle.setCollapse>
            <font-awesome-icon class="when-opened" icon="angle-down"/>
            <font-awesome-icon class="when-closed" icon="angle-right"/>
            Sell sets
        </b-button>
        <b-collapse id="setCollapse">
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

        <b-list-group style="max-height: 300px; overflow: scroll;">
            <b-list-group-item v-for="card in selected.cards" :key="card.templateId">
                <p class="font-weight-bold" style="display: inline;">{{card.name}}</p>
                <b-badge v-if="card.marketPrice" style="float: right;" variant="success">Price: {{card.marketPrice}}</b-badge>
                <b-input-group prepend="Amount" :append="`max: ${card.max}`">
                    <b-form-input type="number" :max="card.max" min="0" v-model="card.amount"/>
                </b-input-group>
                <b-button v-b-toggle="`collapse-${card.templateId}`" variant="outline-dark" class="mt-2" size="sm">Show mints</b-button>
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
                <p class="font-weight-bold">{{sticker.name}}</p>
                <b-input-group prepend="Amount" :append="`max: ${sticker.max}`">
                    <b-form-input type="number" v-model="sticker.amount" :max="sticker.max" min="0"/>
                </b-input-group>
                <b-button v-b-toggle="`collapse-${sticker.templateId}`" variant="outline-dark" class="mt-2" size="sm">Show mints</b-button>
                <b-collapse :id="`collapse-${sticker.templateId}`">
                    <p>
                        <span v-for="i in parseInt(sticker.amount)" :key="i">
                            {{sticker.items[i-1].mintBatch}}{{sticker.items[i-1].mintNumber}}
                            <span v-if="i < sticker.amount">,</span>
                        </span>
                    </p>
                </b-collapse>
            </b-list-group-item>
        </b-list-group>

        <i v-if="showPriceWarning" class="mt-2">
            Prices shown above are 1c below the current lowest market listing.
        </i>
        <p class="mt-2">
            Clicking "Sell" will start the listing process.
        </p>

        <template v-slot:modal-footer>
            <b-button variant="outline-dark" @click="getLowestPrices">
                <b-spinner v-if="showPriceSpinner"/>
                <span v-else>
                    Show prices
                </span>
            </b-button>
            <b-button variant="outline-success">Sell</b-button>
        </template>
    </b-modal>
</template>

<script>
import {getMarketListings} from "@/api";

export default {
    name: "SellModal",
    props: ['selected'],
    data() {
        return {
            sets: 1,
            showPriceWarning: false,
            showPriceSpinner: false
        }
    },
    computed: {
        maxSets() {
            let temp = this.selected.cards.concat(this.selected.stickers).map(el => el.max)
            return temp.reduce((a, b) => {
                return Math.min(a, b)
            }, temp[0])
        }
    },
    methods: {
        selectSets() {
            this.selected.cards.forEach(card => card.amount = this.sets)
            this.selected.stickers.forEach(sticker => sticker.amount = this.sets)
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
            Promise.all(promises).then(() => {
                this.showPriceWarning = true
                this.showPriceSpinner = false
                this.$forceUpdate()
            })
        },
        sellItems() {

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