import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { log } from '../log';

export type ToastType = 'info' | 'warn' | 'error';
export interface IToast {
    id?: number;
    type: ToastType;
    message: string;
    duration: number;
    timer?: NodeJS.Timer;
    openToaster?: boolean;
}

export interface ToasterState {
    toasts: IToast[];
    nextToastId: number;
    isToasterOpen: boolean;
}

const initialState: ToasterState = {
    toasts: [],
    nextToastId: 0,
    isToasterOpen: false,
};

export const toasterSlice = createSlice({
    name: 'toaster',
    initialState,
    reducers: {
        pushToast: (state, action: PayloadAction<IToast>) => {
            state.toasts.push({ ...action.payload, id: state.nextToastId++ });
            if (action.payload.openToaster) {
                state.isToasterOpen = true;
            }
        },
        setTimer: (
            state,
            action: PayloadAction<{ id: number; timer: NodeJS.Timer }>
        ) => {
            const toast = state.toasts.find((t) => t.id === action.payload.id);
            if (!toast) {
                log('Could not find toast to set timer.');
                return;
            }

            toast.timer = action.payload.timer;
        },
        ageToast: (state, action: PayloadAction<IToast>) => {
            const toast = state.toasts.find((t) => t.id === action.payload.id);
            if (!toast) {
                log('Could not find toast to update');
                return;
            }
            toast.duration--;
        },
        dismissToast: (state, action: PayloadAction<IToast>) => {
            state.toasts = state.toasts.filter(
                (t) => t.id !== action.payload.id
            );
            if (state.toasts.length == 0) {
                state.isToasterOpen = false;
            }
        },
        openToaster: (state, action: PayloadAction<boolean>) => {
            state.isToasterOpen = action.payload;
        },
    },
});

export const { pushToast, dismissToast, ageToast, setTimer, openToaster } =
    toasterSlice.actions;
export default toasterSlice.reducer;
