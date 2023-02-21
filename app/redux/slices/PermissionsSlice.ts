import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PermissionsSlice {
    location_allowed: boolean;
}

const initialState: PermissionsSlice = {
    location_allowed: true
}

export const PermissionSlice = createSlice({
    name: "permissions",
    initialState: initialState,
    reducers: {
        setLocationAllowed: (state, action: PayloadAction<boolean>) => {
            state.location_allowed = action.payload
        }
    }
})

export const { setLocationAllowed } = PermissionSlice.actions;
export default PermissionSlice.reducer;