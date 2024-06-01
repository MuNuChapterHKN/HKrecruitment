import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function HomePage() {
  const { isAuthenticated, user } = useAuth0();

  return (
    <>
      {isAuthenticated ? (
        <h1>Welcome, {user.given_name}.</h1>
      ) : (
        <h1>Welcome, anonymous.</h1>
      )}
      <p>This is the HKN Polito Recruitment Platform.</p>

      {isAuthenticated ? (
        <>
          <br />
          <p>Available pages:</p>
          <Link to="/apply">Apply</Link>
          <br />
          <Link to="/availabilities">Availabilities</Link>
          <br />
          <Link to="/debug">Debug</Link>
        </>
      ) : (
        <>
          <p>To get started, please login.</p>
        </>
      )}
    </>
  );
}

export default HomePage;
