import { configureStore } from "@reduxjs/toolkit";
import LocationTrackingReducer from "./slices/location/TrackingSlice";

export const store = configureStore({
    reducer: {
        location_tracking: LocationTrackingReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;