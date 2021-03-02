<template>
    <div>
        <b-row class="w-100 mb-2" align-h="between">
            <b-col cols="3">
                <u><h3>Stake</h3></u>
            </b-col>
            <b-col cols="3">
                <b-button variant="outline-success" @click="$emit('createBet')">
                    Create bet
                </b-button>
            </b-col>

        </b-row>
        <b-row>
            <b-col style="overflow-x: auto; white-space: nowrap; display: block;">
                <div v-for="(items, templateId) in stake" :key="templateId" class="itemContainer">
                    <font-awesome-icon
                        icon="times-circle"
                        class="removeItemButton"
                        size="lg"
                        @click="removeItem(templateId)"
                    />
                    <b-badge v-if="items.length > 1" variant="info" class="amountBadge" pill>
                        {{items.length}}x
                    </b-badge>
                    <b-img
                        v-if="items[0]['cardTemplate']"
                        class="cardImg"
                        :src="items[0]['cardTemplate']['images']['size402']"
                        v-b-tooltip:hover
                        :title="getMints(items)"
                    />
                    <b-img
                        v-else
                        class="stickerImg"
                        :src="`${$store.state.cdnUrl}${items[0]['stickerTemplate']['images'][0].url}`"
                        v-b-tooltip:hover
                        :title="getMints(items)"
                    />
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
export default {
    name: "StakeOverview",
    props: ['stake'],
    methods: {
        removeItem(templateId) {
            this.$emit('removeItem', templateId);
        },
        getMints(items) {
            let list = "";
            for (let idx = 0; idx < items.length - 1; idx++) {
                const item = items[idx];
                list += `${item.mintBatch}${item.mintNumber}, `;
            }
            list += `${items[items.length - 1].mintBatch}${items[items.length - 1].mintNumber}`;
            return list;
        }
    }
}
</script>

<style scoped>
    .itemContainer {
        width: 100px;
        height: 140px;
        position: relative;
        display: inline-block;
        white-space: nowrap;
        margin-right: 15px;
    }

    .cardImg {
        position: absolute;
        width: 90%;
        bottom: 0;
        left: 0;
        z-index: 0;
    }

    .stickerImg {
        position: absolute;
        width: 90%;
        bottom: 50px;
        left: 0;
        z-index: 0;
    }

    .removeItemButton {
        background-color: white;
        border-radius: 50%;
        color: #7a083c;
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        cursor: pointer;
    }

    .amountBadge {
        position: absolute;
        z-index: 1;
        left: 0;
    }
</style>