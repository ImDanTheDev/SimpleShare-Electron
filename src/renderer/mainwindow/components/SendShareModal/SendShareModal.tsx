import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    constants,
    ErrorCode,
    IProfile,
    IUser,
    sendShare,
} from 'simpleshare-common';
import { MdClose } from 'react-icons/md';
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
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [fileBlob, setFileBlob] = useState<Blob | undefined>(undefined);
    const [fileExt, setFileExt] = useState<string | undefined>(undefined);
    const [sendErrorMessage, setSendErrorMessage] = useState<
        string | undefined
    >(undefined);

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
    };

    useEffect(() => {
        if (
            triedSendingShare &&
            !sendingShare &&
            !sentShare &&
            sendShareError
        ) {
            switch (sendShareError.code) {
                case ErrorCode.NOT_SIGNED_IN:
                    setSendErrorMessage(
                        'You are not signed in. Please sign out and sign in.'
                    );
                    break;
                case ErrorCode.NO_PROFILE_SELECTED:
                    setSendErrorMessage(
                        'No profile selected. Please switch to the profile from which to send the share from.'
                    );
                    break;
                case ErrorCode.USER_DOES_NOT_EXIST:
                    setSendErrorMessage(
                        'The provided user does not exist. Verify that the phone number is correct.'
                    );
                    break;
                case ErrorCode.PROFILE_DOES_NOT_EXIST:
                    setSendErrorMessage(
                        'The provided profile does not exist. Verify that the profile name is correct. Profile names are case sensitive.'
                    );
                    break;
                default:
                    setSendErrorMessage(
                        'An unexpected error occurred while sending. Try again later.'
                    );
                    break;
            }
        } else if (
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

    const handleSelectFile = async () => {
        const { buffer, fileName, ext, mimeType } = await window.api.invoke(
            'APP_GET_FILE',
            {
                filters: [
                    {
                        name: 'All Files',
                        extensions: ['*'],
                    },
                ],
            }
        );

        const fileData: Uint8Array = Uint8Array.from(window.atob(buffer), (c) =>
            c.charCodeAt(0)
        );

        setFileBlob(
            new Blob([fileData], {
                type: mimeType || 'application/octet-stream',
            })
        );
        setFileName(fileName);
        setFileExt(ext);
    };

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

        if (!fileBlob && shareText.length === 0) {
            setSendErrorMessage(
                'You must send at least text or a file. Select a file or enter text.'
            );
            return;
        }

        dispatch(
            sendShare({
                toPhoneNumber: phoneNumber,
                toProfileName: profileName,
                share: {
                    textContent: shareText,
                    fileSrc:
                        fileBlob && fileExt
                            ? {
                                  blob: fileBlob,
                                  ext: fileExt,
                              }
                            : undefined,
                },
            })
        );
    };

    const handleClearFile = () => {
        setFileBlob(undefined);
        setFileExt(undefined);
        setFileName(undefined);
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>Send Share</span>
            <span className={styles.fieldLabel}>Phone Number:</span>
            <input
                className={styles.textField}
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
                className={styles.textField}
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
                className={styles.textField}
                value={shareText}
                placeholder='Type anything you want here!'
                maxLength={constants.MAX_SHARE_TEXT_LENGTH}
                rows={4}
                onChange={(e) => setShareText(e.target.value)}
            />
            <span className={styles.errorMessage}>{shareTextError}</span>
            <div style={{ height: '32px', display: 'flex' }}>
                {fileName ? (
                    <div className={styles.selectedFileButtonGroup}>
                        <div
                            className={styles.clearFileButton}
                            title='Clear file'
                            onClick={handleClearFile}
                        >
                            <MdClose className={styles.clearFileButtonIcon} />
                        </div>
                        <div
                            className={styles.changeFileButton}
                            onClick={handleSelectFile}
                        >
                            <span>{fileName}</span>
                        </div>
                    </div>
                ) : (
                    <button
                        className={styles.secondaryButton}
                        onClick={handleSelectFile}
                    >
                        Select File
                    </button>
                )}
            </div>

            {sendingShare ? (
                <LoadingIcon />
            ) : (
                <div
                    style={{
                        height: '32px',
                        display: 'flex',
                        gap: '8px',
                    }}
                >
                    <button
                        className={styles.secondaryButton}
                        onClick={handleDismiss}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.secondaryButton}
                        onClick={handleSend}
                    >
                        Send
                    </button>
                </div>
            )}
            {triedSendingShare && sendErrorMessage && (
                <span className={styles.errorMessage}>{sendErrorMessage}</span>
            )}
        </div>
    );
};
