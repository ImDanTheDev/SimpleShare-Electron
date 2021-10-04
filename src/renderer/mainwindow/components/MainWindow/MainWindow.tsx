import { IAuth, IFirebase, IFirestore, IStorage } from '@omnifire/api';
import { OFAuth, OFFirebase, OFFirestore, OFStorage } from '@omnifire/web';
import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearNotifications,
    clearProfiles,
    ErrorCode,
    getAllAccountInfo,
    initFirebase,
    isAccountComplete,
    isPublicGeneralInfoComplete,
    serviceHandler,
    setCurrentShare,
    startAuthStateListener,
    startNotificationListener,
    startProfileListener,
    startPublicGeneralInfoListener,
    switchProfile,
} from 'simpleshare-common';
import { log } from '../../../common/log';
import {
    setCurrentModal,
    setCurrentScreen,
} from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { pushToast } from '../../../common/redux/toaster-slice';
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
import keys from '../../../keys';
import Titlebar from '../Titlebar/Titlebar';

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
    const fetchAccountError = useSelector(
        (state: RootState) => state.user.fetchAccountError
    );

    const notifications = useSelector(
        (state: RootState) => state.notifications.notifications
    );

    const profiles = useSelector((state: RootState) => state.profiles.profiles);

    useEffect(() => {
        const initializeApp = async () => {
            const firebase: IFirebase = new OFFirebase();
            firebase.initializeApp(keys.firebase);
            const auth: IAuth = new OFAuth();
            auth.configureGoogle();
            const firestore: IFirestore = new OFFirestore();
            const storage: IStorage = new OFStorage();
            initFirebase(firebase, firestore, auth, storage);
            const servicesUpToDate =
                await serviceHandler.isServiceHandlerUpToDate();

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
            log(`User is signed in as: ${user.displayName}.`);
            log('Started listening for profiles.');
            dispatch(startProfileListener());
            log('Fetching account info and general public info.');
            dispatch(getAllAccountInfo());
            dispatch(startPublicGeneralInfoListener());
            dispatch(startNotificationListener());
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

    useEffect(() => {
        if (fetchAccountError) {
            switch (fetchAccountError.code) {
                case ErrorCode.UNEXPECTED_DATABASE_ERROR:
                    dispatch(
                        pushToast({
                            duration: 15,
                            message:
                                'An error occurred while loading your account. Try to sign out and sign back in.',
                            type: 'error',
                            openToaster: true,
                        })
                    );
                    break;
                default:
                    dispatch(
                        pushToast({
                            duration: 15,
                            message:
                                'An unexpected error occurred while loading your account. Restart Simple Share and contact support if the issue persists.',
                            type: 'error',
                            openToaster: true,
                        })
                    );
                    break;
            }
        }
    }, [fetchAccountError]);

    useEffect(() => {
        if (notifications.length > 0) {
            notifications.forEach((noti) => {
                const notification = new Notification(
                    `${noti.share?.fromDisplayName}(${noti.share?.fromProfileName}) sent you a share!`,
                    {
                        body: noti.share
                            ? noti.share.textContent || 'No Text'
                            : '',
                    }
                );

                // OnClick will not be called on Windows 10 if the notification is clicked
                // from within the Action Center.
                // Known Issue: https://github.com/electron/electron/issues/29461
                // Clicking the notification popup outside of the Action center does work.
                notification.onclick = () => {
                    const profile = profiles.find(
                        (x) => x.id === noti.share?.toProfileId
                    );
                    if (profile) dispatch(switchProfile(profile));
                    if (noti.share) dispatch(setCurrentShare(noti.share));
                    dispatch(setCurrentModal('ViewShareModal'));
                    window.api.send('APP_RESTORE', {});
                };
            });
            dispatch(clearNotifications());
        }
    }, [notifications]);

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
        if (currentModal === 'SendShareModal') {
            dispatch(clearProfiles());
        }
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
                <Titlebar />
                <Toolbar />
                {renderScreen()}
            </div>
            {renderModal()}
            <Toaster />
        </WindowFrame>
    );
};

export default MainWindow;
