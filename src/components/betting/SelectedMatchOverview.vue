<template>
    <div>
        <h1>Selected match:</h1>
        <b-row align-h="center" align-v="center" cols="3">
            <b-col>
                <div
                    style="cursor: pointer; pointer-events: auto"
                    :class="selectedTeam === selectedMatch['opponents'][0]['opponent'].id ? 'team_selected' : ''"
                    @click="selectedTeam = selectedMatch['opponents'][0]['opponent'].id"
                >
                    <b-img
                        class="selected_match_team_logo"
                        :src="selectedMatch['opponents'][0]['opponent']['image_url']"
                    />
                    <div v-if="selectedTeam === selectedMatch['opponents'][0]['opponent'].id" class="team_selected_block">
                        <p style="color: white">
                            YOUR CHOICE!
                        </p>
                    </div>
                </div>
            </b-col>
            <b-col>
                <h4>{{parseDate(selectedMatch['begin_at'])}}</h4>
                <b-badge variant="dark">BO{{selectedMatch['number_of_games']}}</b-badge>
            </b-col>
            <b-col>
                <div
                    style="cursor: pointer; pointer-events: auto"
                    :class="selectedTeam === selectedMatch['opponents'][1]['opponent'].id ? 'team_selected' : ''"
                    @click="selectedTeam = selectedMatch['opponents'][1]['opponent'].id"
                >
                    <b-img
                        class="selected_match_team_logo"
                        :src="selectedMatch['opponents'][1]['opponent']['image_url']"
                    />
                    <div v-if="selectedTeam === selectedMatch['opponents'][1]['opponent'].id" class="team_selected_block">
                        <p style="color: white">
                            YOUR CHOICE!
                        </p>
                    </div>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
export default {
    name: "SelectedMatchOverview",
    props: ['selectedMatch'],
    data() {
        return {
            selectedTeam: null
        }
    },
    watch: {
        selectedTeam() {
            this.$emit('teamSelect', this.selectedTeam);
        }
    },
    methods: {
        parseDate(date) {
            const parsed = new Date(date);
            const hour = ('0' + parsed.getHours()).slice(-2);
            const minute = ('0' + parsed.getMinutes()).slice(-2);
            return `${hour}:${minute}`
        }
    }
}
</script>

<style scoped>
    .selected_match_team_logo{
        max-height: 120px;
        max-width: 120px;
    }

    .team_selected {
        outline-color: #1a850e;
        outline-style: solid;
    }

    .team_selected_block {
        height: 25px;
        background-color: #1a850e;
    }
</style>