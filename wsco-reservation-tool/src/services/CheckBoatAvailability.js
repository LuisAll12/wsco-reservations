import axios from "axios";

const baseId = "appzBNlFfIJC6865x";

export default async function checkBoatAvailability(boatId, from, to) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/Reservation`;
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
    };
    console.log("Checking availability for boat:", boatId, "from:", from, "to:", to);
    // 1. Load all reservations for the boat
    const params = {
      filterByFormula: `{FK_Boat} = 'recSAydWK2TyCK41t'`,
    };
    console.log("Request params:", params);
    const response = await axios.get(url, { headers, params });
    console.log("Reservations response:", response.data);
    // 2. Create date objects for comparison
    const checkFrom = new Date(from);
    const checkTo = new Date(to);

    // 3. Filter locally for active reservations with time overlap
    const conflictingReservations = response.data.records.filter(record => {
      // Skip cancelled reservations
      // if (record.fields.State === 'Cancelled') return false;
      
      const recordFrom = new Date(record.fields.From);
      const recordTo = new Date(record.fields.To);
      
      // Check for time overlap
      return (
        (recordFrom < checkTo && recordTo > checkFrom) ||  // Partial overlap
        (recordFrom >= checkFrom && recordTo <= checkTo) || // Completely within
        (recordFrom <= checkFrom && recordTo >= checkTo)    // Completely contains
      );
    });

    return {
      available: conflictingReservations.length === 0,
      conflictingReservations,
    };
    
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      available: false,
      error: "Availability check failed",
      details: error.response?.data?.error?.message || error.message
    };
  }
}