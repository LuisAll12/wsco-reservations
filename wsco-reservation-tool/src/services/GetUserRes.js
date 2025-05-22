export const getUsersReservaitons = async () => {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/user`;
    const headers = {
        "Content-Type": "application/json"
    };

    const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
    });

    const data = await res.json();
    console.log("Data:", data);

    return data;
}

export const GetBoat = async (boatId) => {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat/${boatId}`;
    const headers = {
        "Content-Type": "application/json"
    };

    const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
    });

    const data = await res.json();
    console.log("Data:", data);

    return data;
}

export const SetReservationAsCancelled = async (reservationId) => {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/cancel/${reservationId}`;
    const headers = {
        "Content-Type": "application/json"
    };

    const res = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
    });

    const data = await res.json();
    console.log("Data:", data);

    return data;
}

export const getTasklist = async (id) => {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/${id}/tasklist`;
    const headers = {
        "Content-Type": "application/json"
    };

    const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
    });

    const data = await res.json()
    console.log(data);

    return data;
}

export const CompleteChecklist = async (reservationId) => {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/checkin`;
    const headers = {
        "Content-Type": "application/json"
    };

    const res = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ ReservationId: reservationId })
    });

    const data = await res.json()
    console.log(data);

    return data;
}