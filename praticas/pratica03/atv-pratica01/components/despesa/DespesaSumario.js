import { View, Text, StyleSheet } from 'react-native';

function DespesaSumario({ despesas, periodo }) {
  const receitas = despesas.filter(d => d.category?.isIncome).reduce((s, d) => s + Number(d.value ?? d.valor), 0);
  const gastos = despesas.filter(d => !d.category?.isIncome).reduce((s, d) => s + Number(d.value ?? d.valor), 0);
  const saldo = receitas - gastos;
  return (
    <View style={styles.container}>
      <Text style={styles.periodo}>{periodo}</Text>
      <Text style={styles.total}>Saldo: R$ {saldo.toFixed(2)}</Text>
      <Text style={styles.sub}>Receitas: R$ {receitas.toFixed(2)}  |  Gastos: R$ {gastos.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#4a90d9', padding: 16, alignItems: 'center', marginBottom: 4 },
  periodo: { color: '#fff', fontSize: 13 },
  total: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  sub: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 },
});

export default DespesaSumario;
