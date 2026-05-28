"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uTime;

  void main() {
    // Large cells like the reference image
    float gridSize = 12.0;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 st = vUv * aspect * gridSize;

    vec2 cell    = floor(st);
    vec2 fractSt = fract(st);

    // Mouse mapped to same space
    vec2 normalizedMouse = (uMouse + 1.0) * 0.5;
    vec2 mouseSt   = normalizedMouse * aspect * gridSize;
    vec2 mouseCell = floor(mouseSt);

    // Distance in cell units
    float cellDist = distance(cell, mouseCell);

    // Glow falls off over 2.5 cells
    float glow = smoothstep(2.5, 0.0, cellDist);

    // Cell border mask
    float border = 0.06;
    vec2  toEdge = min(fractSt, 1.0 - fractSt);
    float onBorder = 1.0 - smoothstep(border, border * 0.3, min(toEdge.x, toEdge.y));

    // Faint static grid always visible
    float staticGrid = onBorder * 0.08;

    // Yellow/amber glow colour matching reference
    vec3 glowColour = mix(vec3(0.15, 0.25, 0.0), vec3(1.0, 0.9, 0.15), glow);

    // Pulse for liveliness
    float pulse = 0.85 + 0.15 * sin(uTime * 3.0 - cellDist * 1.5);
    float borderGlow = onBorder * glow * pulse;

    vec3 col  = glowColour * borderGlow;
    col      += vec3(0.07, 0.09, 0.05) * staticGrid;

    float alpha = max(staticGrid, borderGlow * 0.9);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const InteractiveGrid = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport, camera } = useThree();

    const bgZ = -5;
    const fov = (camera as THREE.PerspectiveCamera).fov * THREE.MathUtils.DEG2RAD;
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, bgZ));
    const height = 2 * Math.tan(fov / 2) * dist;
    const width = height * viewport.aspect;

    const uniforms = useMemo(
        () => ({
            uMouse: { value: new THREE.Vector2(-9999, -9999) },
            uResolution: { value: new THREE.Vector2(width, height) },
            uTime: { value: 0 },
        }),
        [width, height]
    );

    useFrame((state) => {
        if (!materialRef.current) return;
        materialRef.current.uniforms.uMouse.value.lerp(
            new THREE.Vector2(state.pointer.x, state.pointer.y), 0.12
        );
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        materialRef.current.uniforms.uResolution.value.set(width, height);
    });

    return (
        <mesh position={[0, 0, bgZ]}>
            <planeGeometry args={[width, height]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};
