<template>
    <b-toast id="feedback-toast" :variant="type === 'error' ? 'danger' : 'success'" :title="title">
        {{description}}
    </b-toast>
</template>

<script>
export default {
    name: "FeedbackToast",
    props: ['title', 'type', 'description']
}
</script>

<style scoped>

</style>