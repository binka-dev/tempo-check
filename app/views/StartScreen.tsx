import React, { useState } from 'react';
import { FlatList, Linking, SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Card, Text } from 'react-native-paper';
import { useAppSelector } from '../hooks';
import DriveTrackCardComponent from './components/DriveTrackCardComponent';

function StartScreen({navigation}: {navigation: any}) {

    let [noPermissions, setNoPermissions] = useState(false)

    const current_speed = useAppSelector(state => state.location_tracking.speed)
    const tracking_status = useAppSelector(state => state.location_tracking.tracking)
    const past_trips = useAppSelector(state => state.location_tracking.past_tracks)
    const past_trips_sorted = Array.from(past_trips).sort((a, b) => b.start_timestamp - a.start_timestamp)

    const card_list: JSX.Element[] = []
    if (noPermissions) {
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
                    <Text style={{color: '#fff', marginTop: 10, fontWeight: 'bold'}} onPress={() => Linking.openURL('App-Prefs:LOCATION_SERVICES')}>Zu den Einstellungen</Text>
                </Card.Content>
            </Card>
        )
    }

    if (tracking_status) {
        card_list.push(
            <Card style={{...styles.cardStyle, ...styles.successCard}}>
                <Card.Title 
                    title="Aufzeichnung läuft" 
                    titleVariant='headlineSmall' 
                    titleStyle={{color: '#fff'}}
                    left={() => <Icon name="location-arrow" size={24} color="#fff"/>}
                />
                <Card.Content>
                    <Text style={{color: '#fff'}}>Die Aufzeichnung läuft gerade. In Kürze erscheint hier deine Fahrt! Du fährst gerade {current_speed} km/h</Text>
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
        marginBottom: 10,
    },
    errorCard: {
        backgroundColor: '#D0342C',
    },
    successCard: {
        backgroundColor: '#2ECC71'
    }
})

export default StartScreen;