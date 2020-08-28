<script>
import { Radar } from 'vue-chartjs';

export default {
    name: "CardStats",
    props: ['card'],
    extends: Radar,
    data() {
        return {
            data: {
                labels: [],
                datasets: [{
                    label: 'test',
                    data: []
                }]
            },
            options: {
                scale: {
                    ticks: {
                        min: 0,
                        max: 100
                    }
                }
            }

        }
    },
    mounted() {
        this.data.datasets[0].label = this.card['title']
        let stats = this.card['playerStatsV2']
        Object.values(stats).forEach(stat => {
            this.data.labels.push(stat.name)
            this.data.datasets[0].data.push(stat.score)
        })
        this.renderChart(this.data, this.options)
    },
    watch:{
        card() {
            this.data.labels = []
            this.data.datasets[0].data = []
            this.data.datasets[0].label = this.card['title']
            let stats = this.card['playerStatsV2']
            Object.values(stats).forEach(stat => {
                this.data.labels.push(stat.name)
                this.data.datasets[0].data.push(stat.score)
            })
            this.renderChart(this.data, this.options)
        }
    }
}
</script>

<style scoped>

</style>