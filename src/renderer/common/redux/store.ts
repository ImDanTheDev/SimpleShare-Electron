import {
    CombinedState,
    combineReducers,
    configureStore,
} from '@reduxjs/toolkit';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    REHYDRATE,
    PersistConfig,
    persistReducer,
} from 'redux-persist';
import electronStorage from './electron-storage';
import authReducer, { AuthState } from './auth-slice';

const rootReducer = combineReducers({
    auth: authReducer,
});

const persistConfig: PersistConfig<
    CombinedState<{
        auth: AuthState;
    }>
> = {
    key: 'root',
    storage: electronStorage(),
    //blacklist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
