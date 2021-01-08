<template>
    <div>
        <b-row align-h="center">
            <b-col  cols="4">
                <b-card title="Login with your Epics Account">
                    <a href="#" v-b-toggle.disclaimer>Why is this needed?</a>
                    <b-collapse id="disclaimer">
                        <p>
                            Your login is needed to send requests to the Epics API.
                            Your login credentials will never be saved!
                            All my code can be found on my
                            <a target="_blank" rel="noopener noreferrer"  :href="$store.state.repoUrl">GitHub</a>, if you
                            want to verify yourself.
                        </p>
                    </b-collapse>
                    <b-form-group class="mt-2">
                        <b-form-input v-model="email" placeholder="Email"/>
                        <b-form-input v-model="password" placeholder="Password" type="password" class="mt-2"/>
                    </b-form-group>
                    <b-button style="float: left" variant="primary" @click="login">
                        <b-spinner v-if="spinner"/>
                        <span v-else>
                            Login
                        </span>
                    </b-button>
                </b-card>
            </b-col>
        </b-row>

        <feedback-toast
            id="feedback-toast"
            :type="err ? 'error' : ''"
            :title="err_title"
            :description="err_msg"
        />
    </div>
</template>

<script>
    import {mapActions} from "vuex";
    import FeedbackToast from "@/components/FeedbackToast";

    export default {
        name: 'Start',
        components: {FeedbackToast},
        data() {
            return {
                email: null,
                password: null,
                err_msg: "",
                err_title: "",
                err: false,
                spinner: false
            }
        },
        methods: {
            ...mapActions(['requestToken']),
            login() {
                let auth = {
                    email: this.email,
                    password: this.password
                }
                this.spinner = true;
                this.requestToken(auth).then(() => {
                    this.spinner = false
                    this.$router.push('/')
                }).catch(err => {
                    this.spinner = false
                    if (err === 'user_banned') {
                        this.err_msg = "You have been banned. Go away now."
                        this.err = true
                        this.err_title = "Banned"
                        this.$bvToast.show('feedback-toast')
                    }
                })
            }
        }
    }
</script>

<style scoped>
</style>
