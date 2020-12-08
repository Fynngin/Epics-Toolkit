<template>
    <b-modal id="updateModal" title="Update listings" @shown="sortData" hide-footer>
        <b-row>
            <b-col>
                <p v-if="spinner.userStickerListings || spinner.userCardListings">Getting user listings...</p>
                <p v-else-if="spinner.getMarketPrice">
                    Getting new market prices... Items will show when complete!
                </p>
                <p v-else-if="spinner.updateListings && progress.updateListings < Object.keys(listings).length">
                    Updating market listings...
                </p>
                <p v-else-if="spinner.updateListings">
                    Done!
                </p>
                <b-progress v-if="spinner.userCardListings" :max="max.userCardListings">
                    <b-progress-bar :value="progress.userCardListings">
                        {{progress.userCardListings}} / {{max.userCardListings}}
                    </b-progress-bar>
                </b-progress>

                <b-progress v-else-if="spinner.userStickerListings" :max="max.userStickerListings">
                    <b-progress-bar :value="progress.userStickerListings">
                        {{progress.userStickerListings}} / {{max.userStickerListings}}
                    </b-progress-bar>
                </b-progress>

                <b-progress v-else-if="spinner.getMarketPrice" :max="max.getMarketPrice">
                    <b-progress-bar :value="progress.getMarketPrice">
                        {{progress.getMarketPrice}} / {{max.getMarketPrice}}
                    </b-progress-bar>
                </b-progress>

                <b-progress v-else-if="spinner.updateListings" :max="Object.keys(listings).length">
                    <b-progress-bar :value="progress.updateListings" :variant="progress.updateListings < Object.keys(listings).length ? 'primary' : 'success'">
                        {{progress.updateListings}} / {{Object.keys(listings).length}}
                    </b-progress-bar>
                </b-progress>
            </b-col>
        </b-row>

        <b-row class="mt-2" v-if="progress.getMarketPrice === max.getMarketPrice">
            <b-col>
                <b-list-group style="max-height: 300px; overflow: scroll;">
                    <b-list-group-item v-for="(listing, idx) in listings" :key="idx">
                        <b-row>
                            <b-col cols="9">
                                <h5>{{listing.items[0].name}}</h5>
                            </b-col>
                            <b-col cols="1">
                                <b-badge variant="info">x{{listing.items.length}}</b-badge>
                            </b-col>
                            <b-col cols=1>
                                <b-button variant="danger" @click="removeListing(listing, idx)">X</b-button>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                {{listing.items[0].price}}
                                <font-awesome-icon class="mr-2 ml-2" icon="arrow-right"/>
                                <strong>{{listing.newPrice}}</strong>
                            </b-col>
                        </b-row>
                    </b-list-group-item>
                </b-list-group>
            </b-col>
        </b-row>

        <b-row class="mt-2">
            <b-col>
                <h5>Summary:</h5>
                {{totalItemsToUpdate}} items will be updated!
            </b-col>
            <b-col>
                <b-button class="mr-2" variant="outline-dark" @click="reloadData">
                    <font-awesome-icon icon="redo-alt"/>
                </b-button>
                <b-button
                    variant="outline-success"
                    @click="updateListings"
                    :disabled="spinner.getMarketPrice || spinner.userCardListings || spinner.userStickerListings"
                >Update Listings</b-button>
            </b-col>
        </b-row>

    </b-modal>
</template>

<script>
import {getMarketListings, getUserMarketListings, updateMarketListing} from "@/api";
import _ from 'lodash';

export default {
    name: "UpdateModal",
    data() {
        return {
            listings: [],
            spinner: {
                userCardListings: false,
                userStickerListings: false,
                getMarketPrice: false,
                updateListings: false
            },
            progress: {
                userCardListings: 0,
                userStickerListings: 0,
                getMarketPrice: 0,
                updateListings: 0
            },
            max: {
                userCardListings: null,
                userStickerListings: null,
                getMarketPrice: null
            },
            totalItemsToUpdate: 0
        }
    },
    methods: {
        removeListing(listing, idx) {
            this.listings.splice(idx, 1);
            this.totalItemsToUpdate -= listing.items.length;
        },
        reloadData() {
            this.listings = []
            this.sortData();
        },
        async sortData() {
            this.progress = {
                userCardListings: 0,
                userStickerListings: 0,
                getMarketPrice: 0
            }
            this.max = {
                userCardListings: null,
                userStickerListings: null,
                getMarketPrice: null
            }

            if (this.listings.length === 0) {
                this.listings = []
                this.totalItemsToUpdate = 0
                await this.getListings(1, "card")
                await this.getListings(1, "sticker")
                this.listings = await _(this.listings).groupBy('templateId').value()
                this.checkMarketPrices()
            }
        },
        async getListings(page, type) {
            if (type === 'card')
                this.spinner.userCardListings = true
            else
                this.spinner.userStickerListings = true
            await getUserMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id, type, page).then(async res => {
                if (res.data.success) {
                    if (type === 'card' && !this.max.userCardListings) {
                        this.max.userCardListings = res.data.data.total
                    } else if (type === 'card' && !this.max.userStickerListings) {
                        this.max.userStickerListings = res.data.data.total
                    }

                    if (res.data.data.count > 0) {
                        let listings = res.data.data.market.map(el => {
                            return {
                                templateId: type === "card" ? el['card']['cardTemplate'].id : el['sticker']['stickerTemplate'].id,
                                // mintBatch: type === "card" ? el['card']['mintBatch'] : el['sticker']['mintBatch'],
                                // mintNumber: type === "card" ? el['card']['mintNumber'] : el['sticker']['mintNumber'],
                                name: type === "card" ? el['card']['cardTemplate'].title : el['sticker']['stickerTemplate'].title,
                                marketId: el.marketId,
                                type: type,
                                price: el.price,
                                minOffer: el.minOffer
                            }
                        })
                        if (type === 'card')
                            this.progress.userCardListings += res.data.data.count
                        else
                            this.progress.userStickerListings += res.data.data.count

                        this.listings = this.listings.concat(listings)
                        await this.getListings(++page, type)
                    } else {
                        if (type === 'card')
                            this.spinner.userCardListings = false
                        else
                            this.spinner.userStickerListings = false
                    }
                }
            })
        },
        checkMarketPrices() {
            this.spinner.getMarketPrice = true
            this.max.getMarketPrice = Object.keys(this.listings).length;
            let promises = []
            for (const templateId of Object.keys(this.listings)) {
                let type = this.listings[templateId][0].type
                promises.push(getMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, templateId, type, 1).then(res => {
                    if (res.data.success) {
                        let amount = res.data.data.count
                        if (amount > 0) {
                            let currLowest = res.data.data.market[0][0].price
                            let toUpdate = this.listings[templateId].filter(item => item.price > currLowest)
                            if (toUpdate.length > 0) {
                                this.listings[templateId] = {
                                    newPrice: currLowest <= this.$store.state.noUndercutMarketAt ? currLowest : currLowest - 1,
                                    items: toUpdate
                                }
                                this.totalItemsToUpdate += toUpdate.length
                            } else {
                                delete this.listings[templateId];
                            }
                        } else {
                            delete this.listings[templateId];
                        }
                        this.progress.getMarketPrice++
                    }
                }).catch(() => {
                    delete this.listings[templateId];
                    this.progress.getMarketPrice++
                }))
            }
            Promise.all(promises).then(() => this.spinner.getMarketPrice = false)
        },
        async updateListings() {
            this.progress.updateListings = 0;
            this.spinner.updateListings = true;
            for (const templateId of Object.keys(this.listings)) {
                let template = this.listings[templateId]
                let price = template.newPrice;
                let promises = [];
                for (const item of template.items) {
                    promises.push(updateMarketListing(this.$store.state.userdata.jwt, this.$store.state.category, item.marketId, item.minOffer, price))
                }
                this.progress.updateListings++
                this.$forceUpdate();
                await Promise.all(promises)
            }
        }
    }
}
</script>

<style scoped>

</style>