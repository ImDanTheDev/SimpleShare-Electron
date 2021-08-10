import React, { ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import { authService, initService } from '../../../common/services/api';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import { AccountSettingsScreen } from '../AccountSettingsScreen/AccountSettingsScreen';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { Toolbar } from '../Toolbar/Toolbar';
import styles from './MainWindow.module.scss';

const MainWindow: React.FC = () => {
    const currentScreen = useSelector((state: RootState) => state.nav.screen);

    useEffect(() => {
        initService.initialize();
        authService.initialize();
    }, []);

    const renderScreen = (): ReactNode => {
        switch (currentScreen) {
            case 'HomeScreen':
                return <HomeScreen />;
            case 'AccountSettingsScreen':
                return <AccountSettingsScreen />;
        }
    };

    return (
        <WindowFrame borderRadius={0}>
            <div className={styles.windowContent}>
                <Toolbar />
                {renderScreen()}
            </div>
        </WindowFrame>
    );
};

export default MainWindow;
