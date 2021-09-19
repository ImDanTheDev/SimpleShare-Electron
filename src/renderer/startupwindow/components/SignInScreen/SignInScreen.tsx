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
                case ErrorCode.SIGN_IN_UNEXPECTED_ERROR:
                    setErrorMessage(
                        'An unexpected error occurred while signing in. Try again later or contact support.'
                    );
                    break;
                case ErrorCode.SIGN_IN_ACCOUNT_DISABLED:
                    setErrorMessage(
                        'Your account is disabled. Contact support if you believe this is a mistake.'
                    );
                    break;
                case ErrorCode.SIGN_IN_BLOCKED:
                    setErrorMessage(
                        'The sign in popup was blocked. Please restart Simple Share and try again.'
                    );
                    break;
                case ErrorCode.SIGN_IN_CANCELLED:
                    setErrorMessage(
                        'The sign in process was cancelled. Try again if this was a mistake.'
                    );
                    break;
                case ErrorCode.SIGN_IN_EMAIL_UNVERIFIED:
                    setErrorMessage(
                        'Your email is unverified. Verify your email and try again.'
                    );
                    break;
                case ErrorCode.SIGN_IN_EXPIRED_TOKEN:
                    setErrorMessage('Sign in token expired. Try again.');
                    break;
                case ErrorCode.SIGN_IN_INVALID_CREDENTIALS:
                    setErrorMessage(
                        'The sign in provider returned invalid credentials. Try again.'
                    );
                    break;
                case ErrorCode.SIGN_IN_POPUP_ALREADY_OPENED:
                    setErrorMessage(
                        'The sign in popup is already open. Please close the current popup and try again.'
                    );
                    break;
                case ErrorCode.SIGN_IN_USER_NOT_FOUND:
                    setErrorMessage(
                        'Your user could not be found. Verify your credentials and contact support if this happens again.'
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
                    <a
                        className={styles.link}
                        href='https://simple-share.flycricket.io/privacy.html'
                        target='_blank'
                    >
                        Privacy Policy
                    </a>
                    <div className={styles.closeButtonGroup}>
                        <button
                            className={styles.closeButton}
                            onClick={handleClose}
                        >
                            <MdClose className={styles.closeButtonIcon} />
                        </button>
                    </div>
                    <a className={styles.link}>{/*'Terms of Services'*/}</a>
                </div>
            </div>
        </div>
    );
};

export default SignInScreen;
