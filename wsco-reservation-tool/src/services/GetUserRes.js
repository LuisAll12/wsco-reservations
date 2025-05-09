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