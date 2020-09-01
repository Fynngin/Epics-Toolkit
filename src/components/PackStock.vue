<script>
    import { Bar } from "vue-chartjs";
    import 'chartjs-plugin-colorschemes';
    import {getStorePacks} from "@/api";

    export default {
        name: "PackStock",
        props: ['category'],
        data() {
            return {
                data: {
                    labels: [''],
                    datasets: []
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.SetThree12'
                        }
                    }
                },
                packs: []
            }
        },
        extends: Bar,
        mounted() {
            this.getData();
        },
        watch: {
            category() {
                this.getData();
            }
        },
        methods: {
            getData() {
                this.$emit('loading', true);
                this.data.datasets = [];
                this.packs = [];
                this.sendRequest(1);
            },
            sendRequest(page) {
                getStorePacks(this.$store.state.userdata.jwt, this.category, page).then(response => {
                    if (response.data.success) {
                        if (response.data.data.length > 0) {
                            this.packs = this.packs.concat(response.data.data)
                            this.sendRequest(++page)
                        } else {
                            this.parseData();
                        }
                    }
                })
            },
            parseData() {
                let unsorted = []
                let today = new Date()

                this.packs.forEach(pack => {
                    let available = false;
                    if (pack['inventoryCount'] > 0) {
                        if (!pack['purchaseEnd']) {
                            if (pack['packPrimary'] === 'event') {
                                if (pack.properties.seasons.includes(this.$store.state.currentSeasons[this.category])) {
                                    available = true;
                                }
                            } else {
                                available = true;
                            }
                        } else {
                            let purchaseEnd = new Date(pack['purchaseEnd'])
                            if (purchaseEnd > today) {
                                available = true;
                            }
                        }
                    }

                    if (available) {
                        unsorted.push({
                            label: pack.name,
                            data: pack['inventoryCount']
                        })
                    }
                })

                let sorted = unsorted.sort(function(a, b) {
                    return b.data - a.data;
                });

                sorted.forEach(item => {
                    this.data.datasets.push({
                        label: item.label,
                        data: [item.data]
                    })
                })

                this.$emit('loading', false);
                this.renderChart(this.data, this.options)
            }
        }
    }
</script>