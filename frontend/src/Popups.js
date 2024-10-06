import React, { useState } from 'react';
import "./Popups.css";

const planets = [
    {
        name: 'Mercury',
        description: "Named after the Roman messenger god, Mercury is the closest to the sun in the solar system. However, Mercury rotates very slowly (taking 59 Earth days) while taking only 88 Earth days to complete a full lap around the sun."
    },
    {
        name: 'Venus',
        description: "Venus is the second planet from the Sun. It is very close in mass and size to Earth. However, there are some key differences: Venus has 90 times the atmospheric pressure of Earth, and is the hottest planet in our solar system."
    },
    {
        name: 'Earth',
        description: "Earth is the third planet from the Sun and the only known planet to support life."
    },
    {
        name: 'Mars',
        description: "Mars is the fourth planet from the Sun and is known as the Red Planet."
    },
    {
        name: 'Jupiter',
        description: "Jupiter is the largest planet in our solar system. If Jupiter was a hollow shell, 1,000 Earths could fit inside."
    },
    {
        name: 'Saturn',
        description: "Saturn is the sixth planet from the Sun and is famous for its rings."
    },
    {
        name: 'Uranus',
        description: "Uranus is the seventh planet from the Sun and has a unique blue color due to methane in its atmosphere."
    },
    {
        name: 'Neptune',
        description: "Neptune is the eighth and farthest planet from the Sun, known for its deep blue color."
    }
];

function Popup() {
    const [visiblePlanet, setVisiblePlanet] = useState(null);

    const toggleInfo = (planet) => {
        setVisiblePlanet(prev => (prev === planet ? null : planet));
    };

    const closePopup = () => {
        setVisiblePlanet(null); // Only close the current planet's popup
    };

    return (
        <div className="popup">
            <center>
                {/* Buttons to toggle visibility for each planet */}
                {planets.map(planet => (
                    <button key={planet.name} onClick={() => toggleInfo(planet.name)}>
                        {planet.name}
                    </button>
                ))}
            </center>

            {/* Conditional rendering for each planet's information */}
            {planets.map(planet => (
                visiblePlanet === planet.name && (
                    <div key={planet.name} id="planetInfoDiv" className="planetInfoDiv">
                        <button className="close-button" onClick={closePopup}>X</button>
                        <center><h1>{planet.name}</h1></center>
                        <p>{planet.description}</p>
                    </div>
                )
            ))}
        </div>
    );
}

export default Popup;
