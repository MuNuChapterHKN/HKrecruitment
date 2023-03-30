import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect } from "react";
import MyNavbar from "./MyNavbar";
import SignupForm from "./SignupForm";
import { Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import AvaiabilitiesTable from "./AvaiabilitiesTable";

function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        grant_type: "client_credentials",
      }).then((token) => {
        console.log(`Token: ${token}`);
      });
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route
        path="/"
        element={<AfterLogin isAuthenticated={isAuthenticated} user={user} />}
      />
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export default App;

function AfterLogin(props) {
  return (
    <div>
      {" "}
      <MyNavbar />
      {props.isAuthenticated &&
        !props.user.email.endsWith("@hknpolito.org") && <SignupForm />}
      {props.isAuthenticated && props.user.email.endsWith("@hknpolito.org") && (
        <AvaiabilitiesTable />
      )}
    </div>
  );
}
