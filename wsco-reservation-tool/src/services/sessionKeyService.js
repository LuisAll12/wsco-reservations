// sessionKeyService.js
import axios from "axios";
import Cookies from "js-cookie";

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl";

const setSessionKey = async (userEmail) => {
  const sessionKey = Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);

  // Setze den Key in Cookies
  Cookies.set("sessionKey", sessionKey, { expires: 1, secure: true });

  // Benachrichtige die App über die Änderung
  window.dispatchEvent(new CustomEvent('sessionKeyChanged'));

  // Rest deiner Logik (Airtable-Update)...
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.get(url, { headers });
    const userRecord = response.data.records.find(record => record.fields.Email === userEmail);
    
    if (userRecord) {
      await axios.patch(`${url}/${userRecord.id}`, {
        fields: { SessionKey: sessionKey }
      }, { headers });
    }
  } catch (error) {
    console.error("Error updating session key:", error);
  }
};

export default setSessionKey;