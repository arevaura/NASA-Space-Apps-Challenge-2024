import './App.css';
import React from 'react';
import './App.css';
import { useEffect } from 'react';
import Popup from "./Popups.js";
import Logo from './Logo.svg'
import PlanetSample from './PlanetSample.js';
import KeplerianOrrery from './Orrery.js';

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
        <p>
          <img src={Logo} style={{ height: 50, width: 50}} alt="Capuchins logo"/> 
          Capuchins | Orrery
        </p>
      </div>
      <div className="container">
        
        <Popup/>
       <KeplerianOrrery className="Orrery"/> 
        </div>
      </div>
    
  );
}

export default App;

