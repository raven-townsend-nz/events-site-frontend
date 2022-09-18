<template>
    <div class="parent-grid p-p-2">
        <div class="p-grid p-jc-center">
            <div class="p-col-4">
                <p-card style="width: 20vw">
                    <template #header>
                        <div style="text-align: center"
                             v-if="image === null">
                            <img style="text-align: center"
                                 src="../assets/default.png"
                                 class="profile-pic"
                                 :alt="lastName"/>
                        </div>
                        <div v-else>
                            <img :src="image"
                                 class="profile-pic"
                                 :alt="lastName">
                        </div>
                    </template>
                    <template #title>
                        Profile
                    </template>
                    <template #subtitle>
                        <div>First Name: {{firstName}}</div>
                        <div>Last Name: {{lastName}}</div>
                        <div>Email: {{email}}</div>
                    </template>
                    <template #footer>
                        <p-button icon="pi pi-user-edit" label="Edit" @click="handleEdit()"/>
                    </template>
                </p-card>
            </div>
        </div>
    </div>
</template>

<script>
import cache from "../cache";
import api from "../api";

export default {
    name: "Profile",

    data() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            images: []
        }
    },

    mounted() {
        this.refresh();

        window.addEventListener('loginOrOut', () => {
            this.refresh();
        });
    },

    computed: {
        image() {
            if (this.images.length > 0) {
                return this.images[0];
            } else {
                return null;
            }
        }
    },

    methods: {
        refresh() {
            if (cache.isLoggedIn()) {
                let userId = cache.getCurrentUserId();
                api.getUserById(userId)
                    .then((response) => {
                        this.firstName = response.data.firstName;
                        this.lastName = response.data.lastName;
                        this.email = response.data.email;
                    }, () => {
                        alert('Error loading user details');
                    });

                let images = this.images;
                api.getUserImage(userId)
                    .then((response) => {
                        let reader = new window.FileReader();
                        reader.readAsDataURL(response.data);
                        reader.onload = function () {
                            images.push(reader.result);
                        }

                    }, () => {
                        this.image = null;
                    });
            }
        },

        handleEdit() {
            this.$router.push('/edit_profile');
        }


    }
}
</script>

<style scoped>

.p-card {
    text-align: left;
    margin: 5vh 35vw;
}

.p-card p-component {
    border: none !important;
}

.p-col-4 {
    align-content: center;
}

.parent-grid {
    color: var(--text-color);
}
.parent-grid .box {
    text-align: center;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 1px -1px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12);
}
.parent-grid .box-stretched {
    height: 100%;
}
.parent-grid .vertical-container {
    margin: 0;
    height: 200px;
    border-radius: 4px;
}
.parent-grid .nested-grid .p-col-4 {
    padding-bottom: 1rem;
}
.parent-grid .dynamic-box-enter-active, .parent-grid .dynamic-box-leave-active {
    transition: all 0.5s;
}
.parent-grid .dynamic-box-enter, .parent-grid .dynamic-box-leave-to {
    opacity: 0;
}
.parent-grid .dynamic-box-enter, .parent-grid .dynamic-box-leave-to {
    transform: translateX(30px);
}
.parent-grid p {
    margin: 0;
}

.profile-pic {
    width: 20vw;
}


</style>