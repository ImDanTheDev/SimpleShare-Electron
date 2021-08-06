import React from 'react';
import styles from './OutboxItem.module.scss';

interface Props {
    to: string;
    fileName: string;
    content: string;
}

export const OutboxItem: React.FC<Props> = (props: Props) => {
    return (
        <div className={styles.item}>
            <div className={styles.profilePicture}>PFP</div>
            <div className={styles.body}>
                <div className={styles.to}>{props.to}</div>

                <div className={styles.fileName}>{props.fileName}</div>
                <div className={styles.content}>{props.content}</div>
            </div>
        </div>
    );
};
