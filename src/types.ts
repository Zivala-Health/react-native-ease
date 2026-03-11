/** Easing curve for timing animations. */
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

/** Timing-based transition with fixed duration and easing curve. */
export type TimingTransition = {
  type: 'timing';
  /** Duration in milliseconds. @default 300 */
  duration?: number;
  /** Easing curve. @default 'easeInOut' */
  easing?: EasingType;
  /** Loop mode — 'repeat' restarts from the beginning, 'reverse' alternates direction. */
  loop?: 'repeat' | 'reverse';
};

/** Physics-based spring transition. */
export type SpringTransition = {
  type: 'spring';
  /** Friction — higher values reduce oscillation. @default 15 */
  damping?: number;
  /** Spring constant — higher values mean faster animation. @default 120 */
  stiffness?: number;
  /** Mass of the object — higher values mean slower, more momentum. @default 1 */
  mass?: number;
};

/** Animation transition configuration. */
export type Transition = TimingTransition | SpringTransition;

/** Event fired when the animation ends. */
export type TransitionEndEvent = {
  /** True if the animation completed naturally, false if interrupted. */
  finished: boolean;
};

/** Transform origin as 0–1 fractions. Default is center (0.5, 0.5). */
export type TransformOrigin = {
  /** Horizontal origin. 0 = left, 0.5 = center, 1 = right. @default 0.5 */
  x?: number;
  /** Vertical origin. 0 = top, 0.5 = center, 1 = bottom. @default 0.5 */
  y?: number;
};

/** Animatable view properties. Unspecified properties default to their identity values. */
export type AnimateProps = {
  /** View opacity (0–1). @default 1 */
  opacity?: number;
  /** Horizontal translation in pixels. @default 0 */
  translateX?: number;
  /** Vertical translation in pixels. @default 0 */
  translateY?: number;
  /** Uniform scale factor. @default 1 */
  scale?: number;
  /** Rotation in degrees. @default 0 */
  rotate?: number;
};
