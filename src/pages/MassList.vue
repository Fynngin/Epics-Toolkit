<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row>
            <b-col>
                <b-card>
                    <b-form-select v-model="season" :options="$store.state.seasons" @change="getCollections"/>
                    <b-form-spinbutton/>
                    <b-form-select
                            v-model="collection"
                            :options="collectionOptions"
                            text-field="collection.name"
                            value-field="collection.id"
                    />
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import Sidebar from "../components/Sidebar";
    import axios from "axios";

    export default {
        name: "MassList",
        components: {Sidebar},
        data() {
            return {
                season: null,
                collection: null,
                collectionOptions: []
            }
        },
        methods: {
            getCollections() {
                axios("https://api.epics.gg/api/v1/collections/users/32876/user-summary", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-jwt': this.$store.state.userdata.jwt
                    },
                    params: {
                        'categoryId': this.$store.state.category,
                        'seasons': this.season
                    }
                }).then(res => {
                    if (res.data.success) {
                        res.data.data.forEach(arr => {
                            this.collectionOptions = this.collectionOptions.concat(arr)
                        })
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>