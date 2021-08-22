import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { log } from '../log';
import IProfile from '../services/IProfile';

export interface ProfilesState {
    profiles: IProfile[];
    currentProfileId: string | undefined;
    editingProfiles: boolean;
}

const initialState: ProfilesState = {
    profiles: [],
    currentProfileId: undefined,
    editingProfiles: false,
};

export const profilesSlice = createSlice({
    name: 'profiles',
    initialState,
    reducers: {
        addProfile: (state, action: PayloadAction<IProfile>) => {
            if (
                state.profiles.findIndex((p) => p.id === action.payload.id) !==
                -1
            ) {
                log('Attempted to add profile with duplicate id!');
                return;
            }
            state.profiles.push(action.payload);
        },
        deleteProfile: (state, action: PayloadAction<IProfile>) => {
            log(`Deleting profile [1/2] ${state.profiles.length}`);
            state.profiles = state.profiles.filter(
                (profile) => profile.id !== action.payload.id
            );
            log(`Deleting profile [2/2] ${state.profiles.length}`);
        },
        updateProfile: (state, action: PayloadAction<IProfile>) => {
            const target = state.profiles.find(
                (x) => x.id === action.payload.id
            );
            if (!target) return;
            target.name = action.payload.name;
        },
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

export const {
    addProfile,
    deleteProfile,
    updateProfile,
    setProfiles,
    setCurrentProfile,
    setEditingProfiles,
} = profilesSlice.actions;
export default profilesSlice.reducer;
