<template>
    <b-modal title="Results" id="resultsModal" hide-footer @hidden="$emit('hidden', true)">
        <b-container v-if="!history">
            <b-progress :max="max" show-progress animated>
                <b-progress-bar :value="progress"/>
            </b-progress>
            <p v-if="!done">

                Search in progress... <br>
                <template v-if="!market && !history">
                    <strong>{{accsChecked}}</strong> accounts checked...
                    <b-badge v-b-tooltip:hover :title="progressInfo">?</b-badge>
                </template>
            </p>
            <p v-else-if="!market">Done! Found {{progress}} of {{max}} cards!</p>
            <p v-else>Done!</p>
        </b-container>
        <b-table :items="found" :fields="fields" sort-by="mint" sort-asc sticky-header="true">
            <template v-slot:cell(view)="row" v-if="market">
                <b-button variant="outline-dark" @click="openMarketPage(row.item)">
                    <font-awesome-icon icon="search"/>
                </b-button>
            </template>
        </b-table>
        <b-button variant="outline-dark" class="mb-2 w-100" @click="exportCSV">Export</b-button>
    </b-modal>
</template>

<script>
    export default {
        name: "SearchResults",
        props: ['found', 'progress', 'max', 'done', 'accsChecked', 'history', 'market'],
        data() {
            return {
                progressInfo: 'Searching for items can take a while, due to api rate limitations. When it\'s done, '
                    + 'the text will say \'Done!\' and tell you how many items were found.',
                jsoncsv: require('json-csv')
            }
        },
        computed: {
            fields() {
                if (this.market) {
                    return [
                        {key: 'mint', label: 'Mint'},
                        {key: 'name', label: 'Item'},
                        {key: 'user', label: 'User'},
                        {key: 'price', label: 'Price'},
                        {key: 'view', label: ''},
                    ]
                } else {
                    return [
                        {key: 'mint', label: 'Mint'},
                        {key: 'name', label: 'Item'},
                        {key: 'user', label: 'User'}
                    ]
                }
            }
        },
        methods: {
            exportCSV() {
                let sorted = this.found.sort((a,b) => {
                    return a.mint.localeCompare(b.mint)
                })
                let fields = []
                if (this.market) {
                    fields = [
                        {name: 'mint', label: 'Mint'},
                        {name: 'name', label: 'Name'},
                        {name: 'user', label: 'User'},
                        {name: 'price', label: 'Price'}
                    ]
                } else {
                    fields = [
                        {name: 'mint', label: 'Mint'},
                        {name: 'name', label: 'Name'},
                        {name: 'user', label: 'User'}
                    ]
                }
                this.jsoncsv.buffered(sorted, {fields: fields}, (err, res) => {
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(res);
                    hiddenElement.target = '_blank';
                    hiddenElement.download = 'search.csv';
                    hiddenElement.click();
                })

            },
            openMarketPage(item) {
                window.open(`https://app.epics.gg/${this.$store.state.category === 1 ? 'csgo' : 'streamers'}/marketplace/${item.type}/${item.templateId}/${item.marketId}`, '_blank')
            }
        }
    }
</script>

<style scoped>

</style>