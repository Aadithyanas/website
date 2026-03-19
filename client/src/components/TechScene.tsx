"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Laptop model built from Three.js primitives ──────────────────────────────
const Laptop = ({ progress }: { progress: React.MutableRefObject<number> }) => {
    const groupRef = useRef<THREE.Group>(null);
    const screenRef = useRef<THREE.Mesh>(null);
    const lidRef = useRef<THREE.Group>(null);

    // Gentle idle bob + slow Y-rotation
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.25;
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.1 - 0.3;

        // Fade/scale based on scroll progress
        const p = progress.current;
        if (groupRef.current) {
            groupRef.current.scale.setScalar(1 - p * 0.6);
            groupRef.current.rotation.x = p * Math.PI * 0.4;
        }
    });

    return (
        <group ref={groupRef} position={[3, 0, 0]}>
            {/* Base / keyboard */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3.2, 0.14, 2]} />
                <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Keyboard rows — purely decorative */}
            {[-0.6, 0, 0.6].map((z, i) =>
                Array.from({ length: 9 }).map((_, j) => (
                    <mesh key={`k-${i}-${j}`} position={[-1.2 + j * 0.27, 0.1, z - 0.1]}>
                        <boxGeometry args={[0.2, 0.04, 0.16]} />
                        <meshStandardMaterial color="#1e3a5f" emissive="#00aaff" emissiveIntensity={0.3} />
                    </mesh>
                ))
            )}

            {/* Hinge */}
            <mesh position={[0, 0.1, -0.95]}>
                <cylinderGeometry args={[0.06, 0.06, 3.1, 16]} />
                <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Lid group */}
            <group ref={lidRef} position={[0, 0.1, -0.95]} rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
                {/* Lid back */}
                <mesh position={[0, 0.07, 0.95]}>
                    <boxGeometry args={[3.2, 0.08, 2]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Screen bezel */}
                <mesh position={[0, 0.12, 0.95]}>
                    <boxGeometry args={[3.0, 0.04, 1.85]} />
                    <meshStandardMaterial color="#0a0a0a" />
                </mesh>

                {/* Glowing screen */}
                <mesh ref={screenRef} position={[0, 0.15, 0.95]}>
                    <boxGeometry args={[2.85, 0.02, 1.75]} />
                    <meshStandardMaterial
                        color="#020617"
                        emissive="#00d4ff"
                        emissiveIntensity={1.2}
                        roughness={0.1}
                        metalness={0.0}
                    />
                </mesh>

                {/* Code line imitation on screen */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <mesh key={`line-${i}`} position={[-0.7 + Math.random() * 0.2, 0.17, 0.4 + i * 0.2]}>
                        <boxGeometry args={[0.6 + Math.random() * 1.2, 0.01, 0.06]} />
                        <meshStandardMaterial
                            color="#00ffcc"
                            emissive="#00ffcc"
                            emissiveIntensity={1.5}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// ─── Circuit / AI Brain orb (second model that fades in on scroll) ────────────
const AIOrb = ({ progress }: { progress: React.MutableRefObject<number> }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        groupRef.current.rotation.y = t * 0.4;
        groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
        const p = progress.current;
        groupRef.current.scale.setScalar(p * 1.4);
        (groupRef.current as any).position.y = Math.sin(t * 0.5) * 0.12;
    });

    return (
        <group ref={groupRef} scale={0} position={[-3, 0, 0]}>
            {/* Core orb */}
            <mesh>
                <sphereGeometry args={[0.7, 32, 32]} />
                <MeshDistortMaterial
                    color="#003366"
                    emissive="#0044ff"
                    emissiveIntensity={0.8}
                    distort={0.35}
                    speed={3}
                    roughness={0.1}
                    metalness={0.6}
                />
            </mesh>

            {/* Orbital rings */}
            {[0, Math.PI / 3, -Math.PI / 3].map((angle, i) => (
                <mesh key={i} rotation={[angle, 0, angle]}>
                    <torusGeometry args={[1.1 + i * 0.15, 0.025, 8, 64]} />
                    <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.2} />
                </mesh>
            ))}

            {/* Circuit nodes */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={`node-${i}`} position={[Math.cos(angle) * 1.2, Math.sin(angle) * 0.3, Math.sin(angle) * 1.2]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
                    </mesh>
                );
            })}
        </group>
    );
};

// ─── Main export ─────────────────────────────────────────────────────────────
export const TechScene = () => {
    const progress = useRef(0); // 0 = hero / laptop, 1 = about / AI orb

    React.useEffect(() => {
        const trigger = ScrollTrigger.create({
            trigger: "#about",
            start: "top 80%",
            end: "top 20%",
            scrub: 2,
            onUpdate: (self) => {
                progress.current = self.progress;
            },
        });
        return () => trigger.kill();
    }, []);

    return (
        <>
            <Laptop progress={progress} />
            <AIOrb progress={progress} />
        </>
    );
};
