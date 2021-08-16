import React from 'react';
import { MdClose } from 'react-icons/md';
import { AccountDropdown } from '../AccountDropdown/AccountDropdown';
import { ProfilePicker } from '../ProfilePicker/ProfilePicker';
import styles from './Toolbar.module.scss';

export const Toolbar: React.FC = () => {
    const handleClose = () => {
        window.api.send('APP_QUIT', {});
    };

    return (
        <div className={styles.toolBar}>
            <img className={styles.logo} src='assets/images/logo.svg' />
            <AccountDropdown />
            <ProfilePicker />
            <div className={styles.closeButtonGroup}>
                <button className={styles.closeButton} onClick={handleClose}>
                    <MdClose className={styles.closeButtonIcon} />
                </button>
            </div>
        </div>
    );
};
