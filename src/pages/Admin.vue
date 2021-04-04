<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row>
            <b-col>
                <b-card border-variant="dark" header="Add Collection">
                    <b-row style="text-align: left" class="mb-2">
                        <b-col>
                            <label for="collId-input">
                                CollectionID: Input single ID or range with <i>id1</i>...<i>id2</i>:
                            </label>
                            <b-form-input id="collId-input" v-model="collectionId" placeholder="CollectionID"/>
                        </b-col>
                        <b-col cols="2">
                            <b-button variant="outline-success" class="h-100 w-100" @click="addCollections">
                                Add
                            </b-button>
                        </b-col>
                    </b-row>
                    <b-row v-if="collectionProgress.max > 0">
                        <b-col>
                            <b-progress
                                :max="collectionProgress.max"
                                :animated="collectionProgress.max > collectionProgress.value"
                                :variant="collectionProgress.max > collectionProgress.value ? 'primary' : 'success'"
                                class="mb-2"
                            >
                                <b-progress-bar :value="collectionProgress.value">
                                    <span>Collections: {{collectionProgress.value}} / {{collectionProgress.max}}</span>
                                </b-progress-bar>
                            </b-progress>
                            <b-progress
                                :max="templateProgress.max"
                                :animated="templateProgress.max > templateProgress.value"
                                :variant="templateProgress.max > templateProgress.value ? 'primary' : 'success'"
                            >
                                <b-progress-bar :value="templateProgress.value">
                                    <span>Templates: {{templateProgress.value}} / {{templateProgress.max}}</span>
                                </b-progress-bar>
                            </b-progress>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>

            <b-col>
                <b-card border-variant="dark" header="Ban User">
                    <b-row style="text-align: left">
                        <b-col>
                            <label for="user-input">
                                Input userID or exact username:
                            </label>
                            <b-form-input id="user-input" v-model="userInput" placeholder="UserID"/>
                        </b-col>
                        <b-col cols="2">
                            <b-button variant="outline-danger" class="h-100 w-100">Ban</b-button>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import firebase from "../firebaseConfig";
const db = firebase.firestore();
import Sidebar from "@/components/Sidebar";
import {getAllCollections, getCardTemplates, getStickerTemplates} from "@/api";

export default {
    name: "Admin",
    components: {Sidebar},
    data() {
        return {
            collections: {},
            collectionId: null,
            userInput: null,
            collectionProgress: {
                value: 0,
                max: 0
            },
            templateProgress: {
                value: 0,
                max: 0
            }
        }
    },
    created() {
        if (!this.$store.getters.isAdmin) {
            this.$router.push('/');
            return;
        }
        getAllCollections(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
            if (res.data.success) {
                let temp = {}
                for (const coll of res.data.data) {
                    temp[coll.id] = coll;
                }
                this.collections = temp;
            }
        })
    },
    methods: {
        getIdRange(str) {
            if (str.includes("...")) {
                const split = str.split("...");
                if (parseInt(split[0]) > parseInt(split[1])) {
                    return [split[1], split[0]];
                }
                return split;
            } else {
                return [str, str];
            }
        },
        async addTemplateToDB(template, type) {
            let templateDB = type === "card"
                ? db.collection("cardTemplates")
                : db.collection("stickerTemplates")
            const templateDoc = templateDB.doc(template.id.toString())
            await templateDoc.set(template)
        },
        async addCollections() {
            const idRange = this.getIdRange(this.collectionId);
            const lowerBound = parseInt(idRange[0]);
            const higherBound = parseInt(idRange[1]);

            this.collectionProgress.value = 0;
            this.collectionProgress.max = higherBound - lowerBound + 1;

            for (let id = lowerBound; id <= higherBound; id++) {
                const entityTypes = this.collections[id] ? this.collections[id]['properties']['entity_types'] : ["sticker", "card"];
                for (const type of entityTypes) {
                    const templates = type === "card"
                        ? await getCardTemplates(this.$store.state.userdata.jwt, this.$store.state.category, id)
                        : await getStickerTemplates(this.$store.state.userdata.jwt, this.$store.state.category, id)

                    this.templateProgress.value = 0;
                    this.templateProgress.max = templates.data.data.length;
                    for (const template of templates.data.data) {
                        await this.addTemplateToDB(template, type);
                        this.templateProgress.value++;
                    }
                }
                this.collectionProgress.value++;
            }
        }
    }
}
</script>

<style scoped>

</style>