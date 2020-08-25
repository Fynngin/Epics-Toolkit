<template>
    <div>
        <b-dropdown variant="outline-dark">
            <template v-slot:button-content>
                Select team ({{tags.length}} selected)
            </template>
            <b-dropdown-form>
                <b-form-input
                    placeholder="Search..."
                    v-model="teamSearch"
                    autofocus
                />
            </b-dropdown-form>
            <div style="max-height: 200px; overflow: auto">
                <b-dropdown-item v-for="team in teamOptions" :key="team.id" @click="addTeam(team)">
                    <b-card-img
                        class="team_logo"
                        :src="`${$store.state.cdnUrl}${team.images.find(img => {return img.name === 'team_logo'}).url}`"
                        style="height: 1.5rem; width: auto;"
                    />
                    {{team.name}}
                </b-dropdown-item>
            </div>
            <div class="ml-2">
                <b-form-tag
                    variant="primary"
                    v-for="(team, index) in tags"
                    :key="team.id"
                    @remove="removeTeam(index)">
                    {{team.name}}
                </b-form-tag>
            </div>
        </b-dropdown>
    </div>
</template>

<script>
import {getTeams} from "@/api";

export default {
    name: "TeamSearch",
    data() {
        return {
            teams: [],
            teamSearch: '',
            tags: [],
            ids: []
        }
    },
    created() {
        getTeams(this.$store.state.userdata.jwt).then(res => {
            if (res.data.success) {
                this.teams = res.data.data.teams
            }
        })
    },
    computed: {
        teamOptions() {
            return this.teams.filter(team => {
                return !this.ids.includes(team.id)
                    && team.name.toLowerCase().includes(this.teamSearch.toLowerCase())
                    && team['shortName'] !== 'OTW'
            })
        }
    },
    methods: {
        addTeam(team) {
            this.tags.push(team)
            this.ids.push(team.id)
            this.$emit('team', this.ids);
        },
        removeTeam(index) {
            this.tags.splice(index, 1)
            this.ids.splice(index, 1)
            this.$emit('team', this.ids);
        }
    }
}
</script>

<style scoped>
    .team_logo {
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