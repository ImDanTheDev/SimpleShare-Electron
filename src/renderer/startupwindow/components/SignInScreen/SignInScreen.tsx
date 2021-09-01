import React, { useEffect, useState } from 'react';
import styles from './SignInScreen.module.scss';
import { MdClose } from 'react-icons/md';
import { LoadingIcon } from '../../../common/LoadingIcon/LoadingIcon';
import { ErrorCode, signInWithGoogle } from 'simpleshare-common';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';

interface Props {
    opacity: number;
}

const SignInScreen: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();

    const signingIn = useSelector((state: RootState) => state.auth.signingIn);
    const signInError = useSelector(
        (state: RootState) => state.auth.signInError
    );

    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    useEffect(() => {
        window.api.send('APP_RESIZE', {
            height: 375,
            width: 375,
            overrideMinimumSize: true,
        });
    }, []);

    useEffect(() => {
        if (signInError) {
            switch (signInError.code) {
                case ErrorCode.SIGN_IN_CANCELLED:
                    setErrorMessage('Sign in cancelled.');
                    break;
                case ErrorCode.SIGN_IN_INVALID_CREDENTIALS:
                    setErrorMessage('Sign in failed with invalid credentials.');
                    break;
                case ErrorCode.UNEXPECTED_SIGN_IN_ERROR:
                    setErrorMessage(
                        'An unexpected error occurred while signing in. Try again later.'
                    );
                    break;
            }
        } else {
            setErrorMessage(undefined);
        }
    }, [signInError]);

    const handleClose = () => {
        window.api.send('APP_QUIT', {});
    };

    const handleSignIn = async () => {
        dispatch(signInWithGoogle());
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
