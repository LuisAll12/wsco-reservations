export const getUserBySessionKey = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/auth/session`;
    const headers = {
      "Content-Type": "application/json"
    };

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();

      if (data && data.user) {
        console.log("User data:", data);
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

