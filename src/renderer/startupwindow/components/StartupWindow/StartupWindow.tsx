import { IAuth, IFirebase, IFirestore, IStorage } from '@omnifire/api';
import { OFAuth, OFFirebase, OFFirestore, OFStorage } from '@omnifire/web';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    initFirebase,
    serviceHandler,
    startAuthStateListener,
} from 'simpleshare-common';
import { RootState } from '../../../common/redux/store';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import SignInScreen from '../SignInScreen/SignInScreen';
import SplashScreen from '../SplashScreen/SplashScreen';
import keys from '../../../keys';

type ScreenType = 'SplashScreen' | 'SignInScreen';

export const StartupWindow: React.FC = () => {
    const dispatch = useDispatch();
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
    const fetchedUser = useSelector(
        (state: RootState) => state.auth.fetchedUser
    );

    useEffect(() => {
        const initializeApp = async () => {
            const firebase: IFirebase = new OFFirebase();
            firebase.initializeApp(keys.firebase);
            const auth: IAuth = new OFAuth();
            auth.configureGoogle();
            const firestore: IFirestore = new OFFirestore();
            const storage: IStorage = new OFStorage();
            initFirebase(firebase, firestore, auth, storage);
            let servicesUpToDate = false;
            try {
                servicesUpToDate =
                    await serviceHandler.isServiceHandlerUpToDate();
            } catch {
                // TODO: Show error screen with "Error communicating with network services. Please check your internet connection."
                window.api.send('APP_SHOW_UPDATE_WINDOW', {});
            }

            if (!servicesUpToDate) {
                window.api.send('APP_SHOW_UPDATE_WINDOW', {});
                return;
            }

            dispatch(startAuthStateListener());
        };
        initializeApp();
    }, []);

    useEffect(() => {
        if (!fetchedUser) return;

        if (user) {
            window.api.send('APP_SHOW_MAIN_WINDOW', {});
        } else {
            setOpacityAnimFrame(0);
            setCurrentScreen('SignInScreen');
            setFrameRadius(signInFrameRadius);

            setOpacityAnimInterval(
                setInterval(() => {
                    setOpacityAnimFrame((oldFrame) => oldFrame + 1);
                }, opacityAnimFrameTime)
            );
        }
    }, [fetchedUser, user]);

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
