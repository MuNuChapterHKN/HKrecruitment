import React from "react";
import Image from "react-bootstrap/Image";
import PageHeader from "../components/PageHeader";

function NotFoundPage() {
  return (
    <>
      <PageHeader>404 - Page not found</PageHeader>
      <Image className="d-flex mx-auto h-50 mw-100" src="notfound404.jpg" />
    </>
  );
}

export default NotFoundPage;
