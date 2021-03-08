<template>
    <b-modal id="removeModal" title="Remove all listings" @shown="initListings" :hide-footer="!allReady || numListingsToRemove === 0">
        <b-row v-if="totalListings && !allReady">
            <b-col>
                <p>Getting your listings...</p>
                <b-progress :max="totalListings">
                    <b-progress-bar :value="listings.length">
                        {{listings.length}} / {{totalListings}}
                    </b-progress-bar>
                </b-progress>
            </b-col>
        </b-row>

        <b-row v-if="delistingInProgress">
            <b-col>
                <p>Removing listings...</p>
                <b-progress :max="numListingsToRemove">
                    <b-progress-bar :value="removedListingsTotal">
                        {{removedListingsTotal}} / {{numListingsToRemove}}
                    </b-progress-bar>
                </b-progress>
            </b-col>
        </b-row>

        <b-row v-else-if="allReady">
            <b-col>
                <p>All ready!</p>
                <p>Select the types of items you want to delist:</p>
                <b-form-checkbox-group v-model="includeType">
                    <b-form-checkbox value="card">Cards</b-form-checkbox>
                    <b-form-checkbox value="sticker">Stickers</b-form-checkbox>
                    <b-form-checkbox value="pack">Packs</b-form-checkbox>
                </b-form-checkbox-group>
                <h4 class="mt-2">{{numListingsToRemove}} listings will be removed.</h4>
            </b-col>
        </b-row>

        <template v-slot:modal-footer>
            <b-button variant="outline-success" @click="delistItems">Remove listings</b-button>
        </template>
    </b-modal>
</template>

<script>
import {getUserMarketListings, removeMarketListing} from "@/api";

export default {
    name: "RemoveModal",
    data() {
        return {
            listings: [],
            totalListings: null,
            totalListingsByType: {
                'card': 0,
                'sticker': 0,
                'pack': 0
            },
            includeType: [],
            ready: {
                'card': false,
                'sticker': false,
                'pack': false
            },
            removedListings: {
                'success': 0,
                'error': 0
            },
            removedListingsTotal: 0,
            delistingInProgress: false
        }
    },
    computed: {
        numListingsToRemove() {
            let total = 0;
            if (this.includeType.includes('card'))
                total += this.totalListingsByType['card'];
            if (this.includeType.includes('sticker'))
                total += this.totalListingsByType['sticker'];
            if (this.includeType.includes('pack'))
                total += this.totalListingsByType['pack'];
            return total;
        },
        allReady() {
            return !Object.values(this.ready).includes(false);
        }
    },
    methods: {
        async initListings() {
            this.ready = {
                'card': false,
                'sticker': false,
                'pack': false
            }
            this.totalListingsByType = {
                'card': 0,
                'sticker': 0,
                'pack': 0
            }
            this.totalListings = null;
            this.listings = [];
            this.delistingInProgress = false;
            await this.getListings(1, "sticker");
            await this.getListings(1, "pack");
            await this.getListings(1, "card");
        },
        async getListings(page, type) {
            await getUserMarketListings(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id, type, page).then(res => {
                if (res.data.success) {
                    this.totalListings = res.data.data.total;

                    if (res.data.data.count > 0) {
                        this.listings = this.listings.concat(res.data.data.market.map(el =>{
                            return {
                                marketId: el.marketId,
                                type: el.type
                            }
                        }));
                        this.getListings(++page, type);
                    } else {
                        this.ready[type] = true;
                        this.totalListingsByType[type] = this.totalListings
                    }
                }
            })
        },
        delistItems() {
            this.delistingInProgress = true;
            this.removedListings = {
                'success': 0,
                'error': 0
            }
            this.removedListingsTotal = 0

            const packsAllowed = this.includeType.includes('pack');
            const stickersAllowed = this.includeType.includes('sticker');
            const cardsAllowed = this.includeType.includes('card');
            const listings = this.listings.filter(el => {
                if (el.type === 'card') return cardsAllowed;
                if (el.type === 'pack') return packsAllowed;
                if (el.type === 'sticker') return stickersAllowed;
            })

            for (const item of listings) {
                removeMarketListing(this.$store.state.userdata.jwt, item.marketId).then(res => {
                    if (res.data.success) {
                        this.removedListings['success'] += 1
                    } else {
                        this.removedListings['error'] += 1
                    }
                    this.removedListingsTotal += 1
                }).catch(() => {
                    this.removedListings['error'] += 1
                    this.removedListingsTotal += 1
                })
            }
        }
    }
}
</script>

<style scoped>

</style>