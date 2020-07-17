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
            }
        }
    }
</script>

<style scoped>
    .categoryButton {
        width: 100px
    }
</style>