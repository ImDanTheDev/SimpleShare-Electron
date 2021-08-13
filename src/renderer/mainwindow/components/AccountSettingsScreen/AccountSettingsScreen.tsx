import React, { useState } from 'react';
import { Panel } from '../Panel/Panel';
import { CircleButton } from '../CircleButton/CircleButton';
import { MdChevronLeft } from 'react-icons/md';
import styles from './AccountSettingsScreen.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentScreen } from '../../../common/redux/nav-slice';
import {
    MAX_DISPLAY_NAME_LENGTH,
    MAX_PHONE_NUMBER_LENGTH,
    MIN_DISPLAY_NAME_LENGTH,
    MIN_PHONE_NUMBER_LENGTH,
} from '../../../common/constants';
import IUser from '../../../common/services/IUser';
import { RootState } from '../../../common/redux/store';
import IAccountInfo from '../../../common/services/IAccountInfo';
import IPublicGeneralInfo from '../../../common/services/IPublicGeneralInfo';
import { log } from '../../../common/log';
import { databaseService } from '../../../common/services/api';

export const AccountSettingsScreen: React.FC = () => {
    const dispatch = useDispatch();

    const user: IUser | undefined = useSelector(
        (state: RootState) => state.auth.user
    );

    const accountInfo: IAccountInfo | undefined = useSelector(
        (state: RootState) => state.user.accountInfo
    );

    const publicGeneralInfo: IPublicGeneralInfo | undefined = useSelector(
        (state: RootState) => state.user.publicGeneralInfo
    );

    const [displayName, setDisplayName] = useState<string>(
        publicGeneralInfo?.displayName || ''
    );
    const [phoneNumber, setPhoneNumber] = useState<string>(
        accountInfo?.phoneNumber || ''
    );

    const handleBack = () => {
        dispatch(setCurrentScreen('HomeScreen'));
    };

    const handleSave = async () => {
        if (!user) {
            log('User is undefined. Cannot save account');
            return;
        }

        if (phoneNumber.length < MIN_PHONE_NUMBER_LENGTH) {
            log(`'${phoneNumber}' is not a valid phone number.`);
            return;
        }

        if (displayName.length < MIN_DISPLAY_NAME_LENGTH) {
            log(`'${displayName}' is not a valid display name`);
            return;
        }

        try {
            await databaseService.setAccountInfo(user.uid, {
                phoneNumber: phoneNumber,
                isAccountComplete: true,
            });
            await databaseService.setPublicGeneralInfo(user.uid, {
                displayName: displayName,
                isComplete: true,
            });
            dispatch(setCurrentScreen('HomeScreen'));
        } catch {
            log('Failed to save account');
        }
    };

    return (
        <div className={styles.screen}>
            <Panel
                title='Account Settings'
                left={
                    <CircleButton width={26} height={26} onClick={handleBack}>
                        <MdChevronLeft className={styles.backButtonIcon} />
                    </CircleButton>
                }
            >
                <div className={styles.panelBody}>
                    <div className={styles.labeledField}>
                        <span className={styles.label}>Display Name:</span>
                        <input
                            className={styles.field}
                            type='text'
                            spellCheck='false'
                            minLength={MIN_DISPLAY_NAME_LENGTH}
                            maxLength={MAX_DISPLAY_NAME_LENGTH}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                    <div className={styles.labeledField}>
                        <span className={styles.label}>Phone Number:</span>
                        <input
                            className={styles.field}
                            type='tel'
                            spellCheck='false'
                            minLength={MIN_PHONE_NUMBER_LENGTH}
                            maxLength={MAX_PHONE_NUMBER_LENGTH}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Save Account
                    </button>
                </div>
            </Panel>
        </div>
    );
};
