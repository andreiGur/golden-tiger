import { View, Text } from '@/components/Themed';
import { StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { setItem } from '@/utils/storage';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const handleGetStarted = async () => {
    await setItem('onboardingComplete', true);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Golden Tiger: Play Smart!</Text>
      <Text style={styles.subtitle}>Your offline investment learning and simulation tool.</Text>
      <View style={styles.highlights}>
        <Text style={styles.highlight}>• Simulate investments in stocks, real estate, bonds, and funds</Text>
        <Text style={styles.highlight}>• Track your real and simulated portfolio</Text>
        <Text style={styles.highlight}>• Learn with articles, videos, and quick facts</Text>
        <Text style={styles.highlight}>• Set goals and monitor your progress</Text>
        <Text style={styles.highlight}>• All features work offline!</Text>
      </View>
      <Pressable style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D7263D',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  highlights: {
    marginBottom: 32,
    width: '100%',
  },
  highlight: {
    fontSize: 15,
    color: '#FFD700',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#D7263D',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 