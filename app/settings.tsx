import { View, Text } from '@/components/Themed';
import { StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const handleReset = async () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all your app data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive', onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Data Reset', 'All app data has been deleted.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Pressable style={styles.settingBtn} onPress={handleReset}>
        <Text style={styles.settingBtnText}>Reset All Data</Text>
      </Pressable>
      <Pressable style={styles.settingBtn} onPress={() => Alert.alert('Coming Soon', 'Theme toggle coming soon!')}>
        <Text style={styles.settingBtnText}>Toggle Dark Mode (Coming Soon)</Text>
      </Pressable>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>App Info</Text>
        <Text style={styles.infoText}>Golden Tiger: Play Smart! v1.0.0</Text>
        <Text style={styles.infoText}>All features work offline. No data leaves your device.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D7263D',
    marginBottom: 24,
  },
  settingBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  settingBtnText: {
    color: '#D7263D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    marginTop: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontWeight: 'bold',
    color: '#D7263D',
    fontSize: 16,
    marginBottom: 6,
  },
  infoText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 2,
  },
}); 