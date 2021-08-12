import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import IUser from '../services/IUser';

export interface AuthState {
    initializing: boolean;
    user: IUser | undefined;
}

const initialState: AuthState = {
    initializing: true,
    user: undefined,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<IUser | undefined>) => {
            state.user = action.payload;
            if (state.initializing === true) {
                state.initializing = false;
            }
        },
    },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
