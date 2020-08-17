<template>
    <div>
        <b-dropdown variant="outline-dark">
            <template v-slot:button-content>
                Select country ({{tags.length}} selected)
            </template>
            <b-dropdown-form>
                <b-form-input
                    placeholder="Search..."
                    v-model="countrySearch"
                    autofocus
                />
            </b-dropdown-form>
            <div style="max-height: 200px; overflow: auto">
                <b-dropdown-item v-for="country in countryOptions" :key="country.full" @click="addCountry(country)">
                    {{country.full}}
                </b-dropdown-item>
            </div>
            <div class="ml-2">
                <b-form-tag
                    variant="primary"
                    v-for="(country, index) in tags"
                    :key="country.full"
                    @remove="removeCountry(index)">
                    {{country.full}}
                </b-form-tag>
            </div>
        </b-dropdown>
    </div>
</template>

<script>
import countries from '../assets/countries.json';

export default {
    name: "CountrySearch",
    countries: countries,
    data() {
        return {
            countrySearch: '',
            tags: [],
            shortTags: []
        }
    },
    computed: {
        countryOptions() {
            return this.$options.countries.filter(country => {
                return !this.tags.includes(country) && country.full.toLowerCase().includes(this.countrySearch.toLowerCase())
            })
        }
    },
    methods: {
        addCountry(country) {
            this.tags.push(country)
            this.shortTags.push(country.short)
            this.$emit('country', this.shortTags);
        },
        removeCountry(index) {
            this.tags.splice(index, 1)
            this.shortTags.splice(index, 1)
            this.$emit('country', this.shortTags);
        }
    }
}
</script>

<style scoped>

</style>