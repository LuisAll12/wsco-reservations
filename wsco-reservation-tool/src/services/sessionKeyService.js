// sessionKeyService.js
import axios from "axios";
import Cookies from "js-cookie";
import { sha256 } from 'js-sha256';

const baseId = "appzBNlFfIJC6865x";
const tableName = "tblalxalwt9C0cFxl";

// Helper function to hash data
const hashData = (data) => {
  return sha256(data);
};

// Function to set session key (updated with hashing)
export const setSessionKey = async (userEmail) => {
  const sessionKey = Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);
  const hashedSessionKey = hashData(sessionKey);

  // Set the hashed key in Cookies
  Cookies.set("sessionKey", hashedSessionKey, { expires: 1, secure: true });

  // Notify the app about the change
  window.dispatchEvent(new CustomEvent('sessionKeyChanged'));

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
        fields: { SessionKey: hashedSessionKey }
      }, { headers });
    }
  } catch (error) {
    console.error("Error updating session key:", error);
  }
};

// Function to check if session key exists in Airtable
export const checkSessionKey = async () => {
  const sessionKey = Cookies.get("sessionKey");
  
  if (!sessionKey) {
    return false;
  }

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.get(url, { headers });
    
    // Check if any record has a matching hashed SessionKey
    const matchingRecord = response.data.records.find(record => 
      record.fields.SessionKey === sessionKey
    );

    return !!matchingRecord;
  } catch (error) {
    console.error("Error checking session key:", error);
    return false;
  }
};