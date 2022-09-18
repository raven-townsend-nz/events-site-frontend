<template>
    <div>
        <p-toast></p-toast>
        <p-confirmdialog></p-confirmdialog>
        <p-datatable :value="events"
                     id="dataTable"
                     v-model:expandedRows="expandedRows"
                     dataKey="eventId"
                     sortField="date"
                     :sortOrder="1"
                     :loading="loading"
                     :paginator="true"
                     :rows="10"
                     @page="checkPage"
                     paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                     responsiveLayout="scroll">
            <template #header>
                <div>
                    <h5>Events You Are Organising</h5>
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
                    {{ formatDate(new Date(slotProps.data.date).toString())}}
                </template>
            </p-column>
            <p-column field="categories"
                      :showFilterMatchModes="false"
                      header="Categories">
            </p-column>
            <p-column field="attendeeCount" header="Attendance">
                <template #body="slotProps">
                    {{ slotProps.data.attendeeCount ? slotProps.data.attendeeCount : 0 }}
                </template>
            </p-column>
            <p-column id="button-col">
                <template #body="slotProps">
                    <tr v-if="slotProps.data.requiresAttendanceControl"><td>
                        <p-button label="Attendance Requests"
                                  icon="pi pi-fw pi-user-edit"
                                  class="p-button-text"
                                  @click="openAttendanceDialog(slotProps.data)"/>
                    </td></tr>
                    <tr><td>
                        <p-button label="Edit Event"
                                  icon="pi pi-fw pi-pencil"
                                  class="p-button-text"
                                  @click="goToEditEvent(slotProps.data.eventId, slotProps.data.title,  slotProps.data.date)"/>
                    </td></tr>
                    <tr><td>
                        <p-button label="Delete Event"
                                  icon="pi pi-fw pi-times-circle"
                                  class="p-button-text"
                                  @click="confirmDelete(slotProps.data.eventId, slotProps.data.title,  slotProps.data.date)"/>
                    </td></tr>
                </template>

            </p-column>
            <template #paginatorRight>
                <p-button type="button"
                          id="add-event"
                          icon="pi pi-fw pi-plus-circle"
                          @click="addEventHandler"
                          class="p-button-text"
                          label="Add Event"></p-button>
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

        <p-dialog header="Attendance Requests"
                  v-model:visible="showAttendanceDialog"
                  :style="{width: '50vw'}"
                  sortField="dateOfInterest"
                  :sortOrder="1"
                  :maximizable="true"
                  :modal="true">
            <div>
                <p-datatable :value="attendanceRequests"
                             responsiveLayout="scroll">
                    <p-column field="firstName" header="First Name"></p-column>
                    <p-column field="lastName" header="Last Name"></p-column>
                    <p-column header="Change Status">
                        <template #body="slotProps">
                            <tr><td>
                                <p-button label="Accept"
                                          @click="accept(slotProps.data)"
                                          class="p-button-outlined p-button-success" />
                            </td></tr>
                            <tr><td>
                                <p-button label="Reject"
                                          @click="reject(slotProps.data)"
                                          class="p-button-outlined p-button-danger" />
                            </td></tr>
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
    name: "Organising.vue",

    data() {
        return{
            events: [],
            expandedRows: [],
            attendees: [],
            organizerId: null,
            showUsersDialog: false,
            showAttendanceDialog: false,
            attendanceRequests: [],
            currentEvent: null,

            categoryDict: {},
            categoryNames: [],

            statusOptions: [
                {name: 'Accepted', value: 'accepted'},
                {name: 'Pending', value: 'pending'},
                {name: 'Rejected', value: 'rejected'}
            ],
            selectedStatus: null,
            loading: true
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
                let response = await api.getEventById(events[i].eventId)
                if (response.data.organizerId == cache.getCurrentUserId()) {
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
                    this.events.push(current_event);

                }
            }
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
                    current_event['eventImage'] = null;
                });
            }
            this.loading = false;
        },

        accept(attendanceRequest) {
            api.updateAttendee(this.currentEvent.eventId, attendanceRequest.attendeeId, 'accepted')
                .then(() => {
                    if (this.currentEvent.attendeeCount < this.currentEvent.capacity) {
                        for (let i = 0; i < this.attendanceRequests.length; i++) {
                            if (this.attendanceRequests[i].attendeeId === attendanceRequest.attendeeId) {
                                this.attendanceRequests.splice(i, 1);
                            }
                        }
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Event Full',
                            detail: `You have reached capacity.`,
                            life: 3000
                        });
                    }
                    this.reloadEvent(this.currentEvent.eventId);
                }).catch();
        },

        reject(attendanceRequest) {
            api.updateAttendee(this.currentEvent.eventId, attendanceRequest.attendeeId, 'rejected')
                .then((response) => {
                    if (response.status === 200) {
                        for (let i = 0; i < this.attendanceRequests.length; i++) {
                            if (this.attendanceRequests[i].attendeeId === attendanceRequest.attendeeId) {
                                this.attendanceRequests.splice(i, 1);
                            }
                        }
                    }
                    this.reloadEvent(this.currentEvent.eventId);
                }).catch();
        },

        goToEditEvent(eventId, eventTitle, date) {
            if (this.eventIsInPast(date)) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Past Event',
                    detail: `The ${eventTitle} event cannot be edited because it is in the past.`,
                    life: 3000
                });
                return
            }
            this.$router.push('/edit_event/' + eventId);
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

        openAttendanceDialog(event) {
            let eventId = event.eventId;
            api.getEventAttendees(eventId)
                .then((response) => {
                    this.attendees = response.data;
                    for (let i = 0; i < this.attendees.length; i++) {
                        if (this.attendees[i].status === 'pending') {
                            this.attendanceRequests.push(this.attendees[i]);
                        }
                    }
                    this.currentEvent = event;
                    this.showAttendanceDialog = true;
                }, (error) => {
                    alert(error);
                });
        },

        reloadEvent(eventId) {
            let index = null;
            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].eventId === eventId) {
                    index = i;
                }
            }
            if (index === null) {
                return
            }
            api.getEventById(eventId)
                .then((response) => {
                    this.events[index]['attendeeCount'] = response.data.attendeeCount;
                }, (error) => {
                    alert('Error getting events: ' + error);
                });
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

        formatDate(date) {
            return common.formatDate(date);
        },

        eventIsInPast(date) {
            date = new Date(Date.parse(date));
            return date < new Date();
        },

        confirmDelete(eventId, eventTitle, date) {
            if (this.eventIsInPast(date)) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Past Event',
                    detail: `The ${eventTitle} event cannot be deleted because it is in the past.`,
                    life: 3000
                });
                return
            }
            this.$confirm.require({
                message: `Confirm that you would like to delete this event:\n${eventTitle}`,
                header: 'Delete Confirmation',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    api.deleteEvent(eventId)
                        .then(() => {
                            this.$router.go(0);
                        }).catch(() => {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Delete Failed',
                            detail: `The ${eventTitle} event was not deleted`,
                            life: 3000
                        })
                    });
                }
            });
        },

        checkPage(event) {
            if (event.page === event.pageCount - 1) {
                this.$toast.add({severity: 'info', summary: 'Last Page', detail: 'There are no more events to see', life: 3000});
            }
        },

        generateAttendeeMessage(count) {
            if (count === null || count === undefined) {
                return 'No attendees';
            } else {
                return 'View all accepted attendees (plus yourself if your status is \'pending\')';
            }
        },

        addEventHandler() {
            this.$router.push('/new_event');
        }
    }
}
</script>

<style scoped>

#button-col {
    width: 500px;
}

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
    width: 170px;
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

#add-event {
    margin-right: 125px;
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
    padding-right: 150px;
}

</style>