import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ScreenType =
    | 'HomeScreen'
    | 'AccountSettingsScreen'
    | 'CompleteAccountScreen'
    | 'LoadingScreen';

type ModalType =
    | 'NewProfileModal'
    | 'SendShareModal'
    | 'ViewShareModal'
    | 'None';
export interface NavState {
    screen: ScreenType;
    modal: ModalType;
}

const initialState: NavState = {
    screen: 'LoadingScreen',
    modal: 'None',
};

export const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        setCurrentScreen: (state, action: PayloadAction<ScreenType>) => {
            state.screen = action.payload;
        },
        setCurrentModal: (state, action: PayloadAction<ModalType>) => {
            state.modal = action.payload;
        },
    },
});

export const { setCurrentScreen, setCurrentModal } = navSlice.actions;
export default navSlice.reducer;
