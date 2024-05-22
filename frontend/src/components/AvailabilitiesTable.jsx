import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AvaiabilitiesCell from "./AvailabilitiesCell";
import moment from "moment";
import { useState, useEffect } from "react";
import { createUserSchema } from "@hkrecruitment/shared";
import React from "react";
// import { getApplicants, getUsers, getInterviewsByDates } from "../services/API";

function AvailabilitiesTable(props) {
  //const start = "2014-09-08T08:00:00";
  const step = 45;
  //const end = "20.00";

  /* Abbiamo queste entità
   * - application (id, applicantId, submission, state, lastModified, notes, cv, itaLevel)
   *     - bscapplication (bscStudyPath, bscAcademicYear, bscGradesAvg, cfu, grades)
   *     - mscapplication (mscStudyPath, mscGradesAvg, mscAcademicYear)
   *     - phdapplication (phdDescription)
   * - user (oauthId, firstName, lastName, sex, email, phone_no, telegramId, role)
   */

  // All'apertura di questa pagina, viene impostata la data ad oggi

  const [startDate, setStartDate] = useState(new Date());

  // Suppongo che interviews restituisca un array di colloqui fissati in un certo periodo, ciascuno con data e ora
  const [interviews, setInterviews] = useState(null);

  // useEffect(() => {
  //   if (startDate !== null) {
  //     setInterviews(
  //       getInterviewsByDates(startDate.getDate(), startDate.getDate() + 7)
  //     );
  //   }
  // }, [startDate]);

  // Crea una matrice 16x7 a partire dalle interviste
  let fill = [[], []];
  if (interviews !== null) {
    for (let interview in interviews.sort()) {
      // TO-DO
    }
  }

  /*
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

  */

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

export default AvailabilitiesTable;
