import { Canvas, useThree } from "@react-three/fiber";
import { useState, useRef } from "react";
import { gsap } from "gsap";

import Pared from "./Pared";
import Marco from "./Marco";


const CameraController = ({ lightColor, setLightColor }) => {
  const { camera } = useThree();

  // Smoothly change light color
  const changeLightColor = (color) => {
    gsap.to(lightColor, {
      duration: 1,
      onUpdate: () => setLightColor(color),
      ease: "power2.inOut",
    });
  };

  // Move camera to the center of the glb
  const moveCamera = (center, distance = 0) => {
    gsap.to(camera.position, {
      x: center ? 0 : camera.position.x - distance * 0.2,
      y: center ? 0 : camera.position.y - distance * 0.15,
      z: center ? 0 : camera.position.z - distance * 0.4,
      duration: 1.2,
      ease: "power2.inOut",
    });
  };

  return (
    <>
      <ambientLight intensity={0.5} color={lightColor} />
      <directionalLight position={[2, 2, 5]} intensity={1} color={lightColor} />
      <pointLight position={[-2, -2, 5]} intensity={1} color={lightColor} />
      <Marco
        onPointerOver={() => {
          changeLightColor("#ffd700"); // Natural mysterious light
          moveCamera(true); // Move camera closer
        }}
        onPointerOut={() => {
          changeLightColor("#ffffff"); // Reset light smoothly
          moveCamera(false); // Reset camera
        }}
      />
    </>
  );
};

export default function App() {
  const modelRef = useRef();
  const [lightColor, setLightColor] = useState("#ffffff"); // Default white light

  return (
    <>
     <Canvas camera={{ position: [40.34, 95.12, 284.57], fov: 50 }}>
  <CameraController lightColor={lightColor} setLightColor={setLightColor} />
  
  <Marco />
  <Pared textureUrl="/wall-texture.jpg" position={[0, 0, -5]} />
</Canvas>
    </>
  );
}