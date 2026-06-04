import { View } from 'react-native';
import DespesaSumario from './DespesaSumario';
import DespesaLista from './DespesaLista';

function DespesaSaida({ despesas, periodo, onLongPress }) {
  return (
    <View style={{ flex: 1 }}>
      <DespesaSumario despesas={despesas} periodo={periodo} />
      <DespesaLista despesas={despesas} onLongPress={onLongPress} />
    </View>
  );
}

export default DespesaSaida;
