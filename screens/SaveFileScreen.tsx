import {Button, StyleSheet} from "react-native";
import {Text, View} from '@/components/Themed';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {Row} from "@/screens/TextDisplayScreen";
import {useEffect, useState} from "react";
import RNFS from 'react-native-fs';

const fileName = 'output.txt'
const appDocumentUri = FileSystem.documentDirectory + fileName;

const getAllFromDb = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('test_db');
        return  await db.getAllAsync<Row>('SELECT * FROM test');
    } catch (error) {
        console.error(error);
    }
}

const prettifyFile = (jsonString: string) => JSON.stringify(JSON.parse(jsonString), null, 6);

const getSavedFile = async () => prettifyFile(await FileSystem.readAsStringAsync(appDocumentUri));

export default function SaveFileScreen() {
    const [fileContents, setFileContents] = useState('');

    const onPress = async () => {
        try {
            const allRows = await getAllFromDb();
            const payload = JSON.stringify(allRows);

            const path = `${RNFS.DownloadDirectoryPath}/Reports/my-report-4.json`;

            await RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/Reports`);
            try {
                await RNFS.writeFile(path, payload, 'utf8');
                console.log(`✅ JSON file saved to ${path}`);
            } catch (err) {
                console.error('Failed to save JSON file:', err);
            }

            console.log('Saved to:', path);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getSavedFile().then(setFileContents)
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
