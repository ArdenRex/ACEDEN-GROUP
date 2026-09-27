import { create } from 'zustand';

/**
 * Whether the persistent nav should be showing. A chapter component
 * (currently Chapter01) owns the sentinel/IntersectionObserver that
 * decides *when*; the nav itself only reads this and handles *how*
 * it appears. Kept this small and decoupled on purpose — later
 * chapters can hand off control of this flag without either side
 * knowing about the other.
 */
interface NavVisibilityState {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useNavVisibility = create<NavVisibilityState>((set) => ({
  // STEP 36: defaults to true, not false — the nav is now meant to be
  // visible at the very top of the page (matching Chapter 01's own
  // sentinel check on mount), so starting true avoids a one-frame
  // flash of "no header" before that effect runs.
  visible: true,
  setVisible: (visible) => set({ visible }),
}));
