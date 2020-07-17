<template>
    <div>
        <b-row align-h="center">
            <b-card title="Login with your Epics Account">
                <b-form-group>
                    <b-form-input v-model="email" placeholder="Email"/>
                    <b-form-input v-model="password" placeholder="Password" type="password" class="mt-2"/>
                </b-form-group>
                <b-button style="float: left" variant="primary" @click="login">Login</b-button>
            </b-card>
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
