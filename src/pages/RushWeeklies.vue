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
                            <MapImg
                                v-for="map in maps" :key="map.id"
                                :img="map.images[0].url"
                                :selected="bannedMaps.includes(map.id)"
                                @selectMap="selectMap(map)"
                            />
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col v-if="teamsReady">
                <UserRoster
                    :maps="maps"
                    :user-rosters="userRosters"
                    @rosterChange="val => setNewUserRoster(val)"
                />
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
            <b-col v-if="teamsReady" cols="6">
                <RushAchievement
                    v-for="achievement in filteredAchievements.filter(el => el.roster)" :key="achievement.id"
                    :play-button-disabled="!selectedUserRoster || gameDelay"
                    :achievement="achievement"
                    :spinner="gameDelay"
                    :maps="maps"
                    @playMatch="playMatch(achievement)"
                />
            </b-col>
            <b-col cols="6">
                <RushCircuit
                    v-for="circuit in circuits" :key="circuit.id"
                    :circuit="circuit"
                />
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
import MapImg from "@/components/Rush/MapImg";
import UserRoster from "@/components/Rush/UserRoster";
import RushAchievement from "@/components/Rush/RushAchievement";
import RushCircuit from "@/components/Rush/RushCircuit";
export default {
    name: "RushWeeklies",
    components: {RushCircuit, RushAchievement, UserRoster, MapImg, FeedbackToast, Sidebar},
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
            gameDelay: false,
            circuits: []
        }
    },
    async created() {
        this.teamsReady = false
        this.circuits = [];
        await getCircuit(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.coreCircuitId).then(res => {
            if (res.data.success) {
                this.stages = res.data.data['circuit']['stages'];
                this.circuits.push(res.data.data['circuit']);
            }
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
                weeklyWin.condition = 'win'
                this.filteredAchievements.push(weeklyWin)
            }
            let weeklyPlay = this.weeklyAchievements.find(el => el.description.match("Play [0-9]+ Rush Matches"))
            if (weeklyPlay) {
                weeklyPlay.type = 'weekly'
                weeklyPlay.condition = 'play'
                this.filteredAchievements.push(weeklyPlay)
            }
            let dailyWin = this.dailyAchievements.find(el => el.description.match("Win [0-9]+ Rush Matches"))
            if (dailyWin) {
                dailyWin.type = 'daily'
                dailyWin.condition = 'win'
                this.filteredAchievements.push(dailyWin)
            }
            let dailyPlay = this.dailyAchievements.find(el => el.description.match("Play [0-9]+ Rush Matches"))
            if (dailyPlay) {
                dailyPlay.type = 'daily'
                dailyPlay.condition = 'play'
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
        setNewUserRoster(val) {
            this.selectedUserRoster = val;
            this.$forceUpdate();
        },
        playMatch(achievement) {
            let isTotw = achievement.stageName === "TOTW"
            playRushPve(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.coreCircuitId, achievement.stageId, this.bannedMaps, this.selectedUserRoster, achievement.roster.id, isTotw).then(res => {
                if (res.data.success) {
                    if (res.data.data['game']['user1']['winner'] && achievement.progress.min < achievement.progress.max)
                        achievement.progress.min++
                    this.filteredAchievements.forEach(ach => {
                        if (ach.type === 'weekly' || ach.type === 'daily') {
                            if (ach.condition === 'play')
                                ach.progress.min++;
                            else if (ach.condition === 'win' && res.data.data['game']['user1']['winner'])
                                ach.progress.min++;
                        }
                    })
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
</style>