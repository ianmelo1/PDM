import { FlatList, Text, StyleSheet } from 'react-native';
import DespesaItem from './DespesaItem';

function DespesaLista({ despesas, onLongPress }) {
  return (
    <FlatList
      data={despesas}
      renderItem={({ item }) => <DespesaItem item={item} onLongPress={onLongPress} />}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.empty}>Nenhuma despesa encontrada.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});

export default DespesaLista;
