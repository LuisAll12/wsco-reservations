export async function authCheck() {
    try {
        const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/session`;
        const headers = {
            "Content-Type": "application/json"
        };

        const response = await fetch(url, {
            method: "GET",
            headers,
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            return data ? true : false;
        }
        return false;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
}

export async function logoutUser() {
    try {
        const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/logout`;
        const headers = {
            "Content-Type": "application/json"
        };

        const response = await fetch(url, {
            method: "GET",
            headers,
            credentials: "include",
        });

        console.log("Logout");
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error logging out user:", error);
        return false;
    }
}

export async function getUserRole() {
    try {

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/role`, {
            credentials: "include",
        });

        const data = await res.json();
        return data.role;
    } catch (e) {
        console.error(e);
    }
}

export async function getUserID() {
    try {
        const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/session`;
        const headers = {
            "Content-Type": "application/json"
        };

        const response = await fetch(url, {
            method: "GET",
            headers,
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            return data ? data.id : null;
        }
        return false;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
}

export async function getBoatName(boatID) {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat/${boatID}`;
    const headers = {
        "Content-Type": "application/json"
    };

    const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
    });

    if (response.ok) {
        const data = await response.json();
        return data ? data.name : null;
    }
    return false;
}

export async function getUserName() {
    try {
        const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/session`;
        const headers = {
            "Content-Type": "application/json"
        };

        const response = await fetch(url, {
            method: "GET",
            headers,
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            return data ? data.firstName : null;
        }
        return false;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
}