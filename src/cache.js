function getCurrentUserId() {
    return localStorage.getItem("currentUserId");
}

function setCurrentUserId(id) {
    return localStorage.setItem("currentUserId", id);
}

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    return localStorage.setItem("token", token);
}

function emitLoginOrOutEvent() {
    const event = new Event('loginOrOut');
    window.dispatchEvent(event);
}


function setLoggedIn() {
    localStorage.setItem("loggedIn", "true");
    emitLoginOrOutEvent();
}

function setLoggedOut() {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("currentUserId");
    emitLoginOrOutEvent();
}

function isLoggedIn() {
    return localStorage.getItem("loggedIn") === "true";
}

// Exports functions that will be visible outside the module.
export default {
    getCurrentUserId,
    setCurrentUserId,
    getToken,
    setToken,
    setLoggedIn,
    setLoggedOut,
    isLoggedIn
};
