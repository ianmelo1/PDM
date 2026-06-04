import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useGlobal } from '../context/GlobalState';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const screenWidth = Dimensions.get('window').width;

export default function Resumo() {
  const { transactions, categories, loading, refresh } = useGlobal();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  function changeMonth(dir) {
    if (dir === -1 && month === 1) { setMonth(12); setYear(y => y - 1); }
    else if (dir === 1 && month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + dir);
  }

  const filtered = transactions.filter(tx => {
    const d = new Date(tx.date ?? tx.data);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const receitas = filtered.filter(tx => tx.category?.isIncome).reduce((s, tx) => s + Number(tx.value), 0);
  const despesas = filtered.filter(tx => !tx.category?.isIncome).reduce((s, tx) => s + Number(tx.value), 0);
  const saldo = receitas - despesas;

  const pieData = categories
    .filter(cat => !cat.isIncome)
    .map(cat => {
      const total = filtered
        .filter(tx => tx.categoryId === cat.id)
        .reduce((s, tx) => s + Number(tx.value), 0);
      return { name: cat.displayName, population: total, color: cat.background, legendFontColor: '#444', legendFontSize: 13 };
    })
    .filter(d => d.population > 0);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filter}>
        <Pressable onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color="#4a90d9" />
        </Pressable>
        <Text style={styles.filterText}>{MONTHS[month - 1]} {year}</Text>
        <Pressable onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color="#4a90d9" />
        </Pressable>
      </View>

      <View style={styles.cards}>
        <View style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
          <Text style={styles.cardLabel}>Receitas</Text>
          <Text style={[styles.cardValue, { color: '#2e7d32' }]}>R$ {receitas.toFixed(2)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#ffebee' }]}>
          <Text style={styles.cardLabel}>Despesas</Text>
          <Text style={[styles.cardValue, { color: '#c62828' }]}>R$ {despesas.toFixed(2)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: saldo >= 0 ? '#e3f2fd' : '#fff3e0', flex: 1 }]}>
          <Text style={styles.cardLabel}>Saldo</Text>
          <Text style={[styles.cardValue, { color: saldo >= 0 ? '#1565c0' : '#e65100' }]}>
            R$ {saldo.toFixed(2)}
          </Text>
        </View>
      </View>

      {pieData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Despesas por Categoria</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 24}
            height={200}
            chartConfig={{ color: () => '#000' }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </View>
      ) : (
        <Text style={styles.empty}>Sem despesas neste período.</Text>
      )}

      {categories.map(cat => {
        const total = filtered
          .filter(tx => tx.categoryId === cat.id)
          .reduce((s, tx) => s + Number(tx.value), 0);
        if (total === 0) return null;
        return (
          <View key={cat.id} style={styles.catRow}>
            <View style={[styles.catDot, { backgroundColor: cat.background }]} />
            <Text style={styles.catName}>{cat.displayName}</Text>
            <Text style={[styles.catTotal, { color: cat.isIncome ? '#2e7d32' : '#c62828' }]}>
              R$ {total.toFixed(2)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, gap: 24 },
  filterText: { fontSize: 16, fontWeight: '600', minWidth: 90, textAlign: 'center' },
  cards: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  card: { flex: 1, minWidth: 120, borderRadius: 10, padding: 14, alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#555', marginBottom: 4 },
  cardValue: { fontSize: 17, fontWeight: 'bold' },
  chartContainer: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 12 },
  chartTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 15 },
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 4, borderRadius: 8, padding: 12 },
  catDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  catName: { flex: 1, fontSize: 14 },
  catTotal: { fontSize: 14, fontWeight: 'bold' },
});
