import {createRouter, createWebHistory} from "vue-router";
import cache from "./cache";

import AllEvents from "./components/AllEvents";
import Organising from "./components/Organising";
import Attending from "./components/Attending";
import NewEvent from "./components/NewEvent";
import EditEvent from "./components/EditEvent";
import Profile from "./components/Profile";
import Register from "./components/Register";
import EditProfile from "./components/EditProfile";
import NotAuthorised from "./components/NotAuthorised";


const routes = [
    {
        path: '/events',
        component: AllEvents
    },
    {
        path: '/not_authorised',
        component: NotAuthorised
    },
    {
        path: '/organising',
        name: 'organising',
        component: Organising,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/attending',
        name: 'attending',
        component: Attending,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/edit_profile',
        name: 'edit_profile',
        component: EditProfile,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
    },
    {
        path: '/new_event',
        name: 'new_event',
        component: NewEvent,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/edit_event/:id',
        name: 'edit_event',
        component: EditEvent,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/",
        redirect: "/events"
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: "/events"
    }
];

const router = createRouter({
    routes,
    history: createWebHistory()
});


router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (cache.isLoggedIn()) {
            next();
        } else {
            alert("Uh oh! You're not logged in.\nClick ok to return to the events page.");
            next({path: '/events'});
        }
    } else {
        next();
    }
});


export default router;