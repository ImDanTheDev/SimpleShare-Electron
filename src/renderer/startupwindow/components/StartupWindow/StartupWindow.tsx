import React, { useEffect, useState } from 'react';
import { authService, initService } from '../../../common/services/api';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import SignInScreen from '../SignInScreen/SignInScreen';
import SplashScreen from '../SplashScreen/SplashScreen';

type ScreenType = 'SplashScreen' | 'SignInScreen';

export const StartupWindow: React.FC = () => {
    const [currentScreen, setCurrentScreen] =
        useState<ScreenType>('SplashScreen');

    const [splashScreenOpacity, setSplashScreenOpacity] = useState<number>(100);
    const [signInScreenOpacity, setSignInScreenOpacity] = useState<number>(0);

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

    useEffect(() => {
        initService.initialize();
        authService.initialize();
    }, []);

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

    useEffect(() => {
        if (currentScreen === 'SplashScreen') {
            // Going to the splash screen.
            setSplashScreenOpacity(
                (opacityAnimFrame / opacityAnimFrameCount) * 100
            );
            setSignInScreenOpacity(
                1 - (opacityAnimFrame / opacityAnimFrameCount) * 100
            );
        } else if (currentScreen === 'SignInScreen') {
            // Going to the sign in screen.
            setSplashScreenOpacity(
                (1 - opacityAnimFrame / opacityAnimFrameCount) * 100
            );
            setSignInScreenOpacity(
                (opacityAnimFrame / opacityAnimFrameCount) * 100
            );
        }
    }, [opacityAnimFrame, currentScreen]);

    const handleSplashScreenFinish = () => {
        setOpacityAnimFrame(0);
        setCurrentScreen('SignInScreen');
        setFrameRadius(signInFrameRadius);

        setOpacityAnimInterval(
            setInterval(() => {
                setOpacityAnimFrame((oldFrame) => oldFrame + 1);
            }, opacityAnimFrameTime)
        );
    };

    const handleSignIn = async () => {
        //window.api.send('APP_SHOW_MAIN_WINDOW', {});
        const user = await authService.googleSignIn();
        if (user) {
            console.log(`Signed in as: ${user.displayName}`);
            window.api.send('APP_SHOW_MAIN_WINDOW', {});
        } else {
            // TODO: Resolve error or should feedback to user.
            console.log('An error occurred while signing in.');
        }
    };

    const renderScreen = () => {
        if (currentScreen === 'SplashScreen') {
            return (
                <SplashScreen
                    onFinish={handleSplashScreenFinish}
                    opacity={splashScreenOpacity}
                />
            );
        } else if (currentScreen === 'SignInScreen') {
            return (
                <SignInScreen
                    onSignIn={handleSignIn}
                    opacity={signInScreenOpacity}
                />
            );
        }
    };

    return (
        <WindowFrame borderRadius={frameRadius}>{renderScreen()}</WindowFrame>
    );
};
