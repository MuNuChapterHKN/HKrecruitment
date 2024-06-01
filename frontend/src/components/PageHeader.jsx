import React from "react";
import { Container } from "react-bootstrap";
import HomeButton from "./HomeButton";

const PageHeader = ({ children }) => {
  return (
    <Container className="d-flex align-items-center mb-2">
      <HomeButton />
      <h1>{children}</h1>
    </Container>
  );
};

export default PageHeader;
