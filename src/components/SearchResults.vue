<template>
    <b-modal title="Results" id="resultsModal" hide-footer @hidden="$emit('hidden', true)">
        <b-progress :max="max" :value="progress"></b-progress>
        <p v-if="!done">Search in progress...</p>
        <p v-else>Done! Found {{progress}} of {{max}} cards!</p>
        <b-table :items="found" sort-by="mint" sort-asc sticky-header="true"></b-table>
    </b-modal>
</template>

<script>
    export default {
        name: "SearchResults",
        props: ['found', 'progress', 'max', 'done']
    }
</script>

<style scoped>

</style>