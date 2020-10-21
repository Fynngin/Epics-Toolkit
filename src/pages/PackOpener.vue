<template>
    <div>
        <Sidebar id="sidebar"></Sidebar>
        <b-button v-b-toggle.sidebar style="float: left" class="ml-2 mr-2 bg-transparent border-transparent">
            <font-awesome-icon icon="align-justify" style="color: black"></font-awesome-icon>
        </b-button>

        <div class="calendar-parent">
            <calendar-view
                :items="packs"
                :startingDayOfWeek="1"
                :disablePast="false"
                :disableFuture="false"
                :show-date="showDate"
            >
                <calendar-view-header
                    slot="header"
                    slot-scope="{ headerProps }"
                    :header-props="headerProps"
                    @input="setShowDate"
                />
            </calendar-view>
        </div>

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
            showDate: new Date()
        }
    },
    mounted() {
        this.packs = []
        this.getPacks(1)
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
            let temp = groupBy(this.packs, 'created')
            for (const key in temp) {
                let test = groupBy(temp[key], 'packTemplate.name')
                for (const it in test) {
                    res.push({
                        items: test[it].map(el => el.id),
                        id: Math.floor(Math.random() * 10000000),
                        startDate: new Date(key),
                        title: it,
                        image: `${this.$store.state.cdnUrl}${test[it][0]['packTemplate']['images'][0].url}`
                    })
                }
            }
            this.packs = res
            console.log(res)
        },
        setShowDate(d) {
            this.showDate = d
        }
    }
}
</script>

<style scoped>
    .calendar-parent {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-x: hidden;
        overflow-y: hidden;
        max-height: 80vh;
        background-color: white;
    }
</style>