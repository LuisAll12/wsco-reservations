const getReservations = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservations`;
    const headers = {
      "Content-Type": "application/json"
    };

    const response = await fetch(url, { headers });

    while (response.data.offset) {
      const nextResponse = await axios.get(url, {
        headers,
        params: { offset: response.data.offset }
      });
      records = [...records, ...nextResponse.data.records];
      response.data.offset = nextResponse.data.offset;
    }

    return records;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};

export default getReservations;