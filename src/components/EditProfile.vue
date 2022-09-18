<template>
    <div>
        <p-card id="edit-profile-card">
            <template #header>
                <h5 class="p-text-center">Edit Your Details</h5>
            </template>
            <template #content>

                <form @submit.prevent="handleSubmit"
                      class="p-fluid p-formgrid p-grid">
                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-inputtext id="firstName" v-model="v$.firstName.$model"
                                         :class="{'p-invalid':v$.firstName.$invalid && submitted}"/>
                            <label :class="{'p-error':v$.firstName.$invalid && submitted}">First Name</label>
                        </div>
                        <small v-if="(v$.firstName.$invalid || v$.firstName.$pending.$response) && submitted"
                               class="p-error">First name is required</small>
                    </div>
                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-inputtext id="lastName" v-model="v$.lastName.$model"
                                         :class="{'p-invalid':v$.lastName.$invalid && submitted}"/>
                            <label :class="{'p-error':v$.lastName.$invalid && submitted}">Last Name</label>
                        </div>
                        <small v-if="(v$.lastName.$invalid || v$.lastName.$pending.$response) && submitted"
                               class="p-error">Last name is required</small>
                    </div>
                    <div class="p-field p-col-12">
                                    <p-fileupload id="file-selector"
                                                  mode="basic"
                                                  style="width: 100%;"
                                                  name="demo[]"
                                                  :disabled="disableNewImage"
                                                  :chooseLabel="label"
                                                  accept=".jpg,.jpeg,.png,.gif"
                                                  :customUpload="true"
                                                  @uploader="myUploader"
                                                  :showCancelButton="true"
                                                  :auto="true"
                                                  :fileLimit="1"
                                                  :maxFileSize="1000000"/>
                    </div>
                    <div class="p-field p-col-12">
                            <p-button :class="'p-button-' + removeClass"
                                      style="width: auto; padding-left: 25px; padding-right: 25px"
                                      :disabled="noImage"
                                      @click="handleRemoveImage()"
                                      id="remove-button"
                                      :label="removeLabel"></p-button>
                    </div>
                    <div class="p-field p-col-12">
                        <div class="p-float-label p-input-icon-right">
                            <i class="pi pi-envelope"/>
                            <p-inputtext id="email" v-model="v$.email.$model"
                                         :class="{'p-invalid':v$.email.$invalid || duplicateEmail}"
                                         aria-describedby="email-error"/>
                            <label :class="{'p-error':v$.email.$invalid}">Email</label>
                        </div>
                        <span v-if="v$.email.$error">
                            <span id="email-error" v-for="(error, index) of v$.email.$errors" :key="index">
                            <small class="p-error">{{ error.$message }}</small>
                            </span>
                        </span>
                        <small v-else-if="duplicateEmail"
                               class="p-error">
                            An account has already been registered with this email
                        </small>
                    </div>
                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-password id="oldPassword" v-model="oldPassword"
                                        :class="{'p-invalid':(oldPassword.length === 0 && newPassword.length >= 8 && submitted) || invalidOldPassword}"
                                        :feedback="false">
                            </p-password>
                            <label :class="{'p-error':(oldPassword.length === 0 && newPassword.length >= 8 && submitted) || invalidOldPassword}">
                                Current Password
                            </label>
                        </div>
                        <small v-if="oldPassword.length === 0 && newPassword.length >= 8 && submitted"
                               class="p-error">
                            You must enter your current password if you wish to update your password
                        </small>
                        <small v-else-if="invalidOldPassword"
                               class="p-error">
                            You entered your old password incorrectly
                        </small>
                    </div>
                    <div class="p-field p-col-12 p-md-6">
                        <div class="p-float-label">
                            <p-password id="newPassword" v-model="v$.newPassword.$model"
                                        :class="{'p-invalid':(v$.newPassword.$invalid  || !newPasswordIsDifferent) && submitted}"
                                        :feedback="false">
                            </p-password>
                            <label :class="{'p-error':(v$.newPassword.$invalid  || !newPasswordIsDifferent) && submitted}">
                                New Password
                            </label>
                        </div>
                        <small v-if="(v$.newPassword.$invalid && submitted) || v$.newPassword.$pending.$response"
                               class="p-error">Password must be at least 8 characters</small>
                        <small v-else-if="!newPasswordIsDifferent && submitted"
                               class="p-error">You cannot set your new password to be the same as your old password</small>
                    </div>
                    <div>
                        <p-button type="submit"
                                  class="button"
                                  label="Submit"/>
                        <p-button class="p-button-secondary button"
                                  label="Cancel"
                                  @click="$router.push('/profile')"/>
                    </div>
                </form>
            </template>
        </p-card>
    </div>
</template>

<script>
import cache from "../cache";
import api from "../api";
import {email, minLength, required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";


export default {
    name: "Profile",

    setup: () => ({v$: useVuelidate()}),

    data() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            oldPassword: '',
            newPassword: '',

            oldFirstName: '',
            oldLastName: '',
            oldEmail: '',

            submitted: false,
            invalidOldPasswords: [],
            showEditDialog: false,
            duplicateEmails: [],

            image: null,
            imageName: null,
            removeImage: false,
            noImage: true,
            disableNewImage: false
        }
    },

    validations() {
        return {
            firstName: {
                required,
            },
            lastName:{
                required,
            },
            email: {
                required,
                email
            },
            newPassword: {
                minLength: minLength(8)
            }
        }
    },

    mounted() {
        this.refresh();

        window.addEventListener('loginOrOut', () => {
            this.refresh();
        });
    },

    computed: {
        duplicateEmail() {
            return this.duplicateEmails.includes(this.email);
        },

        invalidOldPassword() {
            return this.invalidOldPasswords.includes(this.oldPassword);
        },

        newPasswordIsDifferent () {
            return (this.newPassword !== this.oldPassword || this.newPassword.length < 8);
        },

        label() {
            if (this.image === null) {
                return 'Update Profile Picture';
            } else {
                return this.imageName;
            }
        },

        removeLabel() {
            if (this.removeImage) {
                return "Keep Profile Picture";
            } else {
                return "Remove Profile Picture";
            }
        },

        removeClass() {
            if (this.removeImage) {
                return "success";
            } else {
                return "danger";
            }
        },

        isFormValid() {
            return !this.v$.$invalid &&
                    this.newPasswordIsDifferent &&
                    !this.invalidOldPassword &&
                    !this.duplicateEmail &&
                    !(this.oldPassword.length === 0 && this.newPassword.length >= 8 && this.submitted) &&
                    !((this.oldPassword.length === 0 && this.newPassword.length >= 8 && this.submitted) || this.invalidOldPassword)
        }
    },

    methods: {

        handleRemoveImage() {
            this.removeImage = !this.removeImage;
            if (this.removeImage) {
                this.disableNewImage = true;
            } else {
                this.disableNewImage = false;
            }
        },

        myUploader(event) {
            this.imageName = event.files[0].name;
            this.image = event.files[0];
        },

        refresh() {
            if (cache.isLoggedIn()) {
                let userId = cache.getCurrentUserId();
                api.getUserById(userId)
                    .then((response) => {
                        this.firstName = response.data.firstName;
                        this.oldFirstName = response.data.firstName;
                        this.lastName = response.data.lastName;
                        this.oldLastName = response.data.lastName;
                        this.email = response.data.email;
                        this.oldEmail = response.data.email;
                    }, () => {
                        alert('Error loading user details');
                    });

                api.getUserImage(userId)
                    .then(() => {
                        this.noImage = false;
                    })
                    .catch((error) => {
                        if (error.response.status === 404) {
                            this.noImage = true;
                        }
                    })
            }
        },

        createUserRequest() {
            let user = {};
            let changed = false;
            if (this.oldPassword.length > 0) {
                user['currentPassword'] = this.oldPassword;
                changed = true;
            }
            if (this.firstName.length > 0 && this.firstName !== this.oldFirstName) {
                user['firstName'] = this.firstName;
                changed = true;
            }
            if (this.lastName.length > 0 && this.lastName !== this.oldLastName) {
                user['lastName'] = this.lastName;
                changed = true;
            }
            if (this.email.length > 0 && this.email !== this.oldEmail) {
                user['email'] = this.email;
                changed = true;
            }
            if (this.newPassword.length >= 8) {
                user['password'] = this.newPassword;
                changed = true;
            }

            if (changed) {
                return user
            } else {
                return null;
            }
        },

        handleSubmit: async function() {
            this.submitted = true;

            if (!this.isFormValid) {
                return;
            }

            let id = cache.getCurrentUserId();
            let changed = false;

            try {

                if (this.removeImage) {
                    await api.deleteUserImage(id);
                    changed = true;
                }

                let user = this.createUserRequest();

                if (this.image !== null) {
                    await api.putUserImage(id, this.image)
                    changed = true;
                }

                if (user !== null) {
                    try {
                        await api.patchUser(id, user);
                        changed = true;
                    } catch (error) {
                        if (error.response.statusText === "Bad Request: email already in use") {
                            this.duplicateEmails.push(this.email);
                        } else if (error.response.statusText === "Bad Request: incorrect password") {
                            this.invalidOldPasswords.push(this.oldPassword);
                        }
                    }
                }
            } catch {
                alert('Something went wrong updating your details');
            }

            if (changed) {
                const event = new Event('user_updated');
                window.dispatchEvent(event);
                await this.$router.push('/profile');
            } else {
                const event = new Event('user_not_updated');
                window.dispatchEvent(event);
                await this.$router.push('/profile');
            }
        },

        resetForm() {
            this.firstName = '';
            this.lastName = '';
            this.email = '';
            this.oldPssword = '';
            this.new = '';
            this.submitted = false;
            this.duplicateEmails = [];
        }
    }
}
</script>

<style scoped>

#edit-profile-card {
    padding-top: 1rem;
    margin: 5vh 30vw;
}

.p-field {
    padding: 1rem 0;
}

.button {
    margin-top: 1rem;
    width: 10vw;
}

p-button * {
    width: 20vw;
}

td * {
    margin: 0;
}

tr * {
    margin: 0;
}

table * {
    margin: 0;
}

#button-table {
    margin: 0 !important;
}

#remove-button #file-selector {
    margin-left: 10px;
    max-width: 15vw !important;
}

</style>