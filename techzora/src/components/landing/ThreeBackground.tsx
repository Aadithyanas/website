"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// Individual Floating Shape Component
const FloatingShape = ({ position, color, distort, speed, type }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005 * speed;
      meshRef.current.rotation.y += 0.005 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <mesh position={position} ref={meshRef}>
        {type === "torus" && <torusGeometry args={[1.5, 0.4, 32, 64]} />}
        {type === "sphere" && <sphereGeometry args={[1.2, 64, 64]} />}
        {type === "icosahedron" && <icosahedronGeometry args={[1.5, 0]} />}

        <MeshDistortMaterial
          color={color}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          roughness={0.1}
          metalness={0.5}
          distort={distort}
          speed={5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />

        {/* Floating Objects */}
        <FloatingShape position={[-4, 2, -2]} color="#4f46e5" distort={0.4} speed={1.5} type="torus" />
        <FloatingShape position={[4, -2, -1]} color="#ec4899" distort={0.6} speed={2} type="sphere" />
        <FloatingShape position={[0, -5, -4]} color="#14b8a6" distort={0.2} speed={1} type="icosahedron" />
        <FloatingShape position={[6, 4, -5]} color="#f59e0b" distort={0.3} speed={1.2} type="sphere" />

        {/* Environmental Reflections */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
