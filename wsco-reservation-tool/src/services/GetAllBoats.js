// GetAllBoats.js
import axios from "axios";

const baseId = "appzBNlFfIJC6865x";
const tableName = "Boat";

const getBoats = async () => {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.get(url, { headers });
    let records = response.data.records;

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

export default getBoats;