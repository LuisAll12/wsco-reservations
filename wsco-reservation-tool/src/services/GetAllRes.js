export const getReservations = async (startDate, endDate, boatId = null) => {
  try {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation?start=${startDate}&end=${endDate}${boatId ? `&boatId=${boatId}` : ''}`;
    const headers = {
      "Content-Type": "application/json"
    };

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("Response:", response);
    if (!response.ok) {
      throw new Error(`Error fetching reservations: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};
