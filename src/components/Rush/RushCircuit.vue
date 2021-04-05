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
                        <b-list-group-item v-for="team in stageRosters[idx]" :key="team.id">
                            <b-row>
                                <b-col cols="2">
                                    <b-img
                                        class="team_logo"
                                        :src="`${$store.state.cdnUrl}${team.images.find(el => el.name === 'team_logo').url}`"
                                    />
                                </b-col>
                                <b-col cols="4">
                                    <h4 style="text-align: left">{{team.name}}</h4>
                                </b-col>
                            </b-row>
                        </b-list-group-item>
                    </b-list-group>
                </b-collapse>
            </b-list-group-item>
        </b-list-group>
    </b-card>
</template>

<script>
import {getRostersById, getTeams} from "@/api";

export default {
    name: "RushCircuit",
    props: ['circuit'],
    data() {
        return {
            teams: [],
            stageRosters: {}
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
</style>