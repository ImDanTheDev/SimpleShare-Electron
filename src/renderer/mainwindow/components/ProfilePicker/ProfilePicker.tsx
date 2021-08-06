import React, { useState, useEffect, createRef } from 'react';
import { CircleButton } from '../CircleButton/CircleButton';
import styles from './ProfilePicker.module.scss';
import { MdChevronLeft, MdChevronRight, MdAdd } from 'react-icons/md';

export const ProfilePicker: React.FC = () => {
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
                <CircleButton height={50} width={50}>
                    <MdAdd fontSize={64} color='#FFF' />
                </CircleButton>
                <CircleButton height={50} width={50}>
                    <span className={styles.profileLabel}>1</span>
                </CircleButton>
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
