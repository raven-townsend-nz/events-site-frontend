<template>
    <div>
        <p-toast></p-toast>

        <p-card id="new-event-card">
            <template #header>
                <h5 class="p-text-center">Create New Event</h5>
            </template>
            <template #content>

                <form @submit.prevent="handleSubmit()"
                      class="p-fluid p-formgrid p-grid">

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-inputtext id="title" v-model="v$.title.$model"
                                         :class="{'p-invalid':v$.title.$invalid && submitted}"/>
                            <label :class="{'p-error':v$.title.$invalid && submitted}">Title*</label>
                        </div>
                        <small v-if="v$.title.$invalid && submitted || v$.title.$pending.$response"
                               class="p-error">Title is required</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-multiselect v-model="selectedCategories"
                                           :options="allCategories"
                                           class="p-column-filter"
                                           optionLabel="name"
                                           :class="{'p-invalid':selectedCategories.length === 0 && submitted}">
                            </p-multiselect>
                            <label :class="{'p-error':selectedCategories.length === 0 && submitted}">Select event categories*</label>
                        </div>
                        <small v-if="selectedCategories.length === 0 && submitted"
                               class="p-error">You must select at least one category</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-calendar v-model="date"
                                        :minDate="minDate"
                                        :showIcon="true"
                                        selectionMode="single"
                                        :yearNavigator="true"
                                        yearRange="2021:2099"
                                        :showButtonBar="true"
                                        :class="{'p-invalid':date === null && submitted}"
                                        :manualInput="false">
                            </p-calendar>
                            <label :class="{'p-error':date === null && submitted}">Date*</label>
                        </div>
                        <small v-if="date === null && submitted"
                               class="p-error">You must select a date</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div id="time-label-div"><label id="time-label">Time</label></div>
                        <p-calendar v-model="time"
                                    :timeOnly="true"
                                    hourFormat="24"
                                    :manualInput="false">
                        </p-calendar>
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
                        <small v-if="!imageUploaded && submitted"
                               class="p-error">You must provide a hero image for your event</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-textarea v-model="description"
                                        rows="3"
                                        :class="{'p-invalid':description.length === 0 && submitted}"
                                        cols="30" />
                            <label :class="{'p-error':description.length === 0 && submitted}">Description*</label>
                        </div>
                        <small v-if="description.length === 0 && submitted"
                               class="p-error">You must enter a description</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-inputnumber id="integeronly"
                                           :class="{'p-invalid':(capacity !== null && capacity < 1)}"
                                           v-model="capacity" />
                            <label :class="{'p-error':(capacity !== null && capacity < 1)}">Maximum Capacity</label>
                        </div>
                        <small v-if="capacity !== null && capacity < 1"
                               class="p-error">Capacity must be positive</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-selectbutton v-model="isOnlineString"
                                            @click="handleIsOnline"
                                            :options="isOnlineOptions" />
                        </div>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-inputtext id="url" v-model="event_url"
                                         :class="{'p-invalid':event_url.length === 0 && isOnline && submitted}"/>
                            <label :class="{'p-error':event_url.length === 0 && isOnline && submitted}">Event URL</label>
                        </div>
                        <small v-if="event_url.length === 0 && isOnline && submitted"
                               class="p-error">A URL is required for online events</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-inputtext id="venue" v-model="venue"
                                         :disabled="isOnline"
                                         :class="{'p-invalid':venue.length === 0 && !isOnline && submitted}"/>
                            <label :class="{'p-error':venue.length === 0 && !isOnline && submitted}">Venue</label>
                        </div>
                        <small v-if="venue.length === 0 && !isOnline && submitted"
                               class="p-error">A venue is required for physical events</small>
                    </div>

                    <div class="p-field p-col-12">
                        <div class="p-float-label">
                            <p-selectbutton v-model="attendanceControlString" :options="attendanceControlOptions" />
                        </div>
                    </div>

                    <div class="p-field p-col-12">
                        <div>
                            <div id="fee-label-div"><label id="fee-label">Fee</label></div>
                            <p-inputnumber :class="{'p-invalid':fee < 0}"
                                           mode="currency" currency="USD" locale="en-US"
                                           v-model="fee" />
                        </div>
                        <small v-if="fee < 0"
                               class="p-error">You cannot have a negative fee</small>
                    </div>

                    <div>
                        <p-button type="submit"
                                  label="Submit"/>
                    </div>
                </form>
            </template>
        </p-card>
    </div>
</template>

<script>
import {required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import api from "../api";


function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}


Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


export default {
    name: "NewEvent.vue",

    setup: () => ({v$: useVuelidate()}),

    data() {
        return {
            title: '',
            selectedCategories: [],
            allCategories: [],
            date: null,
            minDate: null,
            time: null,
            description: '',
            capacity: null,
            isOnlineString: "Physical Event",
            isOnlineOptions: ["Physical Event", "Online Event"],
            event_url: '',
            venue: '',
            attendanceControlString: 'No Attendance Control',
            attendanceControlOptions: ["No Attendance Control", "Attendance Control"],
            fee: 0,
            image: null,
            imageUploaded: false,
            imageName: '',

            submitted: false
        }
    },

    validations() {
        return {
            title: {
                required,
            },
        }
    },

    mounted() {
        let today = new Date();
        this.time = today;
        this.minDate = new Date();
        this.minDate.setDate(today.getDate() + 1);

        api.getCategories()
            .then((response) => {
                this.allCategories = response.data;
            })
    },

    methods: {

        handleIsOnline() {
            if (this.isOnline) {
                this.venue = '';
            }
        },

        myUploader(event) {
            this.imageName = event.files[0].name;
            this.image = event.files[0];
            this.imageUploaded = true;
        },

        handleSubmit() {
            this.submitted = true;

            if (!this.isFormValid) {
                return;
            }

            this.date.setHours(this.time.getHours() + 12);
            this.date.setMinutes(this.time.getMinutes());

            let event = {
                "title": this.title,
                "description": this.description,
                "categoryIds": this.getSelectedCategoryIds(),
                "date": this.date.toMysqlFormat(),
                "isOnline": this.isOnline,
                "requiresAttendanceControl": this.requiresAttendanceControl,
                "fee": this.fee
            }
            if (this.event_url.length !== 0) {
                event['url'] = this.event_url
            }
            if (this.venue.length !== 0) {
                event['venue'] = this.venue
            }
            if (this.capacity) {
                event["capacity"] = this.capacity;
            }

            api.postEvent(event)
                .then((response) => {
                    if (response.status === 201) {
                        api.putEventImage(response.data.eventId, this.image).catch();
                        this.resetForm();
                        this.$toast.add({severity: 'success', summary: 'Event Created', detail: 'Other users will now be able to see your event', life: 3000});
                    }
                }, () => {
                    alert('Something went wrong creating your event');
                });
        },

        resetForm() {
            this.submitted = false;
            this.title = '';
            this.selectedCategories = [];
            this.date = null;
            this.time = new Date();
            this.description = '';
            this.capacity = null;
            this.isOnlineString = "Physical Event";
            this.isOnlineOptions = ["Physical Event", "Online Event"];
            this.event_url = '';
            this.venue = '';
            this.attendanceControlString = 'No Attendance Control';
            this.attendanceControlOptions = ["No Attendance Control", "Attendance Control"];
            this.fee = 0;
            this.imageName = '';
            this.image = null;
            this.imageUploaded = false;

        },

        getSelectedCategoryIds() {
            let result = [];
            for (let category of this.selectedCategories) {
                result.push(category.id);
            }
            return result;
        }
    },

    computed: {
        isOnline() {
            return this.isOnlineString === 'Online Event';
        },

        requiresAttendanceControl() {
            return this.attendanceControlString === 'Attendance Control';
        },

        isFormValid() {
            return !this.v$.invalid &&
                   this.selectedCategories.length !== 0 &&
                   this.date !== null &&
                   this.description.length !== 0 &&
                   this.fee >= 0 &&
                   (this.capacity >= 1 || this.capacity === null) &&
                   !(this.event_url.length === 0 && this.isOnline) &&
                   !(this.venue.length === 0 && !this.isOnline) &&
                   this.imageUploaded;
        },

        label() {
            if (this.image === null) {
                return 'Choose Event Image';
            } else {
                return this.imageName;
            }
        }
    }
}
</script>

<style scoped>

#new-event-card {
    padding-top: 1rem;
    margin: 5vh 30vw;}

.p-field {
    padding: 1rem 0;
}

.p-button {
    margin-top: 1rem;
    width: 100% !important;
}

.p-fluid .p-fileupload .p-button {
    width: 100% !important;
}

#fee-label, #time-label {
    top: -.75rem;
    font-size: 12px;
    left: 0.5rem;
    color: #6c757d;
    text-align: left;
}

#fee-label-div, #time-label-div {
    width: 100%;
    text-align: left;
}


</style>