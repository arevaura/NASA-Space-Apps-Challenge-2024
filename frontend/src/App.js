import './App.css';
import React from 'react';
import './App.css';
import Orrery from './Orrery.js';
import { useEffect } from 'react';
import Popup from "./Popups.js";


function App() {

  useEffect(() => {
    fetch('http://localhost:8000/load-page')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('There was a problem with the fetch operation:', error));
    console.log("something")
  })

  return (
    
    <div className="App">
      <div className="header">
        <p>Capuchins | Orrery</p>
      </div>
      <div className="container">
        
        <Popup/>
        <Orrery className="Orrery"/>
        </div>
      </div>
    
  );
}

export default App;

