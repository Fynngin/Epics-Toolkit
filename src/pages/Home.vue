<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-card-group columns class="ml-2 mr-2">
            <b-card border-variant="dark" header="Spinner Odds" header-bg-variant="light">
                <SpinnerOddsChart :category="$store.state.category"></SpinnerOddsChart>
            </b-card>
        </b-card-group>

    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import SpinnerOddsChart from "../components/SpinnerOddsChart";

    export default {
        name: "Home",
        components: {SpinnerOddsChart, Sidebar},
        created() {

        }
    }
</script>

<style scoped>

</style>