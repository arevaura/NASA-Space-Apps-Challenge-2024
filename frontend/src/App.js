import './App.css';
import React from 'react';
import './App.css';
import Orrery from './Orrery.js';

import "./script.js";
import { useState } from 'react';
import Popup from './Popups.js';
import "./Popups.css";

function App() {
 
  

  return (
    <div className="App">
      <div className="header">
        <p>Capuchins | Orrery</p>
      </div>
      <div className='container'>
        <Popup/>
        </div>
      </div>
    
  );
}

export default App;

