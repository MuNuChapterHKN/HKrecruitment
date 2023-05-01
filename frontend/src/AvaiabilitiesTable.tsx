import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AvaiabilitiesCell from "./AvaiabilitiesCell";
import moment from "moment";
import { useState, useEffect } from "react";
import { createUserSchema } from "@hkrecruitment/shared";
import React from "react";

function AvaiabilitiesTable(props) {
  let start = "2014-09-08T08:00:00";
  let step = 45;
  let end = "20.00";
  let fill = [
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
    [
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
      "persona1, persona2,...",
    ],
  ];
  let timestamp = moment(start);
  for (let row of fill) {
    row.unshift(timestamp.format("HH:mm"));
    timestamp = timestamp.add(step, "m");
  }
  return (
    <Container fluid>
      <Row>
        <Col></Col>
        <Col md={8}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Hours</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
              </tr>
            </thead>
            <tbody>
              {fill.map((names, index) => (
                <tr key={index}>
                  {names.map((name, index) => (
                    <AvaiabilitiesCell key={index} name={name} />
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}

export default AvaiabilitiesTable;
