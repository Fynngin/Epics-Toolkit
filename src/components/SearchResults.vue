<template>
    <b-modal title="Results" id="resultsModal" hide-footer @hidden="$emit('hidden', true)">
        <b-container v-if="!history">
            <b-progress :max="max">
                <b-progress-bar :value="progress">
                    {{progress}} / {{max}}
                </b-progress-bar>
            </b-progress>
            <p v-if="!done">
                Search in progress... <br><strong>{{accsChecked}}</strong> accounts checked...
                <b-badge v-b-tooltip:hover :title="progressInfo">?</b-badge>
            </p>
            <p v-else>Done! Found {{progress}} of {{max}} cards!</p>
        </b-container>
        <b-table :items="found" sort-by="mint" sort-asc sticky-header="true"></b-table>
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

            }
        }
    }
</script>

<style scoped>

</style>