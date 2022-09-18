<template>
    <div>
        <p-card id="register-card">
            <template #header>
                <h5 class="p-text-center">Register</h5>
            </template>
            <template #content>

                <form @submit.prevent="handleSubmit(!v$.$invalid && !duplicateEmail)" class="p-fluid">
                    <div class="p-field">
                        <div class="p-float-label">
                            <p-inputtext id="firstName" v-model="v$.firstName.$model"
                                         :class="{'p-invalid':v$.firstName.$invalid && submitted}"/>
                            <label :class="{'p-error':v$.firstName.$invalid && submitted}">First Name*</label>
                        </div>
                        <small v-if="(v$.firstName.$invalid && submitted) || v$.firstName.$pending.$response"
                               class="p-error">{{v$.firstName.required.$message.replace('Value', 'First name')}}</small>
                    </div>
                    <div class="p-field">
                        <div class="p-float-label">
                            <p-inputtext id="lastName" v-model="v$.lastName.$model"
                                         :class="{'p-invalid':v$.lastName.$invalid && submitted}"/>
                            <label :class="{'p-error':v$.lastName.$invalid && submitted}">Last Name*</label>
                        </div>
                        <small v-if="(v$.lastName.$invalid && submitted) || v$.lastName.$pending.$response"
                               class="p-error">{{v$.lastName.required.$message.replace('Value', 'Last name')}}</small>
                    </div>
                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-fileupload id="file-selector"
                                          mode="basic"
                                          style="width: 100%;"
                                          name="demo[]"
                                          :chooseLabel="label"
                                          accept=".jpg,.jpeg,.png,.gif"
                                          :customUpload="true"
                                          @uploader="myUploader"
                                          :showCancelButton="true"
                                          :auto="true"
                                          :fileLimit="1"
                                          :maxFileSize="1000000"/>
                        </div>
                    </div>
                    <div class="p-field">
                        <div class="p-float-label p-input-icon-right">
                            <i class="pi pi-envelope"/>
                            <p-inputtext id="email" v-model="v$.email.$model"
                                         :class="{'p-invalid':(v$.email.$invalid || duplicateEmail) && submitted}"
                                         aria-describedby="email-error"/>
                            <label :class="{'p-error':v$.email.$invalid && submitted}">Email*</label>
                        </div>
                        <span v-if="v$.email.$error && submitted">
                            <span id="email-error" v-for="(error, index) of v$.email.$errors" :key="index">
                            <small class="p-error">{{ error.$message }}</small>
                            </span>
                        </span>
                        <small v-else-if="(v$.email.$invalid && submitted) || v$.email.$pending.$response"
                               class="p-error">{{
                                v$.email.required.$message.replace('Value', 'Email')
                            }}</small>
                        <small v-else-if="duplicateEmail && submitted"
                               class="p-error">
                            An account has already been registered with this email
                        </small>
                    </div>
                    <div class="p-field">
                        <div class="p-float-label">
                            <p-password id="password" v-model="v$.password.$model"
                                        :class="{'p-invalid':v$.password.$invalid && submitted}" :feedback="false">
                            </p-password>
                            <label :class="{'p-error':v$.password.$invalid && submitted}">Password*</label>
                        </div>
                        <small v-if="(v$.password.$invalid && submitted) || v$.password.$pending.$response"
                               class="p-error">Password must be at least 8 characters</small>
                    </div>
                    <p-button type="submit"
                              label="Submit"
                              class="p-mt-2"/>
                </form>
            </template>
        </p-card>
    </div>
</template>

<script>
import {email, required, minLength, maxLength} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import api from '../api';
import cache from '../cache';

export default {
    setup: () => ({v$: useVuelidate()}),

    data() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            submitted: false,
            duplicateEmails: [],
            imageName: null,
            image: null,
        }
    },

    validations() {
        return {
            firstName: {
                required,
                maxLength: maxLength(250)
            },
            lastName: {
                required,
                maxLength: maxLength(250)
            },
            email: {
                required,
                email,
                maxLength: maxLength(250)
            },
            password: {
                required,
                minLength: minLength(8),
                maxLength: maxLength(250)
            },
        }
    },

    methods: {
        myUploader(event) {
            this.imageName = event.files[0].name;
            this.image = event.files[0];
        },

        handleSubmit(isFormValid) {
            this.submitted = true;

            if (!isFormValid) {
                return;
            }

            let user = {
                "firstName": this.firstName,
                "lastName": this.lastName,
                "email": this.email,
                "password": this.password
            }

            api.postUser(user)
                .then((response) => {
                    if (response.status === 201) {
                        api.login(this.email, this.password)
                            .then((response) => {
                                if (response.status === 200) {
                                    let id = response.data.userId;
                                    cache.setToken(response.data.token);
                                    if (this.image !== null) {
                                        api.putUserImage(id, this.image).then(() => {
                                            cache.setCurrentUserId(id);
                                            cache.setLoggedIn();
                                            this.resetForm()
                                            this.$router.push('/profile');
                                            return
                                        }).catch();
                                    } else {
                                        cache.setCurrentUserId(id);
                                        cache.setLoggedIn();
                                        this.resetForm()
                                        this.$router.push('/profile');
                                        return
                                    }
                                }
                            }, () => {
                                alert('Something went wrong logging you in');
                            });
                    }
                }, (error) => {
                    if (error.response.statusText === "Bad Request: email already in use") {
                        this.duplicateEmails.push(this.email);
                    } else {
                        alert('Something went wrong signing you up');
                    }
                });
            return
        },

        resetForm() {
            this.firstName = '';
            this.lastName = '';
            this.email = '';
            this.password = '';
            this.submitted = false;
            this.duplicateEmails = [];
        }
    },

    computed: {
        duplicateEmail() {
            return this.duplicateEmails.includes(this.email);
        },

        label() {
            if (this.image === null) {
                return 'Choose Profile Picture';
            } else {
                return this.imageName;
            }
        }
    }
}
</script>

<style scoped>

#register-card {
    padding-top: 1rem;
    margin: 2rem 10rem;
}

.p-field {
    padding: 1rem 0;
}

.p-button {
    margin-top: 1rem;
}


</style>