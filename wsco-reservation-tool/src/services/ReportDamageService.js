// ReportDamageService.js
import axios from "axios";

const baseId    = "appzBNlFfIJC6865x";
const tableName = "tblDfqhYFt0jTZRTb";

export const getUserReservations = async (userId) => {
  const url     = `https://api.airtable.com/v0/${baseId}/${tableName}`;
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
