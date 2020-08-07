<template>
    <div>
        <b-form-select
            class="mt-2 mb-2"
            v-model="season"
            :options="$store.state.seasons"
            @change="loadCollections">
            <template v-slot:first>
                <b-form-select-option :value="null" disabled>-- Season --</b-form-select-option>
            </template>
        </b-form-select>
        <b-list-group v-if="season">
            <b-list-group-item v-for="(colls, name, index) in collectionOptions" :key="index"
                               action v-b-toggle="`collapse-${index}`" variant="secondary">
                {{name}}
                <b-collapse :id="`collapse-${index}`">
                    <b-list-group>
                        <b-list-group-item v-for="(collection, index) in colls" :key="index" button
                                           @click="$emit('collectionChange', collection.collection.id)">
                            {{collection.collection.name}}
                        </b-list-group-item>
                    </b-list-group>
                </b-collapse>
            </b-list-group-item>

        </b-list-group>
    </div>
</template>

<script>
import {getCollections} from "@/api";

export default {
    name: "CollectionSelect",
    data() {
        return {
            season: null,
            collection: null,
            collectionOptions: {}
        }
    },
    methods: {
        loadCollections() {
            getCollections(this.$store.state.userdata.jwt, this.$store.state.category,
                this.season, this.$store.state.userdata.id).then(res => {
                res.data.success ? this.parseCollections(res.data.data) : this.collectionOptions = []
            })
        },
        parseCollections(collections) {
            this.collectionOptions = {}
            for (const coll of collections) {
                let type = coll.collection.properties.types[0]
                let tier = coll.collection.properties.tiers[0]
                if (type === 'event_primary') {
                    this.collectionOptions['Event'] ? this.collectionOptions['Event'].push(coll) : this.collectionOptions['Event'] = [coll]
                } else {
                    this.collectionOptions[tier] ? this.collectionOptions[tier].push(coll) :this.collectionOptions[tier] = [coll]
                }
            }
        }
    }
}
</script>

<style scoped>

</style>