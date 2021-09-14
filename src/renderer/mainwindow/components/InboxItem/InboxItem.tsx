import React, { useState } from 'react';
import styles from './InboxItem.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { deleteCloudShare, IShare, setCurrentShare } from 'simpleshare-common';

interface Props {
    share: IShare;
}

export const InboxItem: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();

    const [fallback, setFallback] = useState<boolean>(false);

    const handleDelete = async () => {
        dispatch(deleteCloudShare(props.share));
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
                <div className={styles.deleteButton} onClick={handleDelete}>
                    <MdDeleteForever />
                </div>
                {props.share.fileURL && (
                    <a
                        className={styles.fileURL}
                        href={props.share.fileURL}
                        target='_blank'
                    >
                        <div className={styles.downloadFileButton}>
                            Download File
                        </div>
                    </a>
                )}
                {props.share.textContent && (
                    <div
                        className={styles.copyTextButton}
                        onClick={handleCopyText}
                    >
                        Copy Text
                    </div>
                )}

                <div className={styles.viewButton} onClick={handleView}>
                    View
                </div>
            </div>
        </div>
    );
};
