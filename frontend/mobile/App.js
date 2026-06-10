import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/Splash/SplashScreen';
import { colors } from './src/styles/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <View style={styles.root}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      {showSplash ? (
        <View style={styles.splashOverlay}>
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.mobileBackground,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.mobileBackground,
  },
});
