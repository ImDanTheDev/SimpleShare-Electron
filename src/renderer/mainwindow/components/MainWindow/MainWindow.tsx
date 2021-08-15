import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { isAccountComplete } from '../../../common/services/IAccountInfo';
import IProfile from '../../../common/services/IProfile';
import { isPublicGeneralInfoComplete } from '../../../common/services/IPublicGeneralInfo';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import { AccountSettingsScreen } from '../AccountSettingsScreen/AccountSettingsScreen';
import { CompleteAccountScreen } from '../CompleteAccountScreen/CompleteAccountScreen';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';
import { NewProfileModal } from '../NewProfileModal/NewProfileModal';
import { SendShareModal } from '../SendShareModal/SendShareModal';
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
    const [fetchedProfiles, setFetchedProfiles] = useState<boolean>(false);

    const profiles: IProfile[] = useSelector(
        (state: RootState) => state.profiles.profiles
    );

    const currentProfile: IProfile | undefined = useSelector(
        (state: RootState) => {
            return state.profiles.profiles.find(
                (profile) => profile.id === state.profiles.currentProfileId
            );
        }
    );

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
                    log('Fetching profiles');
                    await fetchProfiles();
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

        const fetchProfiles = async () => {
            if (!user) return;
            await databaseService.getAllProfiles(user.uid);
            setFetchedProfiles(true);
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
        const ensureProfiles = async () => {
            if (!fetchedProfiles || !user) return;

            if (profiles.length > 0) {
                if (!currentProfile) {
                    log('A profile is not selected');
                    if (profiles[0].id) {
                        log(`Selected profile with id: ${profiles[0].id}`);
                        dispatch(setCurrentProfile(profiles[0].id));
                    } else {
                        // TODO: Do something here.
                        // We checked if a profile exists, and it does, but the id is blank.
                        // This should never happen as id's are assigned by firestore. This
                        // may happen if a profile is created by the user, but instead of
                        // uploading to firestore, it is saved to the store.
                        // Either way, this will no longer be as big of an issue once
                        // logic is implemented for finding the default profile in the
                        // above TODO. If a profile with the default field set to true
                        // does not exist, one will just be created.
                        log('Account has a profile without an id.');
                    }
                } else {
                    log('A profile is selected');
                    if (
                        profiles.findIndex(
                            (p) => p.id === currentProfile.id
                        ) === -1
                    ) {
                        log('The selected profile does not exist');
                        log('Creating default profile');
                        await databaseService.createDefaultProfile(user.uid);
                        log('Fetching profiles');
                        await databaseService.getAllProfiles(user.uid);
                    } else {
                        log('Selected profile exists');
                        log('Going to home screen');
                        dispatch(setCurrentScreen('HomeScreen'));
                    }
                }
            } else {
                log('Account has 0 profiles. Creating default profile.');
                await databaseService.createDefaultProfile(user.uid);
                log('Fetching profiles');
                await databaseService.getAllProfiles(user.uid);
            }
        };

        ensureProfiles();
    }, [profiles, fetchedProfiles, currentProfile, user]);

    useEffect(() => {
        if (!user) return;

        const switchShareListener = async () => {
            if (!currentProfile || !currentProfile.id) return;
            await databaseService.switchShareListener(
                user.uid,
                currentProfile.id
            );
        };

        switchShareListener();
    }, [user, currentProfile]);

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
        </WindowFrame>
    );
};

export default MainWindow;
