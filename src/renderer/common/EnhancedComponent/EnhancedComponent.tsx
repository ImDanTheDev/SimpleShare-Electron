import React, { PropsWithChildren, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { store } from '../redux/store';
import './index.css';

interface Props {
    children: ReactNode;
}

const EnhancedComponent: React.FC<Props> = (
    props: PropsWithChildren<Props>
) => {
    const persistor = persistStore(store);
    return (
        <React.StrictMode>
            <Provider store={store}>
                <PersistGate loading={<></>} persistor={persistor}>
                    {props.children}
                </PersistGate>
            </Provider>
        </React.StrictMode>
    );
};

export default EnhancedComponent;
