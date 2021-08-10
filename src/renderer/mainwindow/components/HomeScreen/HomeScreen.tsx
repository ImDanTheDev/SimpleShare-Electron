import React, { useEffect } from 'react';
import { Inbox } from '../Inbox/Inbox';
import { Outbox } from '../Outbox/Outbox';
import styles from './HomeScreen.module.scss';

export const HomeScreen: React.FC = () => {
    useEffect(() => {
        window.api.send('APP_CONFIGURE', {
            minSize: {
                minWidth: 800,
                minHeight: 600,
            },
            resizable: true,
            movable: true,
        });
    }, []);

    return (
        <div className={styles.body}>
            <div className={styles.sideBar}>
                <Outbox />
                <button className={styles.sendShareButton}>
                    Send a new Share
                </button>
            </div>
            <Inbox />
        </div>
    );
};
