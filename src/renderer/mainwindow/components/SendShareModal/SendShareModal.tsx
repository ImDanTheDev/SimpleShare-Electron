import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { constants, IProfile, IUser, sendShare } from 'simpleshare-common';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';
import { log } from '../../../common/log';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { pushToast } from '../../../common/redux/toaster-slice';
import styles from './SendShareModal.module.scss';

export const SendShareModal: React.FC = () => {
    const dispatch = useDispatch();

    const user: IUser | undefined = useSelector(
        (state: RootState) => state.auth.user
    );

    const currentProfile: IProfile | undefined = useSelector(
        (state: RootState) =>
            state.profiles.profiles.find(
                (profile) => profile.id === state.profiles.currentProfileId
            )
    );

    const sendingShare = useSelector(
        (state: RootState) => state.shares.sendingShare
    );
    const sentShare = useSelector((state: RootState) => state.shares.sentShare);
    const sendShareError = useSelector(
        (state: RootState) => state.shares.sendShareError
    );

    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [profileName, setProfileName] = useState<string>('');
    const [shareText, setShareText] = useState<string>('');

    const [phoneNumberError, setPhoneNumberError] = useState<string>('');
    const [profileNameError, setProfileNameError] = useState<string>('');
    const [shareTextError, setShareTextError] = useState<string>('');
    const [triedSendingShare, setTriedSendingShare] = useState<boolean>(false);

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
    };

    useEffect(() => {
        if (
            triedSendingShare &&
            !sendingShare &&
            sentShare &&
            !sendShareError
        ) {
            dispatch(setCurrentModal('None'));
        }
    }, [triedSendingShare, sendingShare, sentShare, sendShareError]);

    useEffect(() => {
        if (profileName.length < constants.MIN_PROFILE_NAME_LENGTH) {
            setProfileNameError(
                `Profile name must be at least ${constants.MIN_PROFILE_NAME_LENGTH} characters long.`
            );
        } else {
            setProfileNameError('');
        }

        if (phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH) {
            setPhoneNumberError(
                `Phone number must be at least ${constants.MIN_PHONE_NUMBER_LENGTH} characters long.`
            );
        } else {
            setPhoneNumberError('');
        }

        if (shareText.length > constants.MAX_SHARE_TEXT_LENGTH) {
            setShareTextError(
                `Share text must not exceed ${constants.MAX_SHARE_TEXT_LENGTH} characters.`
            );
        } else {
            setShareTextError('');
        }
    }, [profileName, phoneNumber, shareText]);

    const handleSend = async () => {
        setTriedSendingShare(true);
        if (!user || !currentProfile || !currentProfile.id) {
            log('ERROR: Not signed in!');
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
            profileName.length < constants.MIN_PROFILE_NAME_LENGTH ||
            shareText.length > constants.MAX_SHARE_TEXT_LENGTH
        ) {
            return;
        }

        dispatch(
            sendShare({
                toPhoneNumber: phoneNumber,
                toProfileName: profileName,
                share: {
                    content: shareText,
                    type: 'text',
                },
            })
        );
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>Send Share</span>
            <span className={styles.fieldLabel}>Phone Number:</span>
            <input
                className={styles.field}
                type='text'
                value={phoneNumber}
                placeholder='+11234567890'
                minLength={constants.MIN_PHONE_NUMBER_LENGTH}
                maxLength={constants.MAX_PHONE_NUMBER_LENGTH}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <span className={styles.errorMessage}>{phoneNumberError}</span>
            <span className={styles.fieldLabel}>Profile Name:</span>
            <input
                className={styles.field}
                type='text'
                value={profileName}
                placeholder='Laptop'
                minLength={constants.MIN_PROFILE_NAME_LENGTH}
                maxLength={constants.MAX_PROFILE_NAME_LENGTH}
                onChange={(e) => setProfileName(e.target.value)}
            />
            <span className={styles.errorMessage}>{profileNameError}</span>
            <span className={styles.fieldLabel}>Message:</span>
            <textarea
                className={styles.field}
                value={shareText}
                placeholder='Type anything you want here!'
                maxLength={constants.MAX_SHARE_TEXT_LENGTH}
                rows={5}
                onChange={(e) => setShareText(e.target.value)}
            />
            <span className={styles.errorMessage}>{shareTextError}</span>
            {sendingShare ? (
                <LoadingIcon />
            ) : (
                <div className={styles.buttons}>
                    <button className={styles.button} onClick={handleDismiss}>
                        Cancel
                    </button>
                    <button className={styles.button} onClick={handleSend}>
                        Send
                    </button>
                </div>
            )}
            {triedSendingShare && sendShareError && (
                <span className={styles.errorMessage}>
                    {
                        'An unexpected error occurred while sending. Try again later.'
                    }
                </span>
            )}
        </div>
    );
};
