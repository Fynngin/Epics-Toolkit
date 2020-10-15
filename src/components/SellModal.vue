<template>
    <b-modal id="sellModal" title="Sell items">
        <b-button variant="outline-dark" class="mb-2" v-b-toggle.setCollapse>
            <font-awesome-icon class="when-opened" icon="angle-down"/>
            <font-awesome-icon class="when-closed" icon="angle-right"/>
            Sell sets
        </b-button>
        <b-collapse id="setCollapse">
            <b-form-input id="setRange" v-model="sets" type="range" min="0" :max="maxSets"></b-form-input>
            <p>Amount: {{ sets }} {{sets == 1 ? 'set' : 'sets'}}</p>
        </b-collapse>

        <b-list-group>
            <b-list-group-item v-for="card in selected.cards" :key="card.id">
                <p class="font-weight-bold">{{card.name}}</p>
                <b-input-group prepend="Amount" :append="`max: ${card.max}`">
                    <b-form-input type="number" v-model="card.amount"/>
                </b-input-group>
            </b-list-group-item>
            <b-list-group-item v-for="sticker in selected.stickers" :key="sticker.id">
                <p class="font-weight-bold">{{sticker.name}}</p>
                <b-input-group prepend="Amount" :append="`max: ${sticker.max}`">
                    <b-form-input type="number" v-model="sticker.amount"/>
                </b-input-group>
            </b-list-group-item>
        </b-list-group>

        <template v-slot:modal-footer>
            <b-button variant="outline-success">Sell</b-button>
        </template>
    </b-modal>
</template>

<script>
export default {
    name: "SellModal",
    props: ['selected'],
    data() {
        return {
            sets: 1
        }
    },
    computed: {
        maxSets() {
            let temp = this.selected.cards.concat(this.selected.stickers).map(el => el.max)
            return temp.reduce((a, b) => {
                return Math.min(a, b)
            }, temp[0])
        }
    }
}
</script>

<style scoped>
    .collapsed > .when-opened,
    :not(.collapsed) > .when-closed {
        display: none;
    }
</style>