<template>
    <b-card border-variant="dark" :header="circuit.name">
        <b-list-group>
            <b-list-group-item v-for="(stage, idx) in circuit.stages" :key="stage.id" style="position: relative; z-index: 0;">
                <b-row>
                    <b-col cols="1">
                        <b-img
                            :src="`${$store.state.cdnUrl}${stage.images[0].url}`"
                            class="stageBadge"
                        />
                    </b-col>
                    <b-col>
                        <a href="#" @click="toggleStage(stage, idx)" style="text-align: left;">
                            <font-awesome-icon icon="caret-down" style="float: right"/>
                            <h6>{{stage.name}}</h6>
                        </a>
                    </b-col>
                </b-row>

                <b-collapse :id="`collapse-${idx}`">
                    <b-list-group>
                        <b-list-group-item v-for="(team, teamIdx) in stageRosters[idx]" :key="team.id" style="position: relative">
                            <div
                                :id="`progressDiv_stage${idx}_team${teamIdx}`"
                                class="progressDiv"
                                :style="{width: circuit['stages'][idx]['rosters'][teamIdx]['progress'] + '%'}"
                            >
                                {{circuit['stages'][idx]['rosters'][teamIdx]['userWins'] > circuit['stages'][idx]['winsNeeded']
                                    ? '100'
                                    : circuit['stages'][idx]['rosters'][teamIdx]['userWins'] / circuit['stages'][idx]['winsNeeded'] * 100}}%
                            </div>
                            <b-row>
                                <b-col cols="2">
                                    <b-img
                                        class="team_logo"
                                        :src="`${$store.state.cdnUrl}${team.images.find(el => el.name === 'team_logo').url}`"
                                    />
                                </b-col>
                                <b-col cols="8">
                                    <h4 style="text-align: left; white-space: nowrap">{{team.name}}</h4>
                                </b-col>
                                <b-col cols="1">
                                    <b-button
                                        :disabled="!canPlayMatch || gameDelay"
                                        :variant="canPlayMatch && !gameDelay ? 'success' : 'dark'"
                                        @click="playMatch(team, circuit['stages'][idx]['rosters'][teamIdx], circuit['stages'][idx])"
                                    >
                                        <b-spinner v-if="gameDelay" small/>
                                        <font-awesome-icon v-else icon="play"/>
                                    </b-button>
                                </b-col>
                            </b-row>
                        </b-list-group-item>
                    </b-list-group>
                </b-collapse>
            </b-list-group-item>
        </b-list-group>

<!--        <FeedbackToast id="feedback-toast" :title="toastTitle" :type="toastType" :description="toastDescription"/>-->
    </b-card>
</template>

<script>
import {getRostersById, getTeams} from "@/api";
import {playRushPve} from "@/api";

export default {
    name: "RushCircuit",
    props: ['circuit', 'canPlayMatch', 'userRoster', 'bannedMaps'],
    data() {
        return {
            teams: [],
            stageRosters: {},
            gameDelay: false,
            toastTitle: "",
            toastType: "",
            toastDescription: ""
        }
    },
    created() {
        getTeams(this.$store.state.userdata.jwt).then(res => {
            if (res.data.success) {
                this.teams = res.data.data.teams;
            }
        })
    },
    methods: {
        async toggleStage(stage, idx) {
            if (!this.stageRosters[idx]) {

                const firstMatch = stage['objective'].match("[0-9]+ times")[0];
                stage['winsNeeded'] = parseInt(firstMatch.match("[0-9]+")[0]);

                for (let roster of stage['rosters']) {
                    const rosterId = roster['ut_pve_roster_id'];
                    let progressObj = stage['rosterProgress'].find(el => el['ut_pve_roster_id'] === rosterId);

                    const wins = progressObj ? progressObj['wins'] : 0;
                    roster['userWins'] = wins;
                    if (wins >= stage['winsNeeded']) {
                        roster['progress'] = 100;
                    } else {
                        roster['progress'] = wins / stage['winsNeeded'] * 100;
                    }
                }

                let stageRosterIds = [];
                for (let roster of stage['rosters']) {
                    stageRosterIds.push(roster['ut_pve_roster_id']);
                }
                await getRostersById(this.$store.state.userdata.jwt, this.$store.state.category, JSON.stringify(stageRosterIds).replace(/(\[|\])/g, "")).then(res => {
                    if (res.data.success) {
                        let apiRosters = res.data.data['rosters'];
                        apiRosters.forEach(roster => {
                            roster.images = this.teams.find(el => el.id === roster['teamId']).images
                        })
                        this.stageRosters[idx] = apiRosters;
                    }
                })
            }

            this.$forceUpdate();
            this.$root.$emit('bv::toggle::collapse', `collapse-${idx}`);
        },
        playMatch(team, progressObj, stage) {
            playRushPve(
                this.$store.state.userdata.jwt,
                this.$store.state.category,
                this.circuit.id,
                stage.id,
                this.bannedMaps,
                this.userRoster,
                team.id,
                false
            ).then(res => {
                if (res.data.success) {
                    const isWinner = res.data.data['game']['user1']['winner'];
                    if (isWinner) {
                        const info = {
                            type: 'success',
                            title: 'Match won!',
                            description: `You won the match with a ${res.data.data['game']['user1']['winChance']}% chance!`
                        }
                        this.$emit("feedback", info);
                        if (progressObj.progress < 100) {
                            progressObj['userWins']++;
                            progressObj.progress = progressObj['userWins'] / stage['winsNeeded'] * 100;
                        }
                        this.$forceUpdate();
                    } else {
                        const info = {
                            type: 'error',
                            title: 'Match lost!',
                            description: `You lost the match with a ${res.data.data['game']['user1']['winChance']}% win-chance!`
                        }
                        this.$emit("feedback", info);
                    }
                    this.gameDelay = true;
                    window.setTimeout(() => this.gameDelay = false, 2000);
                }
            }).catch(err => {
                let info = {
                    type: "error"
                }

                if (err.response.data['errorCode'] === "invalid_number_of_ut_map_bans") {
                    info.title = "Invalid Map Bans"
                    info.description = err.response.data.error
                } else if (err.response.data['errorCode'] === "ut_game_in_progress") {
                    info.title = "You are clicking too fast."
                    info.description = err.response.data.error
                } else if (!this.selectedUserRoster) {
                    info.title = "Invalid Roster Selection"
                    info.description = "You have to select one of your rosters."
                } else {
                    info.title = "Error 404"
                    info.description = "Ooops..."
                }
                this.$emit('feedback', info)
            })
        }
    }
}
</script>

<style scoped>
    .stageBadge {
        z-index: 1;
        height: 50px;
        position: absolute;
        left: 0;
        top: -10px;
    }

    .team_logo {
        height: 35px;
        -webkit-filter: drop-shadow(1px 1px 0 black)
                        drop-shadow(-1px 1px 0 black)
                        drop-shadow(1px -1px 0 black)
                        drop-shadow(-1px -1px 0 black);
        filter: drop-shadow(1px 1px 0 black)
                drop-shadow(-1px 1px 0 black)
                drop-shadow(1px -1px 0 black)
                drop-shadow(-1px -1px 0 black);
    }

    .progressDiv {
        position: absolute;
        background: #28a745;
        filter: opacity(.5);
        top: 0;
        left: 0;
        line-height: 60px;
        color: white;
        height: 60px;
        font-size: 85px;
        text-align: end;
        font-family: "Proxima Nova Rg",monospace;
        transition: .4s ease-in-out;
    }
</style>