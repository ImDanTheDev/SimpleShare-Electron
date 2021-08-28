import React, { useEffect, useState } from 'react';
import styles from './SignInScreen.module.scss';
import { MdClose } from 'react-icons/md';
import { error, log } from '../../../common/log';
import { authService } from '../../../common/services/api';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';
import { ErrorCode, SimpleShareError } from 'simpleshare-common';

interface Props {
    opacity: number;
}

const SignInScreen: React.FC<Props> = (props: Props) => {
    const [signingIn, setSigningIn] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

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

    const handleSignIn = async () => {
        setSigningIn(true);
        setErrorMessage(undefined);
        try {
            await authService.googleSignIn();
        } catch (e) {
            setSigningIn(false);
            if (e instanceof SimpleShareError) {
                switch (e.code) {
                    case ErrorCode.SIGN_IN_CANCELLED:
                        log('The user cancelled the sign in process.');
                        setErrorMessage(undefined);
                        break;
                    case ErrorCode.SIGN_IN_INVALID_CREDENTIALS:
                        log('Invalid credentials were provided.');
                        setErrorMessage(
                            'Sign in failed with invalid credentials.'
                        );
                        break;
                    case ErrorCode.UNEXPECTED_SIGN_IN_ERROR:
                        error(
                            'An unexpected error occurred while signing in: ',
                            e.additionalInfo
                        );
                        setErrorMessage(
                            'An unexpected error occurred while signing in. Try again later.'
                        );
                        break;
                }
            } else {
                error('An unexpected error occurred while signing in: ', e);
                setErrorMessage(
                    'An unexpected error occurred while signing in. Try again later.'
                );
            }
        }
    };

    return (
        <div className={styles.frame} style={{ opacity: `${props.opacity}%` }}>
            <div className={styles.banner}>
                <img className={styles.logo} src='/assets/images/logo.svg' />
                <div className={styles.title}>
                    Welcome to <br />
                    Simple Share
                </div>
            </div>
            <div className={styles.body}>
                <div className={styles.prompt}>Choose your sign-in method:</div>
                <div className={styles.signInMethods}>
                    <div className={styles.signInMethod} onClick={handleSignIn}>
                        Google
                    </div>
                </div>
                <div className={styles.errorMessage}>
                    {signingIn ? (
                        <LoadingIcon />
                    ) : errorMessage ? (
                        errorMessage
                    ) : (
                        <></>
                    )}
                </div>
                <div className={styles.footer}>
                    {/* <a className={styles.link}>Privacy Policy</a> */}
                    <div className={styles.closeButtonGroup}>
                        <button
                            className={styles.closeButton}
                            onClick={handleClose}
                        >
                            <MdClose className={styles.closeButtonIcon} />
                        </button>
                    </div>
                    {/* <a className={styles.link}>Terms of Services</a> */}
                </div>
            </div>
        </div>
    );
};

export default SignInScreen;
