<template>
    <b-modal size="lg" title="History" id="historyModal" hide-footer @hidden="$emit('hidden', true)">
        <b-table :items="items" :fields="fields" sort-by="date" sort-desc sticky-header="true">
            <template v-slot:cell(view)="row">
                <b-button variant="outline-dark" @click="$emit('showHistoryItem', row.item)">
                    <font-awesome-icon icon="search"/>
                </b-button>
            </template>
            <template v-slot:cell(mintRange)="row">
                <template  v-if="row.item.signatures">
                    Signatures
                </template>
                <template v-else>
                    {{row.item.mintBatch}}{{row.item.minMint}} - {{row.item.mintBatch}}{{row.item.maxMint}}
                </template>
            </template>
        </b-table>
    </b-modal>
</template>

<script>
export default {
    name: "SearchHistory",
    props: ['items'],
    data() {
        return {
            fields: [
                {key: 'market', label: 'Type', formatter: value => {
                    return value ? 'Market' : 'User'
                }},
                {key: 'date', label: 'Date', formatter: value => {
                    let obj = new Date(value)
                        let date = obj.getFullYear()+'-'+(obj.getMonth()+1)+'-'+obj.getDate();
                        let time = obj.getHours() + ":" + (obj.getMinutes() > 9 ? '' : '0') + obj.getMinutes() + ":" + obj.getSeconds();
                        return date+' '+time;
                    }
                },
                {key: 'title', label: 'Collection'},
                {key: 'mintRange', label: 'Mint'},
                {key: 'view', label: ''}
            ]
        }
    }
}
</script>

<style scoped>

</style>