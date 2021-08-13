import React, { useState, useEffect } from 'react';
import { databaseService } from '../../../common/services/api';
import IPublicGeneralInfo from '../../../common/services/IPublicGeneralInfo';
import IShare from '../../../common/services/IShare';
import styles from './OutboxItem.module.scss';

interface Props {
    share: IShare;
}

export const OutboxItem: React.FC<Props> = (props: Props) => {
    const [senderDisplayName, setSenderDisplayName] = useState<string>('');

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const publicGeneralInfo: IPublicGeneralInfo | undefined =
                    await databaseService.getPublicGeneralInfo(
                        props.share.toUid
                    );
                setSenderDisplayName(
                    publicGeneralInfo?.displayName || 'Unknown User'
                );
            } catch {
                setSenderDisplayName('Unknown User');
            }
        };
        fetchDisplayName();
    });

    return (
        <div className={styles.item}>
            <div className={styles.profilePicture}>PFP</div>
            <div className={styles.body}>
                <div className={styles.to}>{senderDisplayName}</div>

                <div className={styles.fileName}>{'No File'}</div>
                <div className={styles.content}>
                    {props.share.content.length > 50
                        ? props.share.content.slice(0, 50)
                        : props.share.content}
                </div>
            </div>
        </div>
    );
};
