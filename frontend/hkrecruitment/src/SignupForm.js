import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

function SignupForm(props) {
    const [level, setLevel]=useState("");
    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
      const form = event.currentTarget;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
  
      setValidated(true);
    }
    return <Form  noValidate validated={validated} onSubmit={handleSubmit}>
       <h2 align="center">Insert your data to submit an application</h2>
        <Container>
            <Row>
            <Form.Group as={Col} controlId="formGridState" onChange={(event)=>setLevel(event.target.value)}>
                    <Form.Label>Il mio attuale livello di studi</Form.Label>
                    <Form.Select defaultValue="">
                        <option value ="">Select one</option>
                        <option value ="LT">Laurea Triennale</option>
                        <option value= "LM">Laurea Magistrale</option>
                        <option value="PhD">Dottorato di Ricerca</option>

                    </Form.Select>
                </Form.Group>

            </Row>
            <Row className="mt-5" md={{ span: "auto", offset: 3 }}>
         
            <Form.Group as={Col} controlId="formGridState" className={level=="LT"? "" : "d-none" }>
                    <Form.Label>Il mio attuale corso di studi</Form.Label>
                    <Form.Select defaultValue="">
                        <option value ="">Select one</option>
                        <option value ="LT">Laurea Triennale</option>
                        <option value= "LM">Laurea Magistrale</option>
                        <option value="PhD">Dottorato di Ricerca</option>

                    </Form.Select>
                </Form.Group>
            </Row>
            <Row>

            <Form.Group as={Col} className="mb-3" controlId="formGridCFU">
                <Form.Label>CFU obtained </Form.Label>
                <Form.Control type="number" placeholder="Please insert the current number of cfu obtained" />
            </Form.Group>
            
            <Form.Group as={Col} className="mb-3" controlId="formGridAverage">
                <Form.Label>Average grade</Form.Label>
                <Form.Control type="number" placeholder="Please insert your actual grade average" />
            </Form.Group>
            </Row>

            <Row className="mb-3">
            <Form.Group as={Col} className="position-relative mb-3">
            <Form.Label>CV</Form.Label>
            <Form.Control
              type="file"
              required
              name="file"
              //onChange={handleChange}
              //isInvalid={!!errors.file}
            />
            <Form.Control.Feedback type="invalid" >
              Nooo
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} className="position-relative mb-3">
            <Form.Label>Lista Voti</Form.Label>
            <Form.Control
              type="file"
              required
              name="file"
              //onChange={handleChange}
              //isInvalid={!!errors.file}
            />
            <Form.Control.Feedback type="invalid" >
                Eh none
            </Form.Control.Feedback>
          </Form.Group>
            </Row>

            <Form.Group className="mb-3" id="formGridCheckbox">
                <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Container>
    </Form>

}
export default SignupForm;