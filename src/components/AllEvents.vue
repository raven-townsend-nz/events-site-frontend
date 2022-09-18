<template>
    <div>
        <p-toast />
        <p-datatable :value="events"
                     id="dataTable"
                     v-model:expandedRows="expandedRows"
                     dataKey="eventId"
                     sortField="date"
                     v-model:filters="filters"
                     filterDisplay="menu"
                     :sortOrder="1"
                     :paginator="true"
                     :loading="loadingEvents || loadingUserImages || loadingEventImages"
                     :rows="10"
                     @page="checkPage"
                     @row-expand="getAttendanceData"
                     paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                     responsiveLayout="scroll"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
            <template #header>
                <div class="p-d-flex p-jc-between">
                    <table>
                        <tbody>
                            <tr>
                                <td class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <p-inputtext v-model="filters['title'].value"
                                                 style="width: 15vw"
                                                 placeholder="Search titles..." />
                                </td>
                                <td style="width: 48vw">
                                    <h5>All Events</h5>
                                </td>
                                <td>
                                    <p-multiselect v-model="selectedCategories"
                                                   placeholder="Filter by category"
                                                   style="width: 15vw"
                                                   :options="categoryNames"></p-multiselect>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
            <p-column :expander="true" headerStyle="width: 3rem"/>
            <p-column field="title"
                      :showFilterMatchModes="false"
                      id="title-col"
                      header="Title">
            </p-column>
            <p-column header="Image">
                <template #body="slotProps">
                    <div v-if="slotProps.data.eventImage === null">
                        <img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
                             :alt="slotProps.data.title"
                             class="event-image" />
                    </div>
                    <div v-else>
                        <img :src="slotProps.data.eventImage"
                             :alt="slotProps.data.title"
                             class="event-image">
                    </div>
                </template>
            </p-column>
            <p-column field="date" header="Date" sortable>
                <template #body="slotProps">
                    {{ formatDate(new Date(slotProps.data.date).toString())}}
                </template>
            </p-column>
            <p-column field="categories"
                      :showFilterMatchModes="false"
                      header="Categories">
            </p-column>
            <p-column header="Organiser Image">
                <template #body="slotProps">
                    <div v-if="slotProps.data.organiserImage === null">
                        <img src="../assets/default.png"
                             :alt="slotProps.data.organizerLastName"
                             class="event-image" />
                    </div>
                    <div v-else>
                        <img :src="slotProps.data.organiserImage"
                             :alt="slotProps.data.organizerLastName"
                             class="event-image">
                    </div>
                </template>
            </p-column>
            <p-column header="Organiser">
                <template #body="slotProps">
                    {{ slotProps.data.organizerFirstName + ' ' + slotProps.data.organizerLastName }}
                </template>
            </p-column>
            <p-column field="attendeeCount" header="Attendance" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.attendeeCount ? slotProps.data.attendeeCount : 0 }}
                </template>
            </p-column>
            <template id="expansion-field"
                      #expansion="slotProps">
                <div>
                    <table id="details-table">
                        <tbody>
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
                                    <p-button :label="generateAttendeeMessage(slotProps.data.attendeeCount)"
                                              :disabled="slotProps.data.attendeeCount === null || slotProps.data.attendeeCount === undefined"
                                              class="p-button-text"
                                              @click="openUsersDialog(slotProps.data.eventId, slotProps.data.organizerId)"/>
                                </td>
                            </tr>
                            <tr>
                                <td class="header-col">Similar Events</td>
                                <td>
                                    <p-button label="View a list of similar events"
                                              class="p-button-text"
                                              @click="openSimilarEventsDialog(slotProps.data)"/>
                                </td>
                            </tr>
                            <tr>
                                <td class="header-col">Attendance Request</td>
                                <td>
                                    <p-button :label="generateAttendanceStatusMessage(slotProps.data.attendance_status)"
                                              @click="handleAttendanceRequest(slotProps.data)"
                                              :class="'p-button-outlined p-button-' + attendanceButtonType(slotProps.data)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </p-datatable>
        <p-dialog header="Attendees"
                  v-model:visible="showUsersDialog"
                  :style="{width: '50vw'}"
                  :maximizable="true"
                  :modal="true">
            <div>
                <p-datatable :value="attendees"
                           responsiveLayout="scroll">
                    <p-column header="Image">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.image === null">
                                <img src="../assets/default.png"
                                     :alt="slotProps.data.lastName"
                                     class="event-image" />
                            </div>
                            <div v-else>
                                <img :src="slotProps.data.image"
                                     :alt="slotProps.data.lastName"
                                     class="event-image">
                            </div>
                        </template>
                    </p-column>
                    <p-column field="firstName" header="First Name"></p-column>
                    <p-column field="lastName" header="Last Name"></p-column>
                    <p-column header="Role">
                        <template #body="slotProps">
                            {{organizerId === slotProps.data.attendeeId ? 'Organiser' : 'Attendee'}}
                        </template>
                    </p-column>
                </p-datatable>
            </div>
        </p-dialog>

        <p-dialog :header="similarEventsTitle"
                  v-model:visible="showSimilarEventDialog"
                  :maximizable="true"
                  :modal="true">
            <div>
                <p>Events which are in one or more of the same categories</p>
            </div>
            <div>
                <p-datatable :value="similarEvents"
                             dataKey="eventId"
                             sortField="date"
                             :sortOrder="1"
                             responsiveLayout="scroll">
                    <p-column field="title"
                              :showFilterMatchModes="false"
                              id="title-col"
                              header="Title">
                    </p-column>
                    <p-column field="date" header="Date" sortable>
                        <template #body="slotProps">
                            {{ formatDate(new Date(slotProps.data.date).toString())}}
                        </template>
                    </p-column>
                    <p-column field="categories"
                              :showFilterMatchModes="false"
                              header="Categories">
                    </p-column>
                    <p-column header="Organiser">
                        <template #body="slotProps">
                            {{ slotProps.data.organizerFirstName + ' ' + slotProps.data.organizerLastName }}
                        </template>
                    </p-column>
                </p-datatable>
            </div>
        </p-dialog>
    </div>
</template>

<script>
import api from '../api';
import cache from '../cache';
import common from '../common';
import {FilterMatchMode} from 'primevue/api';



export default {
    name: "AllEvents.vue",
    data() {
        return {
            categoryDict: {},
            categoryNames: [],
            selectedCategories: [],
            filters: {
                title: {value: null, matchMode: FilterMatchMode.CONTAINS}
            },
            allEvents: [],
            expandedRows: [],
            attendees: [],
            showUsersDialog: false,
            organizerId: null,
            clickedSearch: false,

            similarEvents: [],
            showSimilarEventDialog: false,
            similarEventsTitle: '',

            loadingEvents: true,
            loadingEventImages: true,
            loadingUserImages: true
        }
    },

    mounted() {
        this.getAllEventData();
    },

    methods: {

        openSimilarEventsDialog(selected_event) {
            let similarEvents = this.allEvents.filter(event => event.title !== selected_event.title);

            let match_categories = new Set();
            let categories = selected_event.categories.split(', ');

            for (let category of categories) {
                for (let event of similarEvents) {
                    if (event.categories.includes(category)) {
                        match_categories.add(event);
                    }
                }
            }
            let result = [];
            match_categories.forEach( event => result.push(event));
            this.similarEvents = result;
            this.similarEventsTitle = "Events Similar to " + selected_event.title;
            this.showSimilarEventDialog = true;
        },

        checkPage(event) {
            if (event.page === event.pageCount - 1) {
                this.$toast.add({severity: 'info', summary: 'Last Page', detail: 'There are no more events to see', life: 3000});
            }
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

        formatDate(date) {
            return common.formatDate(date);
        },

        formatCategories (ids) {
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

        getAllEventData: async function() {
            try {
                let events = await api.getEvents()
                this.allEvents = events.data;
                this.loadEventImages();
                let response = await api.getCategories();
                for (let category of response.data) {
                    this.categoryDict[category.id] = category.name;
                    this.categoryNames.push(category.name);
                }
                this.getExtraEventData();
            } catch {
                alert('Error loading events');
            }
        },

        dateInPast(date) {
            if (date === null) return false;
            if (typeof date === 'string') {
                date = Date.parse(date);
            }
            return date < Date.now();
        },

        getExtraEventData() {
            for (let i = 0; i < this.allEvents.length; i++) {
                let current_event = this.allEvents[i];
                api.getEventById(this.allEvents[i].eventId)
                    .then((response) => {
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

                        api.getUserImage(current_event.organizerId)
                            .then((response) => {
                                let reader = new window.FileReader();
                                reader.readAsDataURL(response.data);
                                reader.onload = function () {
                                    current_event['organiserImage'] = reader.result;
                                }

                            }, () => {
                                current_event['organiserImage'] = null;
                            });
                        if (i === this.allEvents.length - 1) {
                            this.loadingUserImages = false;
                            this.loadingEvents = false;
                        }
                    }, (error) => {
                        alert('Error getting events: ' + error);
                        return undefined;
                    }
                );
            }
        },

        loadEventImages() {
            for (let i = 0; i < this.allEvents.length; i++) {
                let current_event = this.allEvents[i];
                api.getEventImage(this.allEvents[i].eventId)
                    .then((response) => {
                        let reader = new window.FileReader();
                        reader.readAsDataURL(response.data);
                        reader.onload = function () {
                            current_event['eventImage'] = reader.result;
                        }

                    }).catch(() => {
                        this.allEvents[i]['eventImage'] = null;
                    });
            }
            this.loadingEventImages = false;
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
            if (status === 'not_logged_in' || status === 'rejected' || this.dateInPast(event.date) ||
                (event.attendeeCount >= event.capacity && event.capacity !== null && event.capacity !== undefined)) {
                return 'secondary'
            } else if (status === 'accepted' || status === 'pending') {
                return 'danger';
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
            } else if (this.dateInPast(event.date)) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Closed',
                    detail: 'You cannot change your attendance status for an event that has already happened',
                    life: 3000
                });
            } else if (event.capacity !== null && event.capacity !== undefined && event.attendeeCount >= event.capacity
                       && status === 'not_going') {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Full',
                    detail: 'Sorry, all spots are taken in this event',
                    life: 3000
                });
            } else if (status === 'rejected') {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You cannot change your status for this event because you have been rejected',
                    life: 3000
                });
            } else if (status === 'not_going') {
                api.requestAttendance(event.eventId)
                    .then(() => {
                        this.reloadRow(event);
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Request Sent',
                            detail: 'Go to the \'attending\' page to check if you have been accepted to this event',
                            life: 3000
                        });
                    })
                    .catch(() => {
                        alert('Attendance request failed');
                    });
            } else if (status === 'accepted' || status === 'pending') {
                api.deleteAttendee(event.eventId)
                    .then(() => {
                        this.reloadRow(event);
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
            for (let i = 0; i < this.allEvents.length; i++) {
                if (this.allEvents[i].eventId === event.eventId) {
                    index = i;
                }
            }
            if (index === null) {
                return
            }
            this.allEvents.splice(index, 1);

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
                            this.allEvents.push(event);
                        }).catch();
                }, (error) => {
                    alert('Error getting events: ' + error);
                    return
                });
        },

        getAttendanceData(event) {
            let id = event.data.eventId;
            let index = -1;
            for (let i = 0; i < this.allEvents.length; i++) {
                if (this.allEvents[i].eventId === id) {
                    index = i;
                }
            }
            if (!cache.isLoggedIn()) {
                this.allEvents[index]['attendance_status'] = 'not_logged_in';
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
                        this.allEvents[index]['attendance_status'] = 'not_going';
                    } else {
                        this.allEvents[index]['attendance_status'] = me.status;
                    }
                }).catch();
        }
    },

    computed: {
        events() {
            if (this.selectedCategories.length === 0) {
                return this.allEvents
            }
            let events = [];
            for (let event of this.allEvents) {
                for (let category of this.selectedCategories) {
                    if (event.categories.includes(category)) {
                        events.push(event);
                        break;
                    }
                }
            }
            return events;
        }
    }
}
</script>

<style scoped>

#details-table table{
    display: table;
    border-collapse: separate;
    box-sizing: border-box;
    text-indent: initial;
    border: none !important;
    padding: 0;
}

#details-table tr{
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
}

#details-table td{
    padding: 1rem;
}

.header-col {
    font-family: "Courier New", monospace;
    width: 210px;
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

.p-button-text {
    padding: 0;
}

</style>