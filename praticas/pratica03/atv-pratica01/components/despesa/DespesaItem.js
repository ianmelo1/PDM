import { View, Text, Pressable, StyleSheet } from 'react-native';

function getDataFormatada(data) {
  const d = new Date(data);
  return d.getDate().toString().padStart(2, '0') + '/' +
    (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
    d.getFullYear();
}

function DespesaItem({ item, onLongPress }) {
  return (
    <Pressable onLongPress={() => onLongPress && onLongPress(item)}>
      <View style={styles.itemContainer}>
        <View style={styles.itemText}>
          <Text style={styles.descricao}>{item.description ?? item.descricao}</Text>
          <Text style={styles.data}>{getDataFormatada(item.date ?? item.data)}</Text>
          <Text style={styles.categoria}>{item.category?.displayName ?? 'Sem categoria'}</Text>
        </View>
        <Text style={[styles.valor, { color: item.category?.isIncome ? 'green' : 'red' }]}>
          {item.category?.isIncome ? '+' : '-'} R$ {Number(item.value ?? item.valor).toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 8, marginVertical: 4,
    padding: 10,
    borderWidth: 1, borderColor: '#ddd',
  },
  itemText: { flex: 1 },
  descricao: { fontSize: 15 },
  data: { fontSize: 12, color: '#888', marginTop: 2 },
  categoria: { fontSize: 12, color: '#aaa', marginTop: 1 },
  valor: { fontSize: 15, fontWeight: 'bold', paddingLeft: 8 },
});

export default DespesaItem;
