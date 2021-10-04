import React from 'react';
import {
    VscChromeMaximize,
    VscChromeMinimize,
    VscClose,
} from 'react-icons/vsc';

import styles from './Titlebar.module.scss';

const Titlebar: React.FC = () => {
    const handleMinimize = () => {
        window.api.send('APP_MINIMIZE', {});
    };

    const handleMaximize = () => {
        window.api.send('APP_MAXIMIZE_OR_RESTORE', {});
    };

    const handleClose = () => {
        window.api.send('APP_QUIT', {});
    };

    return (
        <div className={styles.titlebar}>
            <span className={styles.title}>Simple Share</span>
            <span className={styles.utilityButton} onClick={handleMinimize}>
                <VscChromeMinimize />
            </span>
            <span className={styles.utilityButton} onClick={handleMaximize}>
                <VscChromeMaximize />
            </span>
            <span className={styles.utilityButton} onClick={handleClose}>
                <VscClose />
            </span>
        </div>
    );
};

export default Titlebar;
