import React, { useEffect, useState } from 'react';
import styles from './CompleteAccountScreen.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Panel } from '../Panel/Panel';
import { RootState } from '../../../common/redux/store';
import { log } from '../../../common/log';
import { authService, databaseService } from '../../../common/services/api';
import { pushToast } from '../../../common/redux/toaster-slice';
import {
    constants,
    IAccountInfo,
    IPublicGeneralInfo,
    IUser,
} from 'simpleshare-common';

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
            try {
                // User is undefined, but try to sign out anyways to prevent the startup window immediately redirecting to main window in a loop.
                authService.signOut();
            } finally {
                window.api.send('APP_SHOW_STARTUP_WINDOW', {});
            }

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
                try {
                    // User is undefined, but try to sign out anyways to prevent the startup window immediately redirecting to main window in a loop.
                    authService.signOut();
                } finally {
                    window.api.send('APP_SHOW_STARTUP_WINDOW', {});
                }
                return;
            }

            if (phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH) {
                log(`'${phoneNumber}' is not a valid phone number.`);
                return;
            }

            if (displayName.length < constants.MIN_DISPLAY_NAME_LENGTH) {
                log(`'${displayName}' is not a valid display name`);
                return;
            }

            const accountExists = await databaseService.doesAccountExist(
                user.uid
            );
            if (accountExists) {
                const success = await databaseService.setAccountInfo(user.uid, {
                    phoneNumber: phoneNumber,
                    isAccountComplete: true,
                });

                if (success) {
                    log('Saved completed account info to database.');
                } else {
                    log('Failed to complete the account.');
                    dispatch(
                        pushToast({
                            message:
                                'An unexpected error occurred while completing your account. Try again later.',
                            type: 'error',
                            duration: 5,
                            openToaster: true,
                        })
                    );
                    return;
                }

                try {
                    await databaseService.setPublicGeneralInfo(user.uid, {
                        displayName: displayName,
                        isComplete: true,
                    });
                    log('Saved completed public general info to database');
                } catch {
                    log('Failed to complete public general info');
                    dispatch(
                        pushToast({
                            message:
                                'An unexpected error occurred while completing your account. Try again later.',
                            type: 'error',
                            duration: 5,
                            openToaster: true,
                        })
                    );
                }
            } else {
                const success = await databaseService.initializeAccount(
                    user.uid,
                    {
                        phoneNumber: phoneNumber,
                        isAccountComplete: true,
                    },
                    {
                        displayName: displayName,
                        isComplete: true,
                    }
                );

                if (success) {
                    log('Saved completed account and general info to database');
                } else {
                    log('Failed to complete the account');
                    dispatch(
                        pushToast({
                            message:
                                'An unexpected error occurred while completing your account. Try again later.',
                            type: 'error',
                            duration: 5,
                            openToaster: true,
                        })
                    );
                }
            }
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
                                className={styles.field}
                                type='text'
                                spellCheck='false'
                                minLength={constants.MIN_DISPLAY_NAME_LENGTH}
                                maxLength={constants.MAX_DISPLAY_NAME_LENGTH}
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                            <div className={styles.errorMessage}>
                                {displayNameError}
                            </div>
                        </div>
                        <div className={styles.itemGroup}>
                            <div className={styles.label}>Phone Number:</div>
                            <input
                                className={styles.field}
                                type='tel'
                                spellCheck='false'
                                minLength={constants.MIN_PHONE_NUMBER_LENGTH}
                                maxLength={constants.MAX_PHONE_NUMBER_LENGTH}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <div className={styles.errorMessage}>
                                {phoneNumberError}
                            </div>
                        </div>
                        <div className={styles.itemGroup}>
                            <button
                                className={styles.completeButton}
                                onClick={handleComplete}
                            >
                                Complete Account
                            </button>
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
};
