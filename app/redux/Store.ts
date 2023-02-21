import { configureStore } from "@reduxjs/toolkit";
import LocationTrackingReducer from "./slices/location/TrackingSlice";
import PermissionSliceReducer from "./slices/PermissionsSlice";

export const store = configureStore({
    reducer: {
        location_tracking: LocationTrackingReducer,
        permissions: PermissionSliceReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;