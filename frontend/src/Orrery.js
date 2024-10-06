import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Function to calculate position based on Keplerian parameters
function calculateOrbitPosition(t, a, da, e, de, i, di, L, dL, peri, dperi, anode, danode) {
    // updates with time
    a = a + da * t
    e = e + de * t
    const I = (i + di * t) * Math.PI/180
    L = (L + dL * t) * Math.PI/180
    const w = (peri + dperi * t) * Math.PI/180
    const Omega = (anode + danode * t) * Math.PI/180

    const W = w - Omega
    const M = L - w 
    let E_0 = M + e * Math.sin(M)
    let E = E_0

    let maxIterations = 100; // Maximum number of iterations for Kepler's equation
    let tolerance = 1e-6 * Math.PI / 180; // Desired tolerance for Kepler's equation

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const delta = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
        E = E + delta;
    
        // Check for convergence
        if (Math.abs(delta) < tolerance) {
            break; // Exit the loop if within the desired tolerance
        }
    
        // Optional: Log a warning if convergence is not achieved within maxIterations
        if (iteration === maxIterations - 1) {
            console.warn(`Kepler's equation did not converge after ${maxIterations} iterations for body with a=${a} and e=${e}`);
        }
    }


    const xOrbital = a * (Math.cos(E) - e)
    const yOrbital = a * Math.sqrt(1-e**2) * Math.sin(E)

    // Coordinates in the J200 ecliptic plane

    const x = (Math.cos(W) * Math.cos(Omega) - Math.sin(W) * Math.sin(Omega) * Math.cos(I)) * xOrbital +
              (-Math.sin(W) * Math.cos(Omega) - Math.cos(W) * Math.sin(Omega) * Math.cos(I)) * yOrbital;
    const y = (Math.cos(W) * Math.sin(Omega) + Math.sin(W) * Math.cos(Omega) * Math.cos(I)) * xOrbital +
              (-Math.sin(W) * Math.sin(Omega) + Math.cos(W) * Math.cos(Omega) * Math.cos(I)) * yOrbital;
    const z = (Math.sin(W) * Math.sin(I)) * xOrbital + (Math.cos(W) * Math.sin(I)) * yOrbital;
    
    /*
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
    */

    return new THREE.Vector3(x, y, z);
}

// Main Orrery component with API integration
function KeplerianOrrery() {
    const [orbitingBodies, setOrbitingBodies] = useState([]);

    // Fetching Keplerian parameters from an API
    useEffect(() => {
        const fetchOrbitingBodies = async () => {
            const response = await fetch("/planets.json");
            const data = await response.json();
            // const orbitingArray = Object.values(data);
            setOrbitingBodies(data); // Assuming 'data' is an array of Keplerian parameter objects
        };

        fetchOrbitingBodies();
    }, []);

    return (
        <Canvas dpr={[1, 2]} shadows camera={{ fov: 60 }} style={{ position: "absolute" }}>
            <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} /> 
                <Stage environment={null}>
                    <ambientLight intensity={0.3} />
                    <directionalLight intensity={1} position={[5, 5, 5]} />

                    <mesh position={[0, 0, 0]} scale={0.1}>
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
                </Stage>
        </Canvas>
    );
}

// Orbiting body component
function OrbitingBody({ keplerianParams, scale }) {
    const bodyRef = useRef();
    const { a, da, e, de, i, di, L, dL, peri, dperi, anode, danode } = keplerianParams;
    
    const TIME_SCALE = 10; // Simulated days per real second

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime(); // Real time in seconds
        const t = elapsedTime * TIME_SCALE; // Simulated time in days
        const position = calculateOrbitPosition(elapsedTime, a, da, e, de, i, di, L, dL, peri, dperi, anode, danode );
        bodyRef.current.position.copy(position);
    });

    return (
        <mesh ref={bodyRef} scale={scale}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    );
}

export default KeplerianOrrery;
