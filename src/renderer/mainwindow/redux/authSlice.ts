import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
    user: string | undefined;
}

const initialState: AuthState = {
    user: undefined,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<string | undefined>) => {
            state.user = action.payload;
        },
    },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
