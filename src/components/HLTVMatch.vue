<template>
    <div style="border-color: #22283d; outline-style: solid;" class="match_container">
        <b-row class="w-100 m-0" align-h="start">
            <b-col style="margin-top: 5px">
                <b-img
                    class="event_icon d-md-none d-lg-block"
                    v-if="match['league']['image_url']"
                    :src="match['league']['image_url']"
                    v-b-tooltip:hover
                    :title="match['league'].name"
                />
                <b-img
                    class="event_icon"
                    v-else
                    src="icons/4.png"
                    v-b-tooltip:hover
                    :title="match['league'].name"
                />
            </b-col>
            <b-col style="margin-top: 5px">
                <b-img class="team_icon" v-if="match['opponents'][0]['opponent']['image_url']" :src="match['opponents'][0]['opponent']['image_url']"/>
                <b-img class="team_icon" v-else src="icons/10.png"/>
                <p class="team_name">{{match['opponents'][0]['opponent'].name}}</p>
            </b-col>
            <b-col align-self="center">
                <h4>{{parseDate(match['begin_at'])}}</h4>
                <b-badge variant="dark">BO{{match['number_of_games']}}</b-badge><br>
            </b-col>
            <b-col style="margin-top: 5px">
                <b-img class="team_icon" v-if="match['opponents'][1]['opponent']['image_url']" :src="match['opponents'][1]['opponent']['image_url']"/>
                <b-img class="team_icon" v-else src="icons/10.png"/>
                <p class="team_name">{{match['opponents'][1]['opponent'].name}}</p>
            </b-col>
<!--            <div-->
<!--                @click="openAnalyticsPage(match.link)"-->
<!--                class="analytics_button"-->
<!--                v-b-tooltip:hover-->
<!--                title="HLTV analytics"-->
<!--            >-->
<!--                <font-awesome-icon icon="chart-bar" color="white"/>-->
<!--            </div>-->
        </b-row>
    </div>
</template>

<script>
export default {
    name: "HLTVMatch",
    props: ['match'],
    methods: {
        parseDate(date) {
            const parsed = new Date(date);
            // const day = ('0' + parsed.getDate()).slice(-2);
            // const month = ('0' + parsed.getMonth()).slice(-2);
            const hour = ('0' + parsed.getHours()).slice(-2);
            const minute = ('0' + parsed.getMinutes()).slice(-2);
            return `${hour}:${minute}`
        }
        // openAnalyticsPage(matchLink) {
        //     const hltvPrefix = 'https://hltv.org';
        //     const newLink = hltvPrefix + matchLink.replace("/matches", "/betting/analytics");
        //     window.open(newLink, '_blank');
        // }
    }
}
</script>

<style scoped>
    .team_icon {
        height: 70px;
        max-width: 100px;
    }

    .team_name {
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .event_icon {
        height: 70px;
        -webkit-filter: drop-shadow(1px 1px 0 black)
                        drop-shadow(-1px 1px 0 black)
                        drop-shadow(1px -1px 0 black)
                        drop-shadow(-1px -1px 0 black);
        filter: drop-shadow(1px 1px 0 black)
                drop-shadow(-1px 1px 0 black)
                drop-shadow(1px -1px 0 black)
                drop-shadow(-1px -1px 0 black);
    }

    .match_container {
        padding: 0 0 5px 5px;
        height: 100px;
    }

    .analytics_button {
        cursor: pointer;
        pointer-events: auto;
        top: 0;
        bottom: 0;
        right: 0;
        width: 40px;
        height: 100px;
        background-color: #22283d;
    }
</style>