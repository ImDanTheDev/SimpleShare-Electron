import React from 'react';
import styles from './AccountDropdown.module.scss';
import { MdExpandMore } from 'react-icons/md';
import { authService } from '../../../common/services/api';
import { useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../../common/redux/nav-slice';

export const AccountDropdown: React.FC = () => {
    const dispatch = useDispatch();

    const handleSignOut = () => {
        authService.signOut();
        window.api.send('APP_SHOW_STARTUP_WINDOW', {});
    };

    const handleSettings = () => {
        dispatch(setCurrentScreen('AccountSettingsScreen'));
    };

    return (
        <div className={styles.accountGroup}>
            <div className={styles.picker}>
                <div className={styles.pickerContent}>
                    <div className={styles.welcomeGroup}>
                        <div className={styles.welcomeText}>Welcome</div>
                        <div className={styles.displayName}>wipUser</div>
                    </div>
                    <div className={styles.arrow}>
                        <MdExpandMore />
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <div
                        className={styles.dropdownItem}
                        onClick={handleSettings}
                    >
                        Settings
                    </div>
                    <div
                        className={styles.dropdownItem}
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </div>
                </div>
            </div>
        </div>
    );
};
