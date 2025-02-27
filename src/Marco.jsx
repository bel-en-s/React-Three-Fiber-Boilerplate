import { useGLTF } from "@react-three/drei";
import { useRef, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";

const Marco = forwardRef(({ onPointerOver, onPointerOut, ...props }, ref) => {
  const { scene } = useGLTF("/azteca.glb");
  const modelRef = useRef();

  useFrame(({ mouse }) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = mouse.x * 0.002;
      modelRef.current.rotation.x = mouse.y * 0.002;
    }
  });

  return (
    <primitive
      ref={(el) => {
        modelRef.current = el;
        if (ref) ref.current = el;
      }}
      object={scene}
      onPointerOver={onPointerOver} // Call hover function
      onPointerOut={onPointerOut}   // Call unhover function
      {...props}
    />
  );
});

export default Marco;

