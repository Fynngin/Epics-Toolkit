<template>
    <b-container style="display: inline; position: relative;" class="p-0 m-0">
        <font-awesome-icon
            v-if="selected"
            class="mapBanIcon"
            icon="times-circle"
            size="2x"/>
        <b-badge
            v-if="mapBonus"
            pill
            style="position: absolute;"
            :variant="mapBonus >= 0 ? 'success' : 'danger'"
        >
            {{ round((mapBonus) * 100, 3) }} %
        </b-badge>
        <b-img
            :src="`${$store.state.cdnUrl}${img}`"
            class="mapImg"
            :class="selected ? 'selectedMap' : ''"
            @click="selectMap()"
        />
    </b-container>
</template>

<script>
export default {
    name: "MapImg",
    props: ['img', 'selected', 'mapBonus'],
    methods: {
        selectMap() {
            this.$emit('selectMap')
        },
        round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        }
    }
}
</script>

<style scoped>
    .selectedMap {
        border: solid #7a083c !important;
    }

    .mapBanIcon {
        pointer-events: none;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        left: 50%;
        margin-right: -50%;
        color: #7a083c;
    }

    .mapImg {
        cursor: pointer;
        height: 70px;
        margin-right: 10px;
        border-radius: 25px;
        border: solid #0baaaa;
        transition: .2s;
    }

    .mapImg:hover {
        border: solid #7a083c;
    }
</style>