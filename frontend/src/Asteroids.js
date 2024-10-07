import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Line } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import Popup from './Popups.js';

// Function to calculate position based on Keplerian parameters
function calculateAsteroidPosition(t, a, e, i, omega, M, Omega, P) {
    // Constants
    const PI = Math.PI;

    // Convert degrees to radians
    const iRad = (i * PI) / 180;
    const omegaRad = (omega * PI) / 180;
    const OmegaRad = (Omega * PI) / 180;

    // Calculate mean motion (n) in radians per day
    const n = (2 * PI) / P;

    // Calculate mean anomaly at time t
    const M_t = M + n * t; // M_t in radians
    const MRad = M_t % (2 * PI); // Normalize M_t to [0, 2π]

    // Solve Kepler's equation for eccentric anomaly (E)
    let E = MRad; // Initial guess for E is M
    const tolerance = 1e-6; // Desired tolerance for convergence
    let maxIterations = 100;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const deltaE = (MRad - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
        E += deltaE;

        // Check for convergence
        if (Math.abs(deltaE) < tolerance) {
            break; // Exit the loop if within the desired tolerance
        }

        // Optional: Log a warning if convergence is not achieved
        if (iteration === maxIterations - 1) {
            console.warn(`Kepler's equation did not converge for M=${M_t}`);
        }
    }

    // Calculate the position in the orbital plane
    const xOrbital = a * (Math.cos(E) - e);
    const yOrbital = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Convert orbital plane coordinates to 3D coordinates
    const x = (Math.cos(omegaRad) * Math.cos(OmegaRad) - Math.sin(omegaRad) * Math.sin(OmegaRad) * Math.cos(iRad)) * xOrbital +
              (-Math.sin(omegaRad) * Math.cos(OmegaRad) - Math.cos(omegaRad) * Math.sin(OmegaRad) * Math.cos(iRad)) * yOrbital;

    const y = (Math.cos(omegaRad) * Math.sin(OmegaRad) + Math.sin(omegaRad) * Math.cos(OmegaRad) * Math.cos(iRad)) * xOrbital +
              (-Math.sin(omegaRad) * Math.sin(OmegaRad) + Math.cos(omegaRad) * Math.cos(OmegaRad) * Math.cos(iRad)) * yOrbital;

    const z = (Math.sin(omegaRad) * Math.sin(iRad)) * xOrbital + (Math.cos(omegaRad) * Math.sin(iRad)) * yOrbital;

        points.push(new THREE.Vector3(orbitX, orbitY, orbitZ));
    }

    const handleOrbitClick = (e) => {
        console.log('Clicked planet info:', planetInfo);
        e.stopPropagation();
        onClick(planetInfo);
    };

    return (
        <Line 
            points={points} 
            color="lightblue" 
            lineWidth={2} 
            onPointerDown={handleOrbitClick} // Directly handle the click
            onPointerOver={(e) => (e.object.material.color.set('orange'))}
            onPointerOut={(e) => (e.object.material.color.set('lightblue'))}
        />
    );
}
*/


// Main Orrery component with API integration
function KeplerianOrrery() {
    const [ateroids, setAsteroids] = useState([]);
    const [visiblePlanet, setVisiblePlanet] = useState(null);
    const [timeScale, setTimeScale] = useState(0.0005);
    const{ scene } = useGLTF("/models/sun.glb");

    // Fetching Keplerian parameters from an API
    useEffect(() => {
        const fetchOrbitingBodies = async () => {
            try {
                const response = await fetch("http://localhost:8000/load-page");
                const data = await response.json();
                // const orbitingArray = Object.values(data);
                console.log("data received");
                setOrbitingBodies(data); // Assuming 'data' is an array of Keplerian parameter objects
            } catch (error) {
                console.error("Error fetching orbiting bodies:", error);
            }
        };
        
        fetchOrbitingBodies();
    }, []);

    const handleOrbitClick = (planetInfo) => {
        console.log(planetInfo);
        setVisiblePlanet(planetInfo);
    };

    const closePopup = () => {
        setVisiblePlanet(null);
    };

    return (
        <>
            <Canvas dpr={[1, 2]} shadows={false} camera={{ position: [0,0,50], fov: 10 }} style={{ position: "absolute" }}>
                <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} /> 
                    <Stage environment={null}>
                        <ambientLight intensity={0.3} />
                        <directionalLight intensity={1} position={[5, 5, 5]} />

                        <mesh position={[0, 0, 0]} scale={0.1}>
                            <primitive object={scene} scale={0.8} />
                        </mesh>

                        {orbitingBodies.map((body, index) => (
                            <OrbitingBody
                                key={index}
                                keplerianParams={body} // Passing each object's parameters
                                scale={[0.1, 0.1, 0.1]}
                                onClick={handleOrbitClick}
                                timeScale={timeScale}
                            />
                        ))}
                    </Stage>
            </Canvas>

            <input
                type="range"
                min="0"
                max="0.005"
                step="0.00001"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                style={{ position: "absolute", top: 20, right: 20 }}
            />
            <p style={{ position: "absolute", top: 30, right: 20, color: "white" }}>
                Days/Second: {timeScale.toFixed(5)}
            </p>

            {visiblePlanet && (
                <Popup visiblePlanet={visiblePlanet} closePopup={closePopup} />
            )}
        </>
    );
}

// Orbiting body component
function OrbitingBody({ keplerianParams, onClick, timeScale }) {
    const bodyRef = useRef();
    const { a, e, i, omega, M, Omega, P, texturePath, size, object, description, glbFile } = keplerianParams;

    // const TIME_SCALE = 0.0005; // Simulated days per real second

    // Load texture
    const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        if (texturePath) {
            console.log("Loading texture from:", texturePath); // Log the texture path
            textureLoader.load(
                texturePath, 
                (loadedTexture) => {
                    setTexture(loadedTexture);
                },
                undefined,
                (err) => {
                    console.error("Texture loading error for:", texturePath, err);
                }
            );
        }
    }, [texturePath]);


    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime(); // Real time in seconds
        const t = elapsedTime * timeScale; // Simulated time in days
        const position = calculateAsteroidPosition(t, a, e, i, omega, M, Omega, P );
        bodyRef.current.position.copy(position);
    });

    return (
        <>
            <mesh ref={bodyRef} scale={size}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial map={texture || new THREE.Texture()} />
            </mesh>

            <OrbitLine a={a} e={e} i={i} 
            planetInfo={{
                object, 
                description: keplerianParams.description, 
                glbFile: keplerianParams.glbFile,
                texturePath: keplerianParams.texturePath
            }}
            onClick={onClick}
            /> 
        </>
    );
}


export default KeplerianOrrery;