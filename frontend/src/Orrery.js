import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import './App.css';
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";


function Model(props) {
    const {scene} = useGLTF("/models/mars.glb") // the scene is what the 3d object is, useGLTF is a react hook
    return <primitive object={scene} {...props} /> // 
}


/*
// Function to calculate position based on Keplerian parameters
function calculateOrbitPosition(t, a, e, i, omega, Omega, nu) {
    const mu = 1; // Gravitational parameter (simplified)
    const n = Math.sqrt(mu / Math.pow(a, 3)); // Mean motion
    const M = n * t; // Mean anomaly
    nu += M; // True anomaly updating over time

    const r = (a * (1 - Math.pow(e, 2))) / (1 + e * Math.cos(nu)); // Orbital radius
    const xOrbital = r * Math.cos(nu);
    const yOrbital = r * Math.sin(nu);

    // Rotation matrix for orbital elements
    const cosOmega = Math.cos(Omega), sinOmega = Math.sin(Omega);
    const cosI = Math.cos(i), sinI = Math.sin(i);
    const cosW = Math.cos(omega), sinW = Math.sin(omega);

    const x = (cosW * cosOmega - sinW * sinOmega * cosI) * xOrbital +
              (-sinW * cosOmega - cosW * sinOmega * cosI) * yOrbital;
    const y = (cosW * sinOmega + sinW * cosOmega * cosI) * xOrbital +
              (-sinW * sinOmega + cosW * cosOmega * cosI) * yOrbital;
    const z = (sinW * sinI) * xOrbital + (cosW * sinI) * yOrbital;

    return new THREE.Vector3(x, y, z);
}

// Main Orrery component with API integration
function KeplerianOrrery() {
    const [orbitingBodies, setOrbitingBodies] = useState([]);

    // Fetching Keplerian parameters from an API
    useEffect(() => {
        const fetchOrbitingBodies = async () => {
            const response = await fetch("https://api.example.com/orbits");
            const data = await response.json();
            setOrbitingBodies(data); // Assuming 'data' is an array of Keplerian parameter objects
        };

        fetchOrbitingBodies();
    }, []);

    return (
        <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }} style={{ position: "absolute" }}>
            <color attach="background" args={["#101010"]} />
            <ambientLight intensity={0.3} />
            <directionalLight intensity={1} position={[5, 5, 5]} />

            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="yellow" />
            </mesh>

            {orbitingBodies.map((body, index) => (
                <OrbitingBody
                    key={index}
                    keplerianParams={body} // Passing each object's parameters
                    scale={[0.1, 0.1, 0.1]}
                />
            ))}
        </Canvas>
    );
}

// Orbiting body component
function OrbitingBody({ keplerianParams, scale }) {
    const bodyRef = useRef();
    const { a, e, i, omega, Omega, nu } = keplerianParams;

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        const position = calculateOrbitPosition(elapsedTime, a, e, i, omega, Omega, nu);
        bodyRef.current.position.copy(position);
    });

    return (
        <mesh ref={bodyRef} scale={scale}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    );
}
*/

function Orrery ({className}) {
    return (
        // Canvas has properties which allow us to pick how the 3d gets rendered
        // dpr is device pixel ratio
        // PresentationControls (helper from drei library) allows us to create a simple 3d model render
        <div className={className}>
            <Canvas dpr={[1,2]} shadows camera={{ fov: 45 }} style={{"position": "absolute"}}> 
            <PresentationControls speed={1.5} global zoom={.5} polar={[-0.1, Math.PI / 4]}>
                <Stage environment={null}>
                    <Model scale={0.01} />
                </Stage>
            </PresentationControls>
            </Canvas>
        </div>
    )
}

export default Orrery;



/*
import * as THREE from 'three';

import { useEffect, useRef } from "react";

function orrery () {
  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.75, window.innerHeight); // Adjust size for the panel
  document.getElementById("solar-system").appendChild(renderer.domElement);

  // Add lighting (Sunlight)
  const light = new THREE.PointLight(0xffffff, 2, 1000);
  light.position.set(0, 50, 50);  // Place the light slightly above the scene
  scene.add(light);

  // Create the Sun (Sphere)
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Planets array to store planet objects
  const planets = [];

  // Function to create a planet with orbiting behavior
  function createPlanet(size, color, distance, speed) {
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color });
      const planet = new THREE.Mesh(geometry, material);

      // Set initial position on the X axis
      planet.position.set(distance, 0, 0);

      // Store the planet with its orbit parameters
      planets.push({ mesh: planet, distance, speed, angle: 0 }); // Add 'angle' to track orbit angle
      scene.add(planet);
  }

  // Create the eight planets with their respective sizes, colors, distances, and speeds
  createPlanet(0.5, 0xaaaaaa, 7, 0.04);  // Mercury (gray)
  createPlanet(0.9, 0xffdd44, 10, 0.03);  // Venus (yellow)
  createPlanet(1, 0x1E90FF, 15, 0.02);    // Earth (blue)
  createPlanet(0.8, 0xFF4500, 20, 0.01);  // Mars (red)
  createPlanet(1.2, 0xADD8E6, 30, 0.008); // Jupiter (light blue)
  createPlanet(1.1, 0xFFD700, 40, 0.007); // Saturn (golden)
  createPlanet(1, 0x4682B4, 50, 0.006);   // Uranus (light blue)
  createPlanet(1, 0x00008B, 60, 0.005);   // Neptune (dark blue)

  // Adjust camera position for a bird's-eye view
  camera.position.set(0, 100, 0);  // Move the camera up above the solar system
  camera.lookAt(0, 0, 0);  // Make the camera look towards the Sun (center)

  // Animation loop to simulate the orbits of planets around the sun
  function animate() {
      requestAnimationFrame(animate);

      // Rotate each planet around the sun in a circular orbit on the X-Z plane
      planets.forEach(planet => {
          planet.angle += planet.speed; // Increment the planet's angle
          planet.mesh.position.x = planet.distance * Math.cos(planet.angle);  // Calculate X position
          planet.mesh.position.z = planet.distance * Math.sin(planet.angle);  // Calculate Z position
      });

      // Render the scene
      renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
      const width = window.innerWidth * 0.75;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
  });

}

export default orrery
*/

