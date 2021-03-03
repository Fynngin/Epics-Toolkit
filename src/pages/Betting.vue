<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-row class="mb-2">
            <b-button v-b-toggle.sidebar style="float: left" class="ml-4 bg-transparent border-transparent">
                <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
            </b-button>
        </b-row>

        <b-row v-if="userBets.length > 0" class="mb-2">
            <b-col style="display: block; white-space: nowrap; overflow-x: auto;">
                <div style="height: 160px;">
                    <h2>Your bets:</h2>
                    <UserBet
                        class="mr-3"
                        style="display: inline-block; white-space: nowrap;"
                        v-for="bet in userBets" :key="bet.id"
                        :bet="bet"
                        @removeBet="removeUserBet(bet.id)"
                    />
                </div>
            </b-col>
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
                    <b-collapse visible :id="`collapse-${date}`" v-if="!matchesLoading">
                        <h-l-t-v-match
                            class="ml-5 mb-2"
                            v-for="match in matches"
                            :key="match.id"
                            :match="match"
                            @selectMatch="selectedMatch = match"
                        />
                    </b-collapse>
                </div>
            </b-col>

            <b-col cols="6" v-if="selectedMatch">
                <SelectedMatchOverview
                    :selected-match="selectedMatch"
                    @teamSelect="team => selectedTeam = team"
                />
                <StakeOverview
                    v-if="!stakeEmpty"
                    :stake="stake"
                    @removeItem="value => updateStake({templateId: value, items: []})"
                    @createBet="createBet"
                />
                <CollectionSelect
                    :use-dropdown="true"
                    @collectionChange="coll => selectedCollection = coll"
                    class="mb-2"
                />
                <CollectionOverview
                    v-if="selectedCollection"
                    :collection="selectedCollection"
                    :stake="stake"
                    @stakeUpdate="value => updateStake(value)"
                />
            </b-col>
        </b-row>

        <FeedbackToast
            id="feedback-toast"
            :title="feedbackHeader"
            :type="feedbackType"
            :description="errMsg"
        />
    </div>
</template>

<script>
import HLTVMatch from "@/components/HLTVMatch";
import _ from 'lodash';
import Sidebar from "@/components/Sidebar";
import {getMatchesByStartDate} from "@/csgoApi";
import * as dayjs from "dayjs";
import SelectedMatchOverview from "../components/betting/SelectedMatchOverview";
import CollectionSelect from "../components/CollectionSelect";
import CollectionOverview from "../components/betting/CollectionOverview";
import StakeOverview from "../components/betting/StakeOverview";
import FeedbackToast from "../components/FeedbackToast";
import firebase from "../firebaseConfig";
import UserBet from "../components/betting/UserBet";
const db = firebase.firestore();

export default {
    name: "Betting",
    components: {
        UserBet,
        FeedbackToast,
        StakeOverview, CollectionOverview, CollectionSelect, SelectedMatchOverview, Sidebar, HLTVMatch},
    data() {
        return {
            matches: [],
            matchesByDate: {},
            collapsedDates: {},
            selectedMatch: null,
            selectedTeam: null,
            selectedCollection: null,
            stake: {},
            errMsg: "",
            feedbackType: "",
            feedbackHeader: "",
            matchesLoading: true,
            userBets: []
        }
    },
    created() {
        this.init();
    },
    computed: {
        stakeEmpty() {
            return Object.values(this.stake).length === 0
        }
    },
    methods: {
        init() {
            this.matchesLoading = true;
            const today = dayjs().toISOString();
            const tomorrow = dayjs().add(7, 'day').toISOString();
            getMatchesByStartDate(today, tomorrow).then(res => {
                this.matches = res.data.filter(match => {
                    return match['opponents'].length === 2 && ['s', 'a', 'b', 'c'].includes(match['serie']['tier']);
                })
                this.matches.forEach(match => {
                    const dateTimeSplit = match['begin_at'].split('T');
                    match.date = dateTimeSplit[0];
                    match.bets = [];
                })
                this.groupMatchesByDate();
                this.getOpenBets();
            })
        },
        groupMatchesByDate() {
            const matches = _.groupBy(this.matches, 'date');

            // weird sorting needed to change iteration order for Object.keys()
            const keys = Object.keys(matches)
            keys.sort()
            keys.forEach(key => {
                this.matchesByDate[key] = matches[key]
            })
            this.$forceUpdate();
        },
        async getOpenBets() {
            let openBetDB = db.collection("open_bets")
            await openBetDB.get().then(snap => {
                snap.forEach(doc => {
                    let data = doc.data();
                    data.id = doc.id;
                    let assignedMatch = this.matchesByDate[data.matchDate].findIndex(el => el.id === data.matchId)

                    if (doc.id.split('_')[1] === this.$store.state.userdata.id.toString()) {
                        if (assignedMatch !== undefined) {
                            data.match = this.matchesByDate[data.matchDate][assignedMatch];
                        } else {
                            // cleanup bets that are no longer valid
                            this.deleteBet(doc.id)
                        }
                        this.userBets.push(data);
                    } else {
                        if (assignedMatch !== undefined) {
                            const newLength = this.matchesByDate[data.matchDate][assignedMatch].bets.length + 1;
                            this.matchesByDate[data.matchDate][assignedMatch].bets.splice(newLength);
                            this.$set(this.matchesByDate[data.matchDate][assignedMatch].bets, this.matchesByDate[data.matchDate][assignedMatch].bets.length, data);
                        } else {
                            // cleanup bets that are no longer valid
                            this.deleteBet(doc.id)
                        }
                    }
                })
            })
            this.matchesLoading = false;
        },
        removeUserBet(id) {
            const betIdx = this.userBets.findIndex(bet => bet.id === id)
            this.userBets.splice(betIdx, 1);
            this.deleteBet(id);
        },
        async deleteBet(doc) {
            let openBetDB = db.collection("open_bets").doc(doc)
            openBetDB.delete().then(() => {
                this.errMsg = "Successfully removed bet!";
                this.feedbackHeader = "Success!";
                this.feedbackType = "success";
                this.$bvToast.show('feedback-toast');
            })
        },
        collapseDate(date) {
            if (this.collapsedDates[date] === undefined) {
                this.collapsedDates[date] = false;
            } else {
                this.collapsedDates[date] = !this.collapsedDates[date];
            }
        },
        parseDate(date) {
            const parsed = new Date(date);
            const hour = ('0' + parsed.getHours()).slice(-2);
            const minute = ('0' + parsed.getMinutes()).slice(-2);
            return `${hour}:${minute}`
        },
        updateStake(newItems) {
            if (newItems.items.length === 0) {
                delete this.stake[newItems.templateId];
                this.stake = Object.assign({}, this.stake, this.stake);
            } else {
                this.$set(this.stake, newItems.templateId, newItems.items);
            }
        },
        createBet() {
            if (!this.selectedTeam) {
                this.errMsg = "You need to pick a team to win!";
                this.feedbackHeader = "Error!";
                this.feedbackType = "error";
                this.$bvToast.show('feedback-toast');
                return;
            }

            if (Object.keys(this.stake).length === 0) {
                this.errMsg = "You need to add some items to your bet!";
                this.feedbackHeader = "Error!";
                this.feedbackType = "error";
                this.$bvToast.show('feedback-toast');
                return;
            }

            let stake = {};
            for (const templateId of Object.keys(this.stake)) {
                const items = this.stake[templateId];
                stake[templateId] = items.map(it => {
                    if (it.type === "card") {
                        const el = it.cardTemplate;
                        return {
                            cardTemplate: {
                                id: el.id,
                                images: el.images,
                                title: el.title,
                                cardType: el.cardType
                            },
                            mintBatch: it.mintBatch,
                            mintNumber: it.mintNumber,
                            id: it.id,
                            level: it.level,
                            type: it.type,
                            images: it.images
                        }
                    } else {
                        const el = it.stickerTemplate;
                        return {
                            stickerTemplate: {
                                id: el.id,
                                images: el.images,
                                title: el.title
                            },
                            mintBatch: it.mintBatch,
                            mintNumber: it.mintNumber,
                            id: it.id,
                            level: it.level,
                            type: it.type
                        }
                    }
                })
            }
            let bet = {
                matchId: this.selectedMatch.id,
                matchDate: this.selectedMatch['begin_at'].split('T')[0],
                selectedTeamId: this.selectedTeam,
                stake: stake,
                userId: this.$store.state.userdata.id
            }
            this.uploadBet(bet);
        },
        uploadBet(bet) {
            const randomToken = Math.random().toString(16).substr(2, 8);
            let openBetDB = db.collection("open_bets").doc(`${bet.matchId}_${this.$store.state.userdata.id}_${randomToken}`)
            openBetDB.set(bet).then(() => {
                this.errMsg = "Successfully created bet!";
                this.feedbackHeader = "Success!";
                this.feedbackType = "success";
                this.$bvToast.show('feedback-toast');
            })
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