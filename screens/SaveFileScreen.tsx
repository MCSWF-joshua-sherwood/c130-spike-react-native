import {Button, StyleSheet} from "react-native";
import {Text, View} from '@/components/Themed';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {Row} from "@/screens/TextDisplayScreen";
import {useEffect, useState} from "react";
import {IntentLauncherParams, startActivityAsync,} from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
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
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

    const createFile = async () => {
        if (permissionResponse?.status !== 'granted') {
            await requestPermission();
        }

        try {
            const intentParams: IntentLauncherParams = {
                type: 'application/json',
                extra: {
                    'android.intent.extra.TITLE': "tmp" + fileName,
                },
                category: 'android.intent.category.OPENABLE',
            };

            const result = await startActivityAsync(
                'android.intent.action.CREATE_DOCUMENT',
                intentParams
            );

            if (result && result.resultCode === -1 && result.data) { // -1 indicates RESULT_OK

                const rgxExpMatchArray = result.data.match(/(?<=dat=).*(?=\.\.\.)/gi);

                console.log(rgxExpMatchArray);

                if (rgxExpMatchArray && rgxExpMatchArray.length > 0) {
                    const uri = rgxExpMatchArray[0] + fileName;
                    console.log('File created at:', uri);
                    console.log('result:', JSON.stringify(result, null , 4));
                    return uri;
                }

            } else {
                console.log('File creation cancelled or failed.');
            }
        } catch (error) {
            console.error('Error creating file:', error);
        }
    }

    const onPress = async () => {
        try {
            const allRows = await getAllFromDb();
            const payload = JSON.stringify(allRows);
            console.log(payload);

            const path = `${RNFS.DownloadDirectoryPath}/Reports/my-report-3.json`;

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
