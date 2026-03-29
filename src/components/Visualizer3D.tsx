import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store';

function AudioReactiveSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const audioData = useAppStore(state => state.audioData);
  const micAudioData = useAppStore(state => state.micAudioData);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    // Default fallback values if Meyda analysis is unavailable
    // Add pulsing behavior linked to time
    const time = state.clock.getElapsedTime();
    let currentEnergy = Math.sin(time * 2) * 0.1 + 0.1;
    let currentRms = Math.cos(time * 3) * 0.1 + 0.1;
    
    // Use actual Meyda data if available
    let activeData = audioData;
    if (micAudioData && micAudioData.energy > 0) activeData = micAudioData;

    if (activeData && activeData.energy > 0) {
      currentEnergy = activeData.energy;
      currentRms = activeData.rms;
    }

    // Scale mesh based on energy
    const targetScale = 1 + (currentEnergy * 0.5);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Rotate mesh
    meshRef.current.rotation.x += 0.005 + (currentRms * 0.05);
    meshRef.current.rotation.y += 0.005 + (currentRms * 0.05);

    // Change color based on energy and mode
    let hue = (time * 0.1) % 1;
    let saturation = 0.8;
    let lightness = 0.5 + currentEnergy * 0.2;
    
    if (activeData === micAudioData && micAudioData) {
      // Neural Pink / AI mode
      materialRef.current.color.lerp(new THREE.Color('#e96443'), 0.1);
      materialRef.current.emissive.lerp(new THREE.Color('#904e95'), 0.1);
    } else {
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      materialRef.current.color.lerp(color, 0.1);
      materialRef.current.emissive.lerp(color, 0.1);
    }
    
    materialRef.current.emissiveIntensity = currentEnergy * 3;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 16]} />
      <meshStandardMaterial 
        ref={materialRef} 
        wireframe={true} 
        color="#00f2fe" 
        emissive="#00f2fe"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function Particles() {
  const count = 2000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      temp.push({ x, y, z, speed: Math.random() * 0.02 });
    }
    return temp;
  }, [count]);

  const audioData = useAppStore(state => state.audioData);
  const micAudioData = useAppStore(state => state.micAudioData);

  useFrame(() => {
    if (!meshRef.current) return;
    
    let activeData = audioData;
    if (micAudioData && micAudioData.energy > 0) activeData = micAudioData;
    
    const energy = activeData ? activeData.energy : 0;
    
    particles.forEach((particle, i) => {
      particle.z += particle.speed + (energy * 0.1);
      if (particle.z > 25) particle.z = -25;
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
}

export default function Visualizer3D({ isListening }: { isListening?: boolean }) {
  const isPlaying = useAppStore(state => state.isPlaying);
  const isActive = isPlaying || isListening;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, opacity: isActive ? 1 : 0.3, transition: 'opacity 1s ease' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AudioReactiveSphere />
        <Particles />
      </Canvas>
    </div>
  );
}
