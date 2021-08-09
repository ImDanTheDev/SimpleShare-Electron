import React, { useEffect } from 'react';
import { authService, initService } from '../../../common/services/api';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import { HomeScreen } from '../HomeScreen/HomeScreen';

const MainWindow: React.FC = () => {
    useEffect(() => {
        initService.initialize();
        authService.initialize();
    }, []);

    return (
        <WindowFrame borderRadius={0}>
            <HomeScreen />
        </WindowFrame>
    );
};

export default MainWindow;
