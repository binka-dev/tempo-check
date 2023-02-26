import Geolocation from "@react-native-community/geolocation";
import { Store } from "@reduxjs/toolkit";
import { PermissionsAndroid, Platform } from "react-native";
import RecordedTrack from "../models/RecordedTrack";
import UserLocation from "../models/UserLocation";
import { setTracking, disableTracking, setCurrentLocation } from "../redux/slices/location/TrackingSlice";
import { setLocationAllowed } from "../redux/slices/PermissionsSlice";
import haversine from 'haversine-distance'

Geolocation.setRNConfiguration({
    authorizationLevel: "whenInUse",
    skipPermissionRequests: false
})

const speed_threshold_in_meters = 30 / 3.6

class LocationTracking {
    private _trackingId: number|null = null;
    private _store: Store;
    private _exactTracking: boolean = false;
    private _locationHistory: UserLocation[] = [];
    private _lastLocation: UserLocation|null = null;

    constructor(store: Store) {
        this._store = store
    }

    public async startTrackingIfNotAlreadyStarted() {
        if (Platform.OS == 'android') {
            const permission_promises = [
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)]
            const result = await Promise.all(permission_promises)
            if (!result.every(permission => permission)) {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ])
            }
        } 

        if (this._trackingId == null) {
            // Starting with an unexact tracking in order to get notified when the user starts moving
            console.log("Starting unexact tracking")
            this._trackingId = Geolocation.watchPosition(
                success => {
                    console.log("Location retrieved", success)

                    const newLocation: UserLocation = {
                        latitude: success.coords.latitude, 
                        longitude: success.coords.longitude,
                        speed: success.coords.speed,
                        timestamp: success.timestamp
                    }
                    
                    // Update store to reflect changes
                    this._store.dispatch(setCurrentLocation(newLocation))
                    this._store.dispatch(setLocationAllowed(true))
                    
                    if (this._lastLocation != null) {
                        // Speed must be calculated manually as it is not provided by the unexact tracking (speed ist mostly -1)
                        const distance = haversine(this._lastLocation, newLocation)
                        const time = (newLocation.timestamp - this._lastLocation.timestamp) / 1000
                        const computed_speed = distance / time

                        if ((newLocation.speed != null && newLocation.speed > speed_threshold_in_meters) || computed_speed > speed_threshold_in_meters) {
                            // The user has moved more than 30km/h, we can start tracking more precisely
                            console.log("Starting exact tracking")
                            this._startExactTracking()
                            return
                        }
                    }

                    this._lastLocation = newLocation;
                },
                error => {
                    console.log("error", error)
                    if (error.code == error.PERMISSION_DENIED) {
                        this._store.dispatch(setLocationAllowed(false))
                    } 
                }
            , {
                maximumAge: 10 * 1000,
                timeout: 60 * 1000,
                interval: 60 * 1000,
                fastestInterval: 1 * 1000,
                enableHighAccuracy: Platform.OS == 'android' ? true : false, // Depending on the platform cause the android emulator does not seem to work otherwise...
                useSignificantChanges: false // needed otherwise the location updates are to rare...
            });
        }
    }

    private _startExactTracking() {
        Geolocation.clearWatch(this._trackingId!);
        this._lastLocation = null;
        this._locationHistory = [];
        //Using setInterval as GeoLocation.watchPosition ist not working as expected on android....
        this._exactTracking = true;
        this._trackingId = setInterval(() => {
            Geolocation.getCurrentPosition(
                success => {
                    const speed_in_kmh = Math.floor(success.coords.speed == null ? 0 : success.coords.speed * 3.6)
                    
                    console.log("Exact location retrieved", success)
                    console.log("Speed: " + speed_in_kmh)
                    
                    const newLocation: UserLocation = {
                        latitude: success.coords.latitude, 
                        longitude: success.coords.longitude,
                        speed: success.coords.speed,
                        timestamp: success.timestamp
                    }

                    this._store.dispatch(setTracking(newLocation))
                    this._locationHistory.push(newLocation)
                    const fastestSpeedInPastMinute = this._fastestSpeedInPastMinutes(1);
                    console.log("Fastest speed in past minute: " + fastestSpeedInPastMinute)
                    if (fastestSpeedInPastMinute < 30 / 3.6) {
                        // The user has not been moving for the last minute
                        this._stopExactTracking()
                        this.startTrackingIfNotAlreadyStarted();              
                    }
                }, 
                error => console.warn(error), 
                {
                    maximumAge: 1000,
                    timeout: 1000,
                    enableHighAccuracy: true
                }
            )
        }, 1000)

    }

    private _stopExactTracking() {
        console.log("Stopping exact tracking")
        const recordedTrack: RecordedTrack = {locationHistory: this._locationHistory, start_timestamp: this._locationHistory[0].timestamp}
        this._store.dispatch(disableTracking(recordedTrack));
        clearInterval(this._trackingId!)
        this._exactTracking = false;
        this._trackingId = null;
    }

    public stopTracking() {
        if (this._trackingId != null) {
            console.log("Stopping tracking")
            if (this._exactTracking) {
                this._stopExactTracking()
            } else {
                Geolocation.clearWatch(this._trackingId);
                this._trackingId = null;
            }
        }
    }

    private _fastestSpeedInPastMinutes(minutes: number) {
        const now = new Date().getTime();
        const minutesAgo = now - minutes * 60 * 1000;
        const filteredHistory = this._locationHistory.filter(location => location.timestamp > minutesAgo);
        const speeds = filteredHistory.map(location => location.speed ?? 0);
        return Math.max(...speeds);
    }
}

export default LocationTracking;