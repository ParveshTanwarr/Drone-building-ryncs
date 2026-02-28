import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export interface BuildState {
  frame: boolean;
  motors: boolean;
  esc: boolean;
  fc: boolean;
  battery: boolean;
  props: boolean;
  camera: boolean;
}

// Helper component for scale-in animation
function ScaleIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);
  
  useFrame((_, delta) => {
    if (scale < 1) {
      setScale(prev => Math.min(1, prev + delta * 5));
    }
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface DroneModelProps {
  buildState: BuildState;
  isHovering?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function DroneModel({ 
  buildState, 
  isHovering = false, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0] 
}: DroneModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  // Smoothly interpolate position and rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Target position and rotation from props
      const targetPos = new THREE.Vector3(...position);
      const targetRot = new THREE.Euler(...rotation);
      
      groupRef.current.position.lerp(targetPos, delta * 3);
      
      // Simple rotation lerp
      const currentQuat = groupRef.current.quaternion;
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
      currentQuat.slerp(targetQuat, delta * 3);

      // Hover bobbing effect only if flying and near target
      if (isHovering && groupRef.current.position.distanceTo(targetPos) < 0.5) {
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.005;
        // Slight tilt for realism
        groupRef.current.rotation.x += Math.sin(state.clock.elapsedTime * 2) * 0.002;
        groupRef.current.rotation.z += Math.cos(state.clock.elapsedTime * 2.5) * 0.002;
      }
    }

    // Spin propellers if they exist and drone is hovering/flying
    if (buildState.props && isHovering) {
      propRefs.forEach((ref, index) => {
        if (ref.current) {
          const direction = index % 2 === 0 ? 1 : -1;
          ref.current.rotation.y += 30 * direction * delta;
        }
      });
    }
  });

  const armLength = 2.5;
  const armWidth = 0.15;
  const motorRadius = 0.25;
  const propLength = 2.8;

  if (!buildState.frame) return null;

  return (
    <group ref={groupRef}>
      {/* Frame: Center Plate */}
      <Box args={[1.2, 0.1, 1.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[1.2, 0.1, 1.2]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
      </Box>

      {/* Arms */}
      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([x, z], index) => (
        <group key={index} position={[x * armLength * 0.4, 0.15, z * armLength * 0.4]} rotation={[0, Math.atan2(x, z), 0]}>
          <Box args={[armWidth, armWidth, armLength]}>
            <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
          </Box>
          
          {/* Motors */}
          {buildState.motors && (
            <ScaleIn>
              <Cylinder args={[motorRadius, motorRadius, 0.3, 16]} position={[0, 0.2, armLength / 2]}>
                <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.4} />
              </Cylinder>
            </ScaleIn>
          )}

          {/* Propellers */}
          {buildState.props && (
            <ScaleIn>
              <Box 
                ref={propRefs[index]} 
                args={[propLength, 0.02, 0.2]} 
                position={[0, 0.4, armLength / 2]}
              >
                <meshStandardMaterial color="#06b6d4" transparent opacity={0.7} />
              </Box>
            </ScaleIn>
          )}
        </group>
      ))}

      {/* ESC (4-in-1 under FC) */}
      {buildState.esc && (
        <ScaleIn>
          <Box args={[0.8, 0.05, 0.8]} position={[0, 0.4, 0]}>
            <meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.8} />
          </Box>
        </ScaleIn>
      )}

      {/* Flight Controller */}
      {buildState.fc && (
        <ScaleIn>
          <Box args={[0.7, 0.05, 0.7]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#047857" metalness={0.5} roughness={0.8} />
          </Box>
        </ScaleIn>
      )}

      {/* Battery */}
      {buildState.battery && (
        <ScaleIn>
          <Box args={[0.8, 0.4, 1.4]} position={[0, 0.75, 0]}>
            <meshStandardMaterial color="#991b1b" metalness={0.3} roughness={0.7} />
          </Box>
        </ScaleIn>
      )}

      {/* Camera / FPV */}
      {buildState.camera && (
        <ScaleIn>
          <group position={[0, 0.2, 0.7]}>
            <Box args={[0.3, 0.3, 0.4]}>
              <meshStandardMaterial color="#111827" />
            </Box>
            <Sphere args={[0.1, 16, 16]} position={[0, 0, 0.2]}>
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} />
            </Sphere>
          </group>
        </ScaleIn>
      )}
    </group>
  );
}
