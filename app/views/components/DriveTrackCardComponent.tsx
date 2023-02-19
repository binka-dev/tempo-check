import { StyleSheet } from "react-native"
import MapView, { LatLng, Polyline, Region } from "react-native-maps"
import { Card } from "react-native-paper"
import React from "react"
import RecordedTrack from "../../models/RecordedTrack"
import UserLocation from "../../models/UserLocation"
import DriveTrackMapComponent from "./DriveTrackMapComponent"

function DriveTrackCardComponent({recordedTrack, onPress}: {recordedTrack: RecordedTrack, onPress: () => void}) {
    const timeFormatted = new Date(recordedTrack.start_timestamp).toDateString()
    return (
        <Card style={{...styles.cardStyle}} onPress={onPress}>
            <Card.Title 
                title={"Fahrt am " + timeFormatted}
                titleVariant='headlineSmall' 
            />
            <Card.Content>
                <DriveTrackMapComponent 
                    disabledInteraction={true}
                    recordedTrack={recordedTrack}
                    onPress={onPress}
                    height={200}
                />
            </Card.Content>
        </Card>
    )
}

const styles = StyleSheet.create({
    cardStyle: {
        padding: 10,
        marginBottom: 10
    },
})

export default DriveTrackCardComponent