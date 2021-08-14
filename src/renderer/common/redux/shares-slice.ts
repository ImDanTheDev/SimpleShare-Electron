import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { log } from '../log';
import IShare from '../services/IShare';

export interface SharesState {
    shares: IShare[];
    currentShare: IShare | undefined;
}

const initialState: SharesState = {
    shares: [],
    currentShare: undefined,
};

export const sharesSlice = createSlice({
    name: 'shares',
    initialState,
    reducers: {
        setShares: (state, action: PayloadAction<IShare[]>) => {
            state.shares = action.payload;
        },
        addShare: (state, action: PayloadAction<IShare>) => {
            if (
                state.shares.findIndex((s) => s.id === action.payload.id) !== -1
            ) {
                log('Attemped to add share with a duplicate id!');
                return;
            }
            state.shares.push(action.payload);
        },
        deleteShare: (state, action: PayloadAction<string>) => {
            state.shares = state.shares.filter((x) => x.id !== action.payload);
        },
        updateShare: (state, action: PayloadAction<IShare>) => {
            const target = state.shares.find((x) => x.id === action.payload.id);
            if (!target) return;
            target.content = action.payload.content;
            target.type = action.payload.type;
            target.fromProfileId = action.payload.fromProfileId;
            target.fromUid = action.payload.fromUid;
            target.toProfileId = action.payload.toProfileId;
            target.toUid = action.payload.toUid;
        },
        setCurrentShare: (state, action: PayloadAction<IShare>) => {
            state.currentShare = action.payload;
        },
    },
});

export const {
    setShares,
    addShare,
    deleteShare,
    updateShare,
    setCurrentShare,
} = sharesSlice.actions;
export default sharesSlice.reducer;
