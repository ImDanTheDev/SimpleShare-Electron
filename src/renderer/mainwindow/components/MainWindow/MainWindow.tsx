import React from 'react';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import { HomeScreen } from '../HomeScreen/HomeScreen';

const MainWindow: React.FC = () => {
    return (
        <WindowFrame borderRadius={0}>
            <HomeScreen />
        </WindowFrame>
    );
};

export default MainWindow;
