import React, { useState, useEffect } from 'react';
import styles from './InboxItem.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import { databaseService } from '../../../common/services/api';
import { useDispatch } from 'react-redux';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { setCurrentShare } from '../../../common/redux/shares-slice';
import { pushToast } from '../../../common/redux/toaster-slice';
import { IProfile, IPublicGeneralInfo, IShare } from 'simpleshare-common';

interface Props {
    share: IShare;
}

export const InboxItem: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();

    const [senderDisplayName, setSenderDisplayName] = useState<string>('');
    const [senderProfileName, setSenderProfileName] = useState<string>('');

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const publicGeneralInfo: IPublicGeneralInfo | undefined =
                    await databaseService.getPublicGeneralInfo(
                        props.share.fromUid
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
                        props.share.fromUid,
                        props.share.fromProfileId
                    );
                setSenderProfileName(profile?.name || 'Unknown Profile');
            } catch {
                setSenderProfileName('Unknown Profile');
            }
        };

        fetchDisplayName();
        fetchProfileName();
    }, [props.share]);

    const handleDelete = async () => {
        if (!(await databaseService.deleteShare(props.share))) {
            dispatch(
                pushToast({
                    message:
                        'An unexpected error occurred while deleting the inbox item. Try again later.',
                    duration: 5,
                    type: 'error',
                })
            );
        }
    };

    const handleCopyText = async () => {
        await navigator.clipboard.writeText(props.share.content);
    };

    const handleView = () => {
        dispatch(setCurrentShare(props.share));
        dispatch(setCurrentModal('ViewShareModal'));
    };

    return (
        <div className={styles.item}>
            <div className={styles.header}>
                <div className={styles.preview}></div>
                <div className={styles.fromGroup}>
                    <div className={styles.fromUser}>{senderDisplayName}</div>
                    <div className={styles.fromProfile}>
                        {senderProfileName}
                    </div>
                </div>
            </div>

            <div className={styles.body}>
                <span>{props.share.content}</span>
            </div>

            <div className={styles.footer}>
                <div className={styles.deleteButton} onClick={handleDelete}>
                    <MdDeleteForever />
                </div>
                <div className={styles.copyTextButton} onClick={handleCopyText}>
                    Copy Text
                </div>
                <div className={styles.viewButton} onClick={handleView}>
                    View
                </div>
            </div>
        </div>
    );
};
