import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobal } from '../context/GlobalState';

export default function GerenciarDespesa() {
  const navigation = useNavigation();
  const route = useRoute();
  const editing = route.params?.transaction;

  const { categories, addTransaction, updateTransaction } = useGlobal();

  const [descricao, setDescricao] = useState(editing?.description ?? '');
  const [valor, setValor] = useState(editing ? String(Number(editing.value)) : '');
  const [data, setData] = useState(editing ? new Date(editing.date) : new Date());
  const [categoriaId, setCategoriaId] = useState(editing?.categoryId ?? '');
  const [showPicker, setShowPicker] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Editar Despesa' : 'Nova Despesa' });
  }, [editing]);

  const categoriaSelected = categories.find(c => c.id === categoriaId);

  function handleChangeValor(text) {
    const clean = text.replace(',', '.');
    if (/^\d*\.?\d{0,2}$/.test(clean)) setValor(clean);
  }

  async function handleSave() {
    if (!descricao || !valor || !categoriaId) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        description: descricao,
        value: parseFloat(valor),
        date: data.toISOString(),
        categoryId: categoriaId,
      };
      if (editing) {
        await updateTransaction(editing.id, payload);
      } else {
        await addTransaction(payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar a despesa.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput style={styles.input} maxLength={50} value={descricao} onChangeText={setDescricao} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          maxLength={10}
          value={valor}
          onChangeText={handleChangeValor}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Data</Text>
        <Pressable onPress={() => setShowPicker(true)} style={styles.input}>
          <Text>{data.toLocaleDateString('pt-BR')}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={data}
            mode="date"
            display="default"
            onChange={(_, d) => { setShowPicker(false); if (d) setData(d); }}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoria</Text>
        <Pressable style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowCatModal(true)}>
          {categoriaSelected && <View style={[styles.catDot, { backgroundColor: categoriaSelected.background }]} />}
          <Text style={{ color: categoriaSelected ? '#000' : '#aaa' }}>
            {categoriaSelected ? categoriaSelected.displayName : 'Selecionar categoria'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.botao} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>{editing ? 'Atualizar' : 'Salvar'}</Text>}
      </Pressable>

      <Modal visible={showCatModal} animationType="slide" onRequestClose={() => setShowCatModal(false)}>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={styles.modalTitle}>Selecionar Categoria</Text>
          <FlatList
            data={categories}
            keyExtractor={c => c.id}
            renderItem={({ item }) => (
              <Pressable style={styles.catRow} onPress={() => { setCategoriaId(item.id); setShowCatModal(false); }}>
                <View style={[styles.catDot, { backgroundColor: item.background }]} />
                <Text style={{ fontSize: 15 }}>{item.displayName}</Text>
                <Text style={{ marginLeft: 'auto', color: item.isIncome ? '#2e7d32' : '#c62828', fontSize: 12 }}>
                  {item.isIncome ? 'Receita' : 'Despesa'}
                </Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.cancelBtn} onPress={() => setShowCatModal(false)}>
            <Text>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  inputContainer: { marginVertical: 10 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff', fontSize: 15 },
  botao: { marginTop: 20, backgroundColor: '#4a90d9', padding: 14, alignItems: 'center', borderRadius: 8 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: '#eee' },
  catDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  cancelBtn: { margin: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, alignItems: 'center' },
});
