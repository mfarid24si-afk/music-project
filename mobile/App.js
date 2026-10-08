import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('=== SPOTIRID CRASH CAUGHT BY BOUNDARY ===');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Component stack:', info?.componentStack);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Terjadi Kesalahan di Aplikasi:</Text>
          <ScrollView style={styles.errorScroll}>
            <Text style={styles.errorText}>
              {String(this.state.error?.message || this.state.error)}
            </Text>
            <Text style={styles.stackText}>
              {String(this.state.error?.stack || '')}
            </Text>
            <Text style={styles.stackText}>
              {String(this.state.info?.componentStack || '')}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AudioProvider>
          <StatusBar style="light" />
          <HomeScreen />
        </AudioProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0d0e11',
    padding: 24,
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorScroll: {
    flex: 1,
    backgroundColor: '#17181c',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stackText: {
    color: '#9a9ca6',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
