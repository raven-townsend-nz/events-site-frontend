<template>
    <div>
        <p-toast/>
        <p-menubar :model="items"
                   style="background: #cfeaf3"
                   id="panelmenu">
            <template #end>
                <p-button icon="pi pi-user"
                          v-if="$route.path !== '/register' && !loggedIn"
                          id="register-button"
                          label="Register"
                          @click="handleRegister()"
                          class="p-button-outlined p-button-secondary"></p-button>
                <p-button :icon="loginOrOutIcon"
                          :label="loginOrOutLabel"
                          @click="loginOrOutHandler()"
                          class="p-button-outlined p-button-secondary"></p-button>
            </template>
        </p-menubar>
        <p-dialog header="Login"
                  v-model:visible="showDialog"
                  :style="{width: '40vw'}"
                  :modal="true">
            <div class="p-fluid">
                <div class="p-field">
                    <h6>Email</h6>
                    <p-inputtext v-model="email"></p-inputtext>
                </div>
                <div class="p-field">
                    <h6>Password</h6>
                    <p-password v-model="password"
                                :feedback="null"></p-password>
                </div>
                <div class="p-field">
                    <br/>
                    <p-button @click="submitLogin"
                              label="Submit"></p-button>
                    <small v-if="loginFailed"
                           class="p-error">
                        {{loginFailedMessage}}
                    </small>
                    <p-button label="Not registered? Create an account"
                              class="p-button-text"
                              @click="register"/>
                </div>
            </div>
        </p-dialog>
    </div>
</template>

<script>
import cache from '../cache';
import api from '../api';


export default {
    name: "Navbar.vue",

    data() {
        return {
            loggedIn: false,
            loginOrOutLabel: "Sign In",
            loginOrOutIcon: "pi pi-sign-in",
            items: [{label: 'All Events', icon: 'pi pi-fw pi-search', to: '/events'}],

            showDialog: false,
            email: '',
            password: '',
            loginFailed: false,
            loginFailedMessage: ''
        }
    },

    created() {
        this.refresh();

        window.addEventListener('loginOrOut', () => {
            this.refresh();
        });

        window.addEventListener('user_updated', () => {
            this.$toast.add({severity: 'success', summary: 'Details Updated', detail: 'Your profile details were successfully updated', life: 3000});
        });

        window.addEventListener('user_not_updated', () => {
            this.$toast.add({severity: 'info', summary: 'No Change', detail: 'You did not change any of your details', life: 3000});
        });
    },

    methods: {

        handleRegister() {
            this.$router.push('/register');
        },

        refresh() {
            this.loggedIn = cache.isLoggedIn();
            if (this.loggedIn) {
                this.loginOrOutLabel = "Sign Out";
                this.loginOrOutIcon = "pi pi-sign-out";
            } else {
                this.loginOrOutLabel = "Sign In";
                this.loginOrOutIcon = "pi pi-sign-in";
            }
            this.items = this.getNavItems(this.loggedIn);
        },

        getNavItems(isLoggedIn) {
            if (isLoggedIn) {
                return [
                    {label: 'Profile', icon: 'pi pi-fw pi-user-edit', to: '/profile'},
                    {label: 'All Events', icon: 'pi pi-fw pi-search', to: '/events'},
                    {label: 'Organising', icon: 'pi pi-fw pi-pencil', to: '/organising'},
                    {label: 'Attending', icon: 'pi pi-fw pi-calendar', to: '/attending'},
                    {label: 'Add Event', icon: 'pi pi-fw pi-plus-circle', to: '/new_event'},
                ];
            } else {
                return [{label: 'All Events', icon: 'pi pi-fw pi-search', to: '/events'}]
            }
        },

        loginOrOutHandler() {
            if (this.loggedIn) {
                api.logout()
                    .then((response) => {
                        if (response.status === 200) {
                            cache.setLoggedOut();
                            cache.setCurrentUserId(null);
                            cache.setToken(null);
                            this.$router.push('/events');
                        } else {
                            alert('failed to logout');
                        }
                    }, (error) => {
                        if (error.response.status === 401) {
                            cache.setLoggedOut();
                            cache.setCurrentUserId(null);
                            cache.setToken(null);
                            this.$router.push('/events');
                        } else {
                            alert('failed to logout');
                        }
                    })
            } else {
                this.showDialog = true;
            }
        },

        register() {
            this.showDialog = false;
            this.$router.push('/register');
        },

        submitLogin() {
            api.login(this.email, this.password)
                .then((response) => {
                    if (response.status === 200) {
                        this.loginFailed = false;
                        this.showDialog = false;
                        cache.setCurrentUserId(response.data.userId);
                        cache.setToken(response.data.token);
                        cache.setLoggedIn();
                        this.$router.push('/profile');
                    }
                }, (error) => {
                    if (error.response.status === 400 && error.response.data === 'Already logged in') {
                        this.loginFailedMessage = 'You are already logged in. Unfortunately the backend will not allow you to login again.';
                        this.loginFailed = true;
                    } else if (error.response.status === 400) {
                        this.loginFailedMessage = 'Incorrect email or password';
                        this.loginFailed = true;
                    } else if (error.response.status === 500) {
                        this.loginFailedMessage = 'Server failure';
                        this.loginFailed = true;
                    } else {
                        this.loginFailedMessage = 'Failed to login';
                        this.loginFailed = true;
                    }
                });
        }
    }
}
</script>

<style scoped>

.p-field {
    padding: 0.5vh 1vw;
}

#register-button {
    margin-right: 5px;
}

</style>