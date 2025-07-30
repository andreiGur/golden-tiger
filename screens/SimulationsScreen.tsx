import { View, Text } from '@/components/Themed';
import { investmentScenarios, InvestmentScenario } from '@/data/investmentScenarios';
import { ScrollView, StyleSheet, Pressable, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';

interface SimulationResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  amount: number;
  years: number;
  projectedReturn: number;
  date: string;
}

const STORAGE_KEY = 'simulations';

export default function SimulationsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<InvestmentScenario | null>(null);
  const [amount, setAmount] = useState('');
  const [years, setYears] = useState('');
  const [projectedReturn, setProjectedReturn] = useState<number | null>(null);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const saved = await getItem(STORAGE_KEY);
      if (saved) setSimulations(saved);
      setLoading(false);
    })();
  }, []);

  const openModal = (scenario: InvestmentScenario) => {
    setSelectedScenario(scenario);
    setAmount('');
    setYears('');
    setProjectedReturn(null);
    setError('');
    setFeedback('');
    setModalVisible(true);
  };

  const openEditModal = (sim: SimulationResult) => {
    setSelectedScenario(
      investmentScenarios.find((s) => s.id === sim.scenarioId) || null
    );
    setAmount(sim.amount.toString());
    setYears(sim.years.toString());
    setProjectedReturn(sim.projectedReturn);
    setError('');
    setFeedback('');
    setEditId(sim.id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const updated = simulations.filter((sim) => sim.id !== id);
    setSimulations(updated);
    await setItem(STORAGE_KEY, updated);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedScenario(null);
    setAmount('');
    setYears('');
    setProjectedReturn(null);
    setError('');
    setFeedback('');
    setEditId(null);
  };

  // Remove setError from validateInputs, make it pure
  const isValid = () => {
    const amt = parseFloat(amount);
    const yrs = parseInt(years);
    return (
      !!amount && !!years &&
      !isNaN(amt) && amt > 0 &&
      !isNaN(yrs) && yrs > 0
    );
  };

  const handleSimulate = async () => {
    if (!selectedScenario) return;
    if (!amount || !years) {
      setError('Please enter both amount and years.');
      return;
    }
    const amt = parseFloat(amount);
    const yrs = parseInt(years);
    if (isNaN(amt) || amt <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (isNaN(yrs) || yrs <= 0) {
      setError('Years must be a positive integer.');
      return;
    }
    setError('');
    // Compound interest formula: A = P * (1 + r)^n
    const r = selectedScenario.historicalReturn / 100;
    const result = amt * Math.pow(1 + r, yrs);
    setProjectedReturn(result);
    let updated;
    if (editId) {
      // Edit existing
      updated = simulations.map((sim) =>
        sim.id === editId
          ? {
              ...sim,
              scenarioId: selectedScenario.id,
              scenarioName: selectedScenario.name,
              amount: amt,
              years: yrs,
              projectedReturn: result,
              date: new Date().toLocaleString(),
            }
          : sim
      );
      setFeedback('Simulation updated!');
    } else {
      // New simulation
      const sim: SimulationResult = {
        id: Date.now().toString(),
        scenarioId: selectedScenario.id,
        scenarioName: selectedScenario.name,
        amount: amt,
        years: yrs,
        projectedReturn: result,
        date: new Date().toLocaleString(),
      };
      updated = [sim, ...simulations];
      setFeedback('Simulation saved!');
    }
    setSimulations(updated);
    await setItem(STORAGE_KEY, updated);
    setEditId(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Investment Simulations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 32 }} />
      ) : (
        <>
          {simulations.length > 0 && (
            <View style={styles.pastSimulations}>
              <Text style={styles.pastHeader}>Past Simulations</Text>
              {simulations.slice(0, 5).map((sim) => (
                <View key={sim.id} style={styles.simResult}>
                  <Text style={styles.simText}>{sim.scenarioName}: Invested ${sim.amount} for {sim.years} yrs → ${sim.projectedReturn.toFixed(2)} ({sim.date})</Text>
                  <View style={styles.simActions}>
                    <Pressable style={styles.editBtn} onPress={() => openEditModal(sim)}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.deleteBtn} onPress={() => handleDelete(sim.id)}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
          {investmentScenarios.map((scenario) => (
            <View key={scenario.id} style={styles.card}>
              <Text style={styles.title}>{scenario.name}</Text>
              <Text style={styles.type}>{scenario.type.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.desc}>{scenario.description}</Text>
              <Text style={styles.detail}>Avg. Return: {scenario.historicalReturn}%</Text>
              <Text style={styles.detail}>Risk: {scenario.riskLevel.toUpperCase()}</Text>
              <Pressable style={styles.button} onPress={() => openModal(scenario)}>
                <Text style={styles.buttonText}>Simulate Investment</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedScenario?.name}</Text>
            <Text style={styles.modalDesc}>{selectedScenario?.description}</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount ($)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Years"
              keyboardType="numeric"
              value={years}
              onChangeText={setYears}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[styles.button, !isValid() && { opacity: 0.5 }]}
              onPress={handleSimulate}
              disabled={!isValid()}
            >
              <Text style={styles.buttonText}>Calculate</Text>
            </Pressable>
            {projectedReturn !== null && (
              <Text style={styles.resultText}>
                Projected Value: ${projectedReturn.toFixed(2)}
              </Text>
            )}
            {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
            <Button title="Close" onPress={closeModal} color="#D7263D" />
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
  pastSimulations: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 8,
  },
  pastHeader: {
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  simResult: {
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  simText: {
    fontSize: 13,
  },
  simActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  editBtn: {
    marginRight: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  editBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#D7263D',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
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
    color: '#D7263D', // Red
  },
  type: {
    fontSize: 14,
    color: '#FFD700', // Gold
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    marginBottom: 8,
  },
  detail: {
    fontSize: 13,
    marginBottom: 2,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#D7263D', // Red
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFD700', // Gold
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 6,
    color: '#D7263D',
  },
  modalDesc: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  error: {
    color: '#D7263D',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  feedback: {
    color: '#388e3c',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  resultText: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#D7263D',
    fontSize: 16,
  },
}); 