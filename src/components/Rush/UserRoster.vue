<template>
    <b-card border-variant="dark" class="mb-2">
        <b-row style="text-align: left">
            <b-col>
                <h3>Your team:</h3>
            </b-col>
        </b-row>
        <b-row style="text-align: left;" align-v="center">
            <b-col cols="1" v-if="selectedRosterId">
                <b>Level {{activeUserRoster['level']}}</b>
                <RushRating
                    :rating="activeUserRoster['rating']"
                    :styles="{height: '80px', width: '80px', position: 'relative'}"
                />
            </b-col>
            <b-col v-if="selectedRosterId" style="overflow-x: auto; white-space: nowrap; display: block;">
                <b-img
                    class="team_card"
                    v-for="card in activeUserRoster.cards"
                    :key="card['card'].id"
                    :src="card['card'].images['size402']"
                />
            </b-col>
            <b-col v-if="selectedRosterId" style="overflow-x: auto; white-space: nowrap; display: block;">
                <MapImg
                    v-for="map in maps" :key="map.id"
                    class="mb-1" style="display: inline; position: relative;"
                    :img="map.images[0].url"
                    :map-bonus="activeUserRoster.stats.maps.find(m => {return m['mapId'] === map.id}).weight"
                />
            </b-col>
            <b-col v-else>
                <h4>Please select a roster.</h4>
            </b-col>
            <b-col>
                <b-form-select
                    v-model="selectedRosterId"
                    :options="userRosters"
                    text-field="name"
                    value-field="id"
                    @change="val => $emit('rosterChange', val)"
                >
                    <template #first>
                        <b-form-select-option :value="null" disabled>-- Please select a roster --</b-form-select-option>
                    </template>
                </b-form-select>
            </b-col>
        </b-row>
    </b-card>
</template>

<script>
import RushRating from "@/components/RushRating";
import MapImg from "@/components/Rush/MapImg";
export default {
    name: "UserRoster",
    components: {MapImg, RushRating},
    props: ['userRosters', 'maps'],
    data() {
        return {
            selectedRosterId: null
        }
    },
    computed: {
        activeUserRoster() {
            return this.userRosters.find(el => el.id === this.selectedRosterId)
        }
    }
}
</script>

<style scoped>
    .team_card {
        height: 150px;
        margin-right: 10px;
    }
</style>