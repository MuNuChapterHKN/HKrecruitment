import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AvaiabilitiesCell from './AvaiabilitiesCell';
import moment from 'moment';


function AvaiabilitiesTable(props) {
    let start= "2014-09-08T08:02:17";
    let duration= 45;
let end="20.00";


let fill = [["persona1, persona2,...", "persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...", "persona1, persona2,...", "persona1, persona2,...", "persona1, persona2,...", "persona1, persona2,...", "persona1, persona2,..."], 
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."],
["persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,...","persona1, persona2,..."]
];

for(let row of fill){
row.unshift(moment(start).format('hh:mm'));    
}



    return <Container fluid>
        <Row>
            <Col></Col>
            <Col md={8}>
                <Table striped bordered  hover >
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
                    {fill.map((names,index)=><tr key={index}>{names.map((name,index)=><td key={index} className="name"><AvaiabilitiesCell name={name}/></td>)}</tr>)}

                      
                    </tbody>
                </Table>
            </Col>
            <Col></Col>
        </Row>
    </Container>
}

export default AvaiabilitiesTable;