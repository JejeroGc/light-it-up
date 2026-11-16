import type { FixtureType } from "../../store/lightingStore";

type FixtureModelProps = {
  type: FixtureType;
  fixtureColor: string;
  supportColor: string;
  lensColor: string;
  lensEmissive: string;
  lensEmissiveIntensity: number;
};

type ModelProps = Omit<FixtureModelProps, "type">;

const bodyMaterial = (color: string) => (
  <meshStandardMaterial color={color} metalness={0.68} roughness={0.28} />
);

const supportMaterial = (color: string) => (
  <meshStandardMaterial color={color} metalness={0.82} roughness={0.22} />
);

function Lens({ color, emissive, intensity, radius = 0.21 }: {
  color: string;
  emissive: string;
  intensity: number;
  radius?: number;
}) {
  return (
    <mesh position={[0, -0.405, 0]} castShadow>
      <cylinderGeometry args={[radius, radius, 0.045, 48]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={intensity}
        metalness={0.05}
        roughness={0.12}
        transmission={0.12}
        clearcoat={1}
        clearcoatRoughness={0.08}
      />
    </mesh>
  );
}

function CoolingFins({ color, count = 7, radius = 0.28 }: { color: string; count?: number; radius?: number }) {
  return (
    <group position={[0, 0.16, 0]}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.035, 0.3, 0.13]} />
            {bodyMaterial(color)}
          </mesh>
        );
      })}
    </group>
  );
}


function DisplayPanel({ width = 0.22 }: { width?: number }) {
  return (
    <group position={[0, 0.12, 0.285]}>
      <mesh castShadow>
        <boxGeometry args={[width, 0.12, 0.025]} />
        <meshStandardMaterial color="#0a0b0e" metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[width * 0.62, 0.045, 0.008]} />
        <meshStandardMaterial color="#17302d" emissive="#35f0ba" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function Clamp({ color }: { color: string }) {
  return (
    <group position={[0, 0.62, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.07, 0.11]} />
        {supportMaterial(color)}
      </mesh>
      <mesh position={[0.12, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.085, 0.025, 12, 28, Math.PI * 1.55]} />
        {supportMaterial(color)}
      </mesh>
      <mesh position={[-0.12, 0.08, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <torusGeometry args={[0.085, 0.025, 12, 28, Math.PI * 1.55]} />
        {supportMaterial(color)}
      </mesh>
    </group>
  );
}

export default function FixtureModel(props: FixtureModelProps) {
  switch (props.type) {
    case "wash":
      return <WashModel {...props} />;
    case "beam":
      return <BeamModel {...props} />;
    case "moving":
      return <MovingHeadModel {...props} />;
    case "spot":
    default:
      return <ProfileModel {...props} />;
  }
}

function ProfileModel({ fixtureColor, supportColor, lensColor, lensEmissive, lensEmissiveIntensity }: ModelProps) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.31, 0.76, 48]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.12, 40]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, 0.49, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 0.11, 32]} />
        {supportMaterial(supportColor)}
      </mesh>
      <mesh position={[0.29, 0.05, 0]} castShadow>
        <boxGeometry args={[0.13, 0.3, 0.26]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0.37, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.12, 20]} />
        {supportMaterial(supportColor)}
      </mesh>
      <mesh position={[0, -0.36, 0]} castShadow>
        <torusGeometry args={[0.235, 0.035, 16, 48]} />
        {supportMaterial(supportColor)}
      </mesh>
      <CoolingFins color={fixtureColor} count={8} radius={0.27} />
      <DisplayPanel />
      <Clamp color={supportColor} />
      <Lens color={lensColor} emissive={lensEmissive} intensity={lensEmissiveIntensity} radius={0.205} />
    </group>
  );
}

function WashModel({ fixtureColor, supportColor, lensColor, lensEmissive, lensEmissiveIntensity }: ModelProps) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.4, 0.5, 48]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.34, 0.12, 40]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, -0.26, 0]} castShadow>
        <torusGeometry args={[0.305, 0.045, 16, 48]} />
        {supportMaterial(supportColor)}
      </mesh>
      <CoolingFins color={fixtureColor} count={10} radius={0.35} />
      <DisplayPanel width={0.25} />
      <Clamp color={supportColor} />
      <Lens color={lensColor} emissive={lensEmissive} intensity={lensEmissiveIntensity} radius={0.285} />
    </group>
  );
}

function BeamModel({ fixtureColor, supportColor, lensColor, lensEmissive, lensEmissiveIntensity }: ModelProps) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.245, 0.88, 48]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.12, 36]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow>
        <torusGeometry args={[0.16, 0.028, 14, 40]} />
        {supportMaterial(supportColor)}
      </mesh>
      <mesh position={[0.21, 0.18, 0]} castShadow>
        <boxGeometry args={[0.08, 0.26, 0.18]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <CoolingFins color={fixtureColor} count={6} radius={0.205} />
      <DisplayPanel width={0.18} />
      <Clamp color={supportColor} />
      <Lens color={lensColor} emissive={lensEmissive} intensity={lensEmissiveIntensity} radius={0.13} />
    </group>
  );
}

function MovingHeadModel({ fixtureColor, supportColor, lensColor, lensEmissive, lensEmissiveIntensity }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} scale={[1, 1.12, 0.92]} castShadow receiveShadow>
        <sphereGeometry args={[0.31, 48, 28]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.27, 0.16, 40]} />
        {bodyMaterial(fixtureColor)}
      </mesh>
      <mesh position={[-0.29, 0, 0]} castShadow>
        <boxGeometry args={[0.09, 0.46, 0.42]} />
        {supportMaterial(supportColor)}
      </mesh>
      <mesh position={[0.29, 0, 0]} castShadow>
        <boxGeometry args={[0.09, 0.46, 0.42]} />
        {supportMaterial(supportColor)}
      </mesh>
      <mesh position={[0, -0.285, 0]} castShadow>
        <torusGeometry args={[0.195, 0.034, 16, 48]} />
        {supportMaterial(supportColor)}
      </mesh>
      <DisplayPanel width={0.2} />
      <Clamp color={supportColor} />
      <Lens color={lensColor} emissive={lensEmissive} intensity={lensEmissiveIntensity} radius={0.165} />
    </group>
  );
}
