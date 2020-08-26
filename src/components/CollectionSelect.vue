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
                               action variant="secondary">
                <a v-b-toggle="`collapse-${index}`">
                    <font-awesome-icon icon="caret-down" style="float: right"/>
                    <h6>{{name}}</h6>
                </a>
                <b-collapse :id="`collapse-${index}`">
                    <b-list-group v-if="name !== 'Event'">
                        <b-list-group-item v-for="(collection, index) in colls" :key="index" button
                                           @click="$emit('collectionChange', {id: collection.collection.id, entities: collection.collection.properties['entity_types']})">
                            {{collection.collection.name}}
                        </b-list-group-item>
                    </b-list-group>

                    <b-list-group v-else>
                        <b-list-group-item v-for="(collections, event, index) in colls" :key="index" button>
                            <a v-b-toggle="`event-${index}`">
                                <font-awesome-icon icon="caret-down" style="float: right"/>
                                <h6>{{event}}</h6>
                            </a>
                            <b-collapse :id="`event-${index}`">
                                <b-list-group>
                                    <b-list-group-item v-for="(collection, index) in collections" :key="index" button
                                                       @click="$emit('collectionChange', {id: collection.collection.id, entities: collection.collection.properties['entity_types']})">
                                        {{collection.collection.name}}
                                    </b-list-group-item>
                                </b-list-group>
                            </b-collapse>
                        </b-list-group-item>
                    </b-list-group>
                </b-collapse>
            </b-list-group-item>

        </b-list-group>
    </div>
</template>

<script>
import {getAppInfo, getCollections} from "@/api";

export default {
    name: "CollectionSelect",
    data() {
        return {
            season: null,
            collection: null,
            collectionOptions: {},
            tiers: []
        }
    },
    methods: {
        loadCollections() {
            getAppInfo(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                res.data.success ? this.tiers = res.data.data['treatment']['tiersExtended'] : this.tiers = []
            })
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
                    if (this.collectionOptions['Event']) {
                        if (this.collectionOptions['Event'][tier]) {
                            this.collectionOptions['Event'][tier].push(coll)
                        } else {
                            this.collectionOptions['Event'][tier] = [coll]
                        }
                    } else {
                        this.collectionOptions['Event'] = {}
                        this.collectionOptions['Event'][tier] = [coll]
                    }
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