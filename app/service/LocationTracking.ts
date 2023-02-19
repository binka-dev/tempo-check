import Geolocation from "@react-native-community/geolocation";
import { Store } from "@reduxjs/toolkit";
import { PermissionsAndroid, Platform } from "react-native";
import RecordedTrack from "../models/RecordedTrack";
import UserLocation from "../models/UserLocation";
import { setTracking, disableTracking } from "../redux/slices/location/TrackingSlice";

Geolocation.setRNConfiguration({
    authorizationLevel: "always",
    skipPermissionRequests: false
})


class LocationTracking {
    private _trackingId: number|null = null;
    private _store: Store;
    private _exactTracking: boolean = false;
    private _locationHistory: UserLocation[] = [];

    constructor(store: Store) {
        this._store = store
    }

    public async startTrackingIfNotAlreadyStarted() {
        if (Platform.OS == "android") {
            const permission_promises = [
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION),
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION)]
            const result = await Promise.all(permission_promises)
            if (!result.every(permission => permission)) {
                PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
                ])
            }
        }

        if (this._trackingId == null) {
            // Starting with an unexact tracking in order to get notified when the user starts moving
            console.log("Starting unexact tracking")
            this._trackingId = Geolocation.watchPosition(
                success => {
                    console.log("Location retrieved", success)

                    let newLocation: UserLocation = {
                        latitude: success.coords.latitude, 
                        longitude: success.coords.longitude,
                        speed: success.coords.speed,
                        timestamp: success.timestamp
                    }
                    
                    if (newLocation.speed != null && newLocation.speed > 30 / 3.6) {
                        // The user has moved more than 30km/h, we can start tracking more precisely
                        console.log("Starting exact tracking")
                        // TODO: Notification
                        this._startExactTracking();
                    }
                },
                error => {
                    console.log("error", error)
                }
            , {
                maximumAge: 10 * 1000,
                timeout: 60 * 1000,
                interval: 60 * 1000,
                fastestInterval: 1 * 1000,
                enableHighAccuracy: Platform.OS == 'android' ? true : false, // Depending on the platform cause the android emulator does not seem to work otherwise...
                useSignificantChanges: true
            });
        }
    }

    private _startExactTracking() {
        Geolocation.clearWatch(this._trackingId!);
        this._locationHistory = [];
        //Using setInterval as GeoLocation.watchPosition ist not working as expected on android....
        this._exactTracking = true;
        this._trackingId = setInterval(() => {
            Geolocation.getCurrentPosition(
                success => {
                    let speed_in_kmh = Math.floor(success.coords.speed == null ? 0 : success.coords.speed * 3.6)
                    
                    console.log("Exact location retrieved", success)
                    console.log("Speed: " + speed_in_kmh)
                    this._store.dispatch(setTracking(speed_in_kmh))
                    let newLocation: UserLocation = {
                        latitude: success.coords.latitude, 
                        longitude: success.coords.longitude,
                        speed: success.coords.speed,
                        timestamp: success.timestamp
                    }
                    this._locationHistory.push(newLocation)
                    let fastestSpeedInPastMinute = this._fastestSpeedInPastMinutes(1);
                    console.log("Fastest speed in past minute: " + fastestSpeedInPastMinute)
                    if (fastestSpeedInPastMinute < 30 / 3.6) {
                        // The user has not been moving for the last minute
                        console.log("Stopping exact tracking, starting unexact tracking again")
                        let recordedTrack: RecordedTrack = {locationHistory: this._locationHistory, start_timestamp: this._locationHistory[0].timestamp}
                        this._store.dispatch(disableTracking(recordedTrack));
                        clearInterval(this._trackingId!)
                        this._exactTracking = false;
                        this._trackingId = null;
                        this.startTrackingIfNotAlreadyStarted();              
                    }
                }, 
                error => console.log(error), 
                {
                    maximumAge: 3000,
                    timeout: 3000,
                    enableHighAccuracy: true
                }
            )
        }, 3000)

    }

    public stopTracking() {
        console.log("Stopping tracking")
        if (this._trackingId != null) {
            if (this._exactTracking) {
                clearInterval(this._trackingId);
            } else {
                Geolocation.clearWatch(this._trackingId);
            }
            this._trackingId = null;
            this._exactTracking = false;
        }
    }

    private _fastestSpeedInPastMinutes(minutes: number) {
        let now = new Date().getTime();
        let fiveMinutesAgo = now - minutes * 60 * 1000;
        let filteredHistory = this._locationHistory.filter(location => location.timestamp > fiveMinutesAgo);
        let speeds = filteredHistory.map(location => location.speed ?? 0);
        return Math.max(...speeds);
    }
}

export default LocationTracking;