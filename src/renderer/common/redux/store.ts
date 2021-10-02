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
import navReducer, { NavState } from './nav-slice';
import toasterReducer, { ToasterState } from './toaster-slice';
import {
    AccountInfoState,
    AuthState,
    LocalPersistState,
    OutboxState,
    ProfilesState,
    reduxReducers,
    SearchState,
    SharesState,
} from 'simpleshare-common';

const rootReducer = combineReducers({
    auth: reduxReducers.authReducer,
    user: reduxReducers.accountReducer,
    profiles: reduxReducers.profilesReducer,
    shares: reduxReducers.sharesReducer,
    outbox: reduxReducers.outboxReducer,
    localPersist: reduxReducers.localPersistReducer,
    search: reduxReducers.searchReducer,
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
        localPersist: LocalPersistState;
        nav: NavState;
        toaster: ToasterState;
        search: SearchState;
    }>
> = {
    key: 'root',
    storage: electronStorage(),
    blacklist: [
        'user',
        'auth',
        'profiles',
        'shares',
        'nav',
        'toaster',
        'search',
    ],
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
