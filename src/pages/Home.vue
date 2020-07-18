<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-card-group columns class="ml-2 mr-2">
            <b-card border-variant="dark" header="Spinner Odds" header-bg-variant="light">
                <b-spinner v-if="spinner.spinnerOdds"/>
                <SpinnerOddsChart
                        :hidden="spinner.packStock"
                        :category="$store.state.category"
                        @loading="value => {value ? this.spinner.spinnerOdds = true : this.spinner.spinnerOdds = false}"
                ></SpinnerOddsChart>
            </b-card>
            <b-card border-variant="dark" header="Pack Stock" header-bg-variant="light">
                <b-spinner v-if="spinner.packStock"/>
                <PackStock
                        :hidden="spinner.packStock"
                        :category="$store.state.category"
                        @loading="value => {value ? this.spinner.packStock = true : this.spinner.packStock = false}"
                ></PackStock>
            </b-card>
        </b-card-group>
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import SpinnerOddsChart from "../components/SpinnerOddsChart";
    import PackStock from "../components/PackStock";

    export default {
        name: "Home",
        components: {PackStock, SpinnerOddsChart, Sidebar},
        data() {
            return {
                spinner: {
                    spinnerOdds: true,
                    packStock: true
                }
            }
        }
    }
</script>

<style scoped>

</style>