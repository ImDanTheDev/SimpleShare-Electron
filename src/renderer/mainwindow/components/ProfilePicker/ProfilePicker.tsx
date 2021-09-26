import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { CircleButton } from '../CircleButton/CircleButton';
import styles from './ProfilePicker.module.scss';
import { MdChevronLeft, MdChevronRight, MdAdd, MdEdit } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { pushToast } from '../../../common/redux/toaster-slice';
import {
    constants,
    IProfile,
    selectProfileForEditing,
    switchProfile,
} from 'simpleshare-common';

export const ProfilePicker: React.FC = () => {
    const dispatch = useDispatch();

    const profiles: IProfile[] = useSelector(
        (state: RootState) => state.profiles.profiles
    );

    const currentProfile = useSelector(
        (state: RootState) =>
            // Find current profile.
            // If current profile doesnt exist, pick the first profile.
            // If no profiles exist, return undefined.
            state.profiles.profiles.find(
                (profile) => profile.id === state.profiles.currentProfileId
            ) || state.profiles.profiles[0]
    );

    const publicGeneralInfo = useSelector(
        (state: RootState) => state.user.publicGeneralInfo
    );

    const editingProfiles: boolean = useSelector(
        (state: RootState) => state.profiles.editingProfiles
    );

    const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
    const [showRightArrow, setShowRightArrow] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/ban-types
    const profileListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        profileListRef.current?.addEventListener('scroll', handleScroll);
        profileListRef.current?.scroll(1, 0);
        profileListRef.current?.scroll(0, 0);
        return () => {
            profileListRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScroll = () => {
        if (!profileListRef.current) {
            return;
        }

        if (profileListRef.current.scrollLeft > 0) {
            setShowLeftArrow(true);
        } else {
            setShowLeftArrow(false);
        }

        if (
            profileListRef.current.scrollLeft <
            profileListRef.current.scrollWidth -
                profileListRef.current.clientWidth
        ) {
            setShowRightArrow(true);
        } else {
            setShowRightArrow(false);
        }
    };

    const handleLeftArrow = () => {
        profileListRef.current?.scrollBy({
            left: -profileListRef.current.offsetWidth,
            behavior: 'smooth',
        });
    };

    const handleRightArrow = () => {
        profileListRef.current?.scrollBy({
            left: profileListRef.current.offsetWidth,
            behavior: 'smooth',
        });
    };

    const handleProfileClick = (profile: IProfile) => {
        if (editingProfiles || currentProfile?.id === profile.id) return;
        if (!profile.id) {
            dispatch(
                pushToast({
                    message: 'The selected profile does not exist.',
                    type: 'warn',
                    duration: 5,
                    openToaster: true,
                })
            );
            return;
        }
        dispatch(switchProfile(profile));
    };

    const handleNewProfile = () => {
        if (profiles.length >= 5) {
            dispatch(
                pushToast({
                    message: 'You may only have 5 profiles.',
                    type: 'info',
                    duration: 5,
                    openToaster: true,
                })
            );
            return;
        }
        dispatch(setCurrentModal('NewProfileModal'));
    };

    const handleEditProfile = (profile: IProfile) => {
        dispatch(selectProfileForEditing(profile));
        dispatch(setCurrentModal('NewProfileModal'));
    };

    const renderEditButton = (profile: IProfile) => {
        if (!editingProfiles) return <></>;

        return (
            <div
                className={styles.deleteProfileButtonContainer}
                onClick={() => handleEditProfile(profile)}
            >
                <div className={styles.deleteProfileButton}>
                    <MdEdit className={styles.deleteProfileButtonIcon} />
                </div>
            </div>
        );
    };

    const renderProfiles = (): ReactNode[] => {
        const profileButtons: ReactNode[] = [];

        profiles.forEach((profile) => {
            profileButtons.push(
                <CircleButton
                    key={profile.id}
                    style={{
                        width: 50,
                        height: 50,
                        borderWidth:
                            profile.id === currentProfile?.id ||
                            publicGeneralInfo?.defaultProfileId === profile.id
                                ? 2
                                : 1,
                        borderRadius:
                            profile.id === currentProfile?.id ? 16 : '50%',
                        overflow: 'hidden',
                        borderColor:
                            publicGeneralInfo?.defaultProfileId === profile.id
                                ? '#ee7b1ca1'
                                : undefined,
                    }}
                    tooltip={
                        publicGeneralInfo?.defaultProfileId === profile.id
                            ? `(Default) ${profile.name}`
                            : profile.name
                    }
                    disableAnimation={editingProfiles}
                    onClick={() => handleProfileClick(profile)}
                >
                    {renderEditButton(profile)}
                    {!profile.pfp ||
                    profile.pfp === constants.DEFAULT_PFP_ID ? (
                        <span className={styles.profileLabel}>
                            {profile.name.length > 2
                                ? profile.name.slice(0, 2)
                                : profile.name}
                        </span>
                    ) : (
                        <img
                            className={styles.profileImage}
                            src={profile.pfp}
                        />
                    )}
                </CircleButton>
            );
        });

        return profileButtons;
    };

    return (
        <div className={styles.picker}>
            {showLeftArrow ? (
                <button className={styles.leftArrow} onClick={handleLeftArrow}>
                    <MdChevronLeft />
                </button>
            ) : (
                <></>
            )}
            <div className={styles.profileList} ref={profileListRef}>
                <CircleButton
                    style={{ height: 50, width: 50 }}
                    onClick={handleNewProfile}
                    tooltip='Create Profile'
                >
                    <MdAdd fontSize={64} color='#FFF' />
                </CircleButton>
                {renderProfiles()}
            </div>
            {showRightArrow ? (
                <button
                    className={styles.rightArrow}
                    onClick={handleRightArrow}
                >
                    <MdChevronRight />
                </button>
            ) : (
                <></>
            )}
        </div>
    );
};
