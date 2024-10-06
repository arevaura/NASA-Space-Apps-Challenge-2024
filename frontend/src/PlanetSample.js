import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";

function Model(props) {
    const {scene} = useGLTF("/models/mars.glb") // the scene is what the 3d object is, useGLTF is a react hook
    return <primitive object={scene} {...props} /> // 
}

function PlanetSample ({className}) {
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

export default PlanetSample;