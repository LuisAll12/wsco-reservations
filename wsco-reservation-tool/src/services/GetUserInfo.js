// src/services/getUserBySessionKey.js
import axios from "axios";

const baseId = "appzBNlFfIJC6865x";
const tableName = "Member";

const getUserBySessionKey = async (sessionKey) => {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.get(url, { 
      headers,
      params: {
        filterByFormula: `{SessionKey} = '${sessionKey}'`
      }
    });

    if (response.data.records.length > 0) {
      return response.data.records[0]; // Return the first matching user
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getUserBySessionKey;