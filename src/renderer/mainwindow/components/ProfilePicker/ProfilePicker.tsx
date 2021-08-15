import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { CircleButton } from '../CircleButton/CircleButton';
import styles from './ProfilePicker.module.scss';
import { MdChevronLeft, MdChevronRight, MdAdd, MdClose } from 'react-icons/md';
import IProfile from '../../../common/services/IProfile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import { setCurrentProfile } from '../../../common/redux/profiles-slice';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { log } from '../../../common/log';
import { setShares } from '../../../common/redux/shares-slice';
import { databaseService } from '../../../common/services/api';
import IUser from '../../../common/services/IUser';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';

export const ProfilePicker: React.FC = () => {
    const dispatch = useDispatch();

    const user: IUser | undefined = useSelector(
        (state: RootState) => state.auth.user
    );

    const profiles: IProfile[] = useSelector(
        (state: RootState) => state.profiles.profiles
    );

    const fetchingProfiles: boolean | undefined = useSelector(
        (state: RootState) => state.profiles.fetchingProfiles
    );

    const currentProfile: IProfile | undefined = useSelector(
        (state: RootState) =>
            state.profiles.profiles.find(
                (profile) => profile.id === state.profiles.currentProfileId
            )
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
        if (!profile.id) return;
        dispatch(setShares([]));
        dispatch(setCurrentProfile(profile.id));
    };

    const handleNewProfile = () => {
        if (profiles.length >= 5) {
            log('You may only have 5 profiles');
            return;
        }
        dispatch(setCurrentModal('NewProfileModal'));
    };

    const handleDeleteProfile = async (profile: IProfile) => {
        if (!user || !profile.id) return;
        await databaseService.deleteProfile(user.uid, profile.id);
    };

    const renderDeleteButton = (profile: IProfile) => {
        if (!editingProfiles || profile.id === 'default') return <></>;

        return (
            <div
                className={styles.deleteProfileButton}
                onClick={() => handleDeleteProfile(profile)}
            >
                <MdClose className={styles.deleteProfileButtonIcon} />
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
                        borderWidth: profile.id === currentProfile?.id ? 2 : 1,
                        borderRadius:
                            profile.id === currentProfile?.id ? 16 : '50%',
                    }}
                    onClick={() => handleProfileClick(profile)}
                >
                    {renderDeleteButton(profile)}
                    <span className={styles.profileLabel}>
                        {profile.name.length > 2
                            ? profile.name.slice(0, 2)
                            : profile.name}
                    </span>
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
                >
                    <MdAdd fontSize={64} color='#FFF' />
                </CircleButton>
                {fetchingProfiles || fetchingProfiles === undefined ? (
                    <LoadingIcon />
                ) : (
                    renderProfiles()
                )}
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
