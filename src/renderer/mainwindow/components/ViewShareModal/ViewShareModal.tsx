import React, { useState, useEffect } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { IProfile, IPublicGeneralInfo, IShare } from 'simpleshare-common';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { pushToast } from '../../../common/redux/toaster-slice';
import { databaseService } from '../../../common/services/api';
import styles from './ViewShareModal.module.scss';

export const ViewShareModal: React.FC = () => {
    const dispatch = useDispatch();

    const currentShare: IShare | undefined = useSelector(
        (state: RootState) => state.shares.currentShare
    );

    const [senderDisplayName, setSenderDisplayName] = useState<string>('');
    const [senderProfileName, setSenderProfileName] = useState<string>('');

    useEffect(() => {
        if (!currentShare) {
            dispatch(
                pushToast({
                    message: 'The selected share does not exist.',
                    type: 'info',
                    duration: 5,
                })
            );
            dispatch(setCurrentModal('None'));
            return;
        }

        const fetchDisplayName = async () => {
            try {
                const publicGeneralInfo: IPublicGeneralInfo | undefined =
                    await databaseService.getPublicGeneralInfo(
                        currentShare.fromUid
                    );
                setSenderDisplayName(
                    publicGeneralInfo?.displayName || 'Unknown User'
                );
            } catch {
                setSenderDisplayName('Unknown User');
            }
        };

        const fetchProfileName = async () => {
            try {
                const profile: IProfile | undefined =
                    await databaseService.getProfile(
                        currentShare.fromUid,
                        currentShare.fromProfileId
                    );
                setSenderProfileName(profile?.name || 'Unknown Profile');
            } catch {
                setSenderProfileName('Unknown Profile');
            }
        };

        fetchDisplayName();
        fetchProfileName();
    }, [currentShare]);

    const handleDelete = async () => {
        if (currentShare) await databaseService.deleteShare(currentShare);
        dispatch(setCurrentModal('None'));
    };

    const handleClose = async () => {
        dispatch(setCurrentModal('None'));
    };

    return (
        <div className={styles.modal}>
            <span className={styles.title}>Your Share</span>
            <span className={styles.header}>From User:</span>
            <input
                className={styles.field}
                type='text'
                value={senderDisplayName}
                readOnly={true}
            />
            <span className={styles.header}>From Profile:</span>
            <input
                className={styles.field}
                type='text'
                value={senderProfileName}
                readOnly={true}
            />
            <span className={styles.header}>Text Content:</span>
            <textarea
                className={styles.field}
                value={currentShare?.content || ''}
                readOnly={true}
                rows={5}
            />
            <div className={styles.buttons}>
                <button className={styles.deleteButton} onClick={handleDelete}>
                    <MdDeleteForever />
                </button>
                <button className={styles.button} onClick={handleClose}>
                    Close
                </button>
            </div>
        </div>
    );
};
