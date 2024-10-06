import React, { useState, useEffect } from 'react';
import "./Popups.css";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from 'three';

function SphereModel({ texturePath }) {
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(texturePath, (loadedTexture) => {
            setTexture(loadedTexture);
        }, undefined, (error) => {
            console.error("Error loading texture:", error);
        });

}, [texturePath]);

    return (
        <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <meshStandardMaterial map={texture || new THREE.Texture()} />
        </mesh>
    );
}


function Popup({ visiblePlanet, closePopup}) {

    console.log('Visible Planet:', visiblePlanet);
    // const [visiblePlanet, setVisiblePlanet] = useState(null);

    // check if visiblePlanet is defined and has object property
    if (!visiblePlanet || !visiblePlanet.object) {
        return null;
    }

    //console.log("GLB File Path:", visiblePlanet.glbFile)

    return (
        <div className="planetInfoDiv">
            <h2>{visiblePlanet.object || "Unnamed Object"}</h2>
            
            <Canvas style={{ width: '100%', height: '200px' }} camera={{ position:[0,0,40], fov: 10}}>
                <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} rotateSpeed={0.5} zoomSpeed={1}/>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <SphereModel texturePath={visiblePlanet.texturePath} /> 
            </Canvas>
            
            <p>{visiblePlanet.description || "No description available."}</p>

            <button onClick={closePopup}>Close</button>
        </div>
    );
}


export default Popup;
