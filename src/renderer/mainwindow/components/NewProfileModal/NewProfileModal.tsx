import React, { useEffect, useState } from 'react';
import { MdAddAPhoto, MdClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import {
    constants,
    createProfile,
    deleteCloudProfile,
    selectProfileForEditing,
    updateCloudProfile,
} from 'simpleshare-common';
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

    const updatingProfile = useSelector(
        (state: RootState) => state.profiles.updatingProfile
    );
    const updateProfileError = useSelector(
        (state: RootState) => state.profiles.updateProfileError
    );
    const updatedProfile = useSelector(
        (state: RootState) => state.profiles.updatedProfile
    );

    const profileSelectedForEdit = useSelector(
        (state: RootState) => state.profiles.profileSelectedForEdit
    );

    const [profileName, setProfileName] = useState<string>(
        profileSelectedForEdit?.name || ''
    );
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [triedCreatingProfile, setTriedCreatingProfile] =
        useState<boolean>(false);
    const [triedUpdatingProfile, setTriedUpdatingProfile] =
        useState<boolean>(false);

    const [pfpURL, setPFPURL] = useState<string | undefined>(
        profileSelectedForEdit?.pfp || undefined
    );
    const [pfp, setPFP] = useState<Blob | undefined>(undefined);

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
        dispatch(selectProfileForEditing(undefined));
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

    useEffect(() => {
        if (
            triedCreatingProfile &&
            !creatingProfile &&
            createdProfile &&
            !createProfileError
        ) {
            dispatch(setCurrentModal('None'));
            dispatch(selectProfileForEditing(undefined));
        } else if (
            triedCreatingProfile &&
            !creatingProfile &&
            !createdProfile &&
            createProfileError
        ) {
            setErrorMessage('An unexpected error occurred. Try again later.');
        } else if (
            triedUpdatingProfile &&
            !updatingProfile &&
            updatedProfile &&
            !updateProfileError
        ) {
            dispatch(setCurrentModal('None'));
            dispatch(selectProfileForEditing(undefined));
        } else if (
            triedUpdatingProfile &&
            !updatingProfile &&
            !updatedProfile &&
            updateProfileError
        ) {
            setErrorMessage('An unexpected error occurred. Try again later.');
        }
    }, [
        triedCreatingProfile,
        creatingProfile,
        createdProfile,
        createProfileError,
        triedUpdatingProfile,
        updatingProfile,
        updatedProfile,
        updateProfileError,
    ]);

    const handleSave = () => {
        if (profileName.length < constants.MIN_PROFILE_NAME_LENGTH) {
            return;
        }

        if (profileSelectedForEdit) {
            setTriedUpdatingProfile(true);
            dispatch(
                updateCloudProfile({
                    profile: {
                        ...profileSelectedForEdit,
                        name: profileName,
                        pfp: pfp ? '' : undefined, // If pfpSrc is set, then this field is ignored anyways so send ''.
                    },
                    pfpSrc: pfp,
                })
            );
        } else {
            setTriedCreatingProfile(true);
            dispatch(
                createProfile({
                    profile: {
                        name: profileName,
                    },

                    pfpSrc: pfp,
                })
            );
        }
    };

    const handleDelete = () => {
        if (profileSelectedForEdit) {
            dispatch(deleteCloudProfile(profileSelectedForEdit));
            dispatch(setCurrentModal('None'));
            dispatch(selectProfileForEditing(undefined));
        }
    };

    const handlePFPClick = async () => {
        if (pfp || (pfpURL && pfpURL !== constants.DEFAULT_PFP_ID)) {
            setPFP(undefined);
            setPFPURL(undefined);
            return;
        }

        const selectedFile: { buffer: string; ext: string } | undefined =
            (await window.api.invoke('APP_GET_FILE', {
                filters: [
                    {
                        name: 'Images',
                        extensions: ['jpg', 'jpeg', 'png'],
                    },
                ],
            })) as { buffer: string; ext: string } | undefined;
        if (selectedFile) {
            const imageData: Uint8Array = Uint8Array.from(
                window.atob(selectedFile.buffer),
                (c) => c.charCodeAt(0)
            );
            setPFP(
                new Blob([imageData], {
                    type: `image/${
                        selectedFile.ext === 'jpg' ? 'jpeg' : selectedFile.ext
                    }`,
                })
            );
        }
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>
                {profileSelectedForEdit ? 'Update Profile' : 'New Profile'}
            </span>
            <div className={styles.inputs}>
                <div
                    className={styles.pfp}
                    style={
                        pfp || (pfpURL && pfpURL !== constants.DEFAULT_PFP_ID)
                            ? {
                                  backgroundImage: `url(${
                                      pfpURL &&
                                      pfpURL !== constants.DEFAULT_PFP_ID
                                          ? pfpURL
                                          : URL.createObjectURL(pfp)
                                  })`,
                                  backgroundSize: 'contain',
                              }
                            : {}
                    }
                    onClick={handlePFPClick}
                    title={
                        pfp ? 'Remove Profile Picture' : 'Add Profile Picture'
                    }
                >
                    {pfp || (pfpURL && pfpURL !== constants.DEFAULT_PFP_ID) ? (
                        <MdClose className={styles.removePFPIcon} />
                    ) : (
                        <MdAddAPhoto className={styles.pfpIcon} />
                    )}
                </div>
                <input
                    className={styles.field}
                    type='text'
                    value={profileName}
                    placeholder='Profile name...'
                    minLength={constants.MIN_PROFILE_NAME_LENGTH}
                    maxLength={constants.MAX_PROFILE_NAME_LENGTH}
                    onChange={(e) => setProfileName(e.target.value)}
                />
            </div>

            <div className={styles.errorMessage}>
                {creatingProfile || updatingProfile ? (
                    <LoadingIcon />
                ) : (
                    errorMessage
                )}
            </div>
            <div className={styles.buttons}>
                <button className={styles.button} onClick={handleDismiss}>
                    Cancel
                </button>
                {profileSelectedForEdit ? (
                    <button className={styles.button} onClick={handleDelete}>
                        Delete
                    </button>
                ) : (
                    <div />
                )}
                <button className={styles.button} onClick={handleSave}>
                    Save
                </button>
            </div>
        </div>
    );
};
