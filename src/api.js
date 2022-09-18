import axios from 'axios';
import cache from './cache';

axios.defaults.withCredentials = false;

const base_url = 'http://localhost:4941/api/v1';

function getHeaders() {
    return {headers: {"X-Authorization": cache.getToken()}};
}


export default {

    // Events:

    getEvents: () => axios.get(base_url + '/events'),

    getEventById: (id) => axios.get(base_url + '/events/' + id),

    getEventAttendees: (id) => axios.get(base_url + '/events/' + id + '/attendees', cache.isLoggedIn()? getHeaders() : {}),

    requestAttendance: (id) => axios.post(base_url + '/events/' + id + '/attendees', '', getHeaders()),

    deleteAttendee: (id) => axios.delete(base_url + '/events/' + id + '/attendees', getHeaders()),

    updateAttendee: (event_id, user_id, status) => axios.patch(base_url + '/events/' + event_id + '/attendees/' + user_id,
        {"status": status}, getHeaders()),

    getCategories: () => axios.get(base_url + '/events/categories'),

    getEventImage: (id) => axios.get(base_url + '/events/' +  id + '/image', {responseType: 'blob'}),

    postEvent: (event) => axios.post(base_url + '/events', event, getHeaders()),

    patchEvent: (id, event) => axios.patch(base_url + '/events/' + id, event, getHeaders()),

    deleteEvent: (id) => axios.delete(base_url + '/events/' + id, getHeaders()),

    putEventImage: (id, image) => axios.put(base_url + '/events/' + id + '/image', image,
        {headers: {"X-Authorization": cache.getToken(), 'Content-Type': image.type}}),


    // Users:

    login: (email, password) => axios.post(base_url + '/users/login', {"email": email, "password": password}),

    logout: () => axios.post(base_url + '/users/logout', '', getHeaders()),

    postUser: (user) => axios.post(base_url + '/users/register', user),

    patchUser: (id, user) => axios.patch(base_url + '/users/' + id, user, getHeaders()),

    getUserById(id) {
        if (cache.isLoggedIn()) {
            return axios.get(base_url + '/users/' + id, getHeaders());
        } else {
            return axios.get(base_url + '/users/' + id);
        }
    },

    getUserImage: (id) => axios.get(base_url + '/users/' +  id + '/image', {responseType: 'blob'}),

    putUserImage: (id, image) => axios.put(base_url + '/users/' +  id + '/image', image,
        {headers: {"X-Authorization": cache.getToken(), 'Content-Type': image.type}}),

    deleteUserImage: (id) => axios.delete(base_url + '/users/' +  id + '/image', getHeaders())

};