"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Line, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

// The 3 Main ERP Hub Coordinates
const nodes = [
  new THREE.Vector3(-4, 2, 0), // Tasks Hub
  new THREE.Vector3(4, 1.5, -2), // Team Hub
  new THREE.Vector3(0, -3, 1), // Payroll Hub
];

// Animate a glowing packet moving between two nodes
const DataPacket = ({ startNode, endNode, delay, color }: { startNode: THREE.Vector3, endNode: THREE.Vector3, delay: number, color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Create a pulsating loop based on time and delay
      const t = (state.clock.elapsedTime * 0.5 + delay) % 1;
      // Smooth step for an easing effect as it travels
      const smoothT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      meshRef.current.position.lerpVectors(startNode, endNode, smoothT);
      
      // Make it glow harder when it reaches nodes
      const scale = 1 + Math.sin(t * Math.PI) * 0.5;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshPhysicalMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

// Represents the large servers/hubs
const HubNode = ({ position, label, color, type }: { position: THREE.Vector3, label: string, color: string, type: 'box' | 'octahedron' | 'icosahedron' }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position} ref={meshRef}>
        {type === 'box' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
        {type === 'octahedron' && <octahedronGeometry args={[1.2, 0]} />}
        {type === 'icosahedron' && <icosahedronGeometry args={[1.3, 0]} />}
        
        <meshPhysicalMaterial 
          color={color}
          metalness={0.8}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          transparent
          opacity={0.85}
          wireframe={false}
        />
        {/* Subtle grid wireframe overlaid */}
        <mesh scale={1.01}>
          {type === 'box' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
          {type === 'octahedron' && <octahedronGeometry args={[1.2, 0]} />}
          {type === 'icosahedron' && <icosahedronGeometry args={[1.3, 0]} />}
          <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
        </mesh>
      </mesh>
    </Float>
  );
};

export default function Workflow3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-80 bg-[#020202]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ec4899" />

        {/* The Hubs */}
        <HubNode position={nodes[0]} label="Tasks" color="#4f46e5" type="box" />
        <HubNode position={nodes[1]} label="Team" color="#10b981" type="icosahedron" />
        <HubNode position={nodes[2]} label="Payroll" color="#f59e0b" type="octahedron" />

        {/* The Connection Lines */}
        <Line points={[nodes[0], nodes[1]]} color="#333" lineWidth={1} transparent opacity={0.5} />
        <Line points={[nodes[1], nodes[2]]} color="#333" lineWidth={1} transparent opacity={0.5} />
        <Line points={[nodes[2], nodes[0]]} color="#333" lineWidth={1} transparent opacity={0.5} />

        {/* Flowing Data Packets (Tasks -> Team) */}
        <DataPacket startNode={nodes[0]} endNode={nodes[1]} delay={0} color="#4f46e5" />
        <DataPacket startNode={nodes[0]} endNode={nodes[1]} delay={0.33} color="#4f46e5" />
        <DataPacket startNode={nodes[0]} endNode={nodes[1]} delay={0.66} color="#4f46e5" />

        {/* Flowing Data Packets (Team -> Payroll) */}
        <DataPacket startNode={nodes[1]} endNode={nodes[2]} delay={0.15} color="#10b981" />
        <DataPacket startNode={nodes[1]} endNode={nodes[2]} delay={0.48} color="#10b981" />
        <DataPacket startNode={nodes[1]} endNode={nodes[2]} delay={0.81} color="#10b981" />

        {/* Flowing Data Packets (Payroll -> Tasks) */}
        <DataPacket startNode={nodes[2]} endNode={nodes[0]} delay={0.2} color="#f59e0b" />
        <DataPacket startNode={nodes[2]} endNode={nodes[0]} delay={0.53} color="#f59e0b" />
        <DataPacket startNode={nodes[2]} endNode={nodes[0]} delay={0.86} color="#f59e0b" />

        <Environment preset="city" />
      </Canvas>
      {/* Fog Overlay for depth mapping edge cutoffs */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020202]"></div>
    </div>
  );
}
