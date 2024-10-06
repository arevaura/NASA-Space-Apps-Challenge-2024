import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Line } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import Popup from './Popups.js';

// Function to calculate position based on Keplerian parameters
function calculateAsteroidPosition(t, a, da, e, de, i, di, anode, danode, W, dW, M, dM) {
    // updates with time
    a = a + da * t
    e = e + de * t
    const I = (i + di * t) * Math.PI/180
    const w = (peri + dperi * t) * Math.PI/180
    const Omega = (anode + danode * t) * Math.PI/180

    let E_0 = M + e * Math.sin(M)
    let E = E_0

    let maxIterations = 100; // Maximum number of iterations for Kepler's equation
    let tolerance = 1e-6 * Math.PI / 180; // Desired tolerance for Kepler's equation

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const delta = dM / (1 - e * Math.cos(E));
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

    return new THREE.Vector3(x, y, z);
}

// Orbit Line Component
function OrbitLine({ a, e, i, planetInfo, onClick }) {
    const points = [];

    for (let angle = 0; angle <= 2 * Math.PI; angle += 0.01) {
        const r = (a * (1 - e ** 2)) / (1 + e * Math.cos(angle));
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 0; // For a 2D orbit in the XY plane; modify for 3D

        const I = (i * Math.PI) / 180; // Inclination in radians
        const orbitX = x;
        const orbitY = y * Math.cos(I);
        const orbitZ = y * Math.sin(I);

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


// Main Orrery component with API integration
function KeplerianOrrery() {
    const [orbitingBodies, setOrbitingBodies] = useState([]);
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
    const { a, da, e, de, i, di, anode, danode, W, dW, M, dM, texturePath, size, object, description, glbFile } = keplerianParams;

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
        const position = calculateOrbitPosition(t, a, da, e, de, i, di, L, dL, peri, dperi, anode, danode );
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