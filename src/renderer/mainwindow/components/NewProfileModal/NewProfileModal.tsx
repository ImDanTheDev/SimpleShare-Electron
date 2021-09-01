import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { constants, createProfile } from 'simpleshare-common';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import styles from './NewProfileModal.module.scss';

export const NewProfileModal: React.FC = () => {
    const dispatch = useDispatch();

    const creatingProfile = useSelector(
        (state: RootState) => state.profiles.creatingProfile
    );
    const createProfileError = useSelector(
        (state: RootState) => state.profiles.createProfileError
    );
    const createdProfile = useSelector(
        (state: RootState) => state.profiles.createdProfile
    );

    const [profileName, setProfileName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [triedCreatingProfile, setTriedCreatingProfile] =
        useState<boolean>(false);

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
    };

    useEffect(() => {
        if (profileName.length < 2) {
            setErrorMessage(
                `Profile names must be at least ${constants.MIN_PROFILE_NAME_LENGTH} characters long.`
            );
        } else {
            setErrorMessage('');
        }
    }, [profileName]);

    useEffect;

    useEffect(() => {
        if (
            triedCreatingProfile &&
            !creatingProfile &&
            createdProfile &&
            !createProfileError
        ) {
            dispatch(setCurrentModal('None'));
        } else if (
            triedCreatingProfile &&
            !creatingProfile &&
            !createdProfile &&
            createProfileError
        ) {
            setErrorMessage('An unexpected error occurred. Try again later.');
        }
    }, [creatingProfile, createdProfile, createProfileError]);

    const handleSave = () => {
        setTriedCreatingProfile(true);
        if (profileName.length < constants.MIN_PROFILE_NAME_LENGTH) {
            return;
        }

        dispatch(
            createProfile({
                name: profileName,
            })
        );
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>New Profile</span>
            <input
                className={styles.field}
                type='text'
                value={profileName}
                placeholder='Profile name...'
                minLength={constants.MIN_PROFILE_NAME_LENGTH}
                maxLength={constants.MAX_PROFILE_NAME_LENGTH}
                onChange={(e) => setProfileName(e.target.value)}
            />

            <div className={styles.errorMessage}>
                {creatingProfile ? <LoadingIcon /> : errorMessage}
            </div>
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
