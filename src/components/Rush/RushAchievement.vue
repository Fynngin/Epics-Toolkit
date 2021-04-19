<template>
    <b-card no-body class="mb-2" border-variant="dark">
        <template v-slot:header>
            <b-row>
                <b-col>
                    {{achievement.description}}
                </b-col>
                <b-col>
                    <b-progress :max="achievement.progress.max" :variant="achievement.progress.min < achievement.progress.max ? 'primary' : 'success'">
                        <b-progress-bar :value="achievement.progress.min">
                            {{achievement.progress.min}} / {{achievement.progress.max}}
                        </b-progress-bar>
                    </b-progress>
                </b-col>
            </b-row>
        </template>
        <b-row align-v="center" style="margin: initial">
            <div style="height: 200px; width: 115px; position: relative; overflow: hidden;">
                <b-img
                    class="team_logo"
                    v-if="achievement.roster && achievement.roster.logoUrl"
                    :src="`${$store.state.cdnUrl}${achievement.roster.logoUrl}`"
                />
            </div>
            <b-col style="overflow-x: auto; white-space: nowrap; display: block;">
                <b-img
                    class="team_card"
                    v-for="card in achievement.roster.cards"
                    :key="card['card'].id"
                    :src="card['card'].images['size402']"
                />
            </b-col>
            <b-col class="d-md-none d-lg-block" cols="2">
                <RushRating
                    :rating="achievement.roster.rating"
                    :styles="{height: '150px', width: '150px', position: 'relative'}"
                />
            </b-col>

            <b-col style="overflow-x: auto; white-space: nowrap; display: block;" v-if="maps.length === 7">
                <MapImg
                    v-for="map in achievement.roster.stats.maps" :key="map['map_id']"
                    class="mb-1" style="display: inline; position: relative;"
                    :img="maps[map['map_id'] - 1].images[0].url"
                    :map-bonus="map.weight"
                />
            </b-col>

            <b-col cols="1">
                <b-button
                    size="lg"
                    :disabled="playButtonDisabled"
                    :variant="playButtonDisabled ? 'secondary' : 'outline-success'"
                    @click="$emit('playMatch')"
                >
                    <b-spinner v-if="spinner"/>
                    <font-awesome-icon icon="play" v-else/>
                </b-button>
            </b-col>
            <div
                style="right: 0; height: 200px; width: 115px; position: relative; overflow: hidden;"
            >
                <b-img
                    class="stageBadge"
                    :src="achievement.stageBadge"
                />
            </div>
        </b-row>
    </b-card>
</template>

<script>
import MapImg from "@/components/Rush/MapImg";
import RushRating from "@/components/RushRating";
export default {
    name: "RushAchievement",
    components: {RushRating, MapImg},
    props: ['achievement', 'playButtonDisabled', 'spinner', 'maps']
}
</script>

<style scoped>
    .team_logo {
        height: 100%;
        position: absolute;
        left: -85px;
        top: 0;
        -webkit-filter: drop-shadow(1px 1px 0 black)
                        drop-shadow(-1px 1px 0 black)
                        drop-shadow(1px -1px 0 black)
                        drop-shadow(-1px -1px 0 black);
        filter: drop-shadow(1px 1px 0 black)
                drop-shadow(-1px 1px 0 black)
                drop-shadow(1px -1px 0 black)
                drop-shadow(-1px -1px 0 black);
        mask-image: linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0));
    }

    .stageBadge {
        height: 100%;
        position: absolute;
        right: -85px;
        top: 0;
        mask-image: linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0));
    }

    .team_card {
        height: 150px;
        margin-right: 10px;
    }
</style>