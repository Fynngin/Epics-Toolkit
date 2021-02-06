<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-row class="mb-2">
            <b-button v-b-toggle.sidebar style="float: left" class="ml-4 bg-transparent border-transparent">
                <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
            </b-button>
        </b-row>

        <b-row class="ml-2">
            <b-col cols="6">
                <div v-for="(matches, date) in matchesByDate" :key="date">
                    <b-row align-content="center" class="mb-2">
                        <b-button variant="transparent" class="mr-2" v-b-toggle="`collapse-${date}`" @click="collapseDate(date, $event)">
                            <font-awesome-icon v-if="collapsedDates[date]" icon="arrow-right" size="lg"/>
                            <font-awesome-icon v-else icon="arrow-down" size="lg"/>
                        </b-button>
                        <h2 class="m-0">{{date}}</h2>
                    </b-row>
                    <b-collapse visible :id="`collapse-${date}`">
                        <h-l-t-v-match
                            class="ml-5 mb-2"
                            v-for="match in matches"
                            :key="match.id"
                            :match="match"
                        />
                    </b-collapse>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import HLTVMatch from "@/components/HLTVMatch";
import _ from 'lodash';
import Sidebar from "@/components/Sidebar";
import {getMatchesByStartDate} from "@/csgoApi";
import * as dayjs from "dayjs";

export default {
    name: "Betting",
    components: {Sidebar, HLTVMatch},
    data() {
        return {
            matches: [],
            matchesByDate: {},
            collapsedDates: {}
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            // HLTV.getMatches().then(async matches => {
            //     this.matches = matches.filter(match => {
            //         return match.teams[0].name !== "" && match.teams[1].name !== "";
            //     })
            //     this.matches.forEach(match => {
            //         const dateTimeSplit = match.time.split('T');
            //         match.date = dateTimeSplit[0];
            //     })
            //     await this.groupMatchesByDate();
            // });
            const today = dayjs().toISOString();
            const tomorrow = dayjs().add(7, 'day').toISOString();
            getMatchesByStartDate(today, tomorrow).then(res => {
                this.matches = res.data.filter(match => {
                    return match['opponents'].length === 2 && ['s', 'a', 'b', 'c'].includes(match['serie']['tier']);
                })
                this.matches.forEach(match => {
                    const dateTimeSplit = match['begin_at'].split('T');
                    match.date = dateTimeSplit[0];
                })
                this.groupMatchesByDate();
            })
        },
        groupMatchesByDate() {
            this.matchesByDate = _.groupBy(this.matches, 'date');
        },
        collapseDate(date) {
            if (this.collapsedDates[date] === undefined) {
                this.collapsedDates[date] = false;
            } else {
                this.collapsedDates[date] = !this.collapsedDates[date];
            }
        }
    }
}
</script>

<style scoped>
    .fa-arrow-down{
        transform: rotate(0deg);
        transition: transform 1s linear;
    }

    .fa-arrow-down.open{
        transform: rotate(180deg);
        transition: transform 1s linear;
    }
</style>