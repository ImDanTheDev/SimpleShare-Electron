import React, { useEffect } from 'react';
import styles from './SplashScreen.module.scss';

interface Props {
    onFinish: () => void;
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
            <img
                className={styles.logo}
                src='assets/images/SimpleShare_Logo_512.png'
                onClick={props.onFinish}
            />
        </div>
    );
};

export default SplashScreen;
