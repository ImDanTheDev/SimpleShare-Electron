import React, { useState, useEffect } from 'react';
import { Panel } from '../Panel/Panel';
import { CircleButton } from '../CircleButton/CircleButton';
import { MdChevronLeft } from 'react-icons/md';
import styles from './AccountSettingsScreen.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentScreen } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { log } from '../../../common/log';
import { pushToast } from '../../../common/redux/toaster-slice';
import {
    constants,
    IAccountInfo,
    IPublicGeneralInfo,
    IUser,
    updateAccount,
} from 'simpleshare-common';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';
import { InputDropdown } from '../InputDropdown/InputDropdown';

export const AccountSettingsScreen: React.FC = () => {
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

    const profiles = useSelector((state: RootState) => state.profiles);

    const [displayName, setDisplayName] = useState<string>(
        publicGeneralInfo?.displayName || ''
    );
    const [phoneNumber, setPhoneNumber] = useState<string>(
        accountInfo?.phoneNumber || ''
    );

    // TODO: Add dropdown to set default profile id.
    const [defaultProfileId, setDefaultProfileId] = useState<string>(
        publicGeneralInfo?.defaultProfileId || ''
    );

    const [displayNameError, setDisplayNameError] = useState<string>('');
    const [phoneNumberError, setPhoneNumberError] = useState<string>('');

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

    useEffect(() => {
        if (updateAccountError) {
            dispatch(
                pushToast({
                    message:
                        'An unexpected error occurred while updating your account. Try again later.',
                    type: 'error',
                    duration: 5,
                    openToaster: true,
                })
            );
        }
    }, [updateAccountError]);

    const handleBack = () => {
        dispatch(setCurrentScreen('HomeScreen'));
    };

    const handleSave = async () => {
        if (!user) {
            log('User is undefined. Cannot save account');
            dispatch(
                pushToast({
                    message:
                        'You are signed out. Please sign in and try again.',
                    type: 'error',
                    duration: 5,
                    openToaster: true,
                })
            );
            return;
        }

        if (
            phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH ||
            displayName.length < constants.MIN_DISPLAY_NAME_LENGTH
        ) {
            return;
        }

        dispatch(
            updateAccount({
                accountInfo: {
                    phoneNumber: phoneNumber,
                    isAccountComplete: true,
                },
                publicGeneralInfo: {
                    displayName: displayName,
                    isComplete: true,
                    defaultProfileId: defaultProfileId,
                },
            })
        );
    };

    return (
        <div className={styles.screen}>
            <Panel
                title='Account Settings'
                left={
                    <CircleButton
                        style={{ width: 26, height: 26 }}
                        onClick={handleBack}
                    >
                        <MdChevronLeft className={styles.backButtonIcon} />
                    </CircleButton>
                }
            >
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
                            <div className={styles.label}>Default Profile:</div>
                            <InputDropdown
                                items={profiles.profiles.reduce(
                                    (obj, item) => ({
                                        ...obj,
                                        [item.id || '']: item.name,
                                    }),
                                    {}
                                )}
                                onSelectionChanged={(key) =>
                                    setDefaultProfileId(key)
                                }
                                unselectedText='Select a profile...'
                                defaultKey={
                                    profiles.profiles.find(
                                        (x) =>
                                            x.id ===
                                            publicGeneralInfo?.defaultProfileId
                                    )?.id
                                }
                            />
                            <div className={styles.errorMessage}>
                                {phoneNumberError}
                            </div>
                        </div>
                        <div className={styles.itemGroup}>
                            {updatingAccount ? (
                                <LoadingIcon />
                            ) : (
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSave}
                                >
                                    Save Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
};
