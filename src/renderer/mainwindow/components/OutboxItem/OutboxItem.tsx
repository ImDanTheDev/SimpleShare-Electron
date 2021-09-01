import React from 'react';
import { IShare } from 'simpleshare-common';
import styles from './OutboxItem.module.scss';

interface Props {
    share: IShare;
}

export const OutboxItem: React.FC<Props> = (props: Props) => {
    return (
        <div className={styles.item}>
            <div className={styles.profilePicture}>PFP</div>
            <div className={styles.body}>
                <div className={styles.to}>{props.share.toDisplayName}</div>

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
