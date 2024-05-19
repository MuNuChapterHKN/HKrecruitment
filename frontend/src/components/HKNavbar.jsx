import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";
import { Link } from "react-router-dom";
import Col from "react-bootstrap/Col";
import NavDropdown from "react-bootstrap/NavDropdown";

import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import LoadingSpinner from "./LoadingSpinner";

const HKNavbar = () => {
  const { isLoading, isAuthenticated, user } = useAuth0();

  const LoggedUserMenu = () => (
    <div id="profile-nav-dropdown">
      <NavDropdown
        title={
          (user.picture && (
            <img
              className="thumbnail-image"
              src={user.picture}
              width="65"
              height="65"
              alt="user pic"
              style={{ borderRadius: "50%" }}
            />
          )) || <i class="bi bi-person-circle fs-4 me-2" />
        }
      >
        <NavDropdown.ItemText>
          {user.name ? user.name : user.email}
        </NavDropdown.ItemText>
        <NavDropdown.Divider />
        <LogoutButton />
      </NavDropdown>
    </div>
  );

  return (
    <Container fluid>
      <Row>
        <Navbar className="p-sm-4 p-2">
          <Col md="auto">
            <Navbar.Brand>
              <Link to="/">
                <Image
                  fluid
                  alt="Home"
                  // src="hkn_logo_blu.png"
                  src="hkn_logo_white_vector.svg"
                  width="70"
                  height="70"
                />
              </Link>
            </Navbar.Brand>
          </Col>

          <Col align="center" className="mx-sm-4 mx-2">
            <h2>HKRecruitment</h2>
          </Col>

          <Col md="auto" className="me-1">
            {isLoading ? (
              <LoadingSpinner />
            ) : !isAuthenticated ? (
              <LoginButton />
            ) : (
              <LoggedUserMenu />
            )}
          </Col>
        </Navbar>
      </Row>
    </Container>
  );
};

export default HKNavbar;
