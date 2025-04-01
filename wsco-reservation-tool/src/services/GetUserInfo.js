// src/services/GetUserInfo.js
import axios from "axios";
import Cookies from "js-cookie";

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl"; // Your users table name

const getUserInfo = async () => {
  try {
    const sessionKey = Cookies.get("sessionKey");
    if (!sessionKey) return null;

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

    return response.data.records[0]?.fields || null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

export default getUserInfo;