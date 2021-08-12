import React, { useEffect, useState } from 'react';
import styles from './CompleteAccountScreen.module.scss';
import { useSelector } from 'react-redux';
import { Panel } from '../Panel/Panel';
import IUser from '../../../common/services/IUser';
import { RootState } from '../../../common/redux/store';
import IAccountInfo from '../../../common/services/IAccountInfo';
import IPublicGeneralInfo from '../../../common/services/IPublicGeneralInfo';
import { log } from '../../../common/log';
import {
    MAX_DISPLAY_NAME_LENGTH,
    MAX_PHONE_NUMBER_LENGTH,
    MIN_DISPLAY_NAME_LENGTH,
    MIN_PHONE_NUMBER_LENGTH,
} from '../../../common/constants';
import { databaseService } from '../../../common/services/api';

export const CompleteAccountScreen: React.FC = () => {
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
        accountInfo?.phoneNumber || ''
    );
    const [phoneNumber, setPhoneNumber] = useState<string>(
        publicGeneralInfo?.displayName || ''
    );

    useEffect(() => {
        if (!user) {
            log(
                'Error: User is undefined. Cannot continue account completion without a user.'
            );
            return; // TODO: We need a user for this page. Handle this error.
        }
    }, [user]);

    const handleComplete = () => {
        const continueAuthFlow = async () => {
            if (!user) {
                log('User is undefined. An unexpected error occurred.');
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

            const accountExists = await databaseService.doesAccountExist(
                user.uid
            );
            if (accountExists) {
                const success = await databaseService.setAccountInfo(user.uid, {
                    phoneNumber: phoneNumber,
                    isAccountComplete: true,
                });

                if (success) {
                    log('Saved completed account info to database.');
                } else {
                    log('Failed to complete the account.');
                    return;
                }

                try {
                    await databaseService.setPublicGeneralInfo(user.uid, {
                        displayName: displayName,
                        isComplete: true,
                    });
                    log('Saved completed public general info to database');
                } catch {
                    log('Failed to complete public general info');
                }
            } else {
                const success = await databaseService.initializeAccount(
                    user.uid,
                    {
                        phoneNumber: phoneNumber,
                        isAccountComplete: true,
                    },
                    {
                        displayName: displayName,
                        isComplete: true,
                    }
                );

                if (success) {
                    log('Saved completed account and general info to database');
                } else {
                    log('Failed to complete the account');
                }
            }
        };

        continueAuthFlow();
    };

    return (
        <div className={styles.screen}>
            <Panel title='Complete Your Account'>
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
                    <button
                        className={styles.saveButton}
                        onClick={handleComplete}
                    >
                        Complete Account
                    </button>
                </div>
            </Panel>
        </div>
    );
};
