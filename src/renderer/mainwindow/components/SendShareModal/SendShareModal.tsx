import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { constants, IProfile, IShare, IUser } from 'simpleshare-common';
import { error, log } from '../../../common/log';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { addShareToOutbox } from '../../../common/redux/outbox-slice';
import { RootState } from '../../../common/redux/store';
import { pushToast } from '../../../common/redux/toaster-slice';
import { databaseService } from '../../../common/services/api';
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

    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [profileName, setProfileName] = useState<string>('');
    const [shareText, setShareText] = useState<string>('');

    const [phoneNumberError, setPhoneNumberError] = useState<string>('');
    const [profileNameError, setProfileNameError] = useState<string>('');
    const [shareTextError, setShareTextError] = useState<string>('');

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
    };

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

        if (phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH) {
            log(`'${phoneNumber}' is not a valid phone number.`);
            return;
        }

        if (profileName.length < constants.MIN_PROFILE_NAME_LENGTH) {
            log(`'${profileName}' is not a valid profile name.`);
            return;
        }

        if (shareText.length > constants.MAX_SHARE_TEXT_LENGTH) {
            log(
                `Your message length must not exceed ${constants.MAX_SHARE_TEXT_LENGTH} characters.`
            );
            return;
        }

        const toUid = await databaseService.getUidByPhoneNumber(phoneNumber);
        if (!toUid) {
            log('Could not find a user with the provided phone number.');
            setPhoneNumberError('User does not exist.');
            return;
        }

        const toProfileId = await databaseService.getProfileIdByName(
            toUid,
            profileName
        );
        if (!toProfileId) {
            log(`Profile '${profileName}' does not exist.`);
            setProfileNameError('Profile does not exist.');
            return;
        }

        const share: IShare = {
            fromUid: user.uid,
            fromProfileId: currentProfile.id,
            toUid: toUid,
            toProfileId: toProfileId,
            content: shareText,
            type: 'text',
        };

        try {
            await databaseService.createShare(share);
            dispatch(addShareToOutbox(share));
            dispatch(setCurrentModal('None'));
        } catch (e) {
            error('Failed to send share: ', e);
            setShareTextError(
                'An error occurred while sending the share. Try again later.'
            );
        }
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
            <div className={styles.buttons}>
                <button className={styles.button} onClick={handleDismiss}>
                    Cancel
                </button>
                <button className={styles.button} onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
};
