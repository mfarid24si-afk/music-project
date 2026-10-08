import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <StatusBar style="light" />
        <HomeScreen />
      </AudioProvider>
    </SafeAreaProvider>
  );
}
