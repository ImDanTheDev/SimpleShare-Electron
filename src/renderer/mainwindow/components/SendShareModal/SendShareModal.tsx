import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearProfiles,
    constants,
    ErrorCode,
    IProfile,
    IUser,
    searchProfiles,
    sendShare,
} from 'simpleshare-common';
import { MdClose, MdError } from 'react-icons/md';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';
import { log } from '../../../common/log';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { pushToast } from '../../../common/redux/toaster-slice';
import styles from './SendShareModal.module.scss';
import {
    MIN_PHONE_NUMBER_LENGTH,
    MIN_PROFILE_NAME_LENGTH,
} from 'simpleshare-common/dist/constants';

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
    const searchedProfiles = useSelector(
        (state: RootState) => state.search.profiles
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
    const [showPhoneNumberError, setShowPhoneNumberError] =
        useState<boolean>(false);
    const [showProfileNameError, setShowProfileNameError] =
        useState<boolean>(false);
    const [showSendError, setShowSendError] = useState<boolean>(false);
    const [showShareTextError, setShowShareTextError] =
        useState<boolean>(false);
    const [showAddRecipientError, setShowAddRecipientError] =
        useState<boolean>(false);
    const [addRecipientErrorMessage, setAddRecipientErrorMessage] = useState<
        string | undefined
    >(undefined);
    const [showProfileNameSuggestions, setShowProfileNameSuggestions] =
        useState<boolean>(false);
    const [pickingSuggestion, setPickingSuggestion] = useState<boolean>(false);

    const [recipients, setRecipients] = useState<
        {
            phoneNumber: string;
            profileName: string;
        }[]
    >([]);

    const [filteredProfiles, setFilteredProfiles] = useState<IProfile[]>([]);

    const handleDismiss = () => {
        dispatch(setCurrentModal('None'));
        dispatch(clearProfiles());
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
            dispatch(clearProfiles());
        }
    }, [triedSendingShare, sendingShare, sentShare, sendShareError]);

    useEffect(() => {
        if (profileName.length < constants.MIN_PROFILE_NAME_LENGTH) {
            setProfileNameError(
                `The profile name must be at least ${constants.MIN_PROFILE_NAME_LENGTH} characters long.`
            );
        } else {
            setProfileNameError('');
            setShowProfileNameError(false);
        }

        if (phoneNumber.length < constants.MIN_PHONE_NUMBER_LENGTH) {
            setPhoneNumberError(
                `The phone number must be at least ${constants.MIN_PHONE_NUMBER_LENGTH} characters long.`
            );
        } else {
            setPhoneNumberError('');
            setShowPhoneNumberError(false);
        }

        if (
            recipients.findIndex(
                (x) =>
                    x.phoneNumber === phoneNumber &&
                    x.profileName === profileName
            ) !== -1
        ) {
            setAddRecipientErrorMessage('You already added this recipient.');
        } else {
            setAddRecipientErrorMessage('');
            setShowAddRecipientError(false);
        }

        if (shareText.length > constants.MAX_SHARE_TEXT_LENGTH) {
            setShareTextError(
                `Share text must not exceed ${constants.MAX_SHARE_TEXT_LENGTH} characters.`
            );
        } else {
            setShareTextError('');
            setShowShareTextError(false);
        }
    }, [profileName, phoneNumber, shareText]);

    useEffect(() => {
        if (recipients.length === 0) {
            setSendErrorMessage('You must add at least one recipient');
        } else {
            setSendErrorMessage(undefined);
        }
    }, [recipients]);

    useEffect(() => {
        if (profileName.length === 0) {
            setFilteredProfiles(searchedProfiles);
            return;
        }

        setFilteredProfiles(
            searchedProfiles.filter((profile) =>
                profile.name.startsWith(profileName)
            )
        );
    }, [profileName, searchedProfiles]);

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

        if (recipients.length === 0) {
            setSendErrorMessage('You must add at least one recipient');
            return;
        }

        if (!fileBlob && shareText.length === 0) {
            setSendErrorMessage(
                'You must send at least text or a file. Select a file or enter text.'
            );
            return;
        }

        recipients.forEach((recipient) => {
            dispatch(
                sendShare({
                    toPhoneNumber: recipient.phoneNumber,
                    toProfileName: recipient.profileName,
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
        });

        setTriedSendingShare(true);
    };

    const handleClearFile = () => {
        setFileBlob(undefined);
        setFileExt(undefined);
        setFileName(undefined);
    };

    const handleAddRecipient = () => {
        if (phoneNumber.length === 0 || profileName.length === 0) return;
        if (
            recipients.findIndex(
                (x) =>
                    x.phoneNumber === phoneNumber &&
                    x.profileName === profileName
            ) !== -1
        ) {
            return;
        }

        if (
            phoneNumber.length < MIN_PHONE_NUMBER_LENGTH ||
            profileName.length < MIN_PROFILE_NAME_LENGTH
        ) {
            return;
        }

        setRecipients([
            ...recipients,
            {
                phoneNumber: phoneNumber,
                profileName: profileName,
            },
        ]);

        setPhoneNumber('');
        setProfileName('');
    };

    const renderRecipients = () => {
        const recipientEntries: {
            [index: string]: { profiles: string[] };
        } = {};

        recipients.forEach((recipient) => {
            if (recipientEntries[recipient.phoneNumber]) {
                recipientEntries[recipient.phoneNumber].profiles.push(
                    recipient.profileName
                );
            } else {
                recipientEntries[recipient.phoneNumber] = {
                    profiles: [recipient.profileName],
                };
            }
        });

        return Object.entries(recipientEntries).map((entry) => {
            return (
                <div key={entry[0]} className={styles.userGroup}>
                    <div className={styles.user}>
                        <div className={styles.userDisplayName}>{entry[0]}</div>
                        <div
                            className={styles.userDeleteButton}
                            onClick={() => handleRemoveUser(entry[0])}
                        >
                            <MdClose />
                        </div>
                    </div>
                    <div className={styles.profilesGroup}>
                        {entry[1].profiles.map((profile) => {
                            return (
                                <div key={profile} className={styles.profile}>
                                    <div className={styles.profileName}>
                                        {profile}
                                    </div>
                                    <div
                                        className={styles.profileDeleteButton}
                                        onClick={() =>
                                            handleRemoveProfile(
                                                entry[0],
                                                profile
                                            )
                                        }
                                    >
                                        <MdClose />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    const handleRemoveProfile = (phoneNumber: string, profileName: string) => {
        setRecipients(
            recipients.filter((x) => {
                return !(
                    x.phoneNumber === phoneNumber &&
                    x.profileName === profileName
                );
            })
        );
    };

    const handleRemoveUser = (phoneNumber: string) => {
        setRecipients(
            recipients.filter((x) => {
                return x.phoneNumber !== phoneNumber;
            })
        );
    };

    const handlePhoneNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPhoneNumber(e.target.value);
    };

    const handleProfileNameChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setProfileName(e.target.value);
    };

    const handleShareTextChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setShareText(e.target.value);
    };

    const handleProfileNameFocus = () => {
        dispatch(searchProfiles(phoneNumber));
        setShowProfileNameSuggestions(true);
    };

    const renderProfiles = () => {
        if (!showProfileNameSuggestions) return;
        if (filteredProfiles.length === 0) return;
        return (
            <div className={styles.profileNameDropdown}>
                {filteredProfiles.map((profile) => {
                    return (
                        <div
                            className={styles.profileItem}
                            key={profile.id}
                            onClick={() => {
                                setProfileName(profile.name);
                                setPickingSuggestion(false);
                                setShowProfileNameSuggestions(false);
                            }}
                            onMouseEnter={() => setPickingSuggestion(true)}
                            onMouseLeave={() => setPickingSuggestion(false)}
                        >
                            {profile.name}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={styles.modal}>
            <div className={styles.title}>Send Share</div>
            <div className={styles.columns}>
                <div className={styles.inputColumn}>
                    <div className={styles.addRecipientRow}>
                        <div className={styles.phoneNumberContainer}>
                            <div className={styles.phoneNumberLabel}>
                                Phone Number:
                            </div>
                            <div className={styles.phoneNumberInput}>
                                <input
                                    className={styles.textField}
                                    placeholder='+11234567890'
                                    minLength={
                                        constants.MIN_PHONE_NUMBER_LENGTH
                                    }
                                    maxLength={
                                        constants.MAX_PHONE_NUMBER_LENGTH
                                    }
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                />
                                {phoneNumberError && (
                                    <MdError
                                        className={styles.phoneNumberErrorIcon}
                                        onMouseEnter={() =>
                                            setShowPhoneNumberError(true)
                                        }
                                        onMouseLeave={() =>
                                            setShowPhoneNumberError(false)
                                        }
                                    />
                                )}

                                {showPhoneNumberError && (
                                    <div
                                        className={
                                            styles.phoneNumberErrorTooltip
                                        }
                                    >
                                        <div
                                            className={styles.tooltipArrow}
                                        ></div>
                                        {phoneNumberError}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.profileNameContainer}>
                            <div className={styles.profileNameLabel}>
                                Profile Name:
                            </div>
                            <div className={styles.profileNameInput}>
                                <input
                                    className={styles.textField}
                                    placeholder='Laptop'
                                    minLength={
                                        constants.MIN_PROFILE_NAME_LENGTH
                                    }
                                    maxLength={
                                        constants.MAX_PROFILE_NAME_LENGTH
                                    }
                                    value={profileName}
                                    onChange={handleProfileNameChange}
                                    onFocus={handleProfileNameFocus}
                                    onBlur={() => {
                                        if (!pickingSuggestion) {
                                            setShowProfileNameSuggestions(
                                                false
                                            );
                                        }
                                    }}
                                    style={
                                        showProfileNameSuggestions &&
                                        filteredProfiles.length > 0
                                            ? {
                                                  borderBottomLeftRadius: 0,
                                                  borderBottomRightRadius: 0,
                                                  borderBottomStyle: 'none',
                                                  zIndex: 102,
                                                  marginBottom: 1,
                                              }
                                            : {}
                                    }
                                />
                                {profileNameError && (
                                    <MdError
                                        className={styles.profileNameErrorIcon}
                                        onMouseEnter={() =>
                                            setShowProfileNameError(true)
                                        }
                                        onMouseLeave={() =>
                                            setShowProfileNameError(false)
                                        }
                                    />
                                )}
                                {renderProfiles()}

                                {showProfileNameError && (
                                    <div
                                        className={
                                            styles.profileNameErrorTooltip
                                        }
                                    >
                                        <div
                                            className={styles.tooltipArrow}
                                        ></div>
                                        {profileNameError}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.addRecipientButtonContainer}>
                            <div className={styles.addRecipientButton}>
                                <button
                                    className={styles.secondaryButton}
                                    style={
                                        addRecipientErrorMessage
                                            ? { paddingRight: '36px' }
                                            : {}
                                    }
                                    onClick={handleAddRecipient}
                                >
                                    Add Recipient
                                </button>
                                {addRecipientErrorMessage && (
                                    <MdError
                                        className={styles.addRecipientIcon}
                                        onMouseEnter={() =>
                                            setShowAddRecipientError(true)
                                        }
                                        onMouseLeave={() =>
                                            setShowAddRecipientError(false)
                                        }
                                    />
                                )}
                            </div>
                            {showAddRecipientError && (
                                <div
                                    className={styles.addRecipientErrorTooltip}
                                >
                                    <div className={styles.tooltipArrow}></div>
                                    {addRecipientErrorMessage}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.shareRow}>
                        <div className={styles.messageContainer}>
                            <div className={styles.messageLabel}>Message:</div>
                            <div className={styles.messageInput}>
                                <textarea
                                    className={styles.textField}
                                    placeholder='Type anything you want here!'
                                    maxLength={constants.MAX_SHARE_TEXT_LENGTH}
                                    value={shareText}
                                    onChange={handleShareTextChange}
                                    rows={4}
                                />
                                {shareTextError && (
                                    <MdError
                                        className={styles.shareTextErrorIcon}
                                        onMouseEnter={() =>
                                            setShowShareTextError(true)
                                        }
                                        onMouseLeave={() =>
                                            setShowShareTextError(false)
                                        }
                                    />
                                )}

                                {showShareTextError && (
                                    <div
                                        className={styles.shareTextErrorTooltip}
                                    >
                                        <div
                                            className={styles.tooltipArrow}
                                        ></div>
                                        {shareTextError}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.selectFileButtonContainer}>
                            {fileName ? (
                                <div className={styles.changeFileButtonGroup}>
                                    <div
                                        className={styles.changeFileButton}
                                        onClick={handleSelectFile}
                                    >
                                        <span>{fileName}</span>
                                    </div>
                                    <div
                                        className={styles.clearFileButton}
                                        onClick={handleClearFile}
                                    >
                                        <MdClose />
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
                        <div className={styles.finalButtons}>
                            {sendingShare ? (
                                <LoadingIcon style={{ flex: 1 }} />
                            ) : (
                                <>
                                    <div className={styles.cancelButton}>
                                        <button
                                            className={styles.secondaryButton}
                                            onClick={handleDismiss}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className={styles.sendButton}>
                                        <button
                                            className={styles.secondaryButton}
                                            onClick={handleSend}
                                        >
                                            Send
                                        </button>
                                        {sendErrorMessage && (
                                            <MdError
                                                className={styles.sendErrorIcon}
                                                onMouseEnter={() =>
                                                    setShowSendError(true)
                                                }
                                                onMouseLeave={() =>
                                                    setShowSendError(false)
                                                }
                                            />
                                        )}
                                    </div>
                                    {showSendError && (
                                        <div
                                            className={styles.sendErrorTooltip}
                                        >
                                            <div
                                                className={styles.tooltipArrow}
                                            ></div>
                                            {sendErrorMessage}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.recipientsColumn}>
                    <div className={styles.recipientsLabel}>Recipients:</div>
                    <div className={styles.recipientsScrollContainer}>
                        <div className={styles.recipientsList}>
                            {recipients.length === 0 ? (
                                <span
                                    className={styles.noRecipientsText}
                                    style={{ alignSelf: 'center' }}
                                >
                                    No Recipients
                                </span>
                            ) : (
                                renderRecipients()
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
