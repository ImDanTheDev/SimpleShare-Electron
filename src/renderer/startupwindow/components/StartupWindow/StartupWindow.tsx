import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { log } from '../../../common/log';
import { RootState } from '../../../common/redux/store';
import { authService, initService } from '../../../common/services/api';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import SignInScreen from '../SignInScreen/SignInScreen';
import SplashScreen from '../SplashScreen/SplashScreen';

type ScreenType = 'SplashScreen' | 'SignInScreen';

export const StartupWindow: React.FC = () => {
    const [currentScreen, setCurrentScreen] =
        useState<ScreenType>('SplashScreen');

    // TODO: Fix opacity transistion between splash screen and sign in screen.
    const [splashScreenOpacity, setSplashScreenOpacity] = useState<number>(100);
    const [signInScreenOpacity, setSignInScreenOpacity] = useState<number>(100);

    const splashScreenFrameRadius = '50%';
    const signInFrameRadius = '16px';

    const [frameRadius, setFrameRadius] = useState<string>(
        currentScreen === 'SplashScreen'
            ? splashScreenFrameRadius
            : signInFrameRadius
    );

    const opacityAnimDuration = 0.4; // Seconds
    const opacityAnimFPS = 60;
    const opacityAnimFrameTime = 1000 / opacityAnimFPS;
    const opacityAnimFrameCount = opacityAnimFPS * opacityAnimDuration;
    const [opacityAnimFrame, setOpacityAnimFrame] = useState<number>(
        opacityAnimFrameCount
    );
    const [opacityAnimInterval, setOpacityAnimInterval] =
        useState<NodeJS.Timer>();

    const user = useSelector((state: RootState) => state.auth.user);
    const initializing = useSelector(
        (state: RootState) => state.auth.initializing
    );

    useEffect(() => {
        initService.initialize();
        authService.initialize();
    }, []);

    useEffect(() => {
        const showSignInScreen = () => {
            setOpacityAnimFrame(0);
            setCurrentScreen('SignInScreen');
            setFrameRadius(signInFrameRadius);

            setOpacityAnimInterval(
                setInterval(() => {
                    setOpacityAnimFrame((oldFrame) => oldFrame + 1);
                }, opacityAnimFrameTime)
            );
        };

        const startAuthFlow = async () => {
            if (initializing) return;
            if (!user) {
                log('Going to Sign In Screen');
                showSignInScreen();
            }
        };

        startAuthFlow();
    }, [initializing, user]);

    useEffect(() => {
        if (!user) return;
        window.api.send('APP_SHOW_MAIN_WINDOW', {});
    }, [user]);

    useEffect(() => {
        setOpacityAnimFrame(0);
        setCurrentScreen('SplashScreen');
        setFrameRadius(splashScreenFrameRadius);

        setOpacityAnimInterval(
            setInterval(() => {
                setOpacityAnimFrame((oldFrame) => oldFrame + 1);
            }, opacityAnimFrameTime)
        );
    }, []);

    useEffect(() => {
        if (opacityAnimFrame >= opacityAnimFrameCount) {
            if (opacityAnimInterval) clearInterval(opacityAnimInterval);
        }
    }, [opacityAnimFrame]);

    const renderScreen = () => {
        if (currentScreen === 'SplashScreen') {
            return <SplashScreen opacity={splashScreenOpacity} />;
        } else if (currentScreen === 'SignInScreen') {
            return <SignInScreen opacity={signInScreenOpacity} />;
        }
    };

    return (
        <WindowFrame borderRadius={frameRadius}>{renderScreen()}</WindowFrame>
    );
};
