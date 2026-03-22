import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Brain3DFromMaskProps {
  maskImageUrl: string;
  affectedTerritory: string;
  autoRotate?: boolean;
}

function VolumetricBrain({ 
  maskData, 
  affectedTerritory 
}: { 
  maskData: ImageData | null;
  affectedTerritory: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const pointClouds = useMemo(() => {
    if (!maskData) return [];

    const width = maskData.width;
    const height = maskData.height;
    const data = maskData.data;

    const classColors: { [key: number]: THREE.Color } = {
      1: new THREE.Color(0x00ff00),  // Vert - ACA
      2: new THREE.Color(0xffa500),  // Orange - ACM_d
      3: new THREE.Color(0x00bfff),  // Bleu ciel - ACM_g
      4: new THREE.Color(0x8b0000),  // Rouge foncé - ACP
    };

    const affectedClass = affectedTerritory === 'ACM_g' ? 3 : affectedTerritory === 'ACM_d' ? 2 : 0;

    const voxels: { [key: number]: { positions: number[]; colors: number[] } } = {
      1: { positions: [], colors: [] },
      2: { positions: [], colors: [] },
      3: { positions: [], colors: [] },
      4: { positions: [], colors: [] }
    };

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        let classId = 0;
        if (r === 0 && g === 255 && b === 0) classId = 1;
        else if (r === 255 && g === 165 && b === 0) classId = 2;
        else if (r === 0 && g === 191 && b === 255) classId = 3;
        else if (r === 139 && g === 0 && b === 0) classId = 4;

        if (classId > 0) {
          const posX = (x / width - 0.5) * 5;
          const posY = -(y / height - 0.5) * 5;
          const posZ = Math.random() * 0.3 - 0.15;
          
          voxels[classId].positions.push(posX, posY, posZ);

          const isAffected = classId === affectedClass;
          const color = isAffected ? new THREE.Color(0xff0000) : classColors[classId];
          voxels[classId].colors.push(color.r, color.g, color.b);
        }
      }
    }

    const clouds: JSX.Element[] = [];

    Object.entries(voxels).forEach(([classIdStr, data]) => {
      const classId = parseInt(classIdStr);
      if (data.positions.length === 0) return;

      const positions = new Float32Array(data.positions);
      const colors = new Float32Array(data.colors);

      clouds.push(
        <points key={`class-${classId}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={colors.length / 3}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            vertexColors
            sizeAttenuation
            transparent
            opacity={0.9}
          />
        </points>
      );
    });

    return clouds;
  }, [maskData, affectedTerritory]);

  if (!maskData) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {pointClouds}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color={0x8b5cf6} />
    </group>
  );
}

export default function Brain3DFromMask({ 
  maskImageUrl, 
  affectedTerritory, 
  autoRotate = true 
}: Brain3DFromMaskProps) {
  const [maskData, setMaskData] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!maskImageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setMaskData(imageData);
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      console.error('Erreur de chargement du masque');
      setIsLoading(false);
    };

    img.src = maskImageUrl;
  }, [maskImageUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/60">Chargement de la reconstruction 3D...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <VolumetricBrain maskData={maskData} affectedTerritory={affectedTerritory} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
