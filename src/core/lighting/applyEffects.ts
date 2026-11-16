import type { LightFixture } from "../../store/lightingStore";
import type { LightingEffect } from "../../store/effectStore";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hashNoise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const palette = ["#ff3b30", "#ffcc00", "#34c759", "#00c7be", "#0a84ff", "#bf5af2"];

export const applyEffectsToFixture = (
  fixture: LightFixture,
  effects: LightingEffect[],
  timeSeconds: number
): LightFixture => {
  let resolved = fixture;

  effects.forEach((effect) => {
    if (!effect.active) return;
    const fixtureIndex = effect.fixtureIds.indexOf(fixture.id);
    if (fixtureIndex === -1) return;

    const speed = clamp(effect.speed, 0.1, 20);
    const amount = clamp(effect.amount, 0, 1);
    let intensity = resolved.intensity;
    let color = resolved.color;

    if (effect.type === "strobe") {
      const phase = (timeSeconds * speed) % 1;
      intensity = phase < 0.5 ? resolved.intensity : resolved.intensity * (1 - amount);
    }

    if (effect.type === "pulse") {
      const wave = (Math.sin(timeSeconds * speed * Math.PI * 2) + 1) / 2;
      intensity = resolved.intensity * (1 - amount + wave * amount);
    }

    if (effect.type === "chase") {
      const step = Math.floor(timeSeconds * speed) % Math.max(1, effect.fixtureIds.length);
      const isHot = fixtureIndex === step;
      intensity = isHot ? resolved.intensity : resolved.intensity * (1 - amount);
    }

    if (effect.type === "flicker") {
      const tick = Math.floor(timeSeconds * speed * 8);
      const noise = hashNoise(tick + fixture.id * 17.17);
      intensity = resolved.intensity * (1 - amount + noise * amount);
    }

    if (effect.type === "color-chase") {
      const step = Math.floor(timeSeconds * speed + fixtureIndex) % palette.length;
      color = palette[step];
    }

    resolved = {
      ...resolved,
      intensity: clamp(intensity, 0, 100),
      color,
    };
  });

  return resolved;
};
