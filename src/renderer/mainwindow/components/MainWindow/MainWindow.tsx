import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    IProfile,
    isAccountComplete,
    isPublicGeneralInfoComplete,
} from 'simpleshare-common';
import { log } from '../../../common/log';
import { setPublicGeneralInfo } from '../../../common/redux/account-slice';
import {
    setCurrentModal,
    setCurrentScreen,
} from '../../../common/redux/nav-slice';
import { setCurrentProfile } from '../../../common/redux/profiles-slice';
import { RootState } from '../../../common/redux/store';
import {
    authService,
    databaseService,
    initService,
} from '../../../common/services/api';
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
    const initializing = useSelector(
        (state: RootState) => state.auth.initializing
    );
    const user = useSelector((state: RootState) => state.auth.user);
    const accountInfo = useSelector(
        (state: RootState) => state.user.accountInfo
    );
    const publicGeneralInfo = useSelector(
        (state: RootState) => state.user.publicGeneralInfo
    );

    const [fetchedAccountInfo, setFetchedAccountInfo] =
        useState<boolean>(false);
    const [fetchedPublicGeneralInfo, setFetchedPublicGeneralInfo] =
        useState<boolean>(false);

    const currentProfile: IProfile | undefined = useSelector(
        (state: RootState) => {
            return state.profiles.profiles.find(
                (profile) => profile.id === state.profiles.currentProfileId
            );
        }
    );

    const profiles = useSelector((state: RootState) => state.profiles.profiles);

    useEffect(() => {
        initService.initialize();
        authService.initialize();
        databaseService.initialize();
    }, []);

    useEffect(() => {
        const startAuthFlow = async () => {
            if (initializing) return;
            if (user) {
                log(`User is signed in as: ${user.displayName}`);

                log('Added profile listener');
                await databaseService.switchProfileListener(user.uid);

                log('Fetching account info');
                await databaseService.getAccountInfo(user.uid);
                setFetchedAccountInfo(true);

                log('Fetching public general info');
                dispatch(
                    setPublicGeneralInfo(
                        await databaseService.getPublicGeneralInfo(user.uid)
                    )
                );
                setFetchedPublicGeneralInfo(true);
            } else {
                log(`User is not signed in, going to sign in screen.`);
                window.api.send('APP_SHOW_STARTUP_WINDOW', {});
            }
        };

        startAuthFlow();
    }, [user, initializing]);

    useEffect(() => {
        const continueAuthFlow = async () => {
            if (!user || !fetchedAccountInfo || !fetchedPublicGeneralInfo) {
                return;
            }

            if (accountInfo && publicGeneralInfo) {
                log('Account doc and public general info does exist');
                if (
                    isAccountComplete(accountInfo) &&
                    isPublicGeneralInfoComplete(publicGeneralInfo)
                ) {
                    log('Account doc and public general info is complete');
                    dispatch(setCurrentScreen('HomeScreen'));
                } else {
                    log('Account doc and public general info is not complete');
                    log('Going to complete account screen');
                    dispatch(setCurrentScreen('CompleteAccountScreen'));
                }
            } else {
                log('Account doc and public general info does not exist');
                log('Going to complete account screen');
                dispatch(setCurrentScreen('CompleteAccountScreen'));
            }
        };

        continueAuthFlow();
    }, [
        accountInfo,
        publicGeneralInfo,
        fetchedAccountInfo,
        fetchedPublicGeneralInfo,
        user,
    ]);

    useEffect(() => {
        if (!user) return;

        if (
            currentProfile === undefined &&
            profiles.length > 0 &&
            profiles[0].id
        ) {
            // The current profile was undefined. Now profiles exist, so pick the first one.
            dispatch(setCurrentProfile(profiles[0].id));
            return;
        }

        const switchShareListener = async () => {
            if (!currentProfile || !currentProfile.id) return;
            await databaseService.switchShareListener(
                user.uid,
                currentProfile.id
            );
        };

        switchShareListener();
    }, [user, currentProfile, profiles]);

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
