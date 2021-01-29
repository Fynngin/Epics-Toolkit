<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-if="$store.getters.isAuthenticated" v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row>
            <b-col cols="2">
                <b-input-group>
                    <b-form-input placeholder="Search users..." v-model="userSearch"/>
                    <template #append>
                        <b-button variant="outline-dark" @click="showUserSearch">
                            <font-awesome-icon icon="search"/>
                        </b-button>
                    </template>
                </b-input-group>
                <b-list-group style="position: absolute; z-index: 10;">
                    <b-list-group-item
                        button
                        style="text-align: start"
                        v-for="user in userSearchResults"
                        :key="user.id"
                        @click="$router.push(`/showcase/${user.id}`)"
                    >
                        <b-avatar :src="`${$store.state.cdnUrl}${user.avatar}`"/>
                        {{user.username}}
                    </b-list-group-item>
                </b-list-group>
            </b-col>
            <b-col :cols="$store.getters.isAuthenticated ? '7' : '10'">
                <h1 v-if="showcase.length > 0">Showcase of {{userdata.username}}</h1>
                <h1 v-else>This user does not have a showcase setup.</h1>
            </b-col>
            <b-col>
                <b-button
                    v-if="$store.getters.isAuthenticated"
                    variant="outline-dark"
                    @click="gotoUserShowcase"
                    style="float: right"
                >
                    Edit your showcase
                </b-button>
            </b-col>
        </b-row>

        <b-row v-if="!$store.getters.isAuthenticated">
            <b-col>
                <p>
                    <a href="/">Login</a> &nbsp; to see peoples full physical collections.
                </p>
            </b-col>

        </b-row>

        <b-row class="ml-2 mb-2" v-if="showcase.length > 0">
            <b-col>
                <b-card border-variant="dark">
                    <b-card v-for="item in showcase" :key="item.id">
                        <b-card-img :src="item.img"/>
                    </b-card>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2">
            <b-col cols="3">
                <b-list-group>
                    <b-list-group-item v-for="coll in collections" :key="coll.id" button :active="selectedCollection === coll.id" @click="selectCollection(coll.id)">
                        {{coll.name}}
                    </b-list-group-item>
                </b-list-group>
            </b-col>

            <b-col>
                <b-card border-variant="dark">
                    <b-row>
                        <b-col lg="2" md="4" sm="6" class="mb-2" v-for="template in cardTemplates" :key="template.id" @mouseover="overlay = template.id" @mouseleave="overlay = 0">
                            <b-overlay :show="overlay === template.id">
                                <b-card no-body>
                                    <b-badge
                                        v-if="template.owned.length > 1"
                                        variant="primary"
                                        style="position: absolute; right: 0;"
                                    >
                                        x{{template.owned.length}}
                                    </b-badge>
                                    <b-card-img
                                        :class="template.owned.length > 0 ? '' : 'unowned'"
                                        :src="template.owned.length === 1 ? template.owned[0].images['size402'] : template.images['size402']"
                                    />
                                </b-card>

                                <template v-slot:overlay>
                                    <ul>
                                        <li v-for="(mint, idx) in template.owned.map(el => [el.mintBatch, el.mintNumber])" :key="idx">
                                            {{mint[0]}}{{mint[1]}}
                                        </li>
                                    </ul>
                                </template>
                            </b-overlay>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import {getAllCollections, getCardTemplates, getItems, searchUsers} from "@/api";
import firebase from "../firebaseConfig";
import Sidebar from "../components/Sidebar";
const db = firebase.firestore();

export default {
    name: "Showcase",
    components: {Sidebar},
    data() {
        return {
            userdata: {
                id: null,
                username: "",
                avatar: ""
            },
            showcase: [],
            collections: [],
            selectedCollection: null,
            cardTemplates: {},
            overlay: 0,
            userSearch: "",
            userSearchResults: []
        }
    },
    created() {
        this.init();
        this.initCollections();
    },
    watch: {
        $route (to, from) {
            this.userSearchResults = []
            this.userSearch = ""
            if (to.path !== from.path)
                this.init()
            if (this.$store.getters.isAuthenticated)
                this.initCollections();
        }
    },
    methods: {
        async init() {
            this.userSearchResults = []
            this.userSearch = ""
            this.userdata.id = this.$route.params.id;
            let userDB = db.collection("users").doc(this.userdata.id.toString())
            await userDB.get().then(async res => {
                if (res.exists) {
                    let userdata = await res.data()
                    this.userdata.username = userdata['username'];
                    this.userdata.avatar = userdata['avatar'];
                    if (userdata['showcase'])
                        this.showcase = userdata['showcase'];
                } else {
                    this.showcase = [];
                }
            })
        },
        initCollections() {
            getAllCollections(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                if (res.data.success) {
                    let colls = res.data.data
                    this.collections = colls.filter(el => el['physical'] === true)
                }
            })
        },
        gotoUserShowcase() {
            if (this.$route.params.id !== this.$store.state.userdata.id) {
                this.$router.push(`/showcase/${this.$store.state.userdata.id}`)
            }
        },
        async selectCollection(collId) {
            this.selectedCollection = collId;
            this.cardTemplates = {};
            await getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, collId).then(res => {
                if (res.data.success) {
                    let templates = res.data.data;
                    for (const temp of templates) {
                        temp['owned'] = [];
                        this.cardTemplates[temp.id] = temp;
                    }
                }
            })
            await getItems(this.$store.state.userdata.jwt, this.$store.state.category, collId, this.userdata.id).then(res => {
                if (res.data.success) {
                    let cards = res.data.data.cards;
                    for (const card of cards) {
                        this.cardTemplates[card['cardTemplate'].id]['owned'].push(card)
                    }
                }
            })
            this.$forceUpdate();
        },
        showUserSearch() {
            searchUsers(this.$store.state.userdata.jwt, this.$store.state.category, this.userSearch).then(res => {
                if (res.data.success) {
                    this.userSearchResults = res.data.data;
                }
            })
        }
    }
}
</script>

<style scoped>
    .unowned {
        filter: saturate(30%);
    }
</style>