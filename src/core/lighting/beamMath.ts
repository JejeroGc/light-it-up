import * as THREE from "three";

export type FixturePosition = {
  x: number;
  y: number;
  z: number;
};

export type BeamCalculation = {
  sourcePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;

  direction: THREE.Vector3;

  beamLength: number;
  beamRadius: number;
  beamMidpoint: THREE.Vector3;

  fixtureQuaternion: THREE.Quaternion;
  beamQuaternion: THREE.Quaternion;
};

/**
 * Calcula la dirección del foco utilizando Pan y Tilt.
 *
 * Pan:
 * negativo = izquierda
 * positivo = derecha
 *
 * Tilt:
 * negativo = frente
 * positivo = fondo
 */
export function calculateBeamDirection(
  pan: number,
  tilt: number
): THREE.Vector3 {
  /*
   * El fixture parte apuntando verticalmente hacia abajo.
   * Aplicamos primero Tilt sobre el eje local X y después
   * Pan alrededor del eje Y del escenario. Esto coincide
   * con la rotación que muestra TransformControls.
   */
  const tiltQuaternion =
    new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      tilt
    );

  const panQuaternion =
    new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      pan
    );

  return new THREE.Vector3(0, -1, 0)
    .applyQuaternion(tiltQuaternion)
    .applyQuaternion(panQuaternion)
    .normalize();
}


/**
 * Convierte un punto del escenario en Pan/Tilt para que una luminaria
 * apunte exactamente hacia él. Usa la misma convención angular que
 * calculateBeamDirection.
 */
export function calculatePanTiltToTarget(
  source: FixturePosition,
  target: FixturePosition
): { pan: number; tilt: number } {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dz = target.z - source.z;

  const horizontalDistance = Math.hypot(dx, dz);

  // El fixture parte mirando hacia abajo.
  const tilt = Math.atan2(horizontalDistance, -dy);

  // Cuando el objetivo está justo debajo, Pan no aporta información.
  const pan = horizontalDistance < 0.000001
    ? 0
    : Math.atan2(-dx, -dz);

  return { pan, tilt };
}

/**
 * Calcula el punto en el que el haz cruza el piso.
 *
 * El piso se considera ubicado en Y = 0.
 */
export function calculateFloorIntersection(
  sourcePosition: THREE.Vector3,
  direction: THREE.Vector3
): THREE.Vector3 {
  const minimumDownwardDirection = -0.0001;

  if (direction.y >= minimumDownwardDirection) {
    return sourcePosition
      .clone()
      .add(direction.clone().multiplyScalar(40));
  }

  const distanceToFloor =
    -sourcePosition.y / direction.y;

  return sourcePosition
    .clone()
    .add(
      direction
        .clone()
        .multiplyScalar(distanceToFloor)
    );
}

/**
 * Devuelve todos los valores necesarios para representar
 * el cuerpo, el haz y el punto de impacto de una luminaria.
 */
export function calculateFixtureBeam({
  position,
  pan,
  tilt,
  beamAngle,
}: {
  position: FixturePosition;
  pan: number;
  tilt: number;
  beamAngle: number;
}): BeamCalculation {
  const sourcePosition = new THREE.Vector3(
    position.x,
    position.y,
    position.z
  );

  const direction = calculateBeamDirection(
    pan,
    tilt
  );

  const targetPosition =
    calculateFloorIntersection(
      sourcePosition,
      direction
    );

  const beamLength =
    sourcePosition.distanceTo(targetPosition);

  const beamRadius =
    Math.tan(beamAngle) * beamLength;

  const beamMidpoint = sourcePosition
    .clone()
    .lerp(targetPosition, 0.5);

  const fixtureQuaternion =
    new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      direction
    );

  const directionToSource = direction
    .clone()
    .negate();

  const beamQuaternion =
    new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      directionToSource
    );

  return {
    sourcePosition,
    targetPosition,

    direction,

    beamLength,
    beamRadius,
    beamMidpoint,

    fixtureQuaternion,
    beamQuaternion,
  };
}