import axios from "axios";
import Cookies from "js-cookie";
import { sha256 } from 'js-sha256';

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl";

const hashData = (data) => sha256(data);

export const setSessionKey = async (userEmail) => {
  console.log('Raw email input:', userEmail);
  console.log('Type of email:', typeof userEmail);
  const sessionKey = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const hashedSessionKey = hashData(sessionKey);

  // Set cookie
  Cookies.set("SSessionKey", hashedSessionKey, {
    expires: 1,
    secure: true,
    sameSite: 'strict'
  });

  window.dispatchEvent(new CustomEvent('sessionKeyChanged'));

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    // First find user by email
    const findResponse = await axios.get(url, {
      headers,
      params: {
        filterByFormula: `{Email} = '${userEmail}'`,
        maxRecords: 1
      }
    });

    if (findResponse.data.records.length === 0) {
      console.error("User not found with email:", userEmail);
      return false;
    }

    const userRecord = findResponse.data.records[0];

    // Update session key
    await axios.patch(`${url}/${userRecord.id}`, {
      fields: {
        SessionKey: hashedSessionKey,
        State: "Active" // Optional: Update user state
      }
    }, { headers });

    return true;
  } catch (error) {
    console.error("Error updating session key:", error.response?.data || error.message);
    return false;
  }
};

export const checkSessionKey = async () => {
  const sessionKey = Cookies.get("sessionKey");
  if (!sessionKey) return false;

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.get(url, {
      headers,
      params: {
        filterByFormula: `{SessionKey} = '${sessionKey}'`,
        maxRecords: 1
      }
    });

    const isValid = response.data.records.length > 0;

    // Optional: Check if user is still active
    if (isValid && response.data.records[0].fields.State !== "Active") {
      console.warn("User account is not active");
      return false;
    }

    return isValid;
  } catch (error) {
    console.error("Error checking session key:", error.response?.data || error.message);
    return false;
  }
};

export const getCurrentUserFromSession = async () => {
  const sessionKey = Cookies.get("sessionKey");
  if (!sessionKey) return null;

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.get(url, {
      headers,
      params: {
        filterByFormula: `{SessionKey} = '${sessionKey}'`,
        maxRecords: 1
      }
    });

    if (response.data.records.length === 0) return null;

    return response.data.records[0]; // enthält id & fields
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzers aus der Session:", error);
    return null;
  }
};
