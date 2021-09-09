import React, { useState } from 'react';
import { constants, OutboxEntry } from 'simpleshare-common';
import styles from './OutboxItem.module.scss';

interface Props {
    entry: OutboxEntry;
}

export const OutboxItem: React.FC<Props> = (props: Props) => {
    const [failover, setFailover] = useState<boolean>(false);

    return (
        <div className={styles.item}>
            <div className={styles.profilePictureBox}>
                {failover || props.entry.pfpURL === constants.DEFAULT_PFP_ID ? (
                    props.entry.share.toProfileName &&
                    (props.entry.share.toProfileName.length > 2
                        ? props.entry.share.toProfileName.slice(0, 2)
                        : props.entry.share.toProfileName)
                ) : (
                    <img
                        className={styles.profileImage}
                        src={props.entry.pfpURL}
                        onError={() => {
                            setFailover(true);
                        }}
                    />
                )}
            </div>
            <div className={styles.body}>
                <div className={styles.to}>
                    {props.entry.share.toDisplayName}
                </div>

                <div className={styles.fileName}>{'No File'}</div>
                <div className={styles.content}>
                    {props.entry.share.content.length > 50
                        ? props.entry.share.content.slice(0, 50)
                        : props.entry.share.content}
                </div>
            </div>
        </div>
    );
};
