import React, { useState } from 'react';
import { FlatList, Linking, SafeAreaView, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Card, Text } from 'react-native-paper';
import { useAppSelector } from '../hooks';
import DriveTrackCardComponent from './components/DriveTrackCardComponent';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';

function openSettings() {
    if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:LOCATION_SERVICES')
    } else {
        Linking.openSettings()
    }
}

function StartScreen({navigation}: {navigation: any}) {

    // Keep screen awake
    useKeepAwake()

    const showDebugCard = false

    // Get data from redux store
    const current_location = useAppSelector(state => state.location_tracking.current_location)
    const tracking_status = useAppSelector(state => state.location_tracking.tracking)
    const past_trips = useAppSelector(state => state.location_tracking.past_tracks)
    const location_permissions = useAppSelector(state => state.permissions.location_allowed)
    const past_trips_sorted = Array.from(past_trips).sort((a, b) => b.start_timestamp - a.start_timestamp)

    // Add all cards which should be shown to this list
    const card_list: JSX.Element[] = []
    if (!location_permissions) {
        card_list.push(
            <Card style={{...styles.cardStyle, ...styles.errorCard}}>
                <Card.Title 
                    title="Berechtigungen fehlen" 
                    titleVariant='headlineSmall' 
                    titleStyle={{color: '#fff'}}
                    left={() => <Icon name="exclamation-triangle" size={24} color="#fff"/>}
                />
                <Card.Content>
                    <Text style={{color: '#fff'}}>Um die App nutzen zu können, müssen Sie die Berechtigungen für die Ortungsfunktionen erteilen. Dies können Sie in den Einstellungen Ihres Handy machen.</Text>
                    <Text style={{color: '#fff', marginTop: 10, fontWeight: 'bold'}} onPress={openSettings}>Zu den Einstellungen</Text>
                </Card.Content>
            </Card>
        )
    } else if (tracking_status) {
        card_list.push(
            <Card style={{...styles.cardStyle, ...styles.successCard}}>
                <Card.Title 
                    title="Aufzeichnung läuft" 
                    titleVariant='headlineSmall' 
                    titleStyle={{color: '#fff'}}
                    left={() => <Icon name="location-arrow" size={24} color="#fff"/>}
                />
                <Card.Content>
                    <Text style={{color: '#fff'}}>Die Aufzeichnung läuft gerade. In Kürze erscheint hier deine Fahrt! Du fährst gerade {current_location && current_location.speed ? Math.floor(current_location.speed * 3.6) : 0} km/h</Text>
                </Card.Content>
            </Card>
        )

    } else {
        card_list.push(
            <Card style={{...styles.cardStyle}}>
                <Card.Title 
                    title="Beginne eine Fahrt" 
                    titleVariant='headlineSmall' 
                    left={() => <Icon name="car" size={24} />}
                />
                <Card.Content>
                    <Text>Alles bereit. Fahr einfach los und beginne eine Aufzeichnung automatisch!</Text>
                </Card.Content>
            </Card>
        )
    }

    if (showDebugCard) {
        card_list.push(
            <Card style={{...styles.cardStyle, ...styles.successCard}}>
                <Card.Title 
                    title="Debug Infos" 
                    titleVariant='headlineSmall' 
                    titleStyle={{color: '#fff'}}
                />
                <Card.Content>
                    <Text style={{color: '#fff'}}>{JSON.stringify(current_location)}</Text>
                </Card.Content>
            </Card>
        )
    }

    card_list.push(...past_trips_sorted.map((item) => 
        <DriveTrackCardComponent 
            recordedTrack={item} 
            key={item.start_timestamp} 
            onPress={() => navigation.navigate("DriveDetailScreen", {'recordedTrack': item})}
        />
    ))

    return (
        <SafeAreaView style={styles.container}>
            <Text variant='headlineMedium' style={{margin: 10}}>Aufgezeichnete Fahrten</Text>
            <FlatList style={{padding: 5, marginBottom: 10, paddingBottom: 20}} data={card_list} renderItem={({item}) => item}/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 10,
        height: '100%',
    },
    cardStyle: {
        padding: 10,
        marginBottom: 10
    },
    errorCard: {
        backgroundColor: '#D0342C',
    },
    successCard: {
        backgroundColor: '#2ECC71'
    }
})

export default StartScreen;