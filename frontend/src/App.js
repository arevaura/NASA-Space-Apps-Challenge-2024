import './App.css';
import React from 'react';
import './App.css';
import Orrery from './Orrery.js';

import "./script.js";
import { useState } from 'react';


function App() {
 
  const [isInfoVisible, setIsInfoVisible] = useState(false);


  const toggleInfo = () => {
    setIsInfoVisible(prevState => !prevState);
  };

  return (
    <div className="App">
      <div className="header">
        <p>Capuchins | Orrery</p>
      </div>
      <div className='container'>
        <center>
          {/* Step 4: Update the button to use the toggle function */}
          <button onClick={toggleInfo}>Test</button>
        </center> 
        {/* Conditional rendering to show/hide the info div */}
        {isInfoVisible && (
          <div id="planetInfoDiv" className="planetInfoDiv">
            <p>test1</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
