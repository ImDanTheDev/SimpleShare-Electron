import React from 'react';
import { MdClose } from 'react-icons/md';
import WindowFrame from '../../../common/WindowFrame/WindowFrame';
import styles from './UpdateWindow.module.scss';

export const UpdateWindow: React.FC = () => {
    const handleClose = () => {
        window.api.send('APP_QUIT', {});
    };

    return (
        <WindowFrame borderRadius={0}>
            <div className={styles.windowContent}>
                <div className={styles.header}>Out of Date</div>
                <div className={styles.message}>
                    You must update to the latest version to continue using
                    Simple Share.
                </div>
                <button className={styles.closeButton} onClick={handleClose}>
                    <MdClose className={styles.closeButtonIcon} />
                </button>
            </div>
        </WindowFrame>
    );
};
