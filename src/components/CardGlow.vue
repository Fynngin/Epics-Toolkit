<template>
    <div style="margin-bottom: 230px; margin-right: 170px">
        <b-card-img
            class="cardSize"
            :src="`${card.images['size402']}`"
        />
        <b-card-img
            v-if="card['treatment']['tier'] !== 'Common'"
            class="glowSize" :class="glow"
            :src="require('@/assets/cardglow.webp')"
        />
    </div>
</template>

<script>
export default {
    name: "CardGlow",
    props: ['card'],
    computed: {
        glow() {
            switch (this.card['treatment']['tier']) {
                case 'Tier 2 Epic':
                    return 'glowT2'
                case 'Tier 3 Legendary':
                    return 'glowT3'
                default:
                    return ''
            }
        }
    }
}
</script>

<style scoped>
    .cardSize {
        position: absolute;
        height: 210px;
        width: auto;
        padding-left: 15px;
        padding-top: 15px
    }

    .glowSize {
        position: absolute;
        height: 222px;
        width: auto;
    }

    .glowT2 {
        -webkit-filter: sepia(1) hue-rotate(270deg) saturate(8);
        filter: sepia(1) hue-rotate(270deg) saturate(8);
    }

    .glowT3 {
        -webkit-filter: sepia(1) hue-rotate(0deg) saturate(4);
        filter: sepia(1) hue-rotate(0deg) saturate(4);
    }
</style>