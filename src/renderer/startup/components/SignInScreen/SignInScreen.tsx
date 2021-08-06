import React, { useEffect } from 'react';
import styles from './SignInScreen.module.scss';
import { MdClose } from 'react-icons/md';

interface Props {
    opacity: number;
    onSignIn: () => void;
}

const SignInScreen: React.FC<Props> = (props: Props) => {
    useEffect(() => {
        window.api.send('APP_RESIZE', {
            height: 375,
            width: 375,
            overrideMinimumSize: true,
        });
    }, []);

    const handleClose = () => {
        window.api.send('APP_QUIT', {});
    };

    return (
        <div className={styles.frame} style={{ opacity: `${props.opacity}%` }}>
            <div className={styles.banner}>
                <img
                    className={styles.logo}
                    src='assets/images/SimpleShare_Logo_512.png'
                />
                <div className={styles.title}>
                    Welcome to <br />
                    Simple Share
                </div>
            </div>
            <div className={styles.body}>
                <div className={styles.prompt}>Choose your sign-in method:</div>
                <div className={styles.signInMethods}>
                    <div
                        className={styles.signInMethod}
                        onClick={props.onSignIn}
                    >
                        Google
                    </div>
                </div>
                <div className={styles.footer}>
                    <a className={styles.link}>Privacy Policy</a>
                    <div className={styles.closeButtonGroup}>
                        <button
                            className={styles.closeButton}
                            onClick={handleClose}
                        >
                            <MdClose className={styles.closeButtonIcon} />
                        </button>
                    </div>
                    <a className={styles.link}>Terms of Services</a>
                </div>
            </div>
        </div>
    );
};

export default SignInScreen;
