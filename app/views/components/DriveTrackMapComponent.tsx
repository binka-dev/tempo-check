import React from "react";
import MapView, { LatLng, Polyline, Region } from "react-native-maps";
import RecordedTrack from "../../models/RecordedTrack";
import UserLocation from "../../models/UserLocation";

function __calculate_region(points: Array<LatLng>): Region {
    let minX: number, maxX: number, minY: number, maxY: number
    let additionalPadding = 0.01;

    // init first point
    (point => {
        minX = point.latitude
        maxX = point.latitude
        minY = point.longitude
        maxY = point.longitude
    })(points[0])

    // calculate rect
    points.map(point => {
        minX = Math.min(minX, point.latitude)
        maxX = Math.max(maxX, point.latitude)
        minY = Math.min(minY, point.longitude)
        maxY = Math.max(maxY, point.longitude)
    })

    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2
    const deltaX = (maxX - minX) + additionalPadding
    const deltaY = (maxY - minY) + additionalPadding

    return {
        latitude: midX,
        longitude: midY,
        latitudeDelta: deltaX,
        longitudeDelta: deltaY,
    }
}

function __calculate_speed_colors(points: Array<UserLocation>): Array<string> {
    let colors = new Array<string>()
    points.map(point => {
        if (point.speed == null) {
            colors.push('green')
        } else {
            let speed = point.speed * 3.6
            if (speed > 150) {
                colors.push('red')
            } else if (speed > 50) {
                colors.push('orange')
            } else {
                colors.push('green')
            }
        }
    })
    return colors
}

function DriveTrackMapComponent(props: {recordedTrack: RecordedTrack, disabledInteraction: boolean, onPress?: () => void, height: number}) {
    return (
        <MapView 
            style={{height: props.height}}
            zoomEnabled={!props.disabledInteraction}
            scrollEnabled={!props.disabledInteraction}
            rotateEnabled={!props.disabledInteraction}
            liteMode={props.disabledInteraction}
            initialRegion={__calculate_region(props.recordedTrack.locationHistory)}
            onPress={props.onPress}
        >
            <Polyline 
                coordinates={props.recordedTrack.locationHistory}
                strokeWidth={3}
                strokeColors={__calculate_speed_colors(props.recordedTrack.locationHistory)}
            />
        </MapView>
    )
}

export default DriveTrackMapComponent;