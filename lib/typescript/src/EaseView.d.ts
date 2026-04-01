import { type ViewProps } from 'react-native';
import type { AnimateProps, Transition, TransitionEndEvent, TransformOrigin } from './types';
export type EaseViewProps = ViewProps & {
    /** Target values for animated properties. */
    animate?: AnimateProps;
    /** Starting values for enter animations. Animates to `animate` on mount. */
    initialAnimate?: AnimateProps;
    /** Animation configuration (timing or spring). */
    transition?: Transition;
    /** Called when all animations complete. Reports whether they finished naturally or were interrupted. */
    onTransitionEnd?: (event: TransitionEndEvent) => void;
    /**
     * Enable Android hardware layer during animations. The view is rasterized to
     * a GPU texture so animated property changes (opacity, scale, rotation) are
     * composited on the RenderThread without redrawing the view hierarchy.
     *
     * **Trade-offs:**
     * - Faster rendering of opacity/scale/rotation animations.
     * - Uses additional GPU memory for the off-screen texture.
     * - Children that overflow the view's layout bounds are clipped by the
     *   texture, which can cause visual artifacts with `translateX`/`translateY`.
     *
     * Best suited for views that animate opacity, scale, or rotation without
     * overflowing children. No-op on iOS where Core Animation already composites
     * off the main thread.
     * @default false
     */
    useHardwareLayer?: boolean;
    /** Pivot point for scale and rotation as 0–1 fractions. @default { x: 0.5, y: 0.5 } (center) */
    transformOrigin?: TransformOrigin;
    /** NativeWind / Tailwind CSS class string. Requires NativeWind in your project. */
    className?: string;
};
export declare function EaseView({ animate, initialAnimate, transition, onTransitionEnd, useHardwareLayer, transformOrigin, style, ...rest }: EaseViewProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EaseView.d.ts.map