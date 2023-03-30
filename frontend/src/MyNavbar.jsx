import React, { ReactPropTypes } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import LoginButton from "./LoginButton";

import Col from "react-bootstrap/Col";
import { useAuth0 } from "@auth0/auth0-react";

const MyNavbar = (props) => {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } =
    useAuth0();

  return (
    <Container fluid>
      <Row>
        <Navbar bg="light" variant="light">
          <Col>
            <Navbar.Brand href="#home">
              <img
                alt=""
                src="hkn_logo_blu.png"
                width="60"
                height="60"
                className="d-inline-block align-center"
              />{" "}
              HKRecruitment
            </Navbar.Brand>
          </Col>
          <Col align="center">
            {" "}
            <h2>
              {isAuthenticated
                ? "Hello " + user.name.split(" ")[0] + "!"
                : "Login"}
            </h2>
          </Col>
          <Col align="right">
            <LoginButton />
          </Col>
        </Navbar>
      </Row>
    </Container>
  );
};

export default MyNavbar;
