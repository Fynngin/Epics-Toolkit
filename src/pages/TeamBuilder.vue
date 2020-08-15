<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>
        <h1>Welcome {{this.$store.state.userdata.username}}!</h1>

        <b-row class="ml-2 mr-2">
            <b-col class="mb-2">
                <b-card border-variant="dark">
                    <b-spinner v-if="spinner.roles"/>
                    <b-row v-else align-h="center">
                        <b-col xl="2" md="4" class="mb-3">
                            <b-card border-variant="dark" class="roleCard" @click="selectedRole = roles[0].id">
                                {{roles[0].name}}
                                <b-img class="role-img mw-100 mh-100" :src="`${$store.state.cdnUrl}${roles[0].images[0].url}`"/>
                            </b-card>
                        </b-col>
                        <b-col xl="2" md="4" class="mb-3">
                            <b-card border-variant="dark" class="roleCard" @click="selectedRole = roles[2].id">
                                {{roles[2].name}}
                                <b-img class="role-img mw-100 mh-100" :src="`${$store.state.cdnUrl}${roles[2].images[0].url}`"/>
                            </b-card>
                        </b-col>
                        <b-col xl="2" md="4" class="mb-3">
                            <b-card border-variant="dark" class="roleCard" @click="selectedRole = 0">
                                Flex
                                <font-awesome-icon size="5x" class="w-100" icon="random"/>
                            </b-card>
                        </b-col>
                        <b-col xl="2" md="4" class="mb-3">
                            <b-card border-variant="dark" class="roleCard" @click="selectedRole = roles[1].id">
                                {{roles[1].name}}
                                <b-img class="role-img mw-100 mh-100" :src="`${$store.state.cdnUrl}${roles[1].images[0].url}`"/>
                            </b-card>
                        </b-col>
                        <b-col xl="2" md="4" class="mb-3">
                            <b-card border-variant="dark" class="roleCard" @click="selectedRole = roles[3].id">
                                {{roles[3].name}}
                                <b-img class="role-img mw-100 mh-100" :src="`${$store.state.cdnUrl}${roles[3].images[0].url}`"/>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2 mr-2">
            <b-col>
                <b-card border-variant="dark">
                    <b-spinner v-if="spinner.players"/>
                    <b-row v-else-if="selectedPlayer === 0">
                        <b-col class="mb-3" xl="4" lg="6" sm="12" v-for="player in playerOptions" :key="player.id">
                            <b-card no-body @click="loadPlayerCards(player.id)">
                                <b-row>
                                    <b-col cols="4">
                                        <b-img class="playerFrame"
                                               :src="`${$store.state.cdnUrl}${player.images[0].url}`"
                                        />
                                    </b-col>
                                    <b-col cols="8">
                                        <b-row class="mb-2">
                                            <strong>{{player.minSalary}}$ - {{player.maxSalary}}$</strong>
                                            <country-flag style="float: right" :country="player.country" size="big"/>
                                        </b-row>

                                        <b-row>
                                            <b-col cols="6" v-for="map in maps" :key="map.id" class="mb-2 p-1">
                                                <b-img class="w-75" :src="`${$store.state.cdnUrl}${map.images[0].url}`"/>
                                                <b-badge>{{player.maps.find(m => {return m.mapId === map.id}).weight}}</b-badge>
                                            </b-col>
                                        </b-row>
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-col>
                    </b-row>
                    <b-container v-else>
                        <b-spinner v-if="spinner.cards"/>
                        <b-button class="mb-3" @click="selectedPlayer = 0" v-else>Back</b-button>
                        <b-row>
                            <b-col class="mb-3" cols="4" v-for="card in cards[selectedPlayer]" :key="card.id">
                                <b-overlay :show="overlay === card.id" style="pointer-events: none">
                                    <b-card style="pointer-events: all" no-body @mouseover="overlay = card.id" @mouseleave="overlay = 0">
                                        <b-card-img :src="`${card.images.size402}`"/>
                                    </b-card>
                                    <template v-slot:overlay>
                                        <div>
                                            <h2>{{card.properties.salary}} $</h2>
                                            <h3>{{card.properties.player_rating}} OVR</h3>
                                        </div>
                                    </template>
                                </b-overlay>
                            </b-col>
                        </b-row>
                    </b-container>

                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import Sidebar from "../components/Sidebar";
import {getPlayerMaps, getPlayers, getRoles, getMaps, getCardsByPlayer} from "@/api";
import CountryFlag from 'vue-country-flag';

export default {
    name: "TeamBuilder",
    components: {Sidebar, CountryFlag},
    data() {
        return {
            roster: {
                'flex': null
            },
            selectedRole: 0,
            selectedPlayer: 0,
            roles: [],
            players: [],
            playerMaps: [],
            cards: {},
            maps: [],
            overlay: 0,
            spinner: {
                'roles': true,
                'players': true,
                'cards': false
            }
        }
    },
    created() {
        this.loadPlayers()
        this.loadRoleImages()
        this.loadMaps()
    },
    computed: {
        playerOptions() {
            if (this.selectedRole !== 0) {
                return this.players.filter(player => {
                    return player.playerFrames[0].playerRoleId === this.selectedRole
                })
            }
            return this.players
        }
    },
    methods: {
        async loadPlayers() {
            this.spinner.players = true
            await this.loadPlayerMaps()
            getPlayers(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                if (res.data.success) {
                    res.data.data.players.forEach(player => {
                        if (player.maxSalary !== null && player.minSalary !== null) {
                            // write maps to player object
                            let playerMaps = this.playerMaps.find(p => {
                                return p.playerId === player.id
                            })
                            if (playerMaps) {
                                player.maps = playerMaps.properties.maps
                                this.players.push(player)
                            }
                        }
                    })
                    this.spinner.players = false
                }
            })
        },
        loadRoleImages() {
            this.spinner.roles = true
            getRoles(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                if (res.data.success) {
                    this.roles = res.data.data
                    this.roles.forEach(role => {
                        this.roster[role.id] = null
                    })
                    this.spinner.roles = false
                }
            })
        },
        async loadPlayerMaps() {
            await getPlayerMaps(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                if (res.data.success) {
                    this.playerMaps = res.data.data.players
                } else {
                    this.playerMaps = []
                }
            })
        },
        loadMaps() {
            getMaps(this.$store.state.userdata.jwt, this.$store.state.category).then(res => {
                if (res.data.success) {
                    this.maps = res.data.data.maps
                } else {
                    this.maps = []
                }
            })
        },
        async loadPlayerCards(playerId) {
            this.selectedPlayer = playerId;
            if (!this.cards[playerId]) {
                this.spinner.cards = true;
                this.cards[playerId] = []
                let page = 1
                let neededRequests = 0
                await getCardsByPlayer(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.whaleId, playerId, this.$store.state.rushSeason, page).then(res => {
                    if (res.data.success) {
                        let cards = res.data.data.cards
                        neededRequests = Math.ceil(res.data.data.total / cards.length) - 1
                        cards.forEach(card => {
                            if (!this.cards[playerId].find(elem => {
                                return elem.id === card.cardTemplate.id
                            })) {
                                this.cards[playerId].push(card.cardTemplate)
                            }
                        })
                        page++
                    }
                })
                while (neededRequests > 0) {
                    await getCardsByPlayer(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.whaleId, playerId, this.$store.state.rushSeason, page).then(res => {
                        if (res.data.success) {
                            let cards = res.data.data.cards
                            cards.forEach(card => {
                                if (!this.cards[playerId].find(elem => {
                                    return elem.id === card.cardTemplate.id
                                })) {
                                    this.cards[playerId].push(card.cardTemplate)
                                }
                            })
                            page++
                            neededRequests--
                        }
                    })
                }
                this.spinner.cards = false;
                this.$forceUpdate();
            }
        }
    }
}
</script>

<style scoped>
    .role-img {
        -webkit-filter: drop-shadow(1px 1px 0 black)
                        drop-shadow(-1px 1px 0 black)
                        drop-shadow(1px -1px 0 black)
                        drop-shadow(-1px -1px 0 black);

        filter: drop-shadow(1px 1px 0 black)
                drop-shadow(-1px 1px 0 black)
                drop-shadow(1px -1px 0 black)
                drop-shadow(-1px -1px 0 black);

        margin: 0;
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .roleCard {
        height: 200px;
    }

    .playerFrame {
        width: auto;
        max-height: 400px;
    }
</style>