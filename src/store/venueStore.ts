import { create } from "zustand";

type VenueStore = {
  activeVenueName: string;
  setActiveVenueName: (name: string) => void;
};

export const useVenueStore = create<VenueStore>((set) => ({
  activeVenueName: "SIN VENUE",
  setActiveVenueName: (activeVenueName) => set({ activeVenueName }),
}));
