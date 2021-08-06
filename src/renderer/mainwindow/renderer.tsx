import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import persistStore from 'redux-persist/es/persistStore';
import { PersistGate } from 'redux-persist/integration/react';
import MainWindow from './components/MainWindow/MainWindow';
import './index.css';
import { store } from './redux/store';

const render = (): void => {
    const persistor = persistStore(store);

    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <PersistGate loading={<></>} persistor={persistor}>
                    <MainWindow />
                </PersistGate>
            </Provider>
        </React.StrictMode>,
        document.getElementById('root')
    );
};

render();
