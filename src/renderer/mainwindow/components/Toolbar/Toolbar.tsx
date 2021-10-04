import React from 'react';
import { AccountDropdown } from '../AccountDropdown/AccountDropdown';
import { ProfilePicker } from '../ProfilePicker/ProfilePicker';
import styles from './Toolbar.module.scss';

export const Toolbar: React.FC = () => {
    return (
        <div className={styles.toolBar}>
            <img
                className={styles.logo}
                src='/assets/images/logo.svg'
                title='Simple Share'
            />
            <AccountDropdown />
            <ProfilePicker />
        </div>
    );
};
