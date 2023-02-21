import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import RecordedTrack from "../../../models/RecordedTrack";
import UserLocation from "../../../models/UserLocation";

interface LocationTrackingState {
    tracking: boolean;
    current_location: UserLocation|null;
    past_tracks: RecordedTrack[];
}

const initialState: LocationTrackingState = {
    tracking: false,
    current_location: null,
    past_tracks: []
}

export const LocationTrackingSlice = createSlice({
    name: "location_tracking",
    initialState: initialState,
    reducers: {
        setCurrentLocation: (state, action: PayloadAction<UserLocation>) => {
            state.current_location = action.payload
        },
        setTracking: (state, action: PayloadAction<UserLocation>) => {
            state.tracking = true
            state.current_location = action.payload
        },
        disableTracking: (state, action: PayloadAction<RecordedTrack>) => {
            state.tracking = false
            if (action.payload.locationHistory.length > 1) {
                state.past_tracks.push(action.payload)
                AsyncStorage.setItem("past_tracks", JSON.stringify(state.past_tracks))
                console.log("Saved past tracks")
            }
        },
        loadPreviousTracks: (state, action: PayloadAction<RecordedTrack[]>) => {
            state.past_tracks = action.payload
        }
    }
})

export const { setTracking, disableTracking, loadPreviousTracks, setCurrentLocation } = LocationTrackingSlice.actions;
export default LocationTrackingSlice.reducer;