<script>
import { Radar } from 'vue-chartjs';

export default {
    name: "CardStats",
    props: ['cards'],
    extends: Radar,
    data() {
        return {
            data: {
                labels: [],
                datasets: []
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
        this.cards.forEach((card, index) => {
            this.data.datasets[index].label = card['title']
            let stats = card['playerStatsV2']
            Object.values(stats).forEach(stat => {
                if (this.data.labels.length === 0) {
                    this.data.labels.push(stat.name)
                }
                this.data.datasets[index].data.push(stat.score)
            })
        })

        this.renderChart(this.data, this.options)
    },
    watch:{
        cards() {
            this.data.labels = []
            this.data.datasets = []
            Object.values(this.cards[0]['playerStatsV2']).forEach(stat => {
                this.data.labels.push(stat.name)
            })
            this.cards.forEach(card => {
                let stats = card['playerStatsV2']
                let cardData = []
                Object.values(stats).forEach(stat => {
                    cardData.push(stat.score)
                })
                this.data.datasets.push({
                    label: card['title'],
                    data: cardData
                })
            })
            this.renderChart(this.data, this.options)
        }
    }
}
</script>

<style scoped>

</style>