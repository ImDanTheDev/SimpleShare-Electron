import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import IProfile from '../services/IProfile';

export interface ProfilesState {
    profiles: IProfile[];
    currentProfileId: string;
    editingProfiles: boolean;
}

const initialState: ProfilesState = {
    profiles: [
        {
            id: 'default',
            name: 'Default',
        },
    ],
    currentProfileId: 'default',
    editingProfiles: false,
};

export const profilesSlice = createSlice({
    name: 'profiles',
    initialState,
    reducers: {
        setProfiles: (state, action: PayloadAction<IProfile[]>) => {
            state.profiles = action.payload;
        },
        setCurrentProfile: (state, action: PayloadAction<string>) => {
            state.currentProfileId = action.payload;
        },
        setEditingProfiles: (state, action: PayloadAction<boolean>) => {
            state.editingProfiles = action.payload;
        },
    },
});

export const { setProfiles, setCurrentProfile, setEditingProfiles } =
    profilesSlice.actions;
export default profilesSlice.reducer;
