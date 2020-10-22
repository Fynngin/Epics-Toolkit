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
                    <b-spinner v-if="spinner"/>
                    <calendar-view
                        v-else
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

        <b-row class="ml-2 mb-2" v-if="selectedItem">
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
                            <b-button class="mt-2" variant="outline-success" @click="openPacks">Open</b-button>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="ml-2" v-if="opening">
            <b-col>
                <b-card border-variant="dark">
                    <b-row>
                        <b-row align-h="start">
                            <b-col class="mb-2" v-for="item in newItems" :key="item.id">
                                <b-img v-if="item['cardTemplate']" :src="item.images['size402']" style="height: 200px"/>
                                <b-img v-else :src="`${$store.state.cdnUrl}${item['stickerTemplate'].images[1].url}`" style="height: 200px"/>
                            </b-col>
                        </b-row>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <FeedbackToast id="feedback-toast" :title="toastTitle" :type="toastType" :description="toastDescription"/>
    </div>
</template>

<script>
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"
import Sidebar from "@/components/Sidebar";
import FeedbackToast from "@/components/FeedbackToast";
import {getUserPacks, openPack} from "@/api";
import {groupBy} from 'lodash';

export default {
    name: "PackOpener",
    components: {
        CalendarView,
        CalendarViewHeader,
        Sidebar,
        FeedbackToast
    },
    data() {
        return {
            packs: [],
            showDate: new Date(),
            search: "",
            selectedItem: null,
            openAmount: 1,
            opening: false,
            newItems: [],
            spinner: false,
            toastTitle: "",
            toastType: "",
            toastDescription: "",
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
            this.spinner = true
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
            this.spinner = false
        },
        setShowDate(d) {
            this.showDate = d
        },
        onClickItem(item) {
            this.selectedItem = item.originalItem
        },
        openPacks() {
            this.opening = true
            this.newItems = []
            let promises = []
            for (let i = 0; i < this.openAmount; i++) {
                let packId = this.selectedItem.items[i]
                promises.push(openPack(this.$store.state.userdata.jwt, this.$store.state.category, packId).then(res => {
                    if (res.data.success) {
                        this.newItems = this.newItems.concat(res.data.data.cards).concat(res.data.data.stickers)
                    }
                }).catch(err => {
                    this.toastType = "error"
                    if (err.response.data['errorCode'] === "pack_already_opened") {
                        this.toastTitle = "Pack already opened."
                        this.toastDescription = err.response.data.error
                    } else {
                        this.toastTitle = "Error 404"
                        this.toastDescription = "Ooops... Something went wrong"
                    }
                    this.$bvToast.show("feedback-toast")
                }))
            }
            Promise.all(promises).then(() => {
                this.selectedItem.items.splice(0, this.openAmount)
                this.packs = []
                this.getPacks(1)
            })
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