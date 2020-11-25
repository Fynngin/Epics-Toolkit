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
        <b-row class="mt-2" align-h="center">
            <b-button v-if="$store.getters.isAdmin" class="w-100" :variant="pageVariant('/admin')" @click="$router.push('/admin')">
                Admin
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/')" @click="$router.push('/')">
                Dashboard
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/masslist')" @click="$router.push('/masslist')">
                <font-awesome-icon v-if="$store.getters.isMassListWhitelisted" icon="lock-open"/>
                <font-awesome-icon v-else icon="lock"/>
                Mass-List
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/mintsearch')" @click="$router.push('/mintsearch')">
                Mint-Search
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/teambuilder')" @click="$router.push('/teambuilder')">
                Rush Team-Builder
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/rushweeklies')" @click="$router.push('/rushweeklies')">
                Rush Weekly Achievements
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/accounttransfer')" @click="$router.push('/accounttransfer')">
                Account Transfer
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/packopener')" @click="$router.push('/packopener')">
                Pack Opener
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