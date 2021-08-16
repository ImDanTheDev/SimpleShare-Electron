import React, { useEffect } from 'react';
import styles from './SplashScreen.module.scss';

interface Props {
    opacity: number;
}

const SplashScreen: React.FC<Props> = (props: Props) => {
    useEffect(() => {
        window.api.send('APP_RESIZE', {
            height: 300,
            width: 300,
            overrideMinimumSize: true,
        });
    }, []);

    return (
        <div
            className={styles.splashScreen}
            style={{ opacity: `${props.opacity}%` }}
        >
            <img className={styles.logo} src='assets/images/logo.svg' />
        </div>
    );
};

export default SplashScreen;
