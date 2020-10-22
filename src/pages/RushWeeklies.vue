<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row>
            <b-col>
                <b-card class="mb-2 ml-2" border-variant="dark">
                    <b-row align-v="center">
                        <b-col cols="3">
                            <h3>Map Bans:</h3>
                        </b-col>
                        <b-col cols="9">
                            <b-form inline>
                                <b-form-checkbox
                                    v-for="map in maps"
                                    :key="map.id"
                                    class="mr-2"
                                    @input="selectMap(map)"
                                >
                                    {{map.name}}
                                </b-form-checkbox>
                            </b-form>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
        <b-row>
            <b-col v-if="teamsReady" cols="7">
                <b-card class="mb-2 ml-2" border-variant="dark" v-for="achievement in filteredAchievements" :key="achievement.id">
                    <b-row class="mb-2">
                        <b-col>
                            <b-progress :max="achievement.progress.max" :variant="achievement.progress.min < achievement.progress.max ? 'primary' : 'success'">
                                <b-progress-bar :value="achievement.progress.min">
                                    {{achievement.progress.min}} / {{achievement.progress.max}}
                                </b-progress-bar>
                            </b-progress>
                        </b-col>
                    </b-row>
                    <b-row align-v="center">
                        <b-col cols="1">
                            <b-img
                                class="team_logo"
                                v-if="achievement.roster && achievement.roster.logoUrl"
                                :src="`${$store.state.cdnUrl}${achievement.roster.logoUrl}`"
                            />
                        </b-col>
                        <b-col cols="7">
                            <b-img
                                class="team_card"
                                v-for="card in achievement.roster.cards"
                                :key="card['card'].id"
                                :src="card['card'].images['size402']"
                            />
                        </b-col>
                        <b-col cols="2">
                            <b-list-group>
                                <b-list-group-item>
                                    <b-row align-v="center">
                                        <h5><strong>Team: &#160; </strong></h5>
                                        {{achievement.roster.name}}
                                    </b-row>
                                </b-list-group-item>
                                <b-list-group-item>
                                    <b-row align-v="center">
                                        <h5 style="float: left;"><strong>Stage:</strong></h5>
                                        <b-img v-if="achievement.stageBadge" style="height: 60px; float: right" :src="achievement.stageBadge"/>
                                        <span v-else>TOTW</span>
                                    </b-row>

                                </b-list-group-item>
                            </b-list-group>
                        </b-col>
                        <b-col>
                            <b-button
                                size="lg"
                                :disabled="!selectedUserRoster || gameDelay"
                                :variant="!selectedUserRoster || gameDelay ? 'secondary' : 'outline-success'"
                                @click="playMatch(achievement)"
                            >
                                <b-spinner v-if="gameDelay"/>
                                <span v-else>Play</span>
                            </b-button>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>

            <b-col v-if="teamsReady">
                <b-list-group>
                    <b-list-group-item
                        href="#"
                        @click="selectedUserRoster = roster.id"
                        :active="selectedUserRoster === roster.id"
                        v-for="(roster, idx) in userRosters"
                        :key="idx">
                        <b-row align-v="center">
                            <b-col cols="3">
                                <h3>{{roster.name}}</h3>
                                <RushRating :rating="roster.rating"/>
                            </b-col>
                            <b-col>
                                <b-img
                                    class="team_card"
                                    v-for="card in roster.cards"
                                    :key="card['card'].id"
                                    :src="card['card'].images['size402']"
                                />
                            </b-col>
                        </b-row>
                    </b-list-group-item>
                </b-list-group>
            </b-col>
        </b-row>

        <FeedbackToast id="feedback-toast" :title="toastTitle" :type="toastType" :description="toastDescription"/>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar";
import {
    getCircuit,
    getMaps,
    getRostersById,
    getRushAchievements,
    getTeams,
    getTotw,
    getUserRosters,
    playRushPve
} from "@/api";
import FeedbackToast from "@/components/FeedbackToast";
import RushRating from "@/components/RushRating";
export default {
    name: "RushWeeklies",
    components: {RushRating, FeedbackToast, Sidebar},
    data() {
        return {
            teamsReady: false,
            teams: [],
            maps: [],
            stages: [],
            userRosters: [],
            selectedUserRoster: null,
            bannedMaps: [],
            weeklyAchievements: [],
            filteredAchievements: [],
            toastTitle: "",
            toastType: "",
            toastDescription: "",
            gameDelay: false
        }
    },
    async created() {
        this.teamsReady = false
        await getCircuit(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.coreCircuitId).then(res => {
            if (res.data.success)
                this.stages = res.data.data['circuit']['stages']
        })
        await getTeams(this.$store.state.userdata.jwt).then(res => {
            if (res.data.success)
                this.teams = res.data.data.teams
        })
        getMaps(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
            if (res.data.success)
                this.maps = res.data.data.maps
        })
        getRushAchievements(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id).then(res => {
            if (res.data.success) {
                this.weeklyAchievements = res.data.data['weekly']
                this.filterTeamAchievements()
            }
        })
        getUserRosters(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id).then(res => {
            if (res.data.success)
                this.userRosters = res.data.data['rosters']
        })
    },
    methods: {
        async filterTeamAchievements() {
            this.filteredAchievements = this.weeklyAchievements.filter(ach => {
                return ach.description.match("against")
            })

            for (const ach of this.filteredAchievements) {
                let temp = ach.description.match("[(][a-zA-Z ]+[)]")
                if (temp) {
                    ach.stageName = temp[0].match("[a-zA-Z ]+")[0]
                    let stage = this.stages.find(stage => stage.name === ach.stageName)
                    ach.stageId = stage.id
                    ach.stageBadge = `${this.$store.state.cdnUrl}${stage.images[0].url}`
                    ach.stageRosters = stage['rosters']
                    let rosterIds = ach.stageRosters.map(el => el['ut_pve_roster_id'])
                    await getRostersById(this.$store.state.userdata.jwt, this.$store.state.category, JSON.stringify(rosterIds).replace(/(\[|\])/g, "")).then(res => {
                        if (res.data.success) {
                            let rosters = res.data.data['rosters']
                            ach.roster = rosters.find(roster => ach.description.match(roster.name))
                            ach.roster.logoUrl = this.teams.find(team => team.id === ach.roster.teamId).images
                                .find(im => im.name === "team_logo").url
                        }
                    })
                } else {
                    ach.stageName = "TOTW"
                    getTotw(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                        if (res.data.success)
                            ach.roster = res.data.data['rosters'].find(r => new Date(r.start) < Date.now())
                    })
                }
            }
            this.teamsReady = true
        },
        selectMap(map) {
            if (this.bannedMaps.includes(map.id))
                this.bannedMaps.splice(this.bannedMaps.indexOf(map.id), 1)
            else
                this.bannedMaps.push(map.id)
        },
        playMatch(achievement) {
            let isTotw = achievement.stageName === "TOTW"
            playRushPve(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.coreCircuitId, achievement.stageId, this.bannedMaps, this.selectedUserRoster, achievement.roster.id, isTotw).then(res => {
                if (res.data.success) {
                    if (res.data.data['game']['user1']['winner'] && achievement.progress.min < achievement.progress.max)
                        achievement.progress.min++
                    this.gameDelay = true
                    window.setTimeout(() => this.gameDelay = false, 2000)
                }
            }).catch(err => {
                this.toastType = "error"
                if (err.response.data['errorCode'] === "invalid_number_of_ut_map_bans") {
                    this.toastTitle = "Invalid Map Bans"
                    this.toastDescription = err.response.data.error
                } else if (err.response.data['errorCode'] === "ut_game_in_progress") {
                    this.toastTitle = "You are clicking too fast."
                    this.toastDescription = err.response.data.error
                } else if (!this.selectedUserRoster) {
                    this.toastTitle = "Invalid Roster Selection"
                    this.toastDescription = "You have to select one of your rosters."
                } else {
                    this.toastTitle = "Error 404"
                    this.toastDescription = "Ooops..."
                }
                this.$bvToast.show("feedback-toast")
            })
        }
    }
}
</script>

<style scoped>
    .team_logo {
        height: 100px;
        width: 100px;
        -webkit-filter: drop-shadow(1px 1px 0 black)
                        drop-shadow(-1px 1px 0 black)
                        drop-shadow(1px -1px 0 black)
                        drop-shadow(-1px -1px 0 black);

        filter: drop-shadow(1px 1px 0 black)
                drop-shadow(-1px 1px 0 black)
                drop-shadow(1px -1px 0 black)
                drop-shadow(-1px -1px 0 black);
    }

    .team_card {
        height: 150px;
    }
</style>