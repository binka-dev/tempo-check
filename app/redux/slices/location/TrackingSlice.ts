import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import RecordedTrack from "../../../models/RecordedTrack";

interface LocationTrackingState {
    tracking: boolean;
    speed: number;
    past_tracks: RecordedTrack[];
}

const initialState: LocationTrackingState = {
    tracking: false,
    speed: 0,
    past_tracks: []
}

export const LocationTrackingSlice = createSlice({
    name: "location_tracking",
    initialState: initialState,
    reducers: {
        setTracking: (state, action: PayloadAction<number>) => {
            state.tracking = true
            state.speed = action.payload
        },
        disableTracking: (state, action: PayloadAction<RecordedTrack>) => {
            state.tracking = false
            state.speed = 0
            state.past_tracks.push(action.payload)
            AsyncStorage.setItem("past_tracks", JSON.stringify(state.past_tracks))
            console.log("Saved past tracks")
        },
        loadPreviousTracks: (state, action: PayloadAction<RecordedTrack[]>) => {
            state.past_tracks = action.payload
        }
    }
})

export const { setTracking, disableTracking, loadPreviousTracks } = LocationTrackingSlice.actions;
export default LocationTrackingSlice.reducer;