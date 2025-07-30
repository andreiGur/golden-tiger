import { View, Text } from '@/components/Themed';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Pressable, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { getItem, setItem } from '@/utils/storage';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  notes?: string;
}

const STORAGE_KEY = 'goals';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const saved = await getItem(STORAGE_KEY);
      if (saved) setGoals(saved);
      setLoading(false);
    })();
  }, []);

  const openModal = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setNotes('');
    setError('');
    setModalVisible(true);
  };

  const openEditModal = (goal: Goal) => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate);
    setNotes(goal.notes || '');
    setError('');
    setEditId(goal.id);
    setModalVisible(true);
  };

  const handleAddOrEdit = async () => {
    if (!name || !targetAmount || !currentAmount || !targetDate) {
      setError('All fields except notes are required.');
      return;
    }
    const tgt = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount);
    if (isNaN(tgt) || tgt <= 0) {
      setError('Target amount must be a positive number.');
      return;
    }
    if (isNaN(curr) || curr < 0) {
      setError('Current amount must be zero or positive.');
      return;
    }
    let updated;
    if (editId) {
      updated = goals.map((g) =>
        g.id === editId
          ? { ...g, name, targetAmount: tgt, currentAmount: curr, targetDate, notes }
          : g
      );
    } else {
      const goal: Goal = {
        id: Date.now().toString(),
        name,
        targetAmount: tgt,
        currentAmount: curr,
        targetDate,
        notes,
      };
      updated = [goal, ...goals];
    }
    setGoals(updated);
    await setItem(STORAGE_KEY, updated);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    await setItem(STORAGE_KEY, updated);
  };

  const closeModal = () => {
    setModalVisible(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setNotes('');
    setError('');
    setEditId(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Goals & Progress</Text>
      <Pressable style={styles.addBtn} onPress={openModal}>
        <Text style={styles.addBtnText}>+ Add Goal</Text>
      </Pressable>
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 32 }} />
      ) : goals.length === 0 ? (
        <Text style={{ marginTop: 32, color: '#888' }}>No goals yet.</Text>
      ) : (
        goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          return (
            <View key={goal.id} style={styles.card}>
              <Text style={styles.title}>{goal.name}</Text>
              <Text style={styles.detail}>Target: ${goal.targetAmount}</Text>
              <Text style={styles.detail}>Current: ${goal.currentAmount}</Text>
              <Text style={styles.detail}>Target Date: {goal.targetDate}</Text>
              {goal.notes ? <Text style={styles.notes}>Notes: {goal.notes}</Text> : null}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.progressText}>{percent}% complete</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Pressable style={[styles.editBtn, { marginRight: 8 }]} onPress={() => openEditModal(goal)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(goal.id)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Goal' : 'Add Goal'}</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Buy a house"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>Target Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50000"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
            <Text style={styles.label}>Current Saved ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10000"
              keyboardType="numeric"
              value={currentAmount}
              onChangeText={setCurrentAmount}
            />
            <Text style={styles.label}>Target Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={targetDate}
              onChangeText={setTargetDate}
            />
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional notes"
              value={notes}
              onChangeText={setNotes}
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
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
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
  error: {
    color: '#D7263D',
    fontWeight: 'bold',
    marginBottom: 6,
  },
}); 