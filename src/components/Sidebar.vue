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
            <b-button class="w-100" :variant="pageVariant('/')" @click="$router.push('/')">
                Dashboard
            </b-button>
            <b-button class="w-100" :variant="pageVariant('/masslist')" @click="$router.push('/masslist')">
                Mass-List
            </b-button>
        </b-row>
    </b-sidebar>
</template>

<script>
    import {mapMutations} from "vuex";

    export default {
        name: "Sidebar",
        computed: {

        },
        methods: {
            ...mapMutations(['changeCategory']),
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