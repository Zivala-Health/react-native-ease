#import "EaseView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/EaseViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/EaseViewSpec/EventEmitters.h>
#import <react/renderer/components/EaseViewSpec/Props.h>
#import <react/renderer/components/EaseViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// Animation key constants
static NSString *const kAnimKeyOpacity = @"ease_opacity";
static NSString *const kAnimKeyTranslateX = @"ease_translateX";
static NSString *const kAnimKeyTranslateY = @"ease_translateY";
static NSString *const kAnimKeyScaleX = @"ease_scaleX";
static NSString *const kAnimKeyScaleY = @"ease_scaleY";
static NSString *const kAnimKeyRotate = @"ease_rotate";

static inline CGFloat degreesToRadians(CGFloat degrees) {
  return degrees * M_PI / 180.0;
}

static CAMediaTimingFunction *
timingFunctionForEasing(EaseViewTransitionEasing easing) {
  switch (easing) {
  case EaseViewTransitionEasing::Linear:
    return
        [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionLinear];
  case EaseViewTransitionEasing::EaseIn:
    return [CAMediaTimingFunction functionWithControlPoints:0.42:0.0:1.0:1.0];
  case EaseViewTransitionEasing::EaseOut:
    return [CAMediaTimingFunction functionWithControlPoints:0.0:0.0:0.58:1.0];
  case EaseViewTransitionEasing::EaseInOut:
    return [CAMediaTimingFunction functionWithControlPoints:0.42:0.0:0.58:1.0];
  }
}

@implementation EaseView {
  BOOL _isFirstMount;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<EaseViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const EaseViewProps>();
    _props = defaultProps;
    _isFirstMount = YES;
  }
  return self;
}

#pragma mark - Animation helpers

- (NSValue *)presentationValueForKeyPath:(NSString *)keyPath {
  CALayer *presentationLayer = self.layer.presentationLayer;
  if (presentationLayer) {
    return [presentationLayer valueForKeyPath:keyPath];
  }
  return [self.layer valueForKeyPath:keyPath];
}

- (CAAnimation *)createAnimationForKeyPath:(NSString *)keyPath
                                 fromValue:(NSValue *)fromValue
                                   toValue:(NSValue *)toValue
                                     props:(const EaseViewProps &)props
                                      loop:(BOOL)loop {
  if (props.transitionType == EaseViewTransitionType::Spring) {
    CASpringAnimation *spring =
        [CASpringAnimation animationWithKeyPath:keyPath];
    spring.fromValue = fromValue;
    spring.toValue = toValue;
    spring.damping = props.transitionDamping;
    spring.stiffness = props.transitionStiffness;
    spring.mass = props.transitionMass;
    spring.initialVelocity = 0;
    spring.duration = spring.settlingDuration;
    return spring;
  } else {
    CABasicAnimation *timing = [CABasicAnimation animationWithKeyPath:keyPath];
    timing.fromValue = fromValue;
    timing.toValue = toValue;
    timing.duration = props.transitionDuration / 1000.0;
    timing.timingFunction = timingFunctionForEasing(props.transitionEasing);
    if (loop) {
      if (props.transitionLoop == EaseViewTransitionLoop::Repeat) {
        timing.repeatCount = HUGE_VALF;
      } else if (props.transitionLoop == EaseViewTransitionLoop::Reverse) {
        timing.repeatCount = HUGE_VALF;
        timing.autoreverses = YES;
      }
    }
    return timing;
  }
}

- (void)applyAnimationForKeyPath:(NSString *)keyPath
                    animationKey:(NSString *)animationKey
                       fromValue:(NSValue *)fromValue
                         toValue:(NSValue *)toValue
                           props:(const EaseViewProps &)props
                            loop:(BOOL)loop {
  [self.layer setValue:toValue forKeyPath:keyPath];

  CAAnimation *animation = [self createAnimationForKeyPath:keyPath
                                                 fromValue:fromValue
                                                   toValue:toValue
                                                     props:props
                                                      loop:loop];
  [animation setValue:animationKey forKey:@"easeAnimKey"];
  animation.delegate = self;
  [self.layer addAnimation:animation forKey:animationKey];
}

- (void)setModelValue:(NSValue *)value forKeyPath:(NSString *)keyPath {
  [self.layer setValue:value forKeyPath:keyPath];
}

#pragma mark - Props update

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &newViewProps =
      *std::static_pointer_cast<const EaseViewProps>(props);

  [CATransaction begin];
  [CATransaction setDisableActions:YES];

  if (_isFirstMount) {
    _isFirstMount = NO;

    BOOL hasInitialAnimation =
        newViewProps.initialAnimateOpacity != newViewProps.animateOpacity ||
        newViewProps.initialAnimateTranslateX !=
            newViewProps.animateTranslateX ||
        newViewProps.initialAnimateTranslateY !=
            newViewProps.animateTranslateY ||
        newViewProps.initialAnimateScale != newViewProps.animateScale ||
        newViewProps.initialAnimateRotate != newViewProps.animateRotate;

    if (hasInitialAnimation) {
      // Set initial values immediately
      [self setModelValue:@(newViewProps.initialAnimateOpacity)
               forKeyPath:@"opacity"];
      [self setModelValue:@(newViewProps.initialAnimateTranslateX)
               forKeyPath:@"transform.translation.x"];
      [self setModelValue:@(newViewProps.initialAnimateTranslateY)
               forKeyPath:@"transform.translation.y"];
      [self setModelValue:@(newViewProps.initialAnimateScale)
               forKeyPath:@"transform.scale.x"];
      [self setModelValue:@(newViewProps.initialAnimateScale)
               forKeyPath:@"transform.scale.y"];
      [self setModelValue:@(degreesToRadians(newViewProps.initialAnimateRotate))
               forKeyPath:@"transform.rotation.z"];

      // Animate from initial to target for properties that differ
      if (newViewProps.initialAnimateOpacity != newViewProps.animateOpacity) {
        [self applyAnimationForKeyPath:@"opacity"
                          animationKey:kAnimKeyOpacity
                             fromValue:@(newViewProps.initialAnimateOpacity)
                               toValue:@(newViewProps.animateOpacity)
                                 props:newViewProps
                                  loop:YES];
      }
      if (newViewProps.initialAnimateTranslateX !=
          newViewProps.animateTranslateX) {
        [self applyAnimationForKeyPath:@"transform.translation.x"
                          animationKey:kAnimKeyTranslateX
                             fromValue:@(newViewProps.initialAnimateTranslateX)
                               toValue:@(newViewProps.animateTranslateX)
                                 props:newViewProps
                                  loop:YES];
      }
      if (newViewProps.initialAnimateTranslateY !=
          newViewProps.animateTranslateY) {
        [self applyAnimationForKeyPath:@"transform.translation.y"
                          animationKey:kAnimKeyTranslateY
                             fromValue:@(newViewProps.initialAnimateTranslateY)
                               toValue:@(newViewProps.animateTranslateY)
                                 props:newViewProps
                                  loop:YES];
      }
      if (newViewProps.initialAnimateScale != newViewProps.animateScale) {
        [self applyAnimationForKeyPath:@"transform.scale.x"
                          animationKey:kAnimKeyScaleX
                             fromValue:@(newViewProps.initialAnimateScale)
                               toValue:@(newViewProps.animateScale)
                                 props:newViewProps
                                  loop:YES];
        [self applyAnimationForKeyPath:@"transform.scale.y"
                          animationKey:kAnimKeyScaleY
                             fromValue:@(newViewProps.initialAnimateScale)
                               toValue:@(newViewProps.animateScale)
                                 props:newViewProps
                                  loop:YES];
      }
      if (newViewProps.initialAnimateRotate != newViewProps.animateRotate) {
        [self applyAnimationForKeyPath:@"transform.rotation.z"
                          animationKey:kAnimKeyRotate
                             fromValue:@(degreesToRadians(
                                           newViewProps.initialAnimateRotate))
                               toValue:@(degreesToRadians(
                                           newViewProps.animateRotate))
                                 props:newViewProps
                                  loop:YES];
      }
    } else {
      // No initial animation, set target values directly
      [self setModelValue:@(newViewProps.animateOpacity) forKeyPath:@"opacity"];
      [self setModelValue:@(newViewProps.animateTranslateX)
               forKeyPath:@"transform.translation.x"];
      [self setModelValue:@(newViewProps.animateTranslateY)
               forKeyPath:@"transform.translation.y"];
      [self setModelValue:@(newViewProps.animateScale)
               forKeyPath:@"transform.scale.x"];
      [self setModelValue:@(newViewProps.animateScale)
               forKeyPath:@"transform.scale.y"];
      [self setModelValue:@(degreesToRadians(newViewProps.animateRotate))
               forKeyPath:@"transform.rotation.z"];
    }
  } else {
    // Subsequent updates: animate changed properties
    const auto &oldViewProps =
        *std::static_pointer_cast<const EaseViewProps>(oldProps);

    if (oldViewProps.animateOpacity != newViewProps.animateOpacity) {
      [self
          applyAnimationForKeyPath:@"opacity"
                      animationKey:kAnimKeyOpacity
                         fromValue:[self presentationValueForKeyPath:@"opacity"]
                           toValue:@(newViewProps.animateOpacity)
                             props:newViewProps
                              loop:NO];
    }
    if (oldViewProps.animateTranslateX != newViewProps.animateTranslateX) {
      [self applyAnimationForKeyPath:@"transform.translation.x"
                        animationKey:kAnimKeyTranslateX
                           fromValue:[self presentationValueForKeyPath:
                                               @"transform.translation.x"]
                             toValue:@(newViewProps.animateTranslateX)
                               props:newViewProps
                                loop:NO];
    }
    if (oldViewProps.animateTranslateY != newViewProps.animateTranslateY) {
      [self applyAnimationForKeyPath:@"transform.translation.y"
                        animationKey:kAnimKeyTranslateY
                           fromValue:[self presentationValueForKeyPath:
                                               @"transform.translation.y"]
                             toValue:@(newViewProps.animateTranslateY)
                               props:newViewProps
                                loop:NO];
    }
    if (oldViewProps.animateScale != newViewProps.animateScale) {
      [self applyAnimationForKeyPath:@"transform.scale.x"
                        animationKey:kAnimKeyScaleX
                           fromValue:[self presentationValueForKeyPath:
                                               @"transform.scale.x"]
                             toValue:@(newViewProps.animateScale)
                               props:newViewProps
                                loop:NO];
      [self applyAnimationForKeyPath:@"transform.scale.y"
                        animationKey:kAnimKeyScaleY
                           fromValue:[self presentationValueForKeyPath:
                                               @"transform.scale.y"]
                             toValue:@(newViewProps.animateScale)
                               props:newViewProps
                                loop:NO];
    }
    if (oldViewProps.animateRotate != newViewProps.animateRotate) {
      [self applyAnimationForKeyPath:@"transform.rotation.z"
                        animationKey:kAnimKeyRotate
                           fromValue:[self presentationValueForKeyPath:
                                               @"transform.rotation.z"]
                             toValue:@(degreesToRadians(
                                         newViewProps.animateRotate))
                               props:newViewProps
                                loop:NO];
    }
  }

  [CATransaction commit];

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - CAAnimationDelegate

- (void)animationDidStop:(CAAnimation *)anim finished:(BOOL)flag {
  NSString *animKey = [anim valueForKey:@"easeAnimKey"];
  if (!animKey || !_eventEmitter) {
    return;
  }

  // Map animation key to JS property name
  NSString *jsProperty = nil;
  if ([animKey isEqualToString:kAnimKeyOpacity]) {
    jsProperty = @"opacity";
  } else if ([animKey isEqualToString:kAnimKeyTranslateX]) {
    jsProperty = @"translateX";
  } else if ([animKey isEqualToString:kAnimKeyTranslateY]) {
    jsProperty = @"translateY";
  } else if ([animKey isEqualToString:kAnimKeyScaleX]) {
    jsProperty = @"scale";
  } else if ([animKey isEqualToString:kAnimKeyScaleY]) {
    // Skip — scaleX already fires for scale
    return;
  } else if ([animKey isEqualToString:kAnimKeyRotate]) {
    jsProperty = @"rotate";
  }

  if (jsProperty) {
    auto emitter =
        std::static_pointer_cast<const EaseViewEventEmitter>(_eventEmitter);
    emitter->onTransitionEnd(EaseViewEventEmitter::OnTransitionEnd{
        .property = std::string([jsProperty UTF8String]),
        .finished = static_cast<bool>(flag),
    });
  }
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  [self.layer removeAllAnimations];
  _isFirstMount = YES;
}

@end
