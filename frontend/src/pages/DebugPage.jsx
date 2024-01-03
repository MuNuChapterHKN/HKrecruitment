import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth0 } from "@auth0/auth0-react";
import Accordion from "react-bootstrap/Accordion";

function DebugPage() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
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
      <PageHeader>Debug</PageHeader>
      <Accordion alwaysOpen variant="secondary">
        <Accordion.Item eventKey="0">
          <Accordion.Header>User info</Accordion.Header>
          <Accordion.Body>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Access Token</Accordion.Header>
          <Accordion.Body>{accessToken}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default DebugPage;
