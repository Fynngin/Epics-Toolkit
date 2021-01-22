<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row>
            <b-col>
                <b-card class="mb-2 ml-2" border-variant="dark">
                    <b-row align-v="center">
                        <b-col cols="3">
                            <h3>Map Bans:</h3>
                        </b-col>
                        <b-col cols="9" style="overflow-x: auto; white-space: nowrap; display: block;">
                            <b-container v-for="map in maps"
                                         :key="map.id"
                                         style="display: inline; position: relative;"
                                         class="p-0 m-0"
                            >
                                <font-awesome-icon
                                    v-if="bannedMaps.includes(map.id)"
                                    class="mapBanIcon"
                                    icon="times-circle"
                                    size="2x"/>
                                <b-img
                                    :src="`${$store.state.cdnUrl}${map.images[0].url}`"
                                    class="mapImg"
                                    :class="bannedMaps.includes(map.id) ? 'selectedMap' : ''"
                                    @click="selectMap(map)"
                                />
                            </b-container>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col v-if="teamsReady">
                <b-card border-variant="dark" class="mb-2 ml-2">
                    <b-row style="text-align: left">
                        <b-col>
                            <h3>Your team:</h3>
                        </b-col>
                    </b-row>
                    <b-row style="text-align: left;">
                        <b-col cols="1" v-if="selectedUserRoster">
                            <RushRating
                                :rating="activeUserRoster['rating']"
                                :styles="{height: '80px', width: '80px', position: 'relative'}"
                            />
                        </b-col>
                        <b-col v-if="selectedUserRoster" style="overflow-x: auto; white-space: nowrap; display: block;">
                            <b-img
                                class="team_card"
                                v-for="card in activeUserRoster.cards"
                                :key="card['card'].id"
                                :src="card['card'].images['size402']"
                            />
                        </b-col>
                        <b-col v-if="selectedUserRoster" style="overflow-x: auto; white-space: nowrap; display: block;">
                            <b-container v-for="map in maps" :key="map.id" class="mb-1" style="display: inline; position: relative;">
                                <b-img class="mapImg" :src="`${$store.state.cdnUrl}${map.images[0].url}`"/>
                                <b-badge pill
                                         style="position: absolute; left: 10%"
                                         :variant="activeUserRoster.stats.maps.find(m => {return m['mapId'] === map.id}).weight >= 0 ? 'success' : 'danger'">
                                    {{ round((activeUserRoster.stats.maps.find(m => {return m['mapId'] === map.id}).weight) * 100, 3)}} %
                                </b-badge>
                            </b-container>
                        </b-col>
                        <b-col v-else>
                            <h4>Please select a roster.</h4>
                        </b-col>
                        <b-col>
                            <b-form-select v-model="selectedUserRoster" :options="userRosters" text-field="name" value-field="id">
                                <template #first>
                                    <b-form-select-option :value="null" disabled>-- Please select a roster --</b-form-select-option>
                                </template>
                            </b-form-select>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-card border-variant="dark" class="ml-2 mb-2">
                    <b-row v-for="achievement in filteredAchievements.filter(el => !el.roster)"
                           :key="achievement.id">
                        <b-col cols="4">
                            <b-badge variant="success">
                                {{achievement.type}}
                            </b-badge>
                            {{achievement.description}}:
                        </b-col>
                        <b-col>
                            <b-progress
                                class="mb-2"
                                :max="achievement.progress.max"
                                :variant="achievement.progress.min < achievement.progress.max ? 'primary' : 'success'"
                            >
                                <b-progress-bar :value="achievement.progress.min">
                                    {{achievement.progress.min}} / {{achievement.progress.max}}
                                </b-progress-bar>
                            </b-progress>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col v-if="teamsReady">
                <b-card class="mb-2 ml-2" border-variant="dark" v-for="achievement in filteredAchievements.filter(el => el.roster)" :key="achievement.id">
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
            dailyAchievements: [],
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
                this.dailyAchievements = res.data.data['daily']
                this.filterTeamAchievements()
            }
        })
        getUserRosters(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.userdata.id).then(res => {
            if (res.data.success)
                this.userRosters = res.data.data['rosters']
        })
    },
    computed: {
        activeUserRoster() {
            return this.userRosters.find(el => el.id === this.selectedUserRoster)
        }
    },
    methods: {
        round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        },
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
                            ach.roster = rosters.find(roster => {
                                return ach.description.toUpperCase().match(roster.name.toUpperCase())
                            })
                            ach.roster.logoUrl = this.teams.find(team => team.id === ach.roster.teamId).images
                                .find(im => im.name === "team_logo").url
                        }
                    })
                } else {
                    ach.stageName = "TOTW"
                    await getTotw(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                        if (res.data.success)
                            ach.roster = res.data.data['rosters'].find(r => new Date(r.start) < Date.now())
                    })
                }
            }

            let weeklyWin = this.weeklyAchievements.find(el => el.description.match("Win [0-9]+ Rush Matches"))
            if (weeklyWin) {
                weeklyWin.type = 'weekly'
                this.filteredAchievements.push(weeklyWin)
            }
            let weeklyPlay = this.weeklyAchievements.find(el => el.description.match("Play [0-9]+ Rush Matches"))
            if (weeklyPlay) {
                weeklyPlay.type = 'weekly'
                this.filteredAchievements.push(weeklyPlay)
            }
            let dailyWin = this.dailyAchievements.find(el => el.description.match("Win [0-9]+ Rush Matches"))
            if (dailyWin) {
                dailyWin.type = 'daily'
                this.filteredAchievements.push(dailyWin)
            }
            let dailyPlay = this.dailyAchievements.find(el => el.description.match("Play [0-9]+ Rush Matches"))
            if (dailyPlay) {
                dailyPlay.type = 'daily'
                this.filteredAchievements.push(dailyPlay)
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
        height: 80px;
        margin-right: 10px;
    }

    .mapImg {
        height: 70px;
        margin-right: 10px;
        border-radius: 25px;
        border: solid #0baaaa;
    }

    .selectedMap {
        border: solid #7a083c;
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
</style>