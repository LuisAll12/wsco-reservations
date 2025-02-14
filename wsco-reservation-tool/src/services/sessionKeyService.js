import axios from "axios";
import Cookies from "js-cookie";

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl";

const setSessionKey = async (userEmail) => {
  const sessionKey = Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);

  // Set session key in cookies
  Cookies.set("sessionKey", sessionKey, { expires: 1, secure: true });

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    // Fetch existing records to find the user
    const response = await axios.get(url, { headers });
    const userRecord = response.data.records.find(record => record.fields.Email === userEmail);
    
    if (userRecord) {
      // Update existing record with new session key
      await axios.patch(`${url}/${userRecord.id}`, {
        fields: {
          SessionKey: sessionKey
        }
      }, { headers });
      console.log("Session key updated successfully.");
    } else {
      console.error("User not found.");
    }
  } catch (error) {
    console.error("Error storing session key:", error.response ? error.response.data : error.message);
  }
};

export default setSessionKey;
