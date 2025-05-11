export default async function checkBoatAvailability(boatId, from, to) {
  try {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat/isOccupied?boatId=${boatId}&startCheckTime=${new Date(from).toISOString()}&endCheckTime=${new Date(to).toISOString()}`;
    const headers = {
      "Content-type": "application/json"
    };

    const res = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include'
    })

    if (!res.ok) {
      throw new Error("Error while fetching availability");
    }

    const data = await res.json();

    return {
      available: !data.isOccupied,
    };

  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      available: false,
      error: "Das Boot ist zur reservierten Zeit nicht verfügbar.",
    };
  }
}