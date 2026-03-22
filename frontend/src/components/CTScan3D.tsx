import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CTScan3DProps {
  ctImageUrl: string;
  segmentationImageUrl?: string;
  affectedTerritory: string;
  autoRotate?: boolean;
}

function VolumetricCTScan({ 
  ctData,
  segmentationData,
  affectedTerritory 
}: { 
  ctData: ImageData | null;
  segmentationData: ImageData | null;
  affectedTerritory: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [sliceDepth, setSliceDepth] = useState(0.5);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const texture = useMemo(() => {
    if (!ctData) return null;

    const canvas = document.createElement('canvas');
    canvas.width = ctData.width;
    canvas.height = ctData.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    ctx.putImageData(ctData, 0, 0);

    if (segmentationData) {
      ctx.globalAlpha = 0.4;
      ctx.putImageData(segmentationData, 0, 0);
      ctx.globalAlpha = 1.0;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [ctData, segmentationData]);

  const geometry = useMemo(() => {
    if (!ctData) return null;

    const width = ctData.width;
    const height = ctData.height;
    const data = ctData.data;

    const geometry = new THREE.PlaneGeometry(5, 5, width - 1, height - 1);
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      const idx = (y * width + x) * 4;
      
      const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const normalizedIntensity = intensity / 255;
      
      const z = (normalizedIntensity - 0.5) * 0.8;
      positions.setZ(i, z);
    }

    geometry.computeVertexNormals();
    return geometry;
  }, [ctData]);

  if (!texture || !geometry) {
    return null;
  }

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.7}
          metalness={0.2}
          displacementScale={0.3}
        />
      </mesh>
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.6} color={0x8b5cf6} />
      <pointLight position={[0, -3, 0]} intensity={0.3} color={0xffffff} />
    </group>
  );
}

function MultiSliceCT({
  ctData,
  segmentationData,
}: {
  ctData: ImageData | null;
  segmentationData: ImageData | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [numSlices] = useState(5);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const slices = useMemo(() => {
    if (!ctData) return [];

    const sliceElements: JSX.Element[] = [];
    const spacing = 0.3;

    for (let i = 0; i < numSlices; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = ctData.width;
      canvas.height = ctData.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) continue;

      const imageDataCopy = new ImageData(
        new Uint8ClampedArray(ctData.data),
        ctData.width,
        ctData.height
      );

      const alpha = 1 - (i / numSlices) * 0.5;
      for (let j = 0; j < imageDataCopy.data.length; j += 4) {
        imageDataCopy.data[j + 3] = imageDataCopy.data[j + 3] * alpha;
      }

      ctx.putImageData(imageDataCopy, 0, 0);

      if (segmentationData && i === Math.floor(numSlices / 2)) {
        ctx.globalAlpha = 0.5;
        ctx.putImageData(segmentationData, 0, 0);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const zPos = (i - numSlices / 2) * spacing;

      sliceElements.push(
        <mesh key={i} position={[0, 0, zPos]}>
          <planeGeometry args={[5, 5]} />
          <meshBasicMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      );
    }

    return sliceElements;
  }, [ctData, segmentationData, numSlices]);

  return (
    <group ref={groupRef}>
      {slices}
    </group>
  );
}

export default function CTScan3D({ 
  ctImageUrl,
  segmentationImageUrl,
  affectedTerritory,
  autoRotate = true 
}: CTScan3DProps) {
  const [ctData, setCtData] = useState<ImageData | null>(null);
  const [segmentationData, setSegmentationData] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'volumetric' | 'slices'>('volumetric');

  useEffect(() => {
    if (!ctImageUrl) return;

    const loadImage = (url: string): Promise<ImageData> => {
      return new Promise((resolve, reject) => {
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
            resolve(imageData);
          } else {
            reject(new Error('Impossible de créer le contexte canvas'));
          }
        };

        img.onerror = () => reject(new Error('Erreur de chargement'));
        img.src = url;
      });
    };

    Promise.all([
      loadImage(ctImageUrl),
      segmentationImageUrl ? loadImage(segmentationImageUrl) : Promise.resolve(null)
    ])
      .then(([ct, seg]) => {
        setCtData(ct);
        setSegmentationData(seg);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Erreur de chargement des images:', error);
        setIsLoading(false);
      });
  }, [ctImageUrl, segmentationImageUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/60">Chargement de la reconstruction 3D du CT...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {viewMode === 'volumetric' ? (
          <VolumetricCTScan 
            ctData={ctData} 
            segmentationData={segmentationData}
            affectedTerritory={affectedTerritory}
          />
        ) : (
          <MultiSliceCT
            ctData={ctData}
            segmentationData={segmentationData}
          />
        )}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          minDistance={4}
          maxDistance={12}
        />
      </Canvas>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setViewMode('volumetric')}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            viewMode === 'volumetric'
              ? 'bg-violet-500/80 text-white'
              : 'bg-black/30 text-white/60 hover:bg-black/50'
          }`}
        >
          Volumétrique
        </button>
        <button
          onClick={() => setViewMode('slices')}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            viewMode === 'slices'
              ? 'bg-violet-500/80 text-white'
              : 'bg-black/30 text-white/60 hover:bg-black/50'
          }`}
        >
          Multi-coupes
        </button>
      </div>
    </div>
  );
}
