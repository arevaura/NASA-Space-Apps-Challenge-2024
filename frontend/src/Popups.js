import React, { useState } from 'react';
import "./Popups.css";

function Popup() {
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const toggleInfo = () => {
    setIsInfoVisible(prevState => !prevState);
  };

  return (
    <div>
      <center>
        {/* Button to toggle visibility */}
        <button onClick={toggleInfo}>Test</button>
      </center>
      
      {/* Conditional rendering to show/hide the info div */}
      {isInfoVisible && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <p>This is the info content!</p>
          
          <p>Test dsajdska adj dhakj hak hkhjk dsads ads  </p>
        </div>
      )}
    </div>
  );
}

export default Popup;
