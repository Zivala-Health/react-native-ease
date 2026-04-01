"use strict";

import { StyleSheet } from 'react-native';
import NativeEaseView from './EaseViewNativeComponent';
import { jsx as _jsx } from "react/jsx-runtime";
/** Identity values used as defaults for animate/initialAnimate. */
const IDENTITY = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  borderRadius: 0
};

/** Bitmask flags — must match native constants. */
/* eslint-disable no-bitwise */
const MASK_OPACITY = 1 << 0;
const MASK_TRANSLATE_X = 1 << 1;
const MASK_TRANSLATE_Y = 1 << 2;
const MASK_SCALE_X = 1 << 3;
const MASK_SCALE_Y = 1 << 4;
const MASK_ROTATE = 1 << 5;
const MASK_ROTATE_X = 1 << 6;
const MASK_ROTATE_Y = 1 << 7;
const MASK_BORDER_RADIUS = 1 << 8;
const MASK_BACKGROUND_COLOR = 1 << 9;
/* eslint-enable no-bitwise */

/** Maps animate prop keys to style keys that conflict. */
const ANIMATE_TO_STYLE_KEYS = {
  opacity: 'opacity',
  translateX: 'transform',
  translateY: 'transform',
  scale: 'transform',
  scaleX: 'transform',
  scaleY: 'transform',
  rotate: 'transform',
  rotateX: 'transform',
  rotateY: 'transform',
  borderRadius: 'borderRadius',
  backgroundColor: 'backgroundColor'
};

/** Preset easing curves as cubic bezier control points. */
const EASING_PRESETS = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1]
};

/** Returns true if the transition is a SingleTransition (has a `type` field). */
function isSingleTransition(t) {
  return 'type' in t;
}
/** Default config: timing 300ms easeInOut. */
const DEFAULT_CONFIG = {
  type: 'timing',
  duration: 300,
  easingBezier: [0.42, 0, 0.58, 1],
  damping: 15,
  stiffness: 120,
  mass: 1,
  loop: 'none',
  delay: 0
};

/** Resolve a SingleTransition into a native config object. */
function resolveSingleConfig(config) {
  const type = config.type;
  const duration = config.type === 'timing' ? config.duration ?? 300 : 300;
  const rawEasing = config.type === 'timing' ? config.easing ?? 'easeInOut' : 'easeInOut';
  if (__DEV__) {
    if (Array.isArray(rawEasing)) {
      if (rawEasing.length !== 4) {
        console.warn('react-native-ease: Custom easing must be a [x1, y1, x2, y2] tuple (got length ' + rawEasing.length + ').');
      }
      if (rawEasing[0] < 0 || rawEasing[0] > 1 || rawEasing[2] < 0 || rawEasing[2] > 1) {
        console.warn('react-native-ease: Easing x-values (x1, x2) must be between 0 and 1.');
      }
    }
  }
  const easingBezier = Array.isArray(rawEasing) ? rawEasing : EASING_PRESETS[rawEasing];
  const damping = config.type === 'spring' ? config.damping ?? 15 : 15;
  const stiffness = config.type === 'spring' ? config.stiffness ?? 120 : 120;
  const mass = config.type === 'spring' ? config.mass ?? 1 : 1;
  const loop = config.type === 'timing' ? config.loop ?? 'none' : 'none';
  const delay = config.type === 'timing' || config.type === 'spring' ? config.delay ?? 0 : 0;
  return {
    type,
    duration,
    easingBezier,
    damping,
    stiffness,
    mass,
    loop,
    delay
  };
}

/** Category keys that map to optional NativeTransitions fields. */
const CATEGORY_KEYS = ['transform', 'opacity', 'borderRadius', 'backgroundColor'];

/** Resolve the transition prop into a NativeTransitions struct. */
function resolveTransitions(transition) {
  // No transition: timing default for all properties
  if (transition == null) {
    return {
      defaultConfig: DEFAULT_CONFIG
    };
  }

  // Single transition: set as defaultConfig only
  if (isSingleTransition(transition)) {
    return {
      defaultConfig: resolveSingleConfig(transition)
    };
  }

  // TransitionMap: resolve defaultConfig + only specified category keys
  const defaultConfig = transition.default ? resolveSingleConfig(transition.default) : DEFAULT_CONFIG;
  const result = {
    defaultConfig
  };
  for (const key of CATEGORY_KEYS) {
    const specific = transition[key];
    if (specific != null) {
      result[key] = resolveSingleConfig(specific);
    }
  }
  return result;
}
export function EaseView({
  animate,
  initialAnimate,
  transition,
  onTransitionEnd,
  useHardwareLayer = false,
  transformOrigin,
  style,
  ...rest
}) {
  // Compute bitmask of which properties are animated.
  // Native uses this to skip non-animated properties (lets style handle them).
  /* eslint-disable no-bitwise */
  let animatedProperties = 0;
  if (animate?.opacity != null) animatedProperties |= MASK_OPACITY;
  if (animate?.translateX != null) animatedProperties |= MASK_TRANSLATE_X;
  if (animate?.translateY != null) animatedProperties |= MASK_TRANSLATE_Y;
  if (animate?.scaleX != null || animate?.scale != null) animatedProperties |= MASK_SCALE_X;
  if (animate?.scaleY != null || animate?.scale != null) animatedProperties |= MASK_SCALE_Y;
  if (animate?.rotate != null) animatedProperties |= MASK_ROTATE;
  if (animate?.rotateX != null) animatedProperties |= MASK_ROTATE_X;
  if (animate?.rotateY != null) animatedProperties |= MASK_ROTATE_Y;
  if (animate?.borderRadius != null) animatedProperties |= MASK_BORDER_RADIUS;
  if (animate?.backgroundColor != null) animatedProperties |= MASK_BACKGROUND_COLOR;
  /* eslint-enable no-bitwise */

  // Resolve animate values (identity defaults for non-animated — safe values).
  const resolved = {
    ...IDENTITY,
    ...animate,
    scaleX: animate?.scaleX ?? animate?.scale ?? IDENTITY.scaleX,
    scaleY: animate?.scaleY ?? animate?.scale ?? IDENTITY.scaleY,
    rotateX: animate?.rotateX ?? IDENTITY.rotateX,
    rotateY: animate?.rotateY ?? IDENTITY.rotateY
  };

  // Resolve initialAnimate:
  // - No initialAnimate: same as resolved (no enter animation)
  // - With initialAnimate: use initial values for animated properties,
  //   falling back to identity defaults.
  const initial = initialAnimate ?? animate;
  const resolvedInitial = {
    ...IDENTITY,
    ...initial,
    scaleX: initial?.scaleX ?? initial?.scale ?? IDENTITY.scaleX,
    scaleY: initial?.scaleY ?? initial?.scale ?? IDENTITY.scaleY,
    rotateX: initial?.rotateX ?? IDENTITY.rotateX,
    rotateY: initial?.rotateY ?? IDENTITY.rotateY
  };

  // Resolve backgroundColor — passed as ColorValue directly (codegen handles conversion)
  const animBgColor = animate?.backgroundColor ?? 'transparent';
  const initialBgColor = initialAnimate?.backgroundColor ?? animBgColor;

  // Strip style keys that conflict with animated properties
  let cleanStyle = style;
  if (animate && style) {
    const flat = StyleSheet.flatten(style);
    if (flat) {
      const conflicting = new Set();
      for (const key of Object.keys(animate)) {
        if (animate[key] != null) {
          const styleKey = ANIMATE_TO_STYLE_KEYS[key];
          if (styleKey && styleKey in flat) {
            conflicting.add(styleKey);
          }
        }
      }
      if (conflicting.size > 0) {
        if (__DEV__) {
          console.warn(`react-native-ease: ${[...conflicting].join(', ')} found in both style and animate. ` + 'The animated value takes priority; the style value will be ignored.');
        }
        const cleaned = {};
        for (const [k, v] of Object.entries(flat)) {
          if (!conflicting.has(k)) {
            cleaned[k] = v;
          }
        }
        cleanStyle = cleaned;
      }
    }
  }

  // Resolve transition config into a fully-populated struct
  const transitions = resolveTransitions(transition);
  const handleTransitionEnd = onTransitionEnd ? event => onTransitionEnd(event.nativeEvent) : undefined;
  return /*#__PURE__*/_jsx(NativeEaseView, {
    style: cleanStyle,
    onTransitionEnd: handleTransitionEnd,
    animatedProperties: animatedProperties,
    animateOpacity: resolved.opacity,
    animateTranslateX: resolved.translateX,
    animateTranslateY: resolved.translateY,
    animateScaleX: resolved.scaleX,
    animateScaleY: resolved.scaleY,
    animateRotate: resolved.rotate,
    animateRotateX: resolved.rotateX,
    animateRotateY: resolved.rotateY,
    animateBorderRadius: resolved.borderRadius,
    animateBackgroundColor: animBgColor,
    initialAnimateOpacity: resolvedInitial.opacity,
    initialAnimateTranslateX: resolvedInitial.translateX,
    initialAnimateTranslateY: resolvedInitial.translateY,
    initialAnimateScaleX: resolvedInitial.scaleX,
    initialAnimateScaleY: resolvedInitial.scaleY,
    initialAnimateRotate: resolvedInitial.rotate,
    initialAnimateRotateX: resolvedInitial.rotateX,
    initialAnimateRotateY: resolvedInitial.rotateY,
    initialAnimateBorderRadius: resolvedInitial.borderRadius,
    initialAnimateBackgroundColor: initialBgColor,
    transitions: transitions,
    useHardwareLayer: useHardwareLayer,
    transformOriginX: transformOrigin?.x ?? 0.5,
    transformOriginY: transformOrigin?.y ?? 0.5,
    ...rest
  });
}
//# sourceMappingURL=EaseView.js.map