import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

// Ball model that rotates
function Ball(props: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  const { nodes, materials } = useGLTF('/basketball.glb') as any;
  
  // If you don't have a basketball.glb file, we'll create a simple sphere
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5;
      mesh.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={1.5}
      castShadow
      receiveShadow
    >
      {nodes && materials ? (
        <primitive object={nodes.basketball} />
      ) : (
        <>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#e67e22" 
            roughness={0.8}
            metalness={0.2}
          />
        </>
      )}
    </mesh>
  );
}

// Fallback component when 3D model is loading
function FallbackSphere() {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5;
      mesh.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={mesh} scale={1.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#e67e22" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

interface LoadingAnimationProps {
  size?: string;
  text?: string;
}

export default function LoadingAnimation({ size = "200px", text = "Loading..." }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Suspense fallback={<FallbackSphere />}>
            <Ball position={[0, 0, 0]} />
            <Environment preset="city" />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate
              autoRotateSpeed={1}
            />
          </Suspense>
        </Canvas>
      </div>
      {text && <p className="mt-4 text-[#2c6e49] font-medium">{text}</p>}
    </div>
  );
}

// Preload the 3D model
useGLTF.preload('/basketball.glb');
