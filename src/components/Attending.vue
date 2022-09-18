<template>
    <div>
        <p-toast></p-toast>
        <p-confirmdialog></p-confirmdialog>
        <p-datatable id="dataTable"
                     v-model:expandedRows="expandedRows"
                     :paginator="true"
                     :rowClass="rowClass"
                     :rows="10"
                     :sortOrder="1"
                     :value="events"
                     :loading="loadingEvents || loadingEventImages || loadingUserImages"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                     dataKey="eventId"
                     paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                     responsiveLayout="scroll"
                     sortField="date"
                     @page="checkPage"
                     @row-expand="getAttendanceData">
            <template #header>
                <div>
                    <h5>Events You Have Requested to Attend</h5>
                </div>
            </template>
            <p-column :expander="true" headerStyle="width: 3rem"/>
            <p-column id="title-col"
                      :showFilterMatchModes="false"
                      field="title"
                      header="Title">
            </p-column>
            <p-column header="Image">
                <template #body="slotProps">
                    <div v-if="slotProps.data.eventImage === null">
                        <img :alt="slotProps.data.title"
                             class="event-image"
                             src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"/>
                    </div>
                    <div v-else>
                        <img :alt="slotProps.data.title"
                             :src="slotProps.data.eventImage"
                             class="event-image">
                    </div>
                </template>
            </p-column>
            <p-column field="date" header="Date" sortable>
                <template #body="slotProps">
                    {{ formatDate(new Date(slotProps.data.date).toString()) }}
                </template>
            </p-column>
            <p-column :showFilterMatchModes="false"
                      field="categories"
                      header="Categories">
            </p-column>
            <p-column header="Organiser Image">
                <template #body="slotProps">
                    <div v-if="slotProps.data.organiserImage === null">
                        <img :alt="slotProps.data.organizerLastName"
                             class="event-image"
                             src="../assets/default.png"/>
                    </div>
                    <div v-else>
                        <img :alt="slotProps.data.organizerLastName"
                             :src="slotProps.data.organiserImage"
                             class="event-image">
                    </div>
                </template>
            </p-column>
            <p-column header="Organiser">
                <template #body="slotProps">
                    {{ slotProps.data.organizerFirstName + ' ' + slotProps.data.organizerLastName }}
                </template>
            </p-column>
            <p-column field="attendeeCount" header="Attendance">
                <template #body="slotProps">
                    {{ slotProps.data.attendeeCount ? slotProps.data.attendeeCount : 0 }}
                </template>
            </p-column>
            <template #paginatorRight>
                <p>Go to 'All Events' to find more events to attend</p>
            </template>
            <template #paginatorLeft>
                <div id="extra-padding"/>
            </template>
            <template id="expansion-field"
                      #expansion="slotProps">
                <div>
                    <table id="details-table">
                        <tbody>
                        <tr>
                            <td class="header-col">Attendance Status</td>
                            <td>{{
                                    slotProps.data.attendance_status.charAt(0).toUpperCase() + slotProps.data.attendance_status.slice(1)
                                }}
                            </td>
                        </tr>
                        <tr>
                            <td class="header-col">Capacity</td>
                            <td>{{ slotProps.data.capacity ? slotProps.data.capacity : 'No limit' }}</td>
                        </tr>
                        <tr>
                            <td class="header-col">Event URL</td>
                            <td><a :href="slotProps.data.url">{{ slotProps.data.url }}</a></td>
                        </tr>
                        <tr>
                            <td class="header-col">Venue</td>
                            <td>{{ slotProps.data.venue }}</td>
                        </tr>
                        <tr>
                            <td class="header-col">Fee</td>
                            <td>{{ slotProps.data.fee === "0.00" ? "Free" : '$' + slotProps.data.fee }}</td>
                        </tr>
                        <tr>
                            <td class="header-col">Description</td>
                            <td>{{ slotProps.data.description }}</td>
                        </tr>
                        <tr>
                            <td class="header-col">Attendees</td>
                            <td>
                                <p-button :disabled="slotProps.data.attendeeCount === null || slotProps.data.attendeeCount === undefined"
                                          :label="generateAttendeeMessage(slotProps.data.attendeeCount)"
                                          class="p-button-text"
                                          @click="openUsersDialog(slotProps.data.eventId, slotProps.data.organizerId)"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="header-col">Attendance Request</td>
                            <td>
                                <p-button :class="'p-button-outlined p-button-' + attendanceButtonType(slotProps.data)"
                                          :label="generateAttendanceStatusMessage(slotProps.data.attendance_status)"
                                          @click="handleAttendanceRequest(slotProps.data)"/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </p-datatable>

        <p-dialog v-model:visible="showUsersDialog"
                  :maximizable="true"
                  :modal="true"
                  :style="{width: '50vw'}"
                  header="Attendees">
            <div>
                <p-datatable :value="attendees"
                             responsiveLayout="scroll">
                    <p-column header="Image">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.image === null">
                                <img :alt="slotProps.data.lastName"
                                     class="event-image"
                                     src="../assets/default.png"/>
                            </div>
                            <div v-else>
                                <img :alt="slotProps.data.lastName"
                                     :src="slotProps.data.image"
                                     class="event-image">
                            </div>
                        </template>
                    </p-column>
                    <p-column field="firstName" header="First Name"></p-column>
                    <p-column field="lastName" header="Last Name"></p-column>
                    <p-column header="Role">
                        <template #body="slotProps">
                            {{ organizerId === slotProps.data.attendeeId ? 'Organiser' : 'Attendee' }}
                        </template>
                    </p-column>
                </p-datatable>
            </div>
        </p-dialog>
    </div>
</template>

<script>
import api from "../api";
import cache from "../cache";
import common from "@/common";

export default {
    name: "Attending.vue",

    data() {
        return {
            events: [],
            expandedRows: [],
            attendees: [],
            organizerId: null,
            showUsersDialog: false,

            categoryDict: {},
            categoryNames: [],
            loadingEvents: true,
            loadingEventImages: true,
            loadingUserImages: true
        }
    },

    mounted() {
        this.organizerId = parseInt(cache.getCurrentUserId());
        api.getEvents()
            .then((response) => {
                let events = response.data;
                api.getCategories()
                    .then((response) => {
                        for (let category of response.data) {
                            this.categoryDict[category.id] = category.name;
                            this.categoryNames.push(category.name);
                        }
                        this.getExtraEventData(events);
                    }, () => {
                        alert('error loading category data');
                    });
            }, (error) => {
                alert('Error getting events: ' + error);
                return undefined;
            });
    },

    methods: {

        getExtraEventData: async function(events) {
            for (let i = 0; i < events.length; i++) {
                let current_event = events[i];
                let response = await api.getEventById(events[i].eventId);
                current_event['date'] = response.data.date;
                current_event['url'] = response.data.url;
                current_event['attendeeCount'] = response.data.attendeeCount;
                current_event['venue'] = response.data.venue;
                current_event['requiresAttendanceControl'] = response.data.requiresAttendanceControl;
                current_event['isOnline'] = response.data.isOnline;
                current_event['fee'] = response.data.fee;
                current_event['description'] = response.data.description;
                current_event['organizerId'] = response.data.organizerId;
                current_event.categories = this.formatCategories(response.data.categories);

                let attendees_response = await api.getEventAttendees(current_event.eventId);
                let attendees = attendees_response.data;
                let status = 'not_going';
                for (let a of attendees) {
                    if (a.attendeeId === Number.parseInt(cache.getCurrentUserId())) {
                        status = a.status;
                    }
                }
                if (status !== 'not_going') {
                    current_event['attendance_status'] = status;
                    this.events.push(current_event);
                }
            }
            this.loadingEvents = false;
            this.loadImages();
        },

        loadImages() {
            for (let i = 0; i < this.events.length; i++) {
                let current_event = this.events[i];

                api.getEventImage(current_event.eventId)
                    .then((response) => {
                        let reader = new window.FileReader();
                        reader.readAsDataURL(response.data);
                        reader.onload = function () {
                            current_event['eventImage'] = reader.result;
                        }
                    }).catch(() => {
                        this.events[i]['eventImage'] = null;
                    });

                api.getUserImage(current_event.organizerId)
                    .then((response) => {
                        let reader = new window.FileReader();
                        reader.readAsDataURL(response.data);
                        reader.onload = function () {
                            current_event['organiserImage'] = reader.result;
                        }

                    }).catch(() => {
                    current_event['organiserImage'] = null;
                });
            }
            this.loadingUserImages = false;
            this.loadingEventImages = false;
        },

        openUsersDialog(eventId, organizerId) {
            api.getEventAttendees(eventId)
                .then((response) => {
                    this.attendees = response.data;
                    for (let i = 0; i < this.attendees.length; i++) {
                        let user = this.attendees[i];
                        api.getUserImage(user.attendeeId)
                            .then((response) => {
                                if (response.status === 200) {
                                    let reader = new window.FileReader();
                                    reader.readAsDataURL(response.data);
                                    reader.onload = function () {
                                        user['image'] = reader.result;
                                    }
                                }
                            })
                            .catch(() => {
                                user['image'] = null;
                            });
                    }
                    this.organizerId = organizerId;
                    this.showUsersDialog = true;
                }, (error) => {
                    alert(error);
                });
        },

        rowClass(data) {
            if (data.attendance_status === 'accepted') {
                return 'row-attending';
            } else if (data.attendance_status === 'pending') {
                return 'row-pending';
            } else if (data.attendance_status === 'rejected') {
                return 'row-rejected';
            }
        },

        formatCategories(ids) {
            if (ids.length === 0) {
                return '';
            }
            let result = '';

            for (let i = 0; i < ids.length - 1; i++) {
                if (this.categoryDict[ids[i]] !== undefined) {
                    result += this.categoryDict[ids[i]] + ', ';
                }
            }
            return result + this.categoryDict[ids[ids.length - 1]];
        },

        formatDate(date) {
            return common.formatDate(date);
        },

        eventIsInPast(date) {
            date = new Date(Date.parse(date));
            return date < new Date();
        },

        checkPage(event) {
            if (event.page === event.pageCount - 1) {
                this.$toast.add({
                    severity: 'info',
                    summary: 'Last Page',
                    detail: 'There are no more events to see',
                    life: 3000
                });
            }
        },

        generateAttendeeMessage(count) {
            if (count === null || count === undefined) {
                return 'No attendees';
            } else {
                return 'View all accepted attendees (plus yourself if your status is \'pending\')';
            }
        },

        attendanceButtonType(event) {
            let status = event.attendance_status;
            if (status === 'not_logged_in' || status === 'rejected' || this.eventIsInPast(event.date)) {
                return 'secondary';
            } else if (status === 'accepted' || status === 'pending') {
                return 'danger';
            } else if (event.attendeeCount >= event.capacity) {
                return 'secondary';
            } else if (status === 'not_going') {
                return 'success';
            }
        },

        generateAttendanceStatusMessage(status) {
            if (status === 'not_logged_in' || status === 'not_going') {
                return 'Attend'
            } else if (status === 'accepted' || status === 'pending' || status === 'rejected') {
                return 'Cancel';
            }
        },

        handleAttendanceRequest(event) {
            let status = event.attendance_status;
            if (status === 'not_logged_in') {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Please Login',
                    detail: 'You cannot request to attend an event without first logging in',
                    life: 3000
                });
            } else if (this.eventIsInPast(event.date)) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Closed',
                    detail: 'You cannot change your attendance status for an event that has already happened',
                    life: 3000
                });
            } else if (event.attendeeCount >= event.capacity && status === 'not_going') {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Full',
                    detail: 'Sorry, all spots are taken in this event',
                    life: 3000
                });
            } else if (status === 'rejected') {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Full',
                    detail: 'You cannot change your status for this event because you have been rejected',
                    life: 3000
                });
            } else if (status === 'not_going') {
                api.requestAttendance(event.eventId)
                    .then(() => {
                        this.$router.go(0);
                    })
                    .catch(() => {
                        alert('Attendance request failed');
                    });
            } else if (status === 'accepted' || status === 'pending') {
                api.deleteAttendee(event.eventId)
                    .then(() => {
                        this.$router.go(0);
                    })
                    .catch(() => {
                        alert('Attendance request failed');
                    })
            }
        },

        reloadRow(event) {
            let index = null;
            for (let i = 0; i < this.expandedRows.length; i++) {
                if (this.expandedRows[i].eventId === event.eventId) {
                    index = i;
                }
            }
            if (index === null) {
                return
            }
            this.expandedRows.splice(index, 1);

            index = null;
            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].eventId === event.eventId) {
                    index = i;
                }
            }
            if (index === null) {
                return
            }
            this.events.splice(index, 1);

            api.getEventById(event.eventId)
                .then((response) => {
                    event['attendeeCount'] = response.data.attendeeCount;
                    api.getEventAttendees(event.eventId)
                        .then((response) => {
                            let attendees = response.data;
                            let me = -1;
                            let myId = Number.parseInt(cache.getCurrentUserId());
                            for (let attendee of attendees) {
                                let attendeeId = attendee.attendeeId;
                                if (attendeeId === myId) {
                                    me = attendee;
                                }
                            }
                            if (me === -1) {
                                event['attendance_status'] = 'not_going';
                            } else {
                                event['attendance_status'] = me.status;
                            }
                            this.expandedRows.push(event);
                            this.events.push(event);
                        }).catch();
                }, (error) => {
                    alert('Error getting events: ' + error);
                    return
                });
        },

        getAttendanceData(event) {
            let id = event.data.eventId;
            let index = -1;
            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].eventId === id) {
                    index = i;
                }
            }
            if (!cache.isLoggedIn()) {
                this.events[index]['attendance_status'] = 'not_logged_in';
                return
            }
            let myId = Number.parseInt(cache.getCurrentUserId());
            api.getEventAttendees(id)
                .then((response) => {
                    let attendees = response.data;
                    let me = -1;
                    for (let attendee of attendees) {
                        let attendeeId = attendee.attendeeId;
                        if (attendeeId === myId) {
                            me = attendee;
                        }
                    }
                    if (me === -1) {
                        this.events[index]['attendance_status'] = 'not_going';
                    } else {
                        this.events[index]['attendance_status'] = me.status;
                    }
                }).catch();
        }
    }
}
</script>

<style scoped>

#details-table table {
    display: table;
    border-collapse: separate;
    box-sizing: border-box;
    text-indent: initial;
    border: none !important;
    padding: 0;
}

#details-table tr {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
}

#details-table td {
    padding: 1rem;
}

.header-col {
    font-family: "Courier New", monospace;
    width: 200px;
}

#details-table tr:first-child {
    border-top: none;
}

#details-table tr:first-child > td {
    padding-top: 0;
}

#details-table tr:last-child {
    border-bottom: none;
}

#details-table tr:last-child > td {
    padding-bottom: 0;
}

#dataTable {
    padding: 5vh 2vw;
}

.event-image {
    width: 150px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)
}

.p-datatable .p-datatable-thead > tr > th {
    text-align: center !important;
}

.p-button-text {
    padding: 0;
}

#extra-padding {
    padding-right: 230px;
}

::v-deep(.row-attending) {
    background-color: rgba(0, 128, 0, .1) !important;
}

::v-deep(.row-pending) {
    background-color: rgba(255, 255, 0, .1) !important;
}

::v-deep(.row-rejected) {
    background-color: rgba(255, 0, 0, .1) !important;
}

</style>