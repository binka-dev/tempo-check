import { Slider } from "@miblanchard/react-native-slider";
import { useRoute } from "@react-navigation/native";
import prettyMilliseconds from "pretty-ms";
import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "react-native-paper";
import RecordedTrack from "../models/RecordedTrack";
import DriveTrackMapComponent from "./components/DriveTrackMapComponent";

function DriveDetailScreen() {
    const route = useRoute<any>()
    const recordedTrack: RecordedTrack = route.params!.recordedTrack
    const speedHistory = recordedTrack.locationHistory.map(location => {
        if (location.speed == null || location.speed <= 0) {
            return null
        }

        return {
            'value': location.speed * 3.6
        }
    }).filter(value => value != null)
    const maxSpeed = Math.max(...speedHistory.map(value => value!.value))
    const actualDuration = recordedTrack.locationHistory[recordedTrack.locationHistory.length - 1].timestamp - recordedTrack.locationHistory[0].timestamp
    let lastTimestamp = recordedTrack.locationHistory[0].timestamp

    const [speedLimit, setSpeedLimit] = useState(130 > maxSpeed ? maxSpeed : 130)
    const simulatedDuration = recordedTrack.locationHistory
        .map(value => {
            const result = {speed: value.speed ? value.speed: 0, duration: value.timestamp - lastTimestamp}
            lastTimestamp = value.timestamp
            return result
        })
        .reduce((accumulator, currentValue) => {
            if (currentValue.speed > speedLimit / 3.6) {
                const factor = currentValue.speed / (speedLimit / 3.6)
                return accumulator + currentValue.duration * factor
            }

            return  currentValue.duration + accumulator
            
        }, 0)

    const {height, width} = useWindowDimensions();
    return (
        <ScrollView>
            <DriveTrackMapComponent 
                disabledInteraction={false}
                recordedTrack={recordedTrack}
                height={200}
            />
            <Text variant="headlineSmall" style={{margin: 5}}>Geschwindigkeitsverlauf</Text>
            <View style={{margin: 5}}>
                <LineChart
                    data={speedHistory as any}
                    initialSpacing={0}
                    adjustToWidth={true}
                    width={width - 80}
                    disableScroll={true}
                    yAxisLabelSuffix=" km/h"
                    yAxisLabelWidth={70}
                    showReferenceLine1={true}
                    referenceLine1Position={speedLimit}
                    referenceLine1Config={{color: 'orange', thickness: 3, width: width - 100} as any}
                    curved={true}
                    hideDataPoints={true}
                    xAxisLength={width - 90}
                />
                <Text variant="headlineSmall" >Simulation</Text>
                <View style={{margin: 5}}>
                    <Text variant="bodyLarge" style={{marginBottom: 10}}>Hier kannst du das Tempolimit simulieren, um zu sehen, wie sich die Geschwindigkeitsverteilung verändert.</Text>
                    <Text variant="labelLarge">Simuliertes Tempolimit: {Math.round(speedLimit)} km/h</Text>
                    <Text variant="labelLarge">Derzeitige Dauer: {prettyMilliseconds(actualDuration)}</Text>
                    <Text variant="labelLarge">Simulierte Dauer: {prettyMilliseconds(simulatedDuration)}</Text>
                    <Text variant="labelLarge">Zusätzliche Zeit: {prettyMilliseconds(simulatedDuration - actualDuration)}</Text>
                    <Slider
                        minimumValue={10}
                        step={10}
                        maximumValue={maxSpeed}
                        value={speedLimit}
                        onValueChange={value => setSpeedLimit(value as number)}
                    />
                </View>
            </View>
        </ScrollView>
    )
}

export default DriveDetailScreen;