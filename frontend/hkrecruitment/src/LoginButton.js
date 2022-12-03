import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from 'react-bootstrap/Button';

const LoginButton = () => {
  const {isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return <Button onClick={() => isAuthenticated?  logout() : loginWithRedirect() }variant="light">{isAuthenticated?  "Log out" : "Log in"}</Button>
};

export default LoginButton;