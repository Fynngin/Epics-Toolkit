<template>
    <b-sidebar id="sidebar">
        <div>
            <b-button
                    class="mr-2 categoryButton"
                    :variant="categoryVariant(1)"
                    @click="changeCategory(1)"
            >CS:GO</b-button>
            <b-button
                    class="categoryButton"
                    :variant="categoryVariant(2)"
                    @click="changeCategory(2)"
            >Streamers</b-button>
        </div>
        <b-row class="mt-2 pr-2 pl-2">
            <b-button class="w-100" :variant="pageVariant('/')" @click="$router.push('/')">
                Dashboard
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/masslist')" @click="$router.push('/masslist')">
                <font-awesome-icon icon="dollar-sign"/>
                Mass-List
                <span style="float: right">
                    <font-awesome-icon v-if="$store.getters.isMassListWhitelisted" icon="lock-open"/>
                    <font-awesome-icon v-else icon="lock"/>
                </span>
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/mintsearch')" @click="$router.push('/mintsearch')">
                <font-awesome-icon icon="search"/>
                Mint-Search
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/teambuilder')" @click="$router.push('/teambuilder')">
                <font-awesome-icon icon="users-cog"/>
                Rush Team-Builder
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/rushweeklies')" @click="$router.push('/rushweeklies')">
                <font-awesome-icon icon="calendar-alt"/>
                Rush Weekly Achievements
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/accounttransfer')" @click="$router.push('/accounttransfer')">
                <font-awesome-icon icon="random"/>
                Account Transfer
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/packopener')" @click="$router.push('/packopener')">
                <font-awesome-icon icon="box-open"/>
                Pack Opener
            </b-button>
            <b-button class="w-100 text-left" :variant="pageVariant('/physicaltracker')" @click="$router.push('/physicaltracker')">
                <font-awesome-icon icon="signature"/>
                Physical Tracker
            </b-button>
        </b-row>
    </b-sidebar>
</template>

<script>
    import {mapActions} from "vuex";

    export default {
        name: "Sidebar",
        computed: {

        },
        methods: {
            ...mapActions(['changeCategory']),
            categoryVariant(category) {
                return this.$store.state.category === category ? 'primary' : 'secondary'
            },
            pageVariant(page) {
                return this.$router.currentRoute.fullPath === page ? 'primary' : 'secondary'
            }
        }
    }
</script>

<style scoped>
    .categoryButton {
        width: 100px
    }
</style>