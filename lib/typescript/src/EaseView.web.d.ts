import React from 'react';
import { type ViewStyle, type StyleProp } from 'react-native';
import type { AnimateProps, Transition, TransitionEndEvent, TransformOrigin } from './types';
export type EaseViewProps = {
    animate?: AnimateProps;
    initialAnimate?: AnimateProps;
    transition?: Transition;
    onTransitionEnd?: (event: TransitionEndEvent) => void;
    /** No-op on web. */
    useHardwareLayer?: boolean;
    transformOrigin?: TransformOrigin;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
};
export declare function EaseView({ animate, initialAnimate, transition, onTransitionEnd, useHardwareLayer: _useHardwareLayer, transformOrigin, style, children, }: EaseViewProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EaseView.web.d.ts.map