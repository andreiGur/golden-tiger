import { View, Text } from '@/components/Themed';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Pressable, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getItem, setItem } from '@/utils/storage';
import { Dimensions } from 'react-native';

interface Investment {
  id: string;
  type: string;
  name: string;
  amount: number;
  date: string;
  notes?: string;
}

const STORAGE_KEY = 'portfolio';

const investmentTypes = [
  'Stock',
  'Real Estate',
  'Bond',
  'Mutual Fund',
  'Crypto',
  'Other',
];

export default function PortfolioScreen() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState('Stock');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const saved = await getItem(STORAGE_KEY);
      if (saved) setInvestments(saved);
      setLoading(false);
    })();
  }, []);

  const openModal = () => {
    setType('Stock');
    setName('');
    setAmount('');
    setDate('');
    setNotes('');
    setError('');
    setModalVisible(true);
  };

  const openEditModal = (inv: Investment) => {
    setType(inv.type);
    setName(inv.name);
    setAmount(inv.amount.toString());
    setDate(inv.date);
    setNotes(inv.notes || '');
    setError('');
    setEditId(inv.id);
    setModalVisible(true);
  };

  const handleAddOrEdit = async () => {
    if (!name || !amount || !date) {
      setError('Name, amount, and date are required.');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    let updated;
    if (editId) {
      updated = investments.map((inv) =>
        inv.id === editId
          ? { ...inv, type, name, amount: amt, date, notes }
          : inv
      );
    } else {
      const inv: Investment = {
        id: Date.now().toString(),
        type,
        name,
        amount: amt,
        date,
        notes,
      };
      updated = [inv, ...investments];
    }
    setInvestments(updated);
    await setItem(STORAGE_KEY, updated);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    const updated = investments.filter((inv) => inv.id !== id);
    setInvestments(updated);
    await setItem(STORAGE_KEY, updated);
  };

  const closeModal = () => {
    setModalVisible(false);
    setType('Stock');
    setName('');
    setAmount('');
    setDate('');
    setNotes('');
    setError('');
    setEditId(null);
  };

  // Portfolio value summary
  const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);

  // Prepare chart data: sort by date, accumulate value
  const chartData = React.useMemo(() => {
    if (investments.length === 0) return null;
    // Sort by date ascending
    const sorted = [...investments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const labels: string[] = [];
    const values: number[] = [];
    sorted.forEach((inv) => {
      cumulative += inv.amount;
      labels.push(inv.date.length > 5 ? inv.date.slice(5) : inv.date); // show MM-DD or date
      values.push(cumulative);
    });
    return { labels, values };
  }, [investments]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Portfolio Tracker</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Portfolio Value: <Text style={{color:'#D7263D', fontWeight:'bold'}}>${totalValue.toFixed(2)}</Text></Text>
      </View>
      {chartData && chartData.values.length > 1 && (
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{ data: chartData.values }],
          }}
          width={Dimensions.get('window').width - 32}
          height={180}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(215, 38, 61, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: { borderRadius: 8 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#FFD700' },
          }}
          bezier
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}
      <Pressable style={styles.addBtn} onPress={openModal}>
        <Text style={styles.addBtnText}>+ Add Investment</Text>
      </Pressable>
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 32 }} />
      ) : investments.length === 0 ? (
        <Text style={{ marginTop: 32, color: '#888' }}>No investments yet.</Text>
      ) : (
        investments.map((inv) => (
          <View key={inv.id} style={styles.card}>
            <Text style={styles.title}>{inv.name}</Text>
            <Text style={styles.type}>{inv.type}</Text>
            <Text style={styles.detail}>Amount: ${inv.amount}</Text>
            <Text style={styles.detail}>Date: {inv.date}</Text>
            {inv.notes ? <Text style={styles.notes}>Notes: {inv.notes}</Text> : null}
            <View style={styles.cardActions}>
              <Pressable style={styles.editBtn} onPress={() => openEditModal(inv)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(inv.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Investment' : 'Add Investment'}</Text>
            <Text style={styles.label}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {investmentTypes.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={styles.typeBtnText}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apple Stock"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1000"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
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
  type: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
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
  summaryBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  summaryText: {
    fontWeight: 'bold',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
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
}); 