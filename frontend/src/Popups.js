import React, { useState, useEffect } from 'react';
import "./Popups.css";
import { OrbitControls, useGLTF } from "@react-three/drei";
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

/*
function GLBModel({ path }) {
    const { scene, error } = useGLTF(path);

    if (error) {
        console.error("Error loading GLB model:", error);
        return null;
    }

    return <primitive object={scene} />;
}
*/


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
            
            <Canvas style={{ width: '100%', height: '100px' }} camaera={{ position:[0,0,0], fov: 10}}>
                <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <SphereModel texturePath={visiblePlanet.texturePath} /> 
            </Canvas>
            
            {/*}
            {visiblePlanet.glbFile && ( // conditionally render GLB model
                <GLBModel path={visiblePlanet.glbFile} />
            )}
            */}
            
            <p>{visiblePlanet.description || "No description available."}</p>

            <button onClick={closePopup}>Close</button>
        </div>
    );
}


export default Popup;
