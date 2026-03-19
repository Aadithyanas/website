"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uMouse;
  
  attribute vec3 aRandomPos;
  attribute float aSize;
  attribute vec3 aColor;

  varying vec3 vColor;

  void main() {
    vColor = aColor;
    
    // Base target position of the logo
    vec3 targetPos = position;

    // Repulsion logic based on mouse proximity
    // The canvas is scaled/positioned so we approximate influence range
    float dist = distance(uMouse, targetPos.xy);
    float influenceRadius = 0.05;

    if (dist < influenceRadius && uProgress > 0.9) {
      // Repel strength decays based on distance
      float force = (influenceRadius - dist) / influenceRadius;
      
      // Breaking apart logic: move towards random positions!
      // aRandomPos is the original sphere position.
      // We can use it as a direction vector to shatter outwards organically.
      vec3 breakDir = normalize(aRandomPos);
      
      targetPos += breakDir * force * 10.0;
      
      // Add random jitter based on time and random position to simulate breaking
      targetPos.x += sin(uTime * 15.0 + aRandomPos.x * 100.0) * force * 0.3;
      targetPos.y += cos(uTime * 15.0 + aRandomPos.y * 100.0) * force * 0.3;
      targetPos.z += sin(uTime * 15.0 + aRandomPos.z * 100.0) * force * 0.3;
    }
    
    // Animate from random sphere position (aRandomPos) to image formation (targetPos)
    vec3 currentPos = mix(aRandomPos, targetPos, uProgress);
    
    // Add slight floating movement based on time
    currentPos.x += sin(uTime * 0.5 + aRandomPos.x * 10.0) * 0.05 * (1.0 - uProgress);
    currentPos.y += cos(uTime * 0.3 + aRandomPos.y * 10.0) * 0.05 * (1.0 - uProgress);
    currentPos.z += sin(uTime * 0.7 + aRandomPos.z * 10.0) * 0.05 * (1.0 - uProgress);

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = aSize * (10.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  varying vec3 vColor;

  void main() {
    // Make particles circular with soft edges
    vec2 toCenter = gl_PointCoord - vec2(0.5);
    float dist = length(toCenter);
    if (dist > 0.5) discard;
    
    // Calculate glow/alpha
    float alpha = smoothstep(0.5, 0.2, dist);
    
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

interface ParticleLogoProps {
    imageSrc: string;
}

export const ParticleLogo = ({ imageSrc }: ParticleLogoProps) => {
    const meshRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [geometryData, setGeometryData] = useState<any>(null);
    const { viewport, size, camera } = useThree();

    // Mouse tracker
    const pointer = useRef(new THREE.Vector2(-9999, -9999));

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Convert to Normalized Device Coordinates (NDC) -1 to +1
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;

            // In our specific camera setup with OrbitControls disabled for this specific logic,
            // we approximate the world position intersection on Z=0 plane

            // For a perspective camera with position [0, 0, 10] FOV 45
            // the visible width at Z=0 can be mapped linearly
            const vec = new THREE.Vector3(x, y, 0.5);
            vec.unproject(camera);
            vec.sub(camera.position).normalize();
            const distance = -camera.position.z / vec.z;
            const pos = camera.position.clone().add(vec.multiplyScalar(distance));

            pointer.current.set(pos.x, pos.y);
        };

        const handleMouseLeave = () => {
            // Move pointer far away so it stops repelling
            pointer.current.set(-9999, -9999);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [camera]);


    useEffect(() => {
        // Load image and extract pixel data
        const img = new Image();
        img.onload = () => {
            // Scale down image to sample points for performance
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const width = 200;
            const height = Math.floor(width * (img.height / img.width));
            canvas.width = width;
            canvas.height = height;

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);
            const imgData = ctx.getImageData(0, 0, width, height);
            const pixels = imgData.data;

            const positions: number[] = [];
            const colors: number[] = [];
            const randomPositions: number[] = [];
            const sizes: number[] = [];

            // Sampling threshold
            const sampleGap = 1;

            // We aim for roughly 30k-50k particles depending on non-transparent image space
            for (let y = 0; y < height; y += sampleGap) {
                for (let x = 0; x < width; x += sampleGap) {
                    const idx = (y * width + x) * 4;
                    const r = pixels[idx];
                    const g = pixels[idx + 1];
                    const b = pixels[idx + 2];
                    const a = pixels[idx + 3];

                    // If pixel is not transparent, create a particle
                    if (a > 50) {
                        // Target position (centered)
                        const posX = (x - width / 2) / 30; // Scale down for 3D space
                        const posY = -(y - height / 2) / 30;
                        const posZ = 0;

                        positions.push(posX, posY, posZ);

                        // Extract colors and enhance cyan/blue tones if needed, or use exact logo colors
                        colors.push(r / 255, g / 255, b / 255);

                        // Random start position (scattered in 3D sphere)
                        const rRadius = 10 + Math.random() * 5;
                        const rTheta = Math.random() * Math.PI * 2;
                        const rPhi = Math.acos((Math.random() * 2) - 1);

                        randomPositions.push(
                            rRadius * Math.sin(rPhi) * Math.cos(rTheta),
                            rRadius * Math.sin(rPhi) * Math.sin(rTheta),
                            rRadius * Math.cos(rPhi)
                        );

                        sizes.push(1.5 + Math.random() * 2.5); // Variable size
                    }
                }
            }

            setGeometryData({
                positions: new Float32Array(positions),
                colors: new Float32Array(colors),
                randomPositions: new Float32Array(randomPositions),
                sizes: new Float32Array(sizes),
            });
        };
        img.src = imageSrc;
    }, [imageSrc]);

    // Handle animation sequence
    useEffect(() => {
        if (materialRef.current && geometryData) {
            // Start dispersed, wait a second, then form the logo
            gsap.fromTo(
                materialRef.current.uniforms.uProgress,
                { value: 0 },
                { value: 1, duration: 4.0, ease: "power3.inOut", delay: 1 }
            );
        }
    }, [geometryData]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uProgress: { value: 0 }, // 0 = random, 1 = image formed
            uMouse: { value: new THREE.Vector2(-9999, -9999) },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

            // Smoothly interpolate the Mouse uniform so the scattered particles glide smoothly
            materialRef.current.uniforms.uMouse.value.lerp(pointer.current, 0.1);
        }

        // REMOVED ROTATION HERE AS REQUESTED
    });

    if (!geometryData) return null;

    return (
        <points ref={meshRef} position={[0, 1.5, 0]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={geometryData.positions.length / 3}
                    args={[geometryData.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aColor"
                    count={geometryData.colors.length / 3}
                    args={[geometryData.colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-aRandomPos"
                    count={geometryData.randomPositions.length / 3}
                    args={[geometryData.randomPositions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={geometryData.sizes.length}
                    args={[geometryData.sizes, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
