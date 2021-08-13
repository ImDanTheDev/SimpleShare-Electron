import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MAX_PROFILE_NAME_LENGTH,
    MIN_PROFILE_NAME_LENGTH,
} from '../../../common/constants';
import { error, log } from '../../../common/log';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { databaseService } from '../../../common/services/api';
import IUser from '../../../common/services/IUser';
import SimpleShareError, { ErrorCode } from '../../../common/SimpleShareError';
import styles from './NewProfileModal.module.scss';

export const NewProfileModal: React.FC = () => {
    const dispatch = useDispatch();

    const user: IUser | undefined = useSelector(
        (state: RootState) => state.auth.user
    );

    const [profileName, setProfileName] = useState<string>('');
    const [creatingProfile, setCreatingProfile] = useState<boolean>(false);

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
    };

    const handleSave = async () => {
        if (creatingProfile) return;
        if (!user) {
            log('User is not signed in. Cannot create profile.');
            return;
        }

        if (profileName.length < MIN_PROFILE_NAME_LENGTH) {
            log(
                `Profile names must be at least ${MIN_PROFILE_NAME_LENGTH} long`
            );
            return;
        }

        try {
            setCreatingProfile(true);
            await databaseService.createProfile(user.uid, {
                name: profileName,
            });
        } catch (e) {
            if (e instanceof SimpleShareError) {
                if (e.code === ErrorCode.UNEXPECTED_DATABASE_ERROR) {
                    error(
                        'An unexpected error occurred while creating the profile.',
                        e
                    );
                }
            }
        } finally {
            setCreatingProfile(false);
            handleDismiss();
        }

        dispatch(setCurrentModal('None'));
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>New Profile</span>
            <input
                className={styles.field}
                type='text'
                value={profileName}
                placeholder='Profile name...'
                minLength={MIN_PROFILE_NAME_LENGTH}
                maxLength={MAX_PROFILE_NAME_LENGTH}
                onChange={(e) => setProfileName(e.target.value)}
            />
            <div className={styles.buttons}>
                <button className={styles.button} onClick={handleDismiss}>
                    Cancel
                </button>
                <button className={styles.button} onClick={handleSave}>
                    Save
                </button>
            </div>
        </div>
    );
};
