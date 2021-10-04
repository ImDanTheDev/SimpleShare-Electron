import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentModal } from '../../../common/redux/nav-slice';
import { Inbox } from '../Inbox/Inbox';
import { Outbox } from '../Outbox/Outbox';
import styles from './HomeScreen.module.scss';

export const HomeScreen: React.FC = () => {
    const dispatch = useDispatch();

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

    const handleSendShare = () => {
        dispatch(setCurrentModal('SendShareModal'));
    };

    return (
        <div className={styles.body}>
            <div className={styles.sideBar}>
                <Outbox />
                <div
                    style={{
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <button
                        className={styles.primaryButton}
                        onClick={handleSendShare}
                    >
                        <span
                            style={{
                                padding: '16px',
                            }}
                        >
                            Send a new Share
                        </span>
                    </button>
                </div>
            </div>
            <Inbox />
        </div>
    );
};
