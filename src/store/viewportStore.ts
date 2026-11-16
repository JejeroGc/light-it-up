import { create } from "zustand";

export type ViewMode = "perspective" | "top" | "front" | "side";
export type TransformMode = "select" | "translate" | "rotate" | "focus";

export type FocusPoint = { x: number; y: number; z: number };

export type DragGuide = {
  x: number;
  y: number;
  z: number;
  offsetX: number;
  barName: string;
  count: number;
} | null;

type ViewportStore = {
  viewMode: ViewMode;
  transformMode: TransformMode;
  snapPreviewBarId: number | null;
  isDirectDraggingFixture: boolean;
  dragGuide: DragGuide;
  focusTarget: FocusPoint | null;
  focusPreview: FocusPoint | null;

  setViewMode: (viewMode: ViewMode) => void;
  setTransformMode: (transformMode: TransformMode) => void;
  setSnapPreviewBarId: (id: number | null) => void;
  setDirectDraggingFixture: (dragging: boolean) => void;
  setDragGuide: (guide: DragGuide) => void;
  setFocusTarget: (target: FocusPoint | null) => void;
  setFocusPreview: (target: FocusPoint | null) => void;
};

export const useViewportStore = create<ViewportStore>((set) => ({
  viewMode: "perspective",
  transformMode: "select",
  snapPreviewBarId: null,
  isDirectDraggingFixture: false,
  dragGuide: null,
  focusTarget: null,
  focusPreview: null,

  setViewMode: (viewMode) => set({ viewMode }),
  setTransformMode: (transformMode) => set({ transformMode }),
  setSnapPreviewBarId: (id) => set({ snapPreviewBarId: id }),
  setDirectDraggingFixture: (dragging) => set({ isDirectDraggingFixture: dragging }),
  setDragGuide: (guide) => set({ dragGuide: guide }),
  setFocusTarget: (target) => set({ focusTarget: target }),
  setFocusPreview: (target) => set({ focusPreview: target }),
}));
