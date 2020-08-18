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
                        <b-col xl="2" md="4" class="mb-3" v-for="role in roles" :key="role.id">
                            <b-card
                                :header="role.name"
                                :border-variant="selectedRole === role.id ? 'primary' : 'dark'"
                                :header-bg-variant="selectedRole === role.id ? 'primary' : 'light'"
                                class="roleCard"
                                @click="selectRole(role.id)"
                            >
                                <b-img v-if="roster[role.id]" class="mh-100" :src="roster[role.id].images.size402"/>
                                <b-img v-else class="role-img mw-100 mh-100" :src="`${$store.state.cdnUrl}${role.images[0].url}`"/>
                            </b-card>
                        </b-col>
                        <b-col xl="2" md="4" class="mb-3">
                            <b-card
                                class="roleCard"
                                @click="selectRole(0)"
                                header="Flex"
                                :border-variant="selectedRole === 0 ? 'primary' : 'dark'"
                                :header-bg-variant="selectedRole === 0 ? 'primary' : 'light'"
                            >
                                <b-img v-if="roster['flex']" class="mh-100" :src="roster['flex'].images.size402"/>
                                <font-awesome-icon v-else size="5x" class="w-100" icon="random"/>
                            </b-card>
                        </b-col>
                        <b-col>
                            <strong>Team summary:</strong>
                            <p v-for="map in maps" :key="map.id" class="m-0" style="text-align: left">
                                {{map.name}}: {{mapBonus(map.id)}}%
                            </p>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2 mr-2">
            <b-col class="mb-2">
                <b-card border-variant="dark">
                    <b-row>
                        <b-col cols="4">
                            <b-form inline>
                                <b-form-select
                                    :options="sortOptions"
                                    v-model="sorting"
                                    @change="sortPlayers(sorting, sortDirection)"
                                />
                                <b-form-select
                                    v-if="sorting === 'map'"
                                    v-model="mapSort"
                                    :options="maps"
                                    @change="sortPlayers(sorting, sortDirection)"
                                    text-field="name"
                                    value-field="id"
                                    class="ml-2"
                                />
                                <font-awesome-icon
                                    v-if="sorting"
                                    class="ml-2"
                                    :icon="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                                    size="lg"
                                    @click="changeSortDirection"/>
                            </b-form>
                        </b-col>

                        <b-col cols="8">
                            <b-button style="float: right;" @click="addFilter" variant="primary">Add filter</b-button>
                            <b-form v-for="(filter, index) in filters" :key="index" inline class="mb-2">
                                <b-button @click="filters.splice(filters.indexOf(filter), 1)" variant="danger">X</b-button>
                                <b-form-select class="ml-2" :options="filterOptions" v-model="filter.type"/>
                                <b-form-select
                                    v-if="filter.type === 'map'"
                                    v-model="filter.map"
                                    :options="maps"
                                    text-field="name"
                                    value-field="id"
                                    class="ml-2"
                                />
                                <CountrySearch
                                    v-if="filter.type === 'country'"
                                    class="ml-2"
                                    @country="value => updateCountryFilter(filter, value)"
                                />
                                <b-col>
                                    <strong v-if="filter.type === 'map'">Min: {{filter.min}} %</strong>
                                    <b-form-input
                                        lazy
                                        type="range"
                                        min="-100"
                                        max="100"
                                        v-model="filter.min"
                                        v-if="filter.type === 'map'"
                                        @change="applyFilter"
                                    />
                                </b-col>
                                <b-col>
                                    <strong v-if="filter.type === 'map'">Max: {{filter.max}} %</strong>
                                    <b-form-input
                                        lazy
                                        type="range"
                                        min="-100"
                                        max="100"
                                        v-model="filter.max"
                                        v-if="filter.type === 'map'"
                                        @change="applyFilter"
                                    />
                                </b-col>
                            </b-form>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2 mr-2">
            <b-col>
                <b-card border-variant="dark">
                    <b-spinner v-if="spinner.players"/>
                    <b-row v-else-if="selectedPlayer.id === 0">
                        <b-col class="mb-3" xl="4" lg="6" sm="12" v-for="player in filteredPlayers" :key="player.id">
                            <b-card no-body @click="loadPlayerCards(player)">
                                <template v-slot:header>
                                    <h3 style="float: left">{{player.handle}}</h3>
                                    <country-flag class="ml-2" style="float: right" :country="player.country" size="normal"/>
                                    <p style="float: right">{{player.minSalary}}$ - {{player.maxSalary}}$</p>
                                </template>

                                <b-img class="playerFrame"
                                       :src="`${$store.state.cdnUrl}${player.images[0].url}`"
                                />

                                <b-row>
                                    <b-col cols="6" v-for="map in maps" :key="map.id" class="mb-2 p-1">
                                        <b-img class="w-75 map_img" :src="`${$store.state.cdnUrl}${map.images[0].url}`"/>
                                        <b-badge pill
                                                 style="position: absolute; left: 10%"
                                                 :variant="player.maps.find(m => {return m.mapId === map.id}).weight >= 1 ? 'success' : 'danger'">
                                            {{ round((player.maps.find(m => {return m.mapId === map.id}).weight - 1) * 100, 3)}} %
                                        </b-badge>
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-col>
                    </b-row>
                    <b-container v-else>
                        <b-spinner v-if="spinner.cards"/>
                        <b-button class="mb-3" @click="selectedPlayer.id = 0" v-else>Back</b-button>
                        <b-row>
                            <b-col class="mb-3" cols="4" v-for="card in cards[selectedPlayer.id]" :key="card.id">
                                <b-overlay :show="overlay === card.id" style="pointer-events: none">
                                    <b-card style="pointer-events: all" no-body @mouseover="overlay = card.id" @mouseleave="overlay = 0" @click="addCardToRoster(card)">
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
import CountrySearch from "@/components/CountrySearch";

export default {
    name: "TeamBuilder",
    components: {CountrySearch, Sidebar, CountryFlag},
    data() {
        return {
            roster: {
                'flex': null
            },
            selectedRole: 0,
            selectedPlayer: {
                id: 0
            },
            roles: [],
            players: [],
            filteredPlayers: [],
            playerMaps: [],
            cards: {},
            maps: [],
            overlay: 0,
            spinner: {
                'roles': true,
                'players': true,
                'cards': false
            },
            sortOptions: [
                {text: '--- Sort By ---', value: null},
                {text: 'Name', value: 'name'},
                {text: 'Map Bonus', value: 'map'}
            ],
            filterOptions: [
                {text: '--- Filter ---', value: null},
                {text: 'Team', value: 'team'},
                {text: 'Country', value: 'country'},
                {text: 'Map Bonus', value: 'map'}
            ],
            sorting: null,
            sortDirection: 'asc',
            mapSort: 1,
            filters: []
        }
    },
    created() {
        this.loadPlayers()
        this.loadRoleImages()
        this.loadMaps()
    },
    methods: {
        mapBonus(mapId) {
            let bonus = 1;
            for (const id in this.roster) {
                if (this.roster[id]) {
                    let map = this.roster[id].maps.find(m => {return m.mapId === mapId})
                    bonus *= map.weight
                }
            }
            return this.round((bonus - 1) * 100, 3)
        },
        addCardToRoster(card) {
            if (this.selectedRole === 0) {
                card.maps = this.selectedPlayer.maps
                this.roster['flex'] = card
            } else {
                card.maps = this.selectedPlayer.maps
                this.roster[this.selectedRole] = card
            }
            this.$forceUpdate();
        },
        updateCountryFilter(filter, value) {
            filter.countries = value
            this.applyFilter()
        },
        selectRole(roleId) {
            this.selectedRole = roleId;
            this.applyFilter();
        },
        applyFilter() {
            let temp = this.players
            if (this.selectedRole !== 0) {
                temp = temp.filter(player => {
                    return player.playerFrames[0].playerRoleId === this.selectedRole
                })
            }
            this.filters.forEach(filter => {
                if (filter.type === 'map') {
                    temp = temp.filter(player => {
                        let weight = player.maps.find(map => {return map.mapId === filter.map}).weight
                        return weight <= ((filter.max / 100) + 1) && weight >= ((filter.min / 100) + 1)
                    })
                }
                if (filter.type === 'country') {
                    if (filter.countries.length > 0) {
                        temp = temp.filter(player => {
                            return filter.countries.includes(player.country.toUpperCase())
                        })
                    }
                }
            })
            this.filteredPlayers = temp
        },
        addFilter() {
            this.filters.push({
                type: 'null',
                map: 1,
                min: 0,
                max: 100,
                countries: []
            })
        },
        sortPlayers(sortby, direction) {
            if (sortby === 'name') {
                this.filteredPlayers.sort((a,b) => {
                    return a.handle.localeCompare(b.handle)
                })
            } else if (sortby === 'map') {
                this.filteredPlayers.sort((a,b) => {
                    return a.maps.find(map => {return map.mapId === this.mapSort}).weight - b.maps.find(map => {return map.mapId === this.mapSort}).weight
                })
            }
            if (direction === 'desc') {
                this.filteredPlayers.reverse()
            }
        },
        changeSortDirection() {
            this.sortDirection === 'asc' ? this.sortDirection = 'desc' : this.sortDirection = 'asc'
            this.sortPlayers(this.sorting, this.sortDirection)
        },
        round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        },
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
                    this.filteredPlayers = this.players
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
        async loadPlayerCards(player) {
            this.selectedPlayer = player;
            if (!this.cards[player.id]) {
                this.spinner.cards = true;
                this.cards[player.id] = []
                let page = 1
                let neededRequests = 0
                await getCardsByPlayer(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.whaleId, player.id, this.$store.state.rushSeason, page).then(res => {
                    if (res.data.success) {
                        let cards = res.data.data.cards
                        neededRequests = Math.ceil(res.data.data.total / cards.length) - 1
                        cards.forEach(card => {
                            if (!this.cards[player.id].find(elem => {
                                return elem.id === card.cardTemplate.id
                            })) {
                                this.cards[player.id].push(card.cardTemplate)
                            }
                        })
                        page++
                    }
                })
                while (neededRequests > 0) {
                    await getCardsByPlayer(this.$store.state.userdata.jwt, this.$store.state.category, this.$store.state.whaleId, player.id, this.$store.state.rushSeason, page).then(res => {
                        if (res.data.success) {
                            let cards = res.data.data.cards
                            cards.forEach(card => {
                                if (!this.cards[player.id].find(elem => {
                                    return elem.id === card.cardTemplate.id
                                })) {
                                    this.cards[player.id].push(card.cardTemplate)
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
        position: absolute;
        width: inherit;
        height: inherit;
        max-width: 100%;
        filter: grayscale(1);
    }

    .map_img {
        filter: drop-shadow(4px 4px 5px rgba(0,0,0,0.9));
    }
</style>