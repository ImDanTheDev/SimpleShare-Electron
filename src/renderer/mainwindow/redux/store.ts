import {
    CombinedState,
    combineReducers,
    configureStore,
} from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { AuthState } from './authSlice';

const rootReducer = combineReducers({
    auth: authReducer,
});

const persistConfig: PersistConfig<
    CombinedState<{
        auth: AuthState;
    }>
> = {
    key: 'root',
    storage: storage,
    blacklist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
