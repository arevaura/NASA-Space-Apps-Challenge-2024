import React, { useState } from 'react';
import "./Popups.css";

function Popup() {
  const [visiblePlanet, setVisiblePlanet] = useState(null);

  const toggleInfo = (planet) => {
    // If the clicked planet is already visible, hide it. Otherwise, show the clicked planet's info.
    setVisiblePlanet(prev => (prev === planet ? null : planet));
  };

  return (
    <div>
      <center>
        {/* Buttons to toggle visibility for each planet */}
        <button onClick={() => toggleInfo('Mercury')}>Mercury</button>
        <button onClick={() => toggleInfo('Venus')}>Venus</button>
        <button onClick={() => toggleInfo('Earth')}>Earth</button>
        <button onClick={() => toggleInfo('Mars')}>Mars</button>
        <button onClick={() => toggleInfo('Jupiter')}>Jupiter</button>
        <button onClick={() => toggleInfo('Saturn')}>Saturn</button>
        <button onClick={() => toggleInfo('Uranus')}>Uranus</button>
        <button onClick={() => toggleInfo('Neptune')}>Neptune</button>
      </center>
      
      {/* Conditional rendering for each planet's information */}
      {visiblePlanet === 'Mercury' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Mercury</h1></center>
          <p>Named after the roman messenger god, Mercury is the closest to the sun in a solar system. However, Mercury rotates very slowly(taking 59 earth days) while taking only 88 earth days to complete a full lap around the sun.</p>
        </div>
      )}
      {visiblePlanet === 'Venus' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Venus</h1></center>
          <p>Venus is the second planet from the Sun. It is very close in mass and size to Earth. However there are some key differences. Venus has 90 times the atomespheric pressure on Earth, Venus is the hottest planet in our solar system.</p>
        </div>
      )}
      {visiblePlanet === 'Earth' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Earth</h1></center>
          <p>Earth is the third planet from the Sun and the only known planet to support life.</p>
        </div>
      )}
      {visiblePlanet === 'Mars' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Mars</h1></center>
          <p>Mars is the fourth planet from the Sun and is known as the Red Planet.</p>
        </div>
      )}
      {visiblePlanet === 'Jupiter' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Jupiter</h1></center>
          <p>Jupiter is the largest planet in our solar system. If Jupiter was a hollow shell, 1,000 Earths could fit inside.</p>
        </div>
      )}
      {visiblePlanet === 'Saturn' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Saturn</h1></center>
          <p>Saturn is the sixth planet from the Sun and is famous for its rings.</p>
        </div>
      )}
      {visiblePlanet === 'Uranus' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Uranus</h1></center>
          <p>Uranus is the seventh planet from the Sun and has a unique blue color due to methane in its atmosphere.</p>
        </div>
      )}
      {visiblePlanet === 'Neptune' && (
        <div id="planetInfoDiv" className="planetInfoDiv">
          <center><h1>Neptune</h1></center>
          <p>Neptune is the eighth and farthest planet from the Sun, known for its deep blue color.</p>
        </div>
      )}
    </div>
  );
}

export default Popup;
