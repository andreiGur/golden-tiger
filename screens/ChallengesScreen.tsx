import { View, Text } from '@/components/Themed';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Pressable, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { getItem, setItem } from '@/utils/storage';
import { investmentScenarios } from '@/data/investmentScenarios';

interface Challenge {
  id: string;
  name: string;
  sector: string;
  amount: number;
  startDate: string;
  simulatedReturn: number;
  scenarioName: string;
}

const STORAGE_KEY = 'challenges';
const sectors = ['Tech', 'Real Estate', 'Bonds', 'Index Fund', 'Other'];

function getRandomScenario(sector: string) {
  // Pick a scenario matching the sector/type, fallback to any
  const match = investmentScenarios.find(s => s.name.toLowerCase().includes(sector.toLowerCase()))
    || investmentScenarios[Math.floor(Math.random() * investmentScenarios.length)];
  return match;
}

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [sector, setSector] = useState('Tech');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const saved = await getItem(STORAGE_KEY);
      if (saved) setChallenges(saved);
      setLoading(false);
    })();
  }, []);

  const openModal = () => {
    setName('');
    setSector('Tech');
    setAmount('');
    setStartDate('');
    setError('');
    setEditId(null);
    setModalVisible(true);
  };

  const openEditModal = (challenge: Challenge) => {
    setName(challenge.name);
    setSector(challenge.sector);
    setAmount(challenge.amount.toString());
    setStartDate(challenge.startDate);
    setError('');
    setEditId(challenge.id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setName('');
    setSector('Tech');
    setAmount('');
    setStartDate('');
    setError('');
    setEditId(null);
  };

  const handleAddOrEdit = async () => {
    if (!name || !sector || !amount || !startDate) {
      setError('All fields are required.');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    const scenario = getRandomScenario(sector);
    const simulatedReturn = amt * (1 + scenario.historicalReturn / 100);
    let updated;
    if (editId) {
      updated = challenges.map((c) =>
        c.id === editId
          ? { ...c, name, sector, amount: amt, startDate, simulatedReturn, scenarioName: scenario.name }
          : c
      );
    } else {
      const challenge: Challenge = {
        id: Date.now().toString(),
        name,
        sector,
        amount: amt,
        startDate,
        simulatedReturn,
        scenarioName: scenario.name,
      };
      updated = [challenge, ...challenges];
    }
    setChallenges(updated);
    await setItem(STORAGE_KEY, updated);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    const updated = challenges.filter((c) => c.id !== id);
    setChallenges(updated);
    await setItem(STORAGE_KEY, updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Investment Challenges</Text>
      <Pressable style={styles.addBtn} onPress={openModal}>
        <Text style={styles.addBtnText}>+ New Challenge</Text>
      </Pressable>
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 32 }} />
      ) : challenges.length === 0 ? (
        <Text style={{ marginTop: 32, color: '#888' }}>No challenges yet.</Text>
      ) : (
        challenges.map((c) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.title}>{c.name}</Text>
            <Text style={styles.detail}>Sector: {c.sector}</Text>
            <Text style={styles.detail}>Amount: ${c.amount}</Text>
            <Text style={styles.detail}>Start Date: {c.startDate}</Text>
            <Text style={styles.detail}>Scenario: {c.scenarioName}</Text>
            <Text style={styles.result}>Simulated 1-Year Value: <Text style={{color:'#D7263D', fontWeight:'bold'}}>${c.simulatedReturn.toFixed(2)}</Text></Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable style={[styles.editBtn, { marginRight: 8 }]} onPress={() => openEditModal(c)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(c.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Challenge' : 'New Challenge'}</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tech Sector Challenge"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>Sector/Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {sectors.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.typeBtn, sector === s && styles.typeBtnActive]}
                  onPress={() => setSector(s)}
                >
                  <Text style={styles.typeBtnText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1000"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={editId ? 'Save Changes' : 'Add'} onPress={handleAddOrEdit} color="#D7263D" />
            <Button title="Cancel" onPress={closeModal} color="#888" />
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addBtnText: {
    color: '#D7263D',
    fontWeight: 'bold',
    fontSize: 16,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D7263D',
  },
  detail: {
    fontSize: 13,
    marginBottom: 2,
  },
  result: {
    fontSize: 14,
    color: '#388e3c',
    marginTop: 6,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#D7263D',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  editBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  editBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#D7263D',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#333',
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    fontSize: 16,
  },
  typeBtn: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  typeBtnActive: {
    backgroundColor: '#FFD700',
  },
  typeBtnText: {
    color: '#D7263D',
    fontWeight: 'bold',
  },
  error: {
    color: '#D7263D',
    fontWeight: 'bold',
    marginBottom: 6,
  },
}); 