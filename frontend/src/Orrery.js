import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Line } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
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

// Orbit Line Component
// Orbit Line Component
// Orbit Line Component
function OrbitLine({ a, e, i, onClick }) {
    const points = [];
    const hitboxPoints =[];

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

        // const hitboxRadius = 0.1;
        // hitboxPoints.push(new THREE.Vector3(orbitX + hitboxRadius , orbitY + hitboxRadius * Math.cos(I), orbitZ + hitboxRadius * Math.sin(I)));

    }
    
    /*
    const arePointsEqual = points.length === hitboxPoints.length && points.every((point, index) => {
        const hitboxPoint = hitboxPoints[index];
        return point.equals(hitboxPoint); // Compare the vector3 objects
    });

    if (arePointsEqual) {
        console.log("true");
    }
    */

    const handleOrbitClick = (e) => {
        e.stopPropagation();

        const mousePos = new THREE.Vector2();
        mousePos.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mousePos, e.camera);

        const intersects = points.map((point, index) => {
            if (index === 0) return null;
            const segment = new THREE.Line3(points[index - 1], points[index]);
            return segment.closestPointToPoint(raycaster.ray.origin, true);
        }).filter(Boolean);

        const distanceThreshold = 0.1;
        const isCloseEnough = intersects.some(point => {
            return point.distanceTo(raycaster.ray.origin) < distanceThreshold;
        });

        if (isCloseEnough) {
            alert(`Orbiting body with parameters:\nSemi-Major Axis: ${a}\nEccentricity: ${e}`);
        }
    };
    return (
        <>
            {/* visible line*/}
            <Line 
                points={points} 
                color="lightblue" 
                lineWidth={1} 
                onPointerDown={onClick} 
                onPointerOver={(e) => (e.object.material.color.set('orange'))}
                onPointerOut={(e) => (e.object.material.color.set('lightblue'))}
            />

        </>
    );
}



// Main Orrery component with API integration
function KeplerianOrrery() {
    const [orbitingBodies, setOrbitingBodies] = useState([]);
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

    return (
        <Canvas dpr={[1, 2]} shadows={false} camera={{ fov: 60 }} style={{ position: "absolute" }}>
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
                        />
                    ))}
                </Stage>
        </Canvas>
    );
}


// Orbiting body component
// Orbiting body component
function OrbitingBody({ keplerianParams, scale }) {
    const bodyRef = useRef();
    const { a, da, e, de, i, di, L, dL, peri, dperi, anode, danode, texturePath, size } = keplerianParams;

    const TIME_SCALE = 0.0005; // Simulated days per real second

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
        const t = elapsedTime * TIME_SCALE; // Simulated time in days
        const position = calculateOrbitPosition(t, a, da, e, de, i, di, L, dL, peri, dperi, anode, danode );
        bodyRef.current.position.copy(position);
    });

    return (
        <>
            <mesh ref={bodyRef} scale={size}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial map={texture || new THREE.Texture()} />
            </mesh>

            <OrbitLine a={a} e={e} i={i} /> 
        </>
    );
}


export default KeplerianOrrery;