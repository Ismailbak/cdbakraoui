import React from 'react';
import { Animated, PanResponder, View } from 'react-native';

export function useSwipeGestures(onSwipeLeft, onSwipeRight) {
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }]),
      onPanResponderRelease: (e, { dx }) => {
        const swipeThreshold = 50;
        if (dx > swipeThreshold && onSwipeRight) {
          onSwipeRight();
        } else if (dx < -swipeThreshold && onSwipeLeft) {
          onSwipeLeft();
        }
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  return { panResponder, pan };
}

export function useSwipeToDelete(onDelete) {
  const pan = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, { dx }) => {
        if (dx < 0) {
          pan.setValue(dx);
        }
      },
      onPanResponderRelease: (e, { dx }) => {
        const deleteThreshold = -100;
        if (dx < deleteThreshold && onDelete) {
          onDelete();
        }
        Animated.timing(pan, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      },
    })
  ).current;

  return { panResponder, pan };
}
