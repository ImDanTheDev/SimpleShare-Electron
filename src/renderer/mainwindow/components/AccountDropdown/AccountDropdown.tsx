import React from 'react';
import styles from './AccountDropdown.module.scss';
import { MdExpandMore } from 'react-icons/md';
import { authService } from '../../../common/services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentScreen } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import IPublicGeneralInfo from '../../../common/services/IPublicGeneralInfo';

export const AccountDropdown: React.FC = () => {
    const dispatch = useDispatch();

    const publicGeneralInfo: IPublicGeneralInfo | undefined = useSelector(
        (state: RootState) => state.user.publicGeneralInfo
    );

    const handleSignOut = () => {
        authService.signOut();
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
                        <div className={styles.displayName}>
                            {publicGeneralInfo?.displayName}
                        </div>
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
                        Account Settings
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
