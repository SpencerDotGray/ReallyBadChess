import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import JeopardyWorker from './js/JeopardyWorker';
import { Row, Col, Card, Container, Form } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const jeopardyWorker = new JeopardyWorker();

function App() {

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const handleSearchChange = (e) => {
    setSearch(e.target.value);

    if (e.target.value !== "") {
      jeopardyWorker.refineCategories(e.target.value, setCategories);
    } else {
      console.log('blank')
      jeopardyWorker.getCategories(setCategories);
    }
  }

  if (categories.length <= 0) {
    jeopardyWorker.getCategories( (cats) => {
      if (cats !== undefined) {
        setCategories(cats);
      } else {
        setCategories(['No Categories Available']);
      }
    })
  }

  const Test = (e) => {
    const cat = e.target.ariaLabel;
    console.log(cat)
  }
  

  return (
    <div className="App">
      <header className="App-header">
      
      <Form.Control style={{ width: '40rem' }} className='mt-4 mb-4'placeholder='Search' value={search} onChange={handleSearchChange} type='text'/>
      <Container className='form-outline mt-4'>  
        <Row xs={2} md={4} className="g-4">
          {categories.map( (item, index) => {
            return (
              <Col key={index}>
                <Card bg='light' style={{ height: '10rem', row: '10rem' }} onClick={Test} aria-label={item}>
                  <Card.Text aria-label={item} style={{  color: 'darkslategrey' }}>
                    {item}
                  </Card.Text>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Container>
        

      </header>
    </div>
  );
}

export default App;
