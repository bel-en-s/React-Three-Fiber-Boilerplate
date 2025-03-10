import { useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Pared = ({ position = [0, 10, -10], rotation = [0, 1, 0] }) => {
  const wallRef = useRef();
  const floorRef = useRef();
  const texture = useTexture("/image.jpg");

  // Set initial position and rotation
  useEffect(() => {
    if (wallRef.current) {
      wallRef.current.position.set(...position);
      wallRef.current.rotation.set(...rotation);
    }
    if (floorRef.current) {
      floorRef.current.position.set(position[0], position[1] - 5, position[2]);
      floorRef.current.rotation.set(-Math.PI / 2 + rotation[0], rotation[1], rotation[2]); // Match rotation
    }
  }, [position, rotation]);

  return (
    <>
      {/* Wall (same position & rotation as Marco) */}
      <mesh ref={wallRef} position={position} rotation={rotation}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Floor (matches Marco's position but slightly lower) */}
      <mesh ref={floorRef}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </>
  );
};

export default Pared;
