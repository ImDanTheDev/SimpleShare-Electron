import React from 'react';
import styles from './InboxItem.module.scss';
import { MdDeleteForever } from 'react-icons/md';

export const InboxItem: React.FC = () => {
    return (
        <div className={styles.item}>
            <div className={styles.header}>
                <div className={styles.preview}></div>
                <div className={styles.fromGroup}>
                    <div className={styles.fromUser}>wipUser</div>
                    <div className={styles.fromProfile}>wipProfile</div>
                </div>
            </div>

            <div className={styles.body}>
                <span>wip</span>
            </div>

            <div className={styles.footer}>
                <div className={styles.deleteButton}>
                    <MdDeleteForever />
                </div>
                <div className={styles.copyTextButton}>Copy Text</div>
                <div className={styles.viewButton}>View</div>
            </div>
        </div>
    );
};
