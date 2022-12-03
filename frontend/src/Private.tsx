// Render response from http://localhost:3000/api/private

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useAxios } from "./AxiosContext";

export const Private = () => {
  const [message, setMessage] = useState("");
  const axios = useAxios();
  const { isAuthenticated } = useAuth0();

  const callApi = async () => {
    try {
      const response = await axios.get("/api/private");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      callApi().then((response) => setMessage(response.message));
    }
  }, [isAuthenticated]);

  return <div>{message}</div>;
};
