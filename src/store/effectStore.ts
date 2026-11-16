import { create } from "zustand";

export type EffectType = "strobe" | "pulse" | "chase" | "flicker" | "color-chase";

export type LightingEffect = {
  id: number;
  name: string;
  type: EffectType;
  fixtureIds: number[];
  speed: number;
  amount: number;
  active: boolean;
};

type EffectStore = {
  effects: LightingEffect[];
  addEffect: (effect: Omit<LightingEffect, "id" | "name" | "active"> & { name?: string }) => number | null;
  toggleEffect: (id: number) => void;
  updateEffect: (id: number, values: Partial<Pick<LightingEffect, "name" | "speed" | "amount">>) => void;
  removeEffect: (id: number) => void;
  stopAllEffects: () => void;
  clearEffects: () => void;
};

const labels: Record<EffectType, string> = {
  strobe: "Strobe",
  pulse: "Pulse",
  chase: "Chase",
  flicker: "Flicker",
  "color-chase": "Color Chase",
};

export const useEffectStore = create<EffectStore>((set) => ({
  effects: [],

  addEffect: (effect) => {
    if (effect.fixtureIds.length === 0) return null;
    let createdId: number | null = null;
    set((state) => {
      createdId = state.effects.length > 0 ? Math.max(...state.effects.map((item) => item.id)) + 1 : 1;
      const count = state.effects.filter((item) => item.type === effect.type).length + 1;
      return {
        effects: [
          ...state.effects,
          {
            ...effect,
            fixtureIds: [...effect.fixtureIds],
            id: createdId!,
            name: effect.name?.trim() || `${labels[effect.type]} ${count}`,
            active: true,
          },
        ],
      };
    });
    return createdId;
  },

  toggleEffect: (id) => set((state) => ({
    effects: state.effects.map((effect) => effect.id === id ? { ...effect, active: !effect.active } : effect),
  })),

  updateEffect: (id, values) => set((state) => ({
    effects: state.effects.map((effect) => effect.id === id ? { ...effect, ...values } : effect),
  })),

  removeEffect: (id) => set((state) => ({ effects: state.effects.filter((effect) => effect.id !== id) })),
  stopAllEffects: () => set((state) => ({ effects: state.effects.map((effect) => ({ ...effect, active: false })) })),
  clearEffects: () => set({ effects: [] }),
}));
