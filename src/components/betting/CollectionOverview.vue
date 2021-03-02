<template>
    <div>
        <b-row align-v="center">
            <b-col cols="9">
                <b-form-input placeholder="Search..." v-model="searchInput"/>
            </b-col>
            <b-col cols="3">
                <b-form-checkbox v-model="dupesOnly" switch>Dupes only</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row>
            <b-col
                xl="2" lg="3" md="4" sm="6"
                class="mb-2 mt-2"
                style="position: relative"
                v-for="(items, templateId) in filteredTemplates" :key="templateId"
            >
                <b-badge style="position: absolute; right: 10px;" variant="info" pill>
                    {{items.length}}x
                </b-badge>
                <b-img
                    style="width: inherit; cursor: pointer; pointer-events: auto;"
                    v-if="items[0].type === 'card'"
                    :src="items[0]['cardTemplate'].images['size402']"
                    @click="selectTemplate(items)"
                />
                <b-img
                    style="width: inherit; cursor: pointer; pointer-events: auto;"
                    v-else
                    @click="selectTemplate(items)"
                    :src="`${$store.state.cdnUrl}${items[0]['stickerTemplate'].images[1].url}`"
                />
            </b-col>
        </b-row>

        <b-modal id="mintModal" :title="selectedTemplate.title" v-if="selectedTemplate">
            <b-row>
                <b-col cols="8">
                    <h5>Select mints to add to stake:</h5>
                    <b-form-checkbox
                        v-for="item in selectedTemplate.items" :key="item.id"
                        :checked="item.checked"
                        @change="addCardToStake(item)"
                    >
                        {{item.mintBatch}}{{item.mintNumber}}
                    </b-form-checkbox>
                </b-col>
                <b-col cols="4">
                    <b-img
                        style="width: inherit"
                        v-if="selectedTemplate.items[0].type === 'card'"
                        :src="selectedTemplate.items[0]['cardTemplate'].images['size402']"
                    />
                    <b-img
                        v-else
                        style="width: inherit"
                        :src="`${$store.state.cdnUrl}${selectedTemplate.items[0]['stickerTemplate'].images[1].url}`"
                    />
                </b-col>
            </b-row>
            <template v-slot:modal-footer>
                <b-button variant="outline-success">Add to stake</b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import {getItems} from "../../api";
import _ from 'lodash';

export default {
    name: "CollectionOverview",
    props: ['collection'],
    data() {
        return {
            dupesOnly: false,
            templates: [],
            templatesDupesOnly: [],
            selectedTemplate: null,
            searchInput: ""
        }
    },
    watch: {
        collection() {
            this.sortTemplates()
        }
    },
    created() {
        this.sortTemplates();
    },
    computed: {
        filteredTemplates() {
            return this.filterObject((this.dupesOnly ? this.templatesDupesOnly : this.templates), (it) => {
                if (it[0]['stickerTemplate']) {
                    return it[0]['stickerTemplate']['title'].toLowerCase().includes(this.searchInput.toLowerCase());
                }
                if (it[0]['cardTemplate']['cardType'] === "player") {
                    return it[0]['cardTemplate']['player']['handle'].toLowerCase().includes(this.searchInput.toLowerCase());
                } else if (it[0]['cardTemplate']['cardType'] === "team") {
                    return it[0]['cardTemplate']['team']['name'].toLowerCase().includes(this.searchInput.toLowerCase());
                }
            })
        }
    },
    methods: {
        filterObject(obj, filterFunc) {
            return Object.keys(obj).filter(key => {
                return filterFunc(obj[key]);
            }).reduce((res, key) => {
                res[key] = obj[key];
                return res;
            }, {})
        },
        sortTemplates() {
            getItems(this.$store.state.userdata.jwt, this.$store.state.category, this.collection.id, this.$store.state.userdata.id).then(res => {
                if (res.data.success) {
                    const cards = _.groupBy(res.data.data.cards, 'cardTemplate.id')
                    const cardsDupesOnly = this.filterObject(cards, (it) => it.length > 1);

                    const stickers = _.groupBy(res.data.data.stickers, 'stickerTemplate.id')
                    const stickersDupesOnly = this.filterObject(stickers, (it) => it.length > 1);

                    this.templates = Object.assign({}, cards, stickers)
                    this.templatesDupesOnly = Object.assign({}, cardsDupesOnly, stickersDupesOnly)
                }
            })
        },
        selectTemplate(items) {
            if (items[0].type === 'card') {
                this.selectedTemplate = items[0]['cardTemplate'];
            } else {
                this.selectedTemplate = items[0]['stickerTemplate'];
            }
            this.selectedTemplate.items = items;
            this.$bvModal.show('mintModal');
        },
        addCardToStake(item) {
            if (item.checked) {
                item.checked = false;
                this.$emit('removeCard', item);
            } else {
                item.checked = true;
                this.$emit('addCard', item);
            }
        }
    }
}
</script>

<style scoped>

</style>