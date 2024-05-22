import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const PageLayout = ({ children }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={8} className="mx-auto p-4 text-break">
          {/* Main content column (takes 8 columns on medium-sized screens and larger) */}
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default PageLayout;
