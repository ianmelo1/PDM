import { useState, useCallback } from 'react';
import { View, Text, Modal, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DespesaSaida from '../components/despesa/DespesaSaida';
import { useGlobal } from '../context/GlobalState';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function TodasDespesas() {
  const navigation = useNavigation();
  const { transactions, loading, error, refresh, removeTransaction } = useGlobal();
  const [selectedTx, setSelectedTx] = useState(null);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  function changeMonth(dir) {
    if (month === 0) return;
    if (dir === -1 && month === 1) { setMonth(12); setYear(y => y - 1); }
    else if (dir === 1 && month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + dir);
  }

  const filtered = month === 0
    ? transactions
    : transactions.filter(tx => {
        const d = new Date(tx.date ?? tx.data);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

  const periodo = month === 0 ? 'Total' : `${MONTHS[month - 1]} ${year}`;

  function handleDelete() {
    Alert.alert('Excluir', `Excluir "${selectedTx.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          setSelectedTx(null);
          await removeTransaction(selectedTx.id);
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable onPress={refresh} style={styles.retryBtn}>
        <Text style={{ color: '#fff' }}>Tentar novamente</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filter}>
        <Pressable onPress={() => setMonth(0)} style={[styles.allBtn, month === 0 && styles.allBtnActive]}>
          <Text style={{ color: month === 0 ? '#fff' : '#4a90d9', fontSize: 13 }}>Todos</Text>
        </Pressable>
        <Pressable onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color={month === 0 ? '#ccc' : '#4a90d9'} />
        </Pressable>
        <Pressable onPress={() => month === 0 && setMonth(new Date().getMonth() + 1)}>
          <Text style={styles.filterText}>{month === 0 ? 'Selecionar' : `${MONTHS[month - 1]} ${year}`}</Text>
        </Pressable>
        <Pressable onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color={month === 0 ? '#ccc' : '#4a90d9'} />
        </Pressable>
      </View>

      <DespesaSaida despesas={filtered} periodo={periodo} onLongPress={setSelectedTx} />

      <Modal visible={!!selectedTx} transparent animationType="fade" onRequestClose={() => setSelectedTx(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedTx(null)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selectedTx?.description}</Text>
            <Pressable style={styles.modalBtn} onPress={() => {
              setSelectedTx(null);
              navigation.navigate('GerenciarDespesa', { transaction: selectedTx });
            }}>
              <Ionicons name="pencil" size={18} color="#4a90d9" />
              <Text style={[styles.modalBtnText, { color: '#4a90d9' }]}>Editar</Text>
            </Pressable>
            <Pressable style={styles.modalBtn} onPress={handleDelete}>
              <Ionicons name="trash" size={18} color="#c62828" />
              <Text style={[styles.modalBtnText, { color: '#c62828' }]}>Excluir</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, gap: 12 },
  filterText: { fontSize: 15, fontWeight: '600', minWidth: 100, textAlign: 'center' },
  allBtn: { borderWidth: 1, borderColor: '#4a90d9', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  allBtnActive: { backgroundColor: '#4a90d9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#c62828', marginBottom: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#4a90d9', padding: 10, borderRadius: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%', elevation: 8 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderTopWidth: 1, borderColor: '#eee' },
  modalBtnText: { fontSize: 16, fontWeight: '500' },
});
