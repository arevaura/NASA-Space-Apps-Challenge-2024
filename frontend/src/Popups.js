import React, { useState } from 'react';
import "./Popups.css";
import { useGLTF } from "@react-three/drei";

function GLBModel({ path }) {
    const { scene, error } = useGLTF(path);

    if (error) {
        console.error("Error loading GLB model:", error);
        return null;
    }

    return <primitive object={scene} />;
}

const planets = [
    {
        name: 'Mercury',
        description: "Mercury is the smallest planet in our solar system, only slightly larger than Earth’s Moon. Named after the Roman messenger god, it is the closest planet to the Sun. However, Mercury rotates very slowly, taking 59 Earth days to complete one rotation, while it takes just 88 Earth days to orbit the Sun. This results in extreme temperature variations, with daytime temperatures soaring to over 427 degrees Celsius and dropping to nearly -201 degrees Celsius at night."
    },
    {
        name: 'Venus',

        description: "Venus is the second planet from the Sun and is similar in mass and size to Earth, often referred to as Earth's 'sister planet. However, key differences set them apart. Venus has an atmosphere with 90 times the pressure of Earth's, composed mainly of carbon dioxide and thick clouds of sulfuric acid. This results in a runaway greenhouse effect, making Venus the hottest planet in our solar system, with surface temperatures exceeding 900 degrees Fahrenheit (475 degrees Celsius)."

    },
    {
        name: 'Earth',
        description: "Earth is the third planet from the Sun and the only known planet to support life. It has a diverse climate, varying ecosystems, and abundant water, covering about 71% of its surface. Earth has one natural satellite, the Moon, which influences the planet's tides and stabilizes its axial tilt."
    },
    {   
        name: 'Mars',
        description: "Mars, often called “the Red Planet” due to its iron oxide dust, is a terrestrial planet featuring extinct volcanoes and vast canyons. A day on Mars lasts about 24.5 hours, making it quite similar to Earth. The planet has the largest volcano in the solar system, Olympus Mons, which stands about 21.8 kilometres high. Mars is also home to the longest canyon, Valles Marineris, stretching over 4000 kilometres. Since the late 20th century, Mars has been explored by numerous uncrewed spacecraft and rovers, and as of 2023, over 11 active probes are studying the planet. While Mars remains a key target for future human missions, none are currently planned."
    },
    {
        name: 'Jupiter',
        description: "Jupiter, the largest planet in the solar system, is known for its striking bands of clouds and the Great Red Spot, a massive storm that has been raging for centuries. This gas giant has a strong magnetic field and dozens of moons, with Ganymede being the largest, even surpassing the size of Mercury. A day on Jupiter lasts only about 10 hours, but its year is equivalent to 12 Earth years. Since the late 20th century, Jupiter has been explored by several spacecraft, including the Galileo orbiter and the Juno mission, which is currently studying the planet's atmosphere and magnetic field."
    },
    {
        name: 'Saturn',
        description: "Saturn is famous for its stunning ring system, composed of ice and rock particles. The second-largest planet in the solar system, Saturn is a gas giant with a thick atmosphere primarily made of hydrogen and helium. It has over 80 known moons, with Titan being the largest. A day on Saturn lasts about 10.7 hours, while it takes approximately 29.5 Earth years to complete an orbit around the Sun."
    },
    {
        name: 'Uranus',
        description: "Uranus, the seventh planet from the Sun, is an ice giant known with a unique rotation. It spins nearly perpendicular to the plane of its orbit at an angle close to 90°. It is the third-largest planet in our solar system, with a diameter about four times that of Earth. Uranus has faint icy rings and more than two dozen small moons. It takes 84 Earth years to complete one orbit around the Sun. The planet's striking blue color comes from the methane in its atmosphere, and it is primarily composed of water, methane, and ammonia gases, with a small rocky core."
    },
    {
        name: 'Neptune',
        description: "Neptune, the eighth and farthest planet from the Sun, is a gas giant known for its deep blue colour caused by methane in its atmosphere. It is nearly four times wider than Earth. Neptune experiences powerful storms, including the famous Great Dark Spot, a storm the size of Earth. The planet has 14 known moons, the largest being Triton, which orbits in the opposite direction of Neptune's rotation. It takes Neptune 165 Earth years to complete one orbit around the Sun, and its winds are the fastest in the solar system, reaching up to 2,100 kilometers per hour!"
    },
    {
        name: 'Sun',
        description: "The Sun is a vast ball of gas and plasma that provides light and warmth to our solar system. It is a medium-sized star and accounts for about 99.86% of the solar system's total mass. The Sun's core reaches temperatures of around 15 million degrees Celsius, driving nuclear fusion reactions that produce the energy that fuels all life on Earth."
    }
];

function Popup({ visiblePlanet, closePopup}) {

    console.log('Visible Planet:', visiblePlanet);
    // const [visiblePlanet, setVisiblePlanet] = useState(null);

    // check if visiblePlanet is defined and has object property
    if (!visiblePlanet || !visiblePlanet.object) {
        return null;
    }

    return (
        <div className="planetInfoDiv">
            <h2>{visiblePlanet.object || "Unnamed Object"}</h2>
            {visiblePlanet.glbFilePath && ( // conditionally render GLB model
                <GLBModel path={visiblePlanet.glbFile} />
            )}
            <p>{visiblePlanet.description || "No description available."}</p>
            {/* Conditional rendering for each planet's information 
            
            {planets.map(planet => (
                visiblePlanet === planet.name && (
                    <div key={planet.name} id="planetInfoDiv" className="planetInfoDiv">
                        <button className="close-button" onClick={closePopup}>X</button>
                        <center><h1>{planet.name}</h1></center>
                        <p>{planet.description}</p>
                    </div>
                )
            ))}
            */}

            <button onClick={closePopup}>Close</button>
        </div>
    );
}

export default Popup;
