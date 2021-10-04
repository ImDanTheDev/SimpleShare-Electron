import React, { useState } from 'react';
import styles from './InboxItem.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import {
    deleteCloudShare,
    IShare,
    removeNotificationForShare,
    setCurrentShare,
} from 'simpleshare-common';

interface Props {
    share: IShare;
}

export const InboxItem: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();

    const [fallback, setFallback] = useState<boolean>(false);

    const handleDelete = async () => {
        dispatch(deleteCloudShare(props.share));
        if (props.share.id)
            dispatch(removeNotificationForShare(props.share.id));
    };

    const handleCopyText = async () => {
        await navigator.clipboard.writeText(props.share.textContent || '');
    };

    const handleView = () => {
        dispatch(setCurrentShare(props.share));
        dispatch(setCurrentModal('ViewShareModal'));
    };

    return (
        <div className={styles.item}>
            <div className={styles.header}>
                {props.share.fileURL && !fallback && (
                    <div className={styles.preview}>
                        <img
                            className={styles.previewImage}
                            src={props.share.fileURL}
                            title='File Preview'
                            onError={() => setFallback(true)}
                        />
                    </div>
                )}
                <div className={styles.fromGroup}>
                    <div className={styles.fromUser}>
                        {props.share.fromDisplayName || 'Unknown User'}
                    </div>
                    <div className={styles.fromProfile}>
                        {props.share.fromProfileName || 'Unknown Profile'}
                    </div>
                </div>
            </div>

            <div className={styles.body}>
                {props.share.textContent ? (
                    <span>{props.share.textContent}</span>
                ) : (
                    <span className={styles.noText}>No Text</span>
                )}
            </div>
            <div className={styles.footer}>
                <div
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    title='Delete Share'
                >
                    <MdDeleteForever />
                </div>
                <button
                    className={styles.secondaryButton}
                    disabled={!props.share.fileURL}
                    title={
                        props.share.fileURL ? props.share.fileURL : 'No File'
                    }
                    onClick={() => {
                        if (props.share.fileURL) {
                            window.open(props.share.fileURL, '_blank');
                        }
                    }}
                >
                    <span style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                        Download File
                    </span>
                </button>
                <button
                    className={styles.secondaryButton}
                    onClick={handleCopyText}
                    disabled={!props.share.textContent}
                    title={props.share.textContent ? '' : 'No Text'}
                >
                    <span style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                        Copy Text
                    </span>
                </button>
                <button className={styles.secondaryButton} onClick={handleView}>
                    <span style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                        View
                    </span>
                </button>
            </div>
        </div>
    );
};
