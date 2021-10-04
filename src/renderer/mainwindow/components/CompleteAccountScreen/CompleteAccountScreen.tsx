import React, { useEffect, useState } from 'react';
import styles from './CompleteAccountScreen.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Panel } from '../Panel/Panel';
import { RootState } from '../../../common/redux/store';
import { log } from '../../../common/log';
import {
    constants,
    createProfile,
    IAccountInfo,
    IPublicGeneralInfo,
    IUser,
    signOut,
    updateAccount,
} from 'simpleshare-common';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';

export const CompleteAccountScreen: React.FC = () => {
    const dispatch = useDispatch();

    const user: IUser | undefined = useSelector(
        (state: RootState) => state.auth.user
    );

    const accountInfo: IAccountInfo | undefined = useSelector(
        (state: RootState) => state.user.accountInfo
    );

    const publicGeneralInfo: IPublicGeneralInfo | undefined = useSelector(
        (state: RootState) => state.user.publicGeneralInfo
    );

    const updatingAccount = useSelector(
        (state: RootState) => state.user.updatingAccount
    );
    const updateAccountError = useSelector(
        (state: RootState) => state.user.updateAccountError
    );
    const [displayName, setDisplayName] = useState<string>(
        publicGeneralInfo?.displayName || ''
    );
    const [phoneNumber, setPhoneNumber] = useState<string>(
        accountInfo?.phoneNumber || ''
    );

    const [displayNameError, setDisplayNameError] = useState<string>('');
    const [phoneNumberError, setPhoneNumberError] = useState<string>('');

    useEffect(() => {
        if (!user) {
            log(
                'Error: User is undefined. Cannot continue account completion without a user.'
            );
            // User is undefined, but try to sign out anyways to prevent the startup window immediately redirecting to main window in a loop.
            window.api.send('APP_CLEAR_COOKIES', {});
            dispatch(signOut());
            window.api.send('APP_SHOW_STARTUP_WINDOW', {});

            return;
        }
    }, [user]);

    useEffect(() => {
        if (displayName.length < constants.MIN_DISPLAY_NAME_LENGTH) {
            setDisplayNameError(
                `Display names must be at least ${constants.MIN_DISPLAY_NAME_LENGTH} characters long.`
            );
        } else {
            setDisplayNameError('');
        }

        if (phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH) {
            setPhoneNumberError(
                `Phone numbers must be at least ${constants.MIN_PHONE_NUMBER_LENGTH} characters long.`
            );
        } else {
            setPhoneNumberError('');
        }
    }, [displayName, phoneNumber]);

    const handleComplete = () => {
        const continueAuthFlow = async () => {
            if (!user) {
                log('User is undefined. An unexpected error occurred.');
                // User is undefined, but try to sign out anyways to prevent the startup window immediately redirecting to main window in a loop.
                window.api.send('APP_CLEAR_COOKIES', {});
                dispatch(signOut());
                window.api.send('APP_SHOW_STARTUP_WINDOW', {});
                return;
            }

            if (
                phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH ||
                displayName.length < constants.MIN_DISPLAY_NAME_LENGTH
            ) {
                return;
            }

            // TODO: Check if the user already has a default profile.
            // If they do, do nothing.
            // If they have a profile, but none are default, make the first one default.
            // If they dont, create a default profile.
            dispatch(
                createProfile({
                    profile: {
                        name: 'Default',
                        id: 'default', // TODO: let firebase autogenerate the user's starter profile.
                    },
                })
            );
            dispatch(
                updateAccount({
                    accountInfo: {
                        phoneNumber: phoneNumber,
                        isAccountComplete: true,
                    },
                    publicGeneralInfo: {
                        displayName: displayName,
                        isComplete: true,
                        defaultProfileId: 'default', // TODO: Get the id from the profile that was just created.
                        profilePositions: ['default'], // TODO: Get the id from the profile that was just created.
                    },
                })
            );
        };

        continueAuthFlow();
    };

    return (
        <div className={styles.screen}>
            <Panel title='Complete Your Account'>
                <div className={styles.panelBody}>
                    <div className={styles.items}>
                        <div className={styles.itemGroup}>
                            <div className={styles.label}>Display Name:</div>
                            <input
                                className={styles.textField}
                                type='text'
                                spellCheck='false'
                                minLength={constants.MIN_DISPLAY_NAME_LENGTH}
                                maxLength={constants.MAX_DISPLAY_NAME_LENGTH}
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        {displayNameError && (
                            <div className={styles.errorMessage}>
                                {displayNameError}
                            </div>
                        )}
                        <div className={styles.itemGroup}>
                            <div className={styles.label}>Phone Number:</div>
                            <input
                                className={styles.textField}
                                type='tel'
                                spellCheck='false'
                                minLength={constants.MIN_PHONE_NUMBER_LENGTH}
                                maxLength={constants.MAX_PHONE_NUMBER_LENGTH}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        {phoneNumberError && (
                            <div className={styles.errorMessage}>
                                {phoneNumberError}
                            </div>
                        )}
                        <div className={styles.itemGroup}>
                            <div>
                                {updatingAccount ? (
                                    <LoadingIcon />
                                ) : (
                                    <button
                                        className={styles.primaryButton}
                                        onClick={handleComplete}
                                    >
                                        <span
                                            style={{
                                                padding: '16px',
                                            }}
                                        >
                                            Complete Account
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={styles.errorMessage}>
                            {updateAccountError &&
                                'An error occurred while completing your account. Try again later.'}
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
};
