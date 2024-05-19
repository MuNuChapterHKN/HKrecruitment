import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AvailabilitiesTable from "../components/AvailabilitiesTable";
import PageHeader from "../components/PageHeader";

function AvailabilitiesPage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState("");

  /* AUTH */
  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        grant_type: "client_credentials",
      }).then((token) => {
        setAccessToken(token);
      });
    }
  }, [isAuthenticated]);

  return (
    <>
      <PageHeader>Availabilities</PageHeader>
      <p>This page will be used by members to manage their availabilities.</p>

      <AvailabilitiesTable />
    </>
  );
}

export default AvailabilitiesPage;
