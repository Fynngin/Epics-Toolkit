<template>
    <b-modal title="Results" id="resultsModal" hide-footer @hidden="$emit('hidden', true)">
        <b-progress :max="max">
            <b-progress-bar :value="progress">
                {{progress}} / {{max}}
            </b-progress-bar>
        </b-progress>
        <p v-if="!done">
            Search in progress... <strong>{{accsChecked}}</strong> accounts checked...
            <b-badge v-b-tooltip:hover :title="progressInfo">?</b-badge>
        </p>
        <p v-else>Done! Found {{progress}} of {{max}} cards!</p>
        <b-table :items="found" sort-by="mint" sort-asc sticky-header="true"></b-table>
    </b-modal>
</template>

<script>
    export default {
        name: "SearchResults",
        props: ['found', 'progress', 'max', 'done', 'accsChecked'],
        data() {
            return {
                progressInfo: 'Searching for items can take a while, due to api rate limitations. When it\'s done, '
                    + 'the text will say \'Done!\' and tell you how many items were found.'
            }
        }
    }
</script>

<style scoped>

</style>