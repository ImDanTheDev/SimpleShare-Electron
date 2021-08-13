import React, { useState, useEffect, createRef, ReactNode } from 'react';
import { CircleButton } from '../CircleButton/CircleButton';
import styles from './ProfilePicker.module.scss';
import { MdChevronLeft, MdChevronRight, MdAdd } from 'react-icons/md';
import IProfile from '../../../common/services/IProfile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import { setCurrentProfile } from '../../../common/redux/profiles-slice';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { log } from '../../../common/log';
import { setShares } from '../../../common/redux/shares-slice';

export const ProfilePicker: React.FC = () => {
    const dispatch = useDispatch();

    const profiles: IProfile[] = useSelector(
        (state: RootState) => state.profiles.profiles
    );

    const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
    const [showRightArrow, setShowRightArrow] = useState<boolean>(true);

    const profileListRef = createRef<HTMLDivElement>();

    useEffect(() => {
        const handleScroll = () => {
            if (!profileListRef.current) return;

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

        profileListRef.current?.addEventListener('scroll', handleScroll);

        return () => {
            profileListRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
        dispatch(setShares([]));
        dispatch(setCurrentProfile(profile.id || 'default'));
    };

    const handleNewProfile = () => {
        if (profiles.length >= 5) {
            log('You may only have 5 profiles');
            return;
        }
        dispatch(setCurrentModal('NewProfileModal'));
    };

    const renderProfiles = (): ReactNode[] => {
        const profileButtons: ReactNode[] = [];

        profiles.forEach((profile) => {
            profileButtons.push(
                <CircleButton
                    key={profile.id}
                    height={50}
                    width={50}
                    onClick={() => handleProfileClick(profile)}
                >
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
                <CircleButton height={50} width={50} onClick={handleNewProfile}>
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
