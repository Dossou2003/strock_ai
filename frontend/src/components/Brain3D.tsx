import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Brain3DProps {
  affectedTerritory: string;
  autoRotate?: boolean;
}

function BrainHemisphere({ 
  position, 
  isAffected, 
  isLeft 
}: { 
  position: [number, number, number]; 
  isAffected: boolean;
  isLeft: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const hemisphereGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1.2, 64, 64, 0, Math.PI);
    
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      
      const theta = Math.atan2(vertex.z, vertex.x);
      const phi = Math.acos(vertex.y / vertex.length());
      
      const frontalLobe = Math.sin(phi * 2) * 0.15;
      const temporalLobe = Math.sin(theta * 3) * Math.sin(phi * 1.5) * 0.12;
      const parietalLobe = Math.cos(phi * 1.8) * 0.1;
      const gyri = Math.sin(theta * 12) * Math.sin(phi * 8) * 0.04;
      
      const distortion = frontalLobe + temporalLobe + parietalLobe + gyri;
      
      vertex.multiplyScalar(1 + distortion);
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const color = isAffected 
    ? new THREE.Color(0xef4444)
    : isLeft 
      ? new THREE.Color(0x8b5cf6)
      : new THREE.Color(0xec4899);

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      geometry={hemisphereGeometry}
      rotation={[0, isLeft ? Math.PI : 0, 0]}
    >
      <MeshDistortMaterial
        color={color}
        emissive={isAffected ? new THREE.Color(0x991b1b) : new THREE.Color(0x1e1b4b)}
        emissiveIntensity={isAffected ? 0.4 : 0.1}
        roughness={0.6}
        metalness={0.2}
        distort={0.15}
        speed={1.5}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function Sulcus({ 
  start, 
  end, 
  curve 
}: { 
  start: [number, number, number]; 
  end: [number, number, number];
  curve?: number;
}) {
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
    
    if (curve) {
      mid.y += curve;
    }
    
    const curvePath = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    return curvePath.getPoints(50);
  }, [start, end, curve]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={0x000000} linewidth={2} opacity={0.6} transparent />
    </line>
  );
}

function CorpusCallosum() {
  return (
    <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.15, 0.15, 2, 32]} />
      <meshStandardMaterial 
        color={0x9ca3af}
        roughness={0.7}
        metalness={0.1}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function BrainStem() {
  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.8, 32]} />
        <meshStandardMaterial 
          color={0x6b7280}
          roughness={0.6}
          metalness={0.2}
          emissive={0x374151}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color={0x78716c}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}

function LongitudinalFissure() {
  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.08, 2.4, 2.2]} />
      <meshStandardMaterial 
        color={0x000000}
        roughness={0.9}
        metalness={0.0}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function BrainScene({ affectedTerritory }: { affectedTerritory: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const leftAffected = affectedTerritory === 'ACM_g';
  const rightAffected = affectedTerritory === 'ACM_d';

  return (
    <group ref={groupRef}>
      <BrainHemisphere 
        position={[0.65, 0, 0]} 
        isAffected={leftAffected}
        isLeft={true}
      />
      
      <BrainHemisphere 
        position={[-0.65, 0, 0]} 
        isAffected={rightAffected}
        isLeft={false}
      />
      
      <LongitudinalFissure />
      
      <CorpusCallosum />
      
      <Sulcus 
        start={[0.4, 0.8, 0.5]} 
        end={[0.4, -0.8, 0.5]} 
        curve={0.1}
      />
      <Sulcus 
        start={[-0.4, 0.8, 0.5]} 
        end={[-0.4, -0.8, 0.5]} 
        curve={0.1}
      />
      
      <Sulcus 
        start={[0.6, 0.3, 0.8]} 
        end={[0.6, -0.5, 0.3]} 
        curve={0.15}
      />
      <Sulcus 
        start={[-0.6, 0.3, 0.8]} 
        end={[-0.6, -0.5, 0.3]} 
        curve={0.15}
      />
      
      <BrainStem />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color={0x8b5cf6} />
    </group>
  );
}

export default function Brain3D({ affectedTerritory, autoRotate = true }: Brain3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <BrainScene affectedTerritory={affectedTerritory} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
