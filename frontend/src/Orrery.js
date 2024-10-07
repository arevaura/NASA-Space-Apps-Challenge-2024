import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Line, Stars } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import Popup from './Popups.js';


// Function to calculate position based on Keplerian parameters
function calculateOrbitPosition(t, a, da, e, de, i, di, L, dL, peri, dperi, anode, danode) {
    // updates with time
    a = a + da / 36500 * t
    e = e + de / 36500 * t
    const I = (i + di / 36500 * t) * Math.PI/180
    L = (L + dL / 36500 * t) * Math.PI/180
    const w = (peri + dperi / 36500 * t) * Math.PI/180
    const Omega = (anode + danode /36500 * t) * Math.PI/180

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

/*
// Function to calculate asteroid position based on Keplerian parameters
function calculateAsteroidPosition(t, a, da, e, de, i, di, anode, danode, W, dW, M, dM) {
    // updates with time
    a = a + da * t
    e = e + de * t
    const I = (i + di * t) * Math.PI/180
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
*/

// Main Orrery component with API integration
function KeplerianOrrery() {
    const [orbitingBodies, setOrbitingBodies] = useState([]);
    // const [asteroids, setAsteroids] = useState([]);
    const [visiblePlanet, setVisiblePlanet] = useState(null);
    const [timeScale, setTimeScale] = useState(50);
    const [realSize, setRealSize] = useState(false);
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

    {/*
    useEffect(() => {
        const fetchAsteroids = async () => {
            try {
                const response = await fetch("http://localhost:8000/load-asteroids");
                const data = await response.json();
                setAsteroids(data); // Assuming 'data' is an array of asteroid objects
            } catch (error) {
                console.error("Error fetching asteroids:", error);
            }
        };
        
        fetchAsteroids();
    }, []);
    */}

    const handleOrbitClick = (planetInfo) => {
        console.log(planetInfo);
        setVisiblePlanet(planetInfo);
    };

    const closePopup = () => {
        setVisiblePlanet(null);
    };

    return (
        <>
            <Canvas dpr={[1, 2]} shadows={false} camera={{ position: [0,0,50], fov: 10 }} style={{ position: "absolute", background: "black" }}>
                <Stars />
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
                                realSize={realSize}
                            />
                        ))}
                        {/*
                        {asteroids.map((asteroid, index) => (
                            <AsteroidBody
                                key={index}
                                asteroidParams={asteroid} // Pass the asteroid parameters
                                timeScale={timeScale}
                            />
                         ))}
                        */}
                    </Stage>
            </Canvas>

            <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                style={{ position: "absolute", top: 20, right: 20 }}
            />
            <p style={{ position: "absolute", top: 30, right: 20, color: "white" }}>
                Days/Second: {timeScale}
            </p>

            <label style={{ position: "absolute", top: 100, right: 20, color: "white" }}>
                <input
                    type="checkbox"
                    checked={realSize}
                    onChange={(e) => setRealSize(e.target.checked)}
                />
                Toggle Real Size
            </label>

            {visiblePlanet && (
                <Popup visiblePlanet={visiblePlanet} closePopup={closePopup} />
            )}
        </>
    );
}

// Orbiting body component
function OrbitingBody({ keplerianParams, onClick, timeScale, realSize }) {
    const bodyRef = useRef();
    const { a, da, e, de, i, di, L, dL, peri, dperi, anode, danode, texturePath, size, object, description, glbFile, real } = keplerianParams;

    // const TIME_SCALE = 0.0005; // Simulated days per real second
    const actualSize = realSize ? (real || size) : size;

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
            <mesh ref={bodyRef} scale={[actualSize, actualSize, actualSize]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial map={texture || new THREE.Texture()} />
            </mesh>

            <OrbitLine a={a} e={e} i={i} 
            planetInfo={{
                object, 
                description: keplerianParams.description, 
                glbFile: keplerianParams.glbFile,
                texturePath: keplerianParams.texturePath,
                a: keplerianParams.a,
                e: keplerianParams.e,
                i: keplerianParams.i,
            }}
            onClick={onClick}
            /> 
        </>
    );
}

/*
function AsteroidBody({ asteroidParams, timeScale }) {
    const bodyRef = useRef();
    const { a, e, i, ...otherParams } = asteroidParams; // Destructure your asteroid parameters as needed

    // Calculate asteroid position based on your specific function
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        const t = elapsedTime * timeScale; // Simulated time in days

        const position = calculateAsteroidPosition(t, a, ...otherParams); // Call your custom function
        bodyRef.current.position.copy(position);
    });

    return (
        <mesh ref={bodyRef} scale={[0.05, 0.05, 0.05]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="gray" />
        </mesh>
    );
}
*/


export default KeplerianOrrery;