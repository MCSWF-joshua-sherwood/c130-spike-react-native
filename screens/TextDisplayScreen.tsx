import { Text, View } from '@/components/Themed';
import EditScreenInfo from '@/components/EditScreenInfo';
import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

export interface Row {
  id: number;
  value: string;
}

export default function TextDisplayScreen() {
  const [values, setValues] = useState<string[]>([]);

  async function loadValues(): Promise<void> {
  const db = await SQLite.openDatabaseAsync('test_db');
    const allRows = await db.getAllAsync<Row>('SELECT * FROM test');
    setValues(allRows.map(row => row.value));
  }

  useEffect(() => {
    loadValues();
  }, []);

  return (
    <View style={styles.container}>
      {values.map((value, index) => (
        <Text key={index}>{value}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
