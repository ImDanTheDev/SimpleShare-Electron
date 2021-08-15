import React from 'react';
import styles from './LoadingScreen.module.scss';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';

export const LoadingScreen: React.FC = () => {
    return (
        <div className={styles.screen}>
            <div className={styles.loadingText}>Loading</div>
            <LoadingIcon />
        </div>
    );
};
