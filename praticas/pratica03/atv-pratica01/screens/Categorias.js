import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Alert, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobal } from '../context/GlobalState';

const COLORS = ['#DE9AC3','#DEA17B','#E6E088','#AB8FBE','#82C9DE','#FFB6B6','#B2DFDB','#F8BBD9','#DCEDC8','#E1BEE7'];

export default function Categorias() {
  const { categories, loading, refresh, addCategory, removeCategory } = useGlobal();
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [exibicao, setExibicao] = useState('');
  const [icone, setIcone] = useState('star');
  const [cor, setCor] = useState(COLORS[0]);
  const [isIncome, setIsIncome] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  function resetForm() {
    setNome(''); setExibicao(''); setIcone('star'); setCor(COLORS[0]); setIsIncome(false);
  }

  async function handleCreate() {
    if (!nome || !exibicao) { Alert.alert('Erro', 'Preencha nome e exibição.'); return; }
    setSaving(true);
    try {
      await addCategory({ name: nome.toLowerCase().replace(/\s/g, '_'), displayName: exibicao, icon: icone, background: cor, isIncome });
      resetForm();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erro', e.message ?? 'Não foi possível criar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(cat) {
    Alert.alert('Excluir', `Excluir categoria "${cat.displayName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try { await removeCategory(cat.id); }
          catch (e) { Alert.alert('Erro', e.message ?? 'Não foi possível excluir.'); }
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <FlatList
        data={categories}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 12 }}
        ListHeaderComponent={
          <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Nova Categoria</Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <View style={styles.catRow}>
            <View style={[styles.colorDot, { backgroundColor: item.background }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.catName}>{item.displayName}</Text>
              <Text style={styles.catMeta}>
                {item.isIncome ? 'Receita' : 'Despesa'} · {item.isDefault ? 'Padrão' : 'Personalizada'}
              </Text>
            </View>
            {!item.isDefault && (
              <Pressable onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Excluir</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Nova Categoria</Text>

          <Text style={styles.label}>Nome técnico (sem espaços)</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} autoCapitalize="none" placeholder="ex: saude" />

          <Text style={styles.label}>Nome de exibição</Text>
          <TextInput style={styles.input} value={exibicao} onChangeText={setExibicao} placeholder="ex: Saúde" />

          <Text style={styles.label}>Ícone (nome Material Icons)</Text>
          <TextInput style={styles.input} value={icone} onChangeText={setIcone} autoCapitalize="none" placeholder="ex: favorite" />

          <Text style={styles.label}>Cor</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <Pressable key={c} onPress={() => setCor(c)} style={[styles.colorCircle, { backgroundColor: c }, cor === c && styles.colorSelected]} />
            ))}
          </View>

          <Pressable style={[styles.typeBtn, isIncome && styles.typeBtnActive]} onPress={() => setIsIncome(v => !v)}>
            <Text style={{ color: isIncome ? '#fff' : '#2e7d32' }}>
              {isIncome ? '✓ Receita' : 'Marcar como Receita'}
            </Text>
          </Pressable>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => { resetForm(); setModalVisible(false); }}>
              <Text>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { backgroundColor: '#4a90d9', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  colorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  catName: { fontSize: 15, fontWeight: '500' },
  catMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteBtn: { backgroundColor: '#ffebee', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#c62828', fontSize: 13 },
  modal: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, marginTop: 12 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: '#333' },
  typeBtn: { marginTop: 16, borderWidth: 1, borderColor: '#2e7d32', borderRadius: 8, padding: 12, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#2e7d32' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: '#4a90d9', borderRadius: 8, padding: 14, alignItems: 'center' },
});
