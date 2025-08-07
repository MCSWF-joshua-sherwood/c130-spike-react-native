import { View } from '@/components/Themed';
import { Button, GestureResponderEvent, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import * as SQLite from 'expo-sqlite';

export default function TextInputScreen() {
  const [val, setVal] = useState('');
  const [disabled, setDisabled] = useState(false);

  async function saveText(event: GestureResponderEvent) {
    setDisabled(true);
    const db = await SQLite.openDatabaseAsync('test_db');
    try {
      await db.runAsync('INSERT INTO test (value) VALUES (?)', val);
    } catch (err) {
      console.error(err);
    }
    console.info('db saved value:', val);
    setDisabled(false);
  }

  async function resetDB(event: GestureResponderEvent) {
    setDisabled(true);
    const db = await SQLite.openDatabaseAsync('test_db');
    try {
      await db.execAsync(`
        drop table if exists test;
        create table test (id integer primary key not null, value text not null);
        insert into test (value) values ('Auto-generated db text');
    `);
    console.log('db reset');
    } catch (err) {
      console.error(err);
    }
    setDisabled(false);
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder='Placeholder Text no?' onChangeText={setVal} value={val} />
      <Button title='save' disabled={disabled} onPress={saveText} />
      <Button title='reset db' disabled={disabled} onPress={resetDB} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
