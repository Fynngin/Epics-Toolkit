<template>
    <div>
        <b-row>
            <b-col
                xl="2" lg="3" md="4" sm="6"
                class="mb-2"
                style="position: relative"
                v-for="(items, templateId) in templates" :key="templateId"
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
                    :src="`${$store.state.cdnUrl}${items[0]['stickerTemplate'].images[1].url}`"
                />
            </b-col>
        </b-row>

        <b-modal id="mintModal" :title="selectedTemplate.title" v-if="selectedTemplate" hide-footer>
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
                        :src="`${$store.state.cdnUrl}${selectedTemplate.items[0]['stickerTemplate'].images[1].url}`"
                    />
                </b-col>
            </b-row>

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
            templates: [],
            selectedTemplate: null
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
    methods: {
        sortTemplates() {
            getItems(this.$store.state.userdata.jwt, this.$store.state.category, this.collection.id, this.$store.state.userdata.id).then(res => {
                if (res.data.success) {
                    const cards = _.groupBy(res.data.data.cards, 'cardTemplate.id')
                    const stickers = _.groupBy(res.data.data.stickers, 'stickerTemplate.id')
                    this.templates = Object.assign({}, cards, stickers)
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