import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";


function Model(props) {
    const {scene} = useGLTF("/models/mars.glb") // the scene is what the 3d object is, useGLTF is a react hook
    return <primitive object={scene} {...props} /> // 
}

// Function to calculate position based on Keplerian parameters
function calculateOrbitPosition(t, a, da, e, de, i, di, L, dL, peri, dperi, anode, danode) {
    // updates with time
    a = a + da * t
    e = e + de * t
    const I = (i + di * t) * Math.PI/180
    L = (L + dL * t) * Math.pi/180
    peri = (peri + dL * t) * Math.PI/180
    const Omega = (anode + danode * t) * Math.PI/180

    const W = peri - Omega
    const M = L - peri 
    let E_0 = M + e * Math.sin(M)
    let E = E_0

    while (Math.abs(E) >= 10e-6 * Math.PI/180) {
        const dM = M - (E - e * Math.sin(E))
        const dE = dM/(1- Math.cos(E))
        E = E + dE
    }

    const xOrbital = a * (Math.cos(E - e))
    const yOrbital = a * Math.sqrt(1-e**2)

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

    const TIME_SCALE = 10; // Simulated days per real second

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime(); // Real time in seconds
        const t = elapsedTime * TIME_SCALE; // Simulated time in days
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