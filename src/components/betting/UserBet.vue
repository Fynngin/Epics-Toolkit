<template>
    <div class="container" @click="$bvModal.show(betDetailsModalId)">
        <div class="pickedTeamLogo">
            <b-img
                style="height: inherit"
                :src="pickedTeam['opponent']['image_url']"
            />
        </div>
        <p class="vsText">vs</p>
        <div class="opposingTeamLogo">
            <b-img
                style="height: inherit"
                :src="opposingTeam['opponent']['image_url']"
            />
        </div>

        <b-modal :id="betDetailsModalId" :title="bet['match'].name">
            <b-row align-v="center">
                <b-col>
                    <h4 style="display: inline">Your pick:</h4>
                    <b-img
                        class="ml-2"
                        style="height: 40px"
                        :src="pickedTeam['opponent']['image_url']"
                        v-b-tooltip:hover
                        :title="pickedTeam['opponent']['name']"
                    />
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <h4 style="display: inline">Tournament:</h4>
                    <b-img
                        class="ml-2"
                        style="height: 40px"
                        :src="bet['match']['league']['image_url']"
                        v-b-tooltip:hover
                        :title="bet['match']['serie']['full_name']"
                    />
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <h4 style="display: inline">Starting at:</h4>
                    <span>
                        {{parseDate(bet['match']['begin_at'])}}
                    </span>
                </b-col>
            </b-row>

            <hr>
            <h2>Stake:</h2>
            <b-row>
                <b-col>
                    <b-row>
                        <b-col class="mb-2" lg="3" sm="4" v-for="item in totalStake" :key="item.id">
                            <b-img :src="item['images']['size402']" class="stakedItem"/>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
            <template v-slot:modal-footer>
                <b-button variant="outline-danger" @click="removeBet()">
                    Remove bet
                </b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import * as dayjs from "dayjs";

export default {
    name: "UserBet",
    props: ['bet'],
    data() {
        return {
            pickedTeam: {},
            opposingTeam: {}
        }
    },
    created() {
        this.initTeams();
    },
    computed: {
        betDetailsModalId() {
            return 'betDetailsModal_' + this.bet.id;
        },
        totalStake() {
            let items = [];
            Object.values(this.bet.stake).forEach(template =>  {
                items = items.concat(template)
            })
            return items;
        }
    },
    methods: {
        initTeams() {
            let pickedTeamIdx = this.bet['match']['opponents'].findIndex(team => team['opponent'].id === this.bet['selectedTeamId'])
            this.pickedTeam = this.bet['match']['opponents'][pickedTeamIdx]
            this.opposingTeam = pickedTeamIdx === 0 ? this.bet['match']['opponents'][1] : this.bet['match']['opponents'][0]
        },
        removeBet() {
            this.$emit('removeBet');
            this.$bvModal.hide(this.betDetailsModalId);
        },
        parseDate(date) {
            return dayjs(date).format('DD MMMM YYYY HH:mm')
        },
    }
}
</script>

<style scoped>
    .container {
        width: 150px;
        height: 100px;
        border-radius: 25px;
        border: solid #0baaaa;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: .2s;
    }

    .container:hover {
        transform: scale(1.1);
    }

    .pickedTeamLogo {
        position: absolute;
        height: inherit;
        left: -20px;
        transform: rotate(-20deg);
        pointer-events: none;
    }

    .opposingTeamLogo {
        position: absolute;
        height: 80%;
        right: -15px;
        bottom: -20px;
        transform: rotate(-20deg);
        filter: grayscale(100%);
        pointer-events: none;
    }

    .vsText {
        position: absolute;
        right: 25%;
        top: 5%;
        pointer-events: none;
        /*font-family: "Proxima Nova", sans-serif;*/
    }

    .stakedItem {
        width: inherit;
        transition: .3s;
        cursor: pointer;
    }

    .stakedItem:hover {
        transform: scale(1.5);
    }
</style>