<template>
    <b-row class="container-fluid">
        <b-col>
            <b-form-group
                label-for="tag-search-input"
                label="Search:"
                label-cols-md="auto"
                class="mb-0"
                label-size="sm"
            >
                <b-form-input
                    v-model="countrySearch"
                    id="tag-search-input"
                    type="search"
                    size="sm"
                    autocomplete="off"
                    autofocus
                />
            </b-form-group>
        </b-col>
        <b-col style="overflow: scroll">
            <b-row class="flex-nowrap" style="max-width: inherit;">
                <b-col v-for="(country, index) in countryOptions" :key="index">
                    <b-badge
                        pill
                        href="#"
                        @click="switchCountry(country.short)"
                        :variant="tags.includes(country.short) ? 'success' : 'secondary'"
                    >
                        {{country.full}}
                    </b-badge>
                </b-col>
            </b-row>
        </b-col>
    </b-row>
</template>

<script>
import countries from '../assets/countries.json';

export default {
    name: "CountrySearch",
    countries: countries,
    data() {
        return {
            countrySearch: '',
            tags: []
        }
    },
    computed: {
        countryOptions() {
            return this.$options.countries.filter(country => {
                return country.full.toLowerCase().includes(this.countrySearch.toLowerCase())
            })
        }
    },
    methods: {
        switchCountry(country) {
            if (this.tags.includes(country)) {
                this.tags.splice(this.tags.indexOf(country))
            } else {
                this.tags.push(country)
            }
            this.$emit('country', this.tags);
        }
    }
}
</script>

<style scoped>

</style>