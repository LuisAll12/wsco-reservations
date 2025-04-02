import axios from "axios";

const baseId = "appzBNlFfIJC6865x";

export default async function checkBoatAvailability(boatId, from, to) {
  console.log("Boat:", boatId,);
  try {
    const url = `https://api.airtable.com/v0/${baseId}/Reservation`;  
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
    };
    const params = {
      filterByFormula: `{FK_Boat} = '${boatId}'`,
    };
    const response = await axios.get(url, { headers, params });

    const checkFrom = new Date(from);
    const checkTo = new Date(to); 

    const conflictingReservations = response.data.records.filter(record => {

      if (record.fields.State === 'Cancelled') return false;
      
      const recordFrom = new Date(record.fields.From);
      const recordTo = new Date(record.fields.To);

      return (
        (recordFrom < checkTo && recordTo > checkFrom) ||  
        (recordFrom >= checkFrom && recordTo <= checkTo) || 
        (recordFrom <= checkFrom && recordTo >= checkTo)    
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
      error: "Das Boot ist zur reservierten Zeit nicht verfügbar.",
      details: error.response?.data?.error?.message || error.message
    };
  }
}