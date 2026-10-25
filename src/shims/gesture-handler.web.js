import React from 'react';
import { View, ScrollView, TouchableOpacity, TouchableHighlight, TouchableNativeFeedback, FlatList } from 'react-native';

export const GestureHandlerRootView = ({ children, style }) => React.createElement(View, { style }, children);
export const PanGestureHandler = ({ children }) => children;
export const TapGestureHandler = ({ children }) => children;
export const PinchGestureHandler = ({ children }) => children;
export const LongPressGestureHandler = ({ children }) => children;
export const NativeViewGestureHandler = ({ children }) => children;
export const RectButton = TouchableOpacity;
export const BorderlessButton = TouchableOpacity;
export const BaseButton = TouchableOpacity;
export const Swipeable = View;
export const DrawerLayout = View;
export { ScrollView as GestureHandlerScrollView };
export { FlatList };
export const State = {};
export const Directions = {};
export const gestureHandlerRootHOC = (Component) => Component;
export const createNativeWrapper = (Component) => Component;

const createGestureChain = () => {
  const chain = {
    minDistance: () => chain,
    enabled: () => chain,
    onStart: () => chain,
    onUpdate: () => chain,
    onEnd: () => chain,
    onFinalize: () => chain,
    runOnJS: () => chain,
    activeOffsetX: () => chain,
    activeOffsetY: () => chain,
    failOffsetX: () => chain,
    failOffsetY: () => chain,
  };
  return chain;
};

export const Gesture = {
  Pan: () => createGestureChain(),
  Tap: () => createGestureChain(),
  Pinch: () => createGestureChain(),
  Rotation: () => createGestureChain(),
  Fling: () => createGestureChain(),
  LongPress: () => createGestureChain(),
  Manual: () => createGestureChain(),
  Native: () => createGestureChain(),
};

export const GestureDetector = ({ children }) => children;

export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  PinchGestureHandler,
  LongPressGestureHandler,
  NativeViewGestureHandler,
  RectButton,
  BorderlessButton,
  BaseButton,
  Swipeable,
  DrawerLayout,
  GestureHandlerScrollView: ScrollView,
  FlatList,
  State,
  Directions,
  gestureHandlerRootHOC,
  createNativeWrapper,
  Gesture,
  GestureDetector,
};
