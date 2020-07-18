<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>


    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";

    export default {
        name: "MassList",
        components: {Sidebar},
    }
</script>

<style scoped>

</style>