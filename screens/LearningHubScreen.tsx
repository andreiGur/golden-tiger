import { View, Text } from '@/components/Themed';
import { ScrollView, StyleSheet } from 'react-native';
import React from 'react';

const learningContent = [
  {
    id: 'a1',
    type: 'Article',
    title: 'Value Investing Explained',
    description: 'Learn the principles of value investing and how to spot undervalued stocks.'
  },
  {
    id: 'a2',
    type: 'Article',
    title: 'Growth vs. Index Funds',
    description: 'Compare growth investing with index fund strategies.'
  },
  {
    id: 'v1',
    type: 'Video',
    title: 'How Bonds Work',
    description: 'A short video explaining the basics of bonds and fixed income.'
  },
  {
    id: 'i1',
    type: 'Infographic',
    title: 'Risk Diversification',
    description: 'Visual guide to diversifying your investments.'
  },
  {
    id: 'q1',
    type: 'Quick Fact',
    title: 'What is ROI?',
    description: 'ROI stands for Return on Investment, a key metric for evaluating performance.'
  },
  {
    id: 'q2',
    type: 'Quick Fact',
    title: 'Dividends',
    description: 'Dividends are payments made by a corporation to its shareholders.'
  },
];

export default function LearningHubScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Learning Hub</Text>
      {learningContent.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#D7263D',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#333',
  },
}); 