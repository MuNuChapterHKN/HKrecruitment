import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'


function MyNavbar(props) {

    return <div>
        <Container fluid className="navbarContainer">
            <Row>
                <Navbar fixed="top" className="myNavbar">
                    <Col className="brand" xs={2} >
                        <Navbar.Brand href="/home"><h1 className="white"><b><u>404</u></b>Cars</h1></Navbar.Brand>
                        <Navbar.Toggle/>
                    </Col>
                    <Col className="slope" xs={1}>
                    </Col>
                        <Col md={6} className="center-block text-center">
                            <h1 ><b >Make a reservation</b></h1>
                        </Col>
                    <Col className="slope2" xs={1}>
                    </Col>
                </Navbar>
            </Row>
        </Container>
    </div>


}

export default MyNavbar;
