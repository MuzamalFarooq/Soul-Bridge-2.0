"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshWobbleMaterial, Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function RomanticMesh() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.5, 0.45, 128, 32]} />
        <MeshWobbleMaterial
          color="#FF4D8D"
          factor={0.4}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
          emissive="#9C6BFF"
          emissiveIntensity={0.3}
          wireframe={true}
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const pointsRef = useRef();
  const count = 300;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FFB6C1"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.65}
      />
    </Points>
  );
}

function GlowingSpheres() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.5, 32, 32]} position={[-3, 2, -2]}>
          <meshStandardMaterial color="#FF4D8D" emissive="#FF4D8D" emissiveIntensity={0.6} roughness={0.2} />
        </Sphere>
      </Float>

      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.8}>
        <Sphere args={[0.6, 32, 32]} position={[3.5, -1.8, -1]}>
          <meshStandardMaterial color="#9C6BFF" emissive="#9C6BFF" emissiveIntensity={0.6} roughness={0.2} />
        </Sphere>
      </Float>
    </>
  );
}

export default function HeroCanvas3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="absolute inset-0 z-0 bg-[#09090B]" />;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-80 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#FF4D8D" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#9C6BFF" />
        <RomanticMesh />
        <GlowingSpheres />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
