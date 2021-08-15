import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import IProfile from '../services/IProfile';

export interface ProfilesState {
    profiles: IProfile[];
    currentProfileId: string | undefined;
    editingProfiles: boolean;
    fetchingProfiles: boolean | undefined;
}

const initialState: ProfilesState = {
    profiles: [],
    currentProfileId: undefined,
    editingProfiles: false,
    fetchingProfiles: undefined,
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
        setFetchingProfiles: (state, action: PayloadAction<boolean>) => {
            state.fetchingProfiles = action.payload;
        },
    },
});

export const {
    setProfiles,
    setCurrentProfile,
    setEditingProfiles,
    setFetchingProfiles,
} = profilesSlice.actions;
export default profilesSlice.reducer;
