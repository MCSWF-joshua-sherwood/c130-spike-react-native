import {Button, StyleSheet} from "react-native";
import { Text, View } from '@/components/Themed';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {Row} from "@/screens/TextDisplayScreen";
import {useEffect, useState} from "react";

const jsonPath = FileSystem.documentDirectory + 'output.json';

const test = async () => {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
    console.log('granted', permissions.granted);
}

const onPress = async () => {
    const db = await SQLite.openDatabaseAsync('test_db');
    const allRows = await db.getAllAsync<Row>('SELECT * FROM test');

    const serialized = JSON.stringify(allRows);
    try {
        await FileSystem.writeAsStringAsync(jsonPath, serialized);
    } catch (err) {
        console.error(err);
    }
}

const getSavedFile = async () => await FileSystem.readAsStringAsync(jsonPath);

const prettifyFile = (jsonString: string) => JSON.stringify(JSON.parse(jsonString), null, 2);

export default function SaveFileScreen() {
    const [fileContents, setFileContents] = useState('');

    useEffect(() => {
        getSavedFile().then((fileStr) => setFileContents(prettifyFile(fileStr)))
    }, [])

    return (
        <View style={styles.container}>
            <Button title="Save JSON from DB" onPress={onPress}/>
            <Text>{fileContents}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});
