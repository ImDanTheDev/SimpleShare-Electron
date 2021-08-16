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
import userReducer, {
    AccountInfoState as AccountInfoState,
} from './account-slice';
import profilesReducer, { ProfilesState } from './profiles-slice';
import sharesReducer, { SharesState } from './shares-slice';
import outboxReducer, { OutboxState } from './outbox-slice';
import navReducer, { NavState } from './nav-slice';
import toasterReducer, { ToasterState } from './toaster-slice';

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    profiles: profilesReducer,
    shares: sharesReducer,
    outbox: outboxReducer,
    nav: navReducer,
    toaster: toasterReducer,
});

const persistConfig: PersistConfig<
    CombinedState<{
        auth: AuthState;
        user: AccountInfoState;
        profiles: ProfilesState;
        shares: SharesState;
        outbox: OutboxState;
        nav: NavState;
        toaster: ToasterState;
    }>
> = {
    key: 'root',
    storage: electronStorage(),
    blacklist: ['user', 'auth', 'profiles', 'shares', 'nav', 'toaster'],
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
