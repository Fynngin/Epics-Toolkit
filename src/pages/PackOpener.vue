<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 mr-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <b-row class="ml-2">
            <b-col class="mb-2">
                <b-card border-variant="dark" class="mb-2">
                    <b-form inline>
                        <b-form-input v-model="search" placeholder="Search..."/>
                    </b-form>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2">
            <b-col class="mb-2">
                <div class="calendar-parent">
                    <calendar-view
                        class="theme-default"
                        :items="filteredPacks"
                        :startingDayOfWeek="1"
                        :disablePast="false"
                        :disableFuture="false"
                        :show-date="showDate"
                        @click-item="onClickItem"
                    >
                        <calendar-view-header
                            slot="header"
                            slot-scope="{ headerProps }"
                            :header-props="headerProps"
                            @input="setShowDate"
                        />
                    </calendar-view>
                </div>
            </b-col>
        </b-row>

        <b-row class="ml-2" v-if="selectedItem">
            <b-col>
                <b-card border-variant="dark">
                    <b-row>
                        <b-col>
                            <b-img :src="selectedItem.image" style="height: 200px"/>
                        </b-col>
                        <b-col>
                            <h2>{{selectedItem.title}}</h2>
                            <p><strong>Mint-Date: </strong>{{parsedDate}}</p>
                            <p><strong>Amount: </strong>{{selectedItem.items.length}}</p>
                        </b-col>
                        <b-col>
                            <h5>Amount to open:</h5>
                            <b-form-input type="range" min="1" :max="selectedItem.items.length" v-model="openAmount"/>
                            <b-form-input type="number" min="1" :max="selectedItem.items.length" v-model="openAmount"/>
                            <b-button class="mt-2" variant="outline-success">Open</b-button>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

    </div>
</template>

<script>
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"
import Sidebar from "@/components/Sidebar";
import {getUserPacks} from "@/api";
import {groupBy} from 'lodash';

export default {
    name: "PackOpener",
    components: {
        CalendarView,
        CalendarViewHeader,
        Sidebar
    },
    data() {
        return {
            packs: [],
            showDate: new Date(),
            search: "",
            selectedItem: null,
            openAmount: 1
        }
    },
    mounted() {
        this.packs = []
        this.getPacks(1)
    },
    computed: {
        filteredPacks() {
            return this.packs.filter(pack => {
                if (this.search.length > 0)
                    return pack.title.toUpperCase().includes(this.search.toUpperCase())
                else
                    return this.packs
            })
        },
        parsedDate() {
            let year = this.selectedItem.startDate.getFullYear()
            let day = this.selectedItem.startDate.getDate()
            let shortMonthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format;
            let month = shortMonthName(this.selectedItem.startDate);

            return `${day} ${month} ${year}`
        }
    },
    methods: {
        getPacks(page) {
            getUserPacks(this.$store.state.userdata.jwt, this.$store.state.category, page).then(res => {
                if (res.data.success) {
                    if (res.data.data.count > 0) {
                        this.packs = this.packs.concat(res.data.data.packs)
                        this.getPacks(++page)
                    } else {
                        this.sortPacks();
                    }
                }
            })
        },
        sortPacks() {
            let res = []
            this.packs.forEach(pack => {
                pack.created = pack.created.split('T')[0]
            })
            let groupByDate = groupBy(this.packs, 'created')
            for (const key in groupByDate) {
                let groupByName = groupBy(groupByDate[key], 'packTemplate.name')
                for (const it in groupByName) {
                    res.push({
                        items: groupByName[it].map(el => el.id),
                        id: Math.floor(Math.random() * 10000000),
                        startDate: new Date(key),
                        title: it,
                        url: "https://app.epics.gg/",
                        image: `${this.$store.state.cdnUrl}${groupByName[it][0]['packTemplate']['images'][0].url}`
                    })
                }
            }
            this.packs = res
        },
        setShowDate(d) {
            this.showDate = d
        },
        onClickItem(item) {
            this.selectedItem = item.originalItem
        }
    }
}
</script>

<style scoped>
    .calendar-parent {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        height: 600px;
        background-color: white;
    }
</style>