<script>
    import { Pie } from 'vue-chartjs'
    import 'chartjs-plugin-colorschemes';
    import axios from "axios";

    export default {
        name: "SpinnerOddsChart",
        props: ['category'],
        data() {
            return {
                data: {
                    labels: [],
                    datasets: [{
                        data: []
                    }]
                },
                options: {
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.SetThree12'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
            }
        },
        extends: Pie,
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
                this.data.labels = []
                this.data.datasets[0].data = []
                axios("https://api.epics.gg/api/v1/spinner", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-jwt': this.$store.state.userdata.jwt
                    },
                    params: {
                        'categoryId': this.category
                    }
                }).then(response => {
                    if (response.data.success) {
                        this.$emit('error', false);
                        this.parseData(response.data.data.items)
                    }
                }).catch(() => {
                    this.$emit('loading', false);
                    this.$emit('error', true);
                })
            },
            parseData(data) {
                let unsorted = []
                data.forEach(item => {
                    unsorted.push({
                        label: item.name,
                        data: item['chance']
                    })
                })
                let sorted = unsorted.sort(function(a, b) {
                    return b.data - a.data;
                });

                sorted.forEach(item => {
                    this.data.labels.push(item.label)
                    this.data.datasets[0].data.push(item.data)
                })

                this.$emit('loading', false);
                this.renderChart(this.data, this.options);
                this.$emit('spinnerData', this.data.datasets);
            }
        }
    }
</script>