import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";

function SignupForm(props) {
  const [level, setLevel] = useState("");
  const [validated, setValidated] = useState(false);
  const [previous, setPrevious] = useState("");
  const [average, setAverage] = useState("");
  const [cfu, setCfu] = useState(0);
  const [course, setCourse] = useState("");
  const [year, setYear] = useState(0);
  const [phd, setPhd] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    switch (level) {
      case "LT":
        if (year > 1 && cfu > 60 && cfu < 180 && average >= 26) {
          setValidated(true);
          setLoading(true);
        }
        break;
      case "LM":
        if (cfu < 20 && average >= 26) {
          setValidated(true);
          setLoading(true);
        } else if (cfu >= 20 && average >= 27) {
          setValidated(true);
          setLoading(true);
        }
        break;
      case "PhD":
        setValidated(true);
        setLoading(true);
        break;
      default:
        setValidated(false);
    }
  };
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <h2 align="center">Insert your data to submit an application</h2>
      <Container>
        <Row>
          <Form.Group
            as={Col}
            controlId="formGridState"
            onChange={(event) => setLevel(event.target.value)}
          >
            <Form.Label>Il mio attuale livello di studi</Form.Label>
            <Form.Select defaultValue="">
              <option value="">Select one</option>
              <option value="LT">Laurea Triennale</option>
              <option value="LM">Laurea Magistrale</option>
              <option value="PhD">Dottorato di Ricerca</option>
            </Form.Select>
          </Form.Group>
        </Row>
        <Row className="mt-3" md={{ span: "auto", offset: 3 }}>
          <Form.Group
            as={Col}
            controlId="formGridCFU"
            className={level === "LM" ? "mb-3" : "d-none mb-3"}
            onChange={(event) => setCfu(event.target.value)}
          >
            <Form.Label>CFU obtained </Form.Label>
            <Form.Control
              type="number"
              max="180"
              required
              placeholder="Please insert the current number of cfu obtained"
            />
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridState"
            className={level === "LT" || level == "LM" ? "" : "d-none"}
            onChange={(event) => setCourse(event.target.value)}
          >
            <Form.Label>Il mio attuale corso di studi</Form.Label>
            <Form.Select defaultValue="">
              <option value="">Select one</option>
              <option value="LT">Laurea Triennale</option>
              <option value="LM">Laurea Magistrale</option>
              <option value="PhD">Dottorato di Ricerca</option>
            </Form.Select>
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridState"
            className={level == "LM" && cfu < 20 ? "" : "d-none"}
            onChange={(event) => setPrevious(event.target.value)}
          >
            <Form.Label>Il mio corso di studi triennale</Form.Label>
            <Form.Select defaultValue="">
              <option value="">Select one</option>
              <option value="LT">Laurea Triennale</option>
              <option value="LM">Laurea Magistrale</option>
              <option value="PhD">Dottorato di Ricerca</option>
            </Form.Select>
          </Form.Group>

          <Form.Group
            as={Col}
            className={level == "PhD" ? "" : "d-none"}
            onChange={(event) => setPhd(event.target.value)}
          >
            <Form.Label>Brief Description of your PhD work</Form.Label>
            <Form.Control as="textarea" aria-label="With textarea" required />
          </Form.Group>
        </Row>
        <Row className="mt-3">
          <Form.Group
            as={Col}
            controlId="formGridState"
            className={level == "PhD" ? "" : "d-none"}
            onChange={(event) => setPrevious(event.target.value)}
          >
            <Form.Label>Il mio corso di studi magistrale</Form.Label>
            <Form.Select defaultValue="">
              <option value="">Select one</option>
              <option value="LT">Laurea Triennale</option>
              <option value="LM">Laurea Magistrale</option>
              <option value="PhD">Dottorato di Ricerca</option>
            </Form.Select>
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridCFU"
            className={level === "LT" ? "mb-3" : "d-none mb-3"}
            onChange={(event) => setCfu(event.target.value)}
          >
            <Form.Label>CFU obtained </Form.Label>
            <Form.Control
              type="number"
              max="180"
              required
              placeholder="Please insert the current number of cfu obtained"
            />
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridState"
            className={level == "LT" || level == "LM" ? "" : "d-none"}
            onChange={(event) => setYear(event.target.value)}
          >
            <Form.Label>Year</Form.Label>
            <Form.Select defaultValue="">
              <option value="">Select one</option>
              <option value="1">1</option>
              <option value="2">2</option>
              {level == "LT" ? <option value="3">3</option> : ""}
            </Form.Select>
          </Form.Group>

          <Form.Group
            as={Col}
            className={level === "LT" || level == "LM" ? "mb-3" : "d-none mb-3"}
            controlId="formGridAverage"
            onChange={(event) => setAverage(event.target.value)}
          >
            <Form.Label>Average {cfu < 20 ? "bachelor" : ""} grade</Form.Label>
            <Form.Control
              type="number"
              max="30"
              min="25"
              required
              placeholder="Please insert your actual grade average"
            />
            <Form.Control.Feedback type="invalid">
              Insert average grade (min 25, for 30L insert 30)
            </Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Row
          className={
            level === "LT" || level === "LM" || level === "PhD"
              ? "mb-3"
              : "d-none mb-3"
          }
        >
          <Form.Group
            as={Col}
            className={
              level === "LT" || level === "LM" || level === "PhD"
                ? "position-relative mb-3"
                : "d-none position-relative mb-3"
            }
          >
            <Form.Label>CV</Form.Label>
            <Form.Control
              type="file"
              required
              name="file"
              onChange={(event) => {
                return;
              }}
            />
            <Form.Control.Feedback type="invalid">
              Upload a cv to continue
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group
            as={Col}
            className={
              level === "LT" || level === "LM"
                ? "position-relative mb-3"
                : "d-none position-relative mb-3"
            }
          >
            <Form.Label>Lista Voti</Form.Label>
            <Form.Control
              type="file"
              required
              name="file"
              onChange={(event) => {
                return;
              }}
            />
            <Form.Control.Feedback type="invalid">
              Upload your actual grade list to continue
            </Form.Control.Feedback>
          </Form.Group>
        </Row>

        <Button
          className="submitButton"
          disabled={isLoading}
          onClick={!isLoading ? handleSubmit : null}
        >
          {isLoading ? "Loading…" : "Submit"}
        </Button>
      </Container>
    </Form>
  );
}
export default SignupForm;
