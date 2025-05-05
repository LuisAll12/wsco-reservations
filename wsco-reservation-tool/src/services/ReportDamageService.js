// ReportDamageService.js
import axios from "axios";

const baseId    = "appzBNlFfIJC6865x";
const restableName = "tblDfqhYFt0jTZRTb";
const dmgTableName = 'tblyI8KtM0QN5UvC4';

export const getUserReservations = async (userId) => {
  const url     = `https://api.airtable.com/v0/${baseId}/${restableName}`;
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
    "Content-Type":  "application/json",
  };
  // filter für Deinen User
  const filterFormula = `ARRAYJOIN({FK_Member}, ",") = "${userId}"`;

  let all = [], offset;
  do {
    const resp = await axios.get(url, {
      headers,
      params: {
        filterByFormula: filterFormula,
        offset,
        // ← hier kommt das expand! 
        expand: ["FK_Boat"],
      },
    });
    all    = all.concat(resp.data.records);
    offset = resp.data.offset;
  } while (offset);

  return all;
};

export const createDamageReport = async (fields) => {
    const url    = `https://api.airtable.com/v0/${baseId}/${dmgTableName}`;
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    try {
      const resp = await axios.post(url, { fields }, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type":  "application/json",
        }
      });
      return resp.data;
    } catch (err) {
      // <-- hier die Airtable-Antwort loggen:
      console.error("Airtable-Error:", err.response?.data);
      throw err;
    }
  };