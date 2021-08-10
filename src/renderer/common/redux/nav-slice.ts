import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ScreenType = 'HomeScreen' | 'AccountSettingsScreen';
export interface NavState {
    screen: ScreenType;
}

const initialState: NavState = {
    screen: 'HomeScreen',
};

export const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        setCurrentScreen: (state, action: PayloadAction<ScreenType>) => {
            state.screen = action.payload;
        },
    },
});

export const { setCurrentScreen } = navSlice.actions;
export default navSlice.reducer;
