<template>
    <div>
        <b-row align-h="center">
            <b-col  cols="4">
                <b-card title="Login with your Epics Account">
                    <a href="#" v-b-toggle.disclaimer>Why is this needed?</a>
                    <b-collapse id="disclaimer">
                        <p>
                            Your login is needed to send requests to the Epics API.
                            It will (and cannot) be saved, since this is a static webpage.
                            All my code can be found on my
                            <a target="_blank" rel="noopener noreferrer"  :href="$store.state.repoUrl">GitHub</a>, if you
                            want to verify yourself.
                        </p>
                    </b-collapse>
                    <b-form-group class="mt-2">
                        <b-form-input v-model="email" placeholder="Email"/>
                        <b-form-input v-model="password" placeholder="Password" type="password" class="mt-2"/>
                    </b-form-group>
                    <b-button style="float: left" variant="primary" @click="login">Login</b-button>

                </b-card>
            </b-col>

        </b-row>
    </div>
</template>

<script>
    import {mapActions} from "vuex";

    export default {
        name: 'Start',
        data() {
            return {
                email: null,
                password: null
            }
        },
        methods: {
            ...mapActions(['requestToken']),
            login() {
                let auth = {
                    email: this.email,
                    password: this.password
                }
                this.requestToken(auth).then(() => this.$router.push('/')).catch(err => console.log(err))
            }
        }
    }
</script>

<style scoped>
</style>
