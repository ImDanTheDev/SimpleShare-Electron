import { IAuth, IFirebase, IFirestore, IStorage } from '@omnifire/api';
import { OFAuth, OFFirebase, OFFirestore, OFStorage } from '@omnifire/web';
import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllAccountInfo,
    initFirebase,
    isAccountComplete,
    isPublicGeneralInfoComplete,
    startAuthStateListener,
    startProfileListener,
} from 'simpleshare-common';
import { log } from '../../../common/log';
import {
    setCurrentModal,
    setCurrentScreen,
} from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import { AccountSettingsScreen } from '../AccountSettingsScreen/AccountSettingsScreen';
import { CompleteAccountScreen } from '../CompleteAccountScreen/CompleteAccountScreen';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';
import { NewProfileModal } from '../NewProfileModal/NewProfileModal';
import { SendShareModal } from '../SendShareModal/SendShareModal';
import { Toaster } from '../Toaster/Toaster';
import { Toolbar } from '../Toolbar/Toolbar';
import { ViewShareModal } from '../ViewShareModal/ViewShareModal';
import styles from './MainWindow.module.scss';

const MainWindow: React.FC = () => {
    const dispatch = useDispatch();
    const currentScreen = useSelector((state: RootState) => state.nav.screen);
    const currentModal = useSelector((state: RootState) => state.nav.modal);
    const user = useSelector((state: RootState) => state.auth.user);
    const fetchedUser = useSelector(
        (state: RootState) => state.auth.fetchedUser
    );
    const accountInfo = useSelector(
        (state: RootState) => state.user.accountInfo
    );
    const publicGeneralInfo = useSelector(
        (state: RootState) => state.user.publicGeneralInfo
    );
    const fetchedAccount = useSelector(
        (state: RootState) => state.user.fetchedAccount
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
            log(`User is signed in as: ${user.displayName}.`);
            log('Started listening for profiles.');
            dispatch(startProfileListener());
            log('Fetching account info and general public info.');
            dispatch(getAllAccountInfo());
        } else {
            // User is signed out.
            window.api.send('APP_SHOW_STARTUP_WINDOW', {});
        }
    }, [user, fetchedUser]);

    useEffect(() => {
        if (!fetchedUser || !fetchedAccount) return;

        if (accountInfo && publicGeneralInfo) {
            log('Account doc and public general info does exist.');
            if (
                isAccountComplete(accountInfo) &&
                isPublicGeneralInfoComplete(publicGeneralInfo)
            ) {
                log('Account doc and public general info is complete.');
                dispatch(setCurrentScreen('HomeScreen'));
            } else {
                log('Account doc and public general info is not complete.');
                log('Going to complete account screen');
                dispatch(setCurrentScreen('CompleteAccountScreen'));
            }
        } else {
            log('Account doc and public general info does not exist.');
            log('Going to complete account screen.');
            dispatch(setCurrentScreen('CompleteAccountScreen'));
        }
    }, [fetchedUser, fetchedAccount]);

    const renderScreen = (): ReactNode => {
        switch (currentScreen) {
            case 'HomeScreen':
                return <HomeScreen />;
            case 'CompleteAccountScreen':
                return <CompleteAccountScreen />;
            case 'AccountSettingsScreen':
                return <AccountSettingsScreen />;
            case 'LoadingScreen':
                return <LoadingScreen />;
        }
    };

    const handleDismissModalOverlay = () => {
        dispatch(setCurrentModal('None'));
    };

    const renderModal = (): ReactNode => {
        let modal: ReactNode = <></>;

        switch (currentModal) {
            case 'NewProfileModal':
                modal = <NewProfileModal />;
                break;
            case 'SendShareModal':
                modal = <SendShareModal />;
                break;
            case 'ViewShareModal':
                modal = <ViewShareModal />;
                break;
            case 'None':
                return <></>;
        }

        return (
            <div className={styles.modalContainer}>
                <div
                    className={styles.dismissOverlay}
                    onClick={handleDismissModalOverlay}
                ></div>
                {modal}
            </div>
        );
    };

    return (
        <WindowFrame borderRadius={0}>
            <div className={styles.windowContent}>
                <Toolbar />
                {renderScreen()}
            </div>
            {renderModal()}
            <Toaster />
        </WindowFrame>
    );
};

export default MainWindow;
