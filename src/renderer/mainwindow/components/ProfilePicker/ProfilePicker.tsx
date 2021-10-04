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
    updateAccount,
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
    const [dragging, setDragging] = useState<boolean>(false);
    const [previewX, setPreviewX] = useState<number>(0);

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

    const handleDropOnList = (e: React.DragEvent<HTMLDivElement>) => {
        setDragging(false);

        const profile: IProfile | undefined = profiles.find(
            (x) => x.id === e.dataTransfer.getData('profileId')
        );
        if (!profile) return;
        e.preventDefault();

        const gapBetweenProfiles = 8;
        const profileWidth = 50;
        let newIndex =
            e.clientX -
            e.currentTarget.getBoundingClientRect().left -
            gapBetweenProfiles -
            profileWidth / 2;
        newIndex = Math.floor(newIndex / (profileWidth + gapBetweenProfiles));
        newIndex = Math.max(0, Math.min(profiles.length, newIndex));

        const tmpProfiles = [...profiles];
        const oldIndex = tmpProfiles.findIndex((i) => i.id === profile.id);

        if (oldIndex !== newIndex && oldIndex + 1 !== newIndex) {
            if (newIndex > oldIndex) {
                tmpProfiles.splice(
                    newIndex - 1,
                    0,
                    tmpProfiles.splice(oldIndex, 1)[0]
                );
            } else {
                tmpProfiles.splice(
                    newIndex,
                    0,
                    tmpProfiles.splice(oldIndex, 1)[0]
                );
            }
        }

        if (!publicGeneralInfo) return;
        dispatch(
            updateAccount({
                publicGeneralInfo: {
                    ...publicGeneralInfo,
                    profilePositions: tmpProfiles.map(
                        (profile) => profile.id || ''
                    ),
                },
            })
        );
    };

    const handleDragOverList = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const gapBetweenProfiles = 8;
        const profileWidth = 50;
        let x =
            e.clientX -
            e.currentTarget.getBoundingClientRect().left -
            gapBetweenProfiles -
            profileWidth / 2;
        x = Math.floor(x / (profileWidth + gapBetweenProfiles));
        x = Math.max(0, Math.min(profiles.length, x));

        setPreviewX((x + 1) * (profileWidth + gapBetweenProfiles));
        setDragging(true);
    };

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        profile: IProfile
    ) => {
        if (!profile.id) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('profileId', profile.id);
        e.dataTransfer.setDragImage(e.currentTarget, 25, 25);
    };

    const handleDragEnd = () => {
        setDragging(false);
    };

    const renderProfiles = (): ReactNode[] => {
        const profileButtons: ReactNode[] = [];

        profiles.forEach((profile) => {
            profileButtons.push(
                <div
                    key={profile.id}
                    style={{
                        transform: 'translate(0,0)',
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, profile)}
                    onDragEnd={handleDragEnd}
                >
                    <CircleButton
                        key={profile.id}
                        style={{
                            width: 50,
                            height: 50,
                            borderWidth:
                                profile.id === currentProfile?.id ||
                                publicGeneralInfo?.defaultProfileId ===
                                    profile.id
                                    ? 2
                                    : 1,
                            borderRadius:
                                profile.id === currentProfile?.id ? 16 : '50%',
                            overflow: 'hidden',
                            borderColor:
                                publicGeneralInfo?.defaultProfileId ===
                                profile.id
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
                </div>
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
            <div
                className={styles.profileList}
                ref={profileListRef}
                onDrop={handleDropOnList}
                onDragOver={handleDragOverList}
            >
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
            {dragging && (
                <div
                    className={styles.dragPreview}
                    style={{
                        left: previewX + 2,
                    }}
                />
            )}
        </div>
    );
};
