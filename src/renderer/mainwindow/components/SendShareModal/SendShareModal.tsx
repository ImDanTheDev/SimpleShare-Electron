import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MAX_PHONE_NUMBER_LENGTH,
    MAX_PROFILE_NAME_LENGTH,
    MAX_SHARE_TEXT_LENGTH,
    MIN_PHONE_NUMBER_LENGTH,
    MIN_PROFILE_NAME_LENGTH,
} from '../../../common/constants';
import { error, log } from '../../../common/log';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { addShareToOutbox } from '../../../common/redux/outbox-slice';
import { RootState } from '../../../common/redux/store';
import { databaseService } from '../../../common/services/api';
import IProfile from '../../../common/services/IProfile';
import IShare from '../../../common/services/IShare';
import IUser from '../../../common/services/IUser';
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

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
    };

    const handleSend = async () => {
        if (!user || !currentProfile || !currentProfile.id) {
            log('ERROR: Not signed in!');
            return;
        }

        if (phoneNumber.length < MIN_PHONE_NUMBER_LENGTH) {
            log(`'${phoneNumber}' is not a valid phone number.`);
            return;
        }

        if (profileName.length < MIN_PROFILE_NAME_LENGTH) {
            log(`'${profileName}' is not a valid profile name.`);
            return;
        }

        if (shareText.length > MAX_SHARE_TEXT_LENGTH) {
            log(
                `Your message length must not exceed ${MAX_SHARE_TEXT_LENGTH} characters.`
            );
            return;
        }

        const toUid = await databaseService.getUidByPhoneNumber(phoneNumber);
        if (!toUid) {
            log('Could not find a user with the provided phone number.');
            return;
        }

        const toProfileId = await databaseService.getProfileIdByName(
            toUid,
            profileName
        );
        if (!toProfileId) {
            log(`Profile '${profileName}' does not exist.`);
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
        }
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>Send Share</span>
            <input
                className={styles.field}
                type='text'
                value={phoneNumber}
                placeholder='Phone number...'
                minLength={MIN_PHONE_NUMBER_LENGTH}
                maxLength={MAX_PHONE_NUMBER_LENGTH}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
                className={styles.field}
                type='text'
                value={profileName}
                placeholder='Profile name...'
                minLength={MIN_PROFILE_NAME_LENGTH}
                maxLength={MAX_PROFILE_NAME_LENGTH}
                onChange={(e) => setProfileName(e.target.value)}
            />
            <textarea
                className={styles.field}
                value={shareText}
                placeholder='Enter text to share...'
                maxLength={MAX_SHARE_TEXT_LENGTH}
                rows={5}
                onChange={(e) => setShareText(e.target.value)}
            />
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
