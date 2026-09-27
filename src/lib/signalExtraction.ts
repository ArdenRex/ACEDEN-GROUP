export interface SignalConfig {
  id: string;
  /** Scroll progress (0-1) at which this signal is recognized at its source and begins traveling. */
  threshold: number;
  /** How much scroll progress the travel itself consumes. */
  travelSpan: number;
}

export interface SignalState {
  id: string;
  /** The word/source has been noticed — mid-extraction, still visually anchored to its source. */
  recognized: boolean;
  /** The signal has completed its travel and landed at its destination. */
  arrived: boolean;
}

/** The scroll position at which a signal has fully landed at its destination. */
export function arrivalThreshold(signal: Pick<SignalConfig, 'threshold' | 'travelSpan'>): number {
  return signal.threshold + signal.travelSpan;
}

/**
 * Reusable foundation, Step 5A. Pure timing logic (no hooks, no DOM,
 * no rendering) for "N pieces of information travel from a source to
 * a destination," shared by any scroll-driven signal-extraction
 * chapter. Chapter 01 uses this for Sarah/Friday/High-Priority
 * traveling to the Workspace; the same shape is meant to be reused by
 * later chapters for their own signals (a person, an integration, a
 * workflow) traveling into the same evolving surface — not built yet,
 * just kept possible by keeping this logic generic and separate from
 * any one chapter's content.
 *
 * Two states per signal, not one, is the important fix this step
 * makes: `recognized` (word noticed, starts detaching) and `arrived`
 * (landed, destination should now react) are DIFFERENT moments,
 * `travelSpan` apart. Earlier code collapsed them into a single
 * `stage` threshold, which made the destination's new content appear
 * at the same instant the traveling signal started its journey —
 * i.e. before it had actually arrived. That mismatch is what read as
 * "the field appeared from nowhere."
 */
export function extractionState(progress: number, signals: SignalConfig[]): SignalState[] {
  return signals.map((signal) => ({
    id: signal.id,
    recognized: progress >= signal.threshold,
    arrived: progress >= arrivalThreshold(signal),
  }));
}
