import React, { useEffect } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteCloudShare,
    IShare,
    removeNotificationForShare,
} from 'simpleshare-common';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { RootState } from '../../../common/redux/store';
import { pushToast } from '../../../common/redux/toaster-slice';
import styles from './ViewShareModal.module.scss';

export const ViewShareModal: React.FC = () => {
    const dispatch = useDispatch();

    const currentShare: IShare | undefined = useSelector(
        (state: RootState) => state.shares.currentShare
    );

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
    }, [currentShare]);

    const handleDelete = async () => {
        if (currentShare) {
            dispatch(deleteCloudShare(currentShare));
            if (currentShare.id) {
                dispatch(removeNotificationForShare(currentShare.id));
            }
        }
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
                className={styles.textField}
                type='text'
                value={currentShare?.fromDisplayName}
                readOnly={true}
            />
            <span className={styles.header}>From Profile:</span>
            <input
                className={styles.textField}
                type='text'
                value={currentShare?.fromProfileName}
                readOnly={true}
            />
            <span className={styles.header}>Text Content:</span>
            <textarea
                className={styles.textField}
                value={currentShare?.textContent || ''}
                title={currentShare?.textContent ? '' : 'No Text'}
                readOnly={true}
                rows={5}
            />
            <div className={styles.buttons}>
                <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    title='Delete Share'
                >
                    <MdDeleteForever />
                </button>
                <button
                    className={styles.secondaryButton}
                    disabled={!currentShare?.fileURL}
                    title={
                        currentShare?.fileURL ? currentShare.fileURL : 'No File'
                    }
                    onClick={() => {
                        if (currentShare?.fileURL) {
                            window.open(currentShare?.fileURL, '_blank');
                        }
                    }}
                >
                    Download File
                </button>
                <button
                    className={styles.secondaryButton}
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};
