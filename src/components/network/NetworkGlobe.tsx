import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html } from '@react-three/drei';
import { useRef, useMemo, useState, Suspense, createContext, useContext, useCallback } from 'react';
import * as THREE from 'three';
import { useEvaluationCities, EvaluationCity } from '@/hooks/useEvaluationCities';

// Context to share hover state between components
interface GlobeContextType {
  isHovering: boolean;
  setIsHovering: (value: boolean) => void;
}

const GlobeContext = createContext<GlobeContextType>({
  isHovering: false,
  setIsHovering: () => {},
});

// Fallback data for when no real data is available
const FALLBACK_LOCATIONS: EvaluationCity[] = [
  { city: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333, evaluation_count: 10, intensity: 1 },
  { city: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729, evaluation_count: 8, intensity: 0.8 },
  { city: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345, evaluation_count: 5, intensity: 0.5 },
  { city: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733, evaluation_count: 4, intensity: 0.4 },
  { city: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177, evaluation_count: 3, intensity: 0.3 },
];

// Initial rotation to focus on Brazil (longitude ~-50 degrees)
const BRAZIL_INITIAL_ROTATION = (50 * Math.PI) / 180;

/**
 * Convert latitude/longitude to 3D cartesian coordinates
 * 
 * This function converts geographic coordinates to 3D positions on a sphere.
 * The Blue Marble texture has Greenwich (longitude 0) at the center.
 * 
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lng - Longitude in degrees (-180 to 180)
 * @param radius - Radius of the sphere
 * @returns THREE.Vector3 position on the sphere
 */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  // phi: polar angle (0 = north pole, PI = south pole)
  // theta: azimuthal angle (longitude)
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  // Spherical to cartesian conversion
  // The negative x is needed to match the Blue Marble texture orientation
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

// Animated pulse point component
interface PulsePointProps {
  position: THREE.Vector3;
  intensity: number;
  city: string;
  state: string;
  evaluationCount: number;
}

function PulsePoint({ position, intensity, city, state, evaluationCount }: PulsePointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { setIsHovering } = useContext(GlobeContext);
  
  const handlePointerEnter = useCallback(() => {
    setHovered(true);
    setIsHovering(true);
  }, [setIsHovering]);
  
  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    setIsHovering(false);
  }, [setIsHovering]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 0.02 + Math.sin(state.clock.elapsedTime * 2 + intensity * 10) * 0.01;
      meshRef.current.scale.setScalar(scale * (1 + intensity * 0.5));
    }
    if (glowRef.current) {
      const glowScale = 0.05 + Math.sin(state.clock.elapsedTime * 1.5 + intensity * 10) * 0.02;
      glowRef.current.scale.setScalar(glowScale * (1 + intensity * 0.5));
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  // High intensity points are orange, regular points are blue
  const isHighIntensity = intensity > 0.7;
  const primaryColor = isHighIntensity ? '#e07020' : '#3b82f6';
  const glowColor = isHighIntensity ? '#e07020' : '#60a5fa';
  
  return (
    <group position={position}>
      {/* Glow effect */}
      <mesh ref={glowRef} raycast={() => null}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
      </mesh>

      {/* Invisible hit area (prevents hover flicker when meshes animate) */}
      <mesh
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        scale={0.08}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Core point */}
      <mesh ref={meshRef} raycast={() => null}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={primaryColor} />
      </mesh>
      
      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={3}>
          <div className="px-3 py-2 bg-[hsl(215_35%_12%)] border border-[hsl(215_30%_25%)] rounded-lg text-xs text-[hsl(210_20%_95%)] whitespace-nowrap shadow-xl">
            <div className="font-semibold">{city}, {state}</div>
            <div className="text-[hsl(210_20%_95%/0.6)] mt-1">
              {evaluationCount} {evaluationCount === 1 ? 'avaliação' : 'avaliações'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Globe grid lines (subtle overlay)
function GlobeGrid() {
  const lines = useMemo(() => {
    const result: THREE.Vector3[][] = [];
    const radius = 2.02;
    
    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        points.push(latLngToVector3(lat, lng, radius));
      }
      result.push(points);
    }
    
    // Longitude lines
    for (let lng = -180; lng < 180; lng += 30) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToVector3(lat, lng, radius));
      }
      result.push(points);
    }
    
    return result;
  }, []);
  
  return (
    <>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#3b82f6"
          lineWidth={0.3}
          transparent
          opacity={0.15}
        />
      ))}
    </>
  );
}

// Atmosphere glow effect - removed to keep globe clean
function Atmosphere() {
  return null;
}

// Main globe with earth texture
interface EarthGlobeProps {
  locations: EvaluationCity[];
}

function EarthGlobe({ locations }: EarthGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load earth textures
  const [earthTexture, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
    // Earth Blue Marble texture (NASA public domain)
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
    // Bump map for terrain
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png',
    // Specular map for water reflection
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png',
  ]);
  
  const { isHovering } = useContext(GlobeContext);
  
  useFrame(() => {
    if (groupRef.current && !isHovering) {
      groupRef.current.rotation.y += 0.001;
    }
  });
  
  const points = useMemo(() => {
    return locations.map(loc => ({
      position: latLngToVector3(loc.lat, loc.lng, 2.03),
      intensity: loc.intensity,
      city: loc.city,
      state: loc.state,
      evaluationCount: loc.evaluation_count,
    }));
  }, [locations]);
  
  return (
    <group ref={groupRef} rotation={[0, BRAZIL_INITIAL_ROTATION, 0]}>
      {/* Earth sphere with texture */}
      <Sphere args={[2, 64, 64]}>
        <meshPhongMaterial
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.03}
          specularMap={specularMap}
          specular={new THREE.Color('#333333')}
          shininess={5}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Atmosphere />
      
      {/* Subtle grid lines */}
      <GlobeGrid />
      
      {/* Active broker points */}
      {points.map((point, i) => (
        <PulsePoint
          key={`${point.city}-${i}`}
          position={point.position}
          intensity={point.intensity}
          city={point.city}
          state={point.state}
          evaluationCount={point.evaluationCount}
        />
      ))}
    </group>
  );
}

// Fallback globe while textures load
interface FallbackGlobeProps {
  locations: EvaluationCity[];
}

function FallbackGlobe({ locations }: FallbackGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { isHovering } = useContext(GlobeContext);
  
  useFrame(() => {
    if (groupRef.current && !isHovering) {
      groupRef.current.rotation.y += 0.001;
    }
  });
  
  const points = useMemo(() => {
    return locations.map(loc => ({
      position: latLngToVector3(loc.lat, loc.lng, 2.03),
      intensity: loc.intensity,
      city: loc.city,
      state: loc.state,
      evaluationCount: loc.evaluation_count,
    }));
  }, [locations]);
  
  return (
    <group ref={groupRef} rotation={[0, BRAZIL_INITIAL_ROTATION, 0]}>
      {/* Simple dark globe */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>
      
      {/* Grid lines more visible on fallback */}
      <GlobeGrid />
      
      {/* Active broker points */}
      {points.map((point, i) => (
        <PulsePoint
          key={`${point.city}-${i}`}
          position={point.position}
          intensity={point.intensity}
          city={point.city}
          state={point.state}
          evaluationCount={point.evaluationCount}
        />
      ))}
    </group>
  );
}

// Scene setup
interface SceneProps {
  locations: EvaluationCity[];
}

function Scene({ locations }: SceneProps) {
  const { camera } = useThree();
  const { isHovering } = useContext(GlobeContext);
  
  useMemo(() => {
    camera.position.set(0, 1, 6.5);
  }, [camera]);
  
  return (
    <>
      {/* Lighting for textured earth */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
      
      {/* Earth globe with suspense fallback */}
      <Suspense fallback={<FallbackGlobe locations={locations} />}>
        <EarthGlobe locations={locations} />
      </Suspense>
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI - Math.PI / 4}
        autoRotate={!isHovering}
        autoRotateSpeed={0.3}
      />
    </>
  );
}

interface NetworkGlobeProps {
  activeCitiesCount?: number;
}

export const NetworkGlobe = ({ activeCitiesCount }: NetworkGlobeProps) => {
  const { data: cities, isLoading } = useEvaluationCities();
  const [isHovering, setIsHovering] = useState(false);
  
  // Use real data or fallback
  const locations = cities && cities.length > 0 ? cities : FALLBACK_LOCATIONS;
  
  const contextValue = useMemo(() => ({
    isHovering,
    setIsHovering,
  }), [isHovering]);
  
  return (
    <GlobeContext.Provider value={contextValue}>
      <Canvas
        camera={{ position: [0, 1, 6.5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Scene locations={locations} />
      </Canvas>
    </GlobeContext.Provider>
  );
};
