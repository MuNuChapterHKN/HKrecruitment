import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

const HomeButton = () => {
  return (
    <Link to="/" className="me-4">
      <Button variant="outline-light" size="sm">
        ᐊ
      </Button>
    </Link>
  );
};

export default HomeButton;
