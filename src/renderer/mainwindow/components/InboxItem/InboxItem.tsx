import React, { useState, useEffect } from 'react';
import styles from './InboxItem.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import IShare from '../../../common/services/IShare';
import { databaseService } from '../../../common/services/api';
import IPublicGeneralInfo from '../../../common/services/IPublicGeneralInfo';
import IProfile from '../../../common/services/IProfile';

interface Props {
    share: IShare;
}

export const InboxItem: React.FC<Props> = (props: Props) => {
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
        await databaseService.deleteShare(props.share);
    };

    const handleCopyText = () => {
        navigator.clipboard.writeText(props.share.content);
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
                <div className={styles.viewButton}>View</div>
            </div>
        </div>
    );
};
