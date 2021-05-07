<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row align-h="center">
            <b-col lg="5" sm="10" class="mb-2">
                <b-card border-variant="dark" header-bg-variant="light">
                    <template v-slot:header>
                        Spinner Odds
                        <b-button style="float: right" variant="outline-dark" @click="keys.spinnerodds++">
                            <font-awesome-icon icon="redo-alt"/>
                        </b-button>
                    </template>
                    <b-row style="text-align: left">
                        <b-col>
                            <b-spinner v-if="spinner.spinnerOdds"/>
                            <p v-if="error.spinnerOdds">Spinner unavailable.</p>
                            <SpinnerOddsChart
                                class="mb-2"
                                :key="keys.spinnerodds"
                                :hidden="spinner.spinnerOdds || error.spinnerOdds"
                                :category="$store.state.category"
                                @loading="value => {value ? this.spinner.spinnerOdds = true : this.spinner.spinnerOdds = false}"
                                @error="value => {this.error.spinnerOdds = value}"
                                @spinnerData="value => showSpinnerOddsTable(value)"
                            ></SpinnerOddsChart>
                            <b-table :items="spinnerOdds" v-if="!spinner.spinnerOdds && !error.spinnerOdds" small>
                                <template #cell(color)="data">
                                    <span v-html="data.value"></span>
                                </template>
                            </b-table>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
            <b-col lg="5" sm="10" class="mb-2">
                <b-card border-variant="dark" header="Pack Stock" header-bg-variant="light">
                    <template v-slot:header>
                        Pack Stock
                        <b-button style="float: right" variant="outline-dark" @click="keys.packstock++">
                            <font-awesome-icon icon="redo-alt"/>
                        </b-button>
                    </template>
                    <b-row style="text-align: left">
                        <b-col>
                            <b-spinner v-if="spinner.packStock"/>
                            <p v-if="error.packStock">No packs available.</p>
                            <PackStock
                                class="mb-2"
                                :key="keys.packstock"
                                :hidden="spinner.packStock || error.packStock"
                                :category="$store.state.category"
                                @loading="value => {value ? this.spinner.packStock = true : this.spinner.packStock = false}"
                                @error="value => {this.error.packStock = value}"
                                @packData="value => showPackStockTable(value)"
                            />
                            <b-table :items="packs" v-if="!spinner.packStock && !error.packStock" small>
                                <template #cell(color)="data">
                                    <span v-html="data.value"></span>
                                </template>
                            </b-table>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import SpinnerOddsChart from "../components/SpinnerOddsChart";
    import PackStock from "../components/PackStock";
    import {mapActions} from "vuex";

    export default {
        name: "Home",
        components: {PackStock, SpinnerOddsChart, Sidebar},
        data() {
            return {
                spinner: {
                    spinnerOdds: true,
                    packStock: true
                },
                error: {
                    spinnerOdds: false,
                    packStock: false
                },
                keys: {
                    packstock: 0,
                    spinnerodds: 0
                },
                packs: [],
                spinnerOdds: []
            }
        },
        created() {
            this.changeCategory(this.$store.state.category)
        },
        methods: {
            ...mapActions(['changeCategory']),
            showPackStockTable(value) {
                this.packs = value.map(el => {
                    const key = Object.keys(el.__ob__.value._meta)[0];
                    const color = el.__ob__.value._meta[key].controller._cachedDataOpts.backgroundColor;
                    return {
                        color: `<div style="width: 20px; height:20px; background: ${color}"/>`,
                        name: el.label,
                        stock: el.data[0],
                        _rowVariant: color
                    }
                })
            },
            showSpinnerOddsTable(value) {
                const key = Object.keys(value[0].__ob__.value._meta)[0];
                const odds = value[0].data;
                this.spinnerOdds = value[0].__ob__.value._meta[key].data.map(el => {
                    const color = el._view.backgroundColor;
                    const name = el._view.label;
                    const idx = el._index;
                    return {
                        color: `<div style="width: 20px; height:20px; background: ${color}"/>`,
                        name: name,
                        odds: odds[idx],
                        _rowVariant: color
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>