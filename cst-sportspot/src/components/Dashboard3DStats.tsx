import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Cylinder, OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Animated 3D bar for statistics
function StatBar({ value, maxValue, label, color, index, totalBars }: { 
  value: number; 
  maxValue: number; 
  label: string; 
  color: string;
  index: number;
  totalBars: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Calculate height based on value (normalized to max value)
  const height = Math.max(0.1, (value / maxValue) * 5);
  
  // Calculate position based on index and total bars
  const position: [number, number, number] = [
    ((index - (totalBars - 1) / 2) * 2), // x position
    height / 2, // y position (half of height to center)
    0 // z position
  ];
  
  // Animation for growing the bar
  const [animatedHeight, setAnimatedHeight] = useState(0.1);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedHeight(height);
    }, index * 200); // Stagger the animations
    
    return () => clearTimeout(timer);
  }, [height, index]);
  
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh
        ref={mesh}
        position={[0, animatedHeight / 2, 0]}
        scale={[1, animatedHeight, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : color} 
          metalness={0.3}
          roughness={0.7}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Value on top of bar */}
      <Text
        position={[0, animatedHeight + 0.5, 0]}
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      
      {/* Label below bar */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.4}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
      >
        {label}
      </Text>
    </group>
  );
}

// Title component
function Title({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Text
      position={position}
      fontSize={0.8}
      color="#2c6e49"
      anchorX="center"
      anchorY="middle"
      font="/fonts/Inter-Bold.woff"
    >
      {text}
    </Text>
  );
}

interface Stat {
  label: string;
  value: number;
  color: string;
}

interface Dashboard3DStatsProps {
  title?: string;
  stats: Stat[];
}

export default function Dashboard3DStats({ title = "Your Booking Statistics", stats = [] }: Dashboard3DStatsProps) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...stats.map(stat => stat.value), 1);
  
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Title */}
        <Title text={title} position={[0, 5, 0]} />
        
        {/* Stats bars */}
        <group position={[0, 0, 0]}>
          {stats.map((stat, index) => (
            <StatBar
              key={stat.label}
              value={stat.value}
              maxValue={maxValue}
              label={stat.label}
              color={stat.color}
              index={index}
              totalBars={stats.length}
            />
          ))}
        </group>
        
        {/* Base platform */}
        <mesh position={[0, -0.6, 0]} receiveShadow>
          <boxGeometry args={[stats.length * 2.5, 0.2, 3]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={20}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
