import { IAuth, IFirebase, IFirestore, IStorage } from '@omnifire/api';
import { OFAuth, OFFirebase, OFFirestore, OFStorage } from '@omnifire/web';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initFirebase, startAuthStateListener } from 'simpleshare-common';
import { RootState } from '../../../common/redux/store';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import SignInScreen from '../SignInScreen/SignInScreen';
import SplashScreen from '../SplashScreen/SplashScreen';

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
        const firebase: IFirebase = new OFFirebase();
        firebase.initializeApp({
            apiKey: 'AIzaSyA6zzVAR_PGih6Pe8mIrBpFV6x-tNAVCp4',
            authDomain: 'simpleshare-428bb.firebaseapp.com',
            projectId: 'simpleshare-428bb',
            storageBucket: 'simpleshare-428bb.appspot.com',
            messagingSenderId: '555940005658',
            appId: '1:555940005658:web:b00dd5f990111de83dcea3',
            measurementId: 'G-WV37870J2G',
        });
        const auth: IAuth = new OFAuth();
        auth.configureGoogle();
        const firestore: IFirestore = new OFFirestore();
        const storage: IStorage = new OFStorage();
        initFirebase(firebase, firestore, auth, storage);
        dispatch(startAuthStateListener());
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
