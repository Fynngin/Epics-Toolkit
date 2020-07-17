<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2">
            <font-awesome-icon icon="angle-double-right"></font-awesome-icon>
            Toggle Sidebar
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    export default {
        name: "Home",
        components: {Sidebar}
    }
</script>

<style scoped>

</style>