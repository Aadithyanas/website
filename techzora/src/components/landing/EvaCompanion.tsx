"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  MeshDistortMaterial
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

function EvaModel({ targetY }: { targetY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  
  // Floating animation and follow logic
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (headRef.current) {
      // Smooth movement towards targetY (normalized or scaled)
      headRef.current.position.y = THREE.MathUtils.lerp(
        headRef.current.position.y,
        targetY,
        0.05
      );
      // Subtle tilt towards the side
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      headRef.current.rotation.z = Math.cos(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={headRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main Head - White Oval */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.1} 
            metalness={0.1} 
            emissive="#ffffff"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Face Plate - Black Glassy Area */}
        <mesh position={[0, 0, 0.4]} scale={[0.85, 0.7, 0.7]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial 
            color="#050505" 
            roughness={0} 
            metalness={0.9} 
          />
          
          {/* Eyes - Glowing Blue */}
          <group position={[0, 0, 0.95]}>
            <mesh position={[-0.4, 0.1, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial 
                color="#00f2ff" 
                emissive="#00f2ff" 
                emissiveIntensity={10} 
              />
            </mesh>
            <mesh position={[0.4, 0.1, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial 
                color="#00f2ff" 
                emissive="#00f2ff" 
                emissiveIntensity={10} 
              />
            </mesh>
          </group>
        </mesh>

        {/* Floating Torso/Base */}
        <mesh position={[0, -1.3, -0.2]} scale={[0.6, 0.8, 0.5]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function EvaCompanion({ targetY = 0 }: { targetY?: number }) {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
        <spotLight position={[-5, 5, 5]} angle={0.15} penumbra={1} intensity={1} />
        
        <EvaModel targetY={targetY} />
        
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4.5} 
        />
      </Canvas>
    </div>
  );
}
