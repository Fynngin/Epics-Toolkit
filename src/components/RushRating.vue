<script>
    import { Doughnut } from 'vue-chartjs';

    export default {
        name: "RushRating",
        props: ['rating'],
        data() {
            return {
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#aa0b53', 'white']
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    centerText: {
                        display: true,
                        text: this.rating
                    }
                },
                plugin: function (chart) {
                    let width = chart.chart.width,
                        height = chart.chart.height,
                        ctx = chart.chart.ctx;

                    ctx.restore();
                    let fontSize = (height / 114).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";

                    let text = chart.config.options.centerText.text,
                        textX = Math.round((width - ctx.measureText(text).width) / 2),
                        textY = height / 2;

                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }
        },
        extends: Doughnut,
        mounted() {
            this.data.datasets[0].data = [this.rating, 100 - this.rating]
            this.options.centerText.text = this.rating
            this.addPlugin({
                beforeDraw: this.plugin
            })
            this.renderChart(this.data, this.options)
        },
        watch: {
            rating() {
                this.data.datasets[0].data = [this.rating, 100 - this.rating]
                this.options.centerText.text = this.rating
                this.renderChart(this.data, this.options)
            }
        }
    }
</script>

<style scoped>

</style>