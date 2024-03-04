import React from 'react';
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls  } from "@react-three/drei";



function Model(props) {
  const { scene } = useGLTF("./human_teeth.glb");
  return <primitive object={scene} {...props} />;
}

function App() {

  return (
    <>
      <button onClick={() => window.location.href = 'http://localhost:8080/booking'}>
        Book Appointment
      </button>


    <Canvas dpr={[1, 2]} shadows={{ enabled: true, type: 'PCFSoft' }} camera={{ fov: 45 }} style={{ "position": "absolute" }}>
      <color attach="background" args={["#101010"]} />
      <ambientLight intensity={0.9} />
      <PresentationControls speed={1.5} global zoom={.5} polar={[-0.1, Math.PI / 4]}>
        <Stage environment={"sunset"}>
          <Model scale={0.01} />
        </Stage>
      </PresentationControls>
    </Canvas>
    </>
  );
}







export default App