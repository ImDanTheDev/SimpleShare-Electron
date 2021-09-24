import React, { ReactNode, useEffect } from 'react';
import {
    MdClose,
    MdErrorOutline,
    MdInfoOutline,
    MdNotifications,
    MdWarning,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../common/redux/store';
import {
    ageToast,
    dismissToast,
    IToast,
    openToaster,
    setTimer,
} from '../../../common/redux/toaster-slice';
import styles from './Toaster.module.scss';

export const Toaster: React.FC = () => {
    const dispatch = useDispatch();

    const toasts: IToast[] = useSelector(
        (state: RootState) => state.toaster.toasts
    );

    const isToasterOpen: boolean = useSelector(
        (state: RootState) => state.toaster.isToasterOpen
    );

    useEffect(() => {
        toasts.forEach((toast) => {
            if (toast.id === undefined) {
                if (toast.timer) {
                    clearInterval(toast.timer);
                }
                dispatch(dismissToast(toast));
                return;
            }

            if (!toast.timer) {
                // This is a new toast without a timer.
                // Create the timer.
                const timer: NodeJS.Timer = setInterval(() => {
                    dispatch(ageToast(toast));
                }, 1000);

                dispatch(setTimer({ id: toast.id, timer: timer }));
            } else {
                // This toast has a timer.
                if (toast.duration <= 0) {
                    // This toast has expired.
                    // Cancel timer and remove toast.
                    if (toast.timer) {
                        clearInterval(toast.timer);
                    }
                    dispatch(dismissToast(toast));
                } else {
                    // This toast is still fresh.
                }
            }
        });
    }, [toasts]);

    const getToastIcon = (toast: IToast): ReactNode => {
        switch (toast.type) {
            case 'info':
                return (
                    <MdInfoOutline
                        className={styles.toastIcon}
                        color='#2A9D8F'
                    />
                );
            case 'warn':
                return (
                    <MdWarning className={styles.toastIcon} color='#E9C46A' />
                );
            case 'error':
                return (
                    <MdErrorOutline
                        className={styles.toastIcon}
                        color='#E76F51'
                    />
                );
        }
    };

    const handleNotificationIconClick = () => {
        dispatch(openToaster(!isToasterOpen));
    };

    const handleDismissToast = (toast: IToast) => {
        if (toast.timer) {
            clearInterval(toast.timer);
        }
        dispatch(dismissToast(toast));
    };

    const renderToasts = (): ReactNode[] => {
        const renderedToasts: ReactNode[] = [];

        toasts.forEach((toast, i) => {
            renderedToasts.push(
                <div key={i} className={styles.toast}>
                    <div className={styles.toastInfo}>
                        {getToastIcon(toast)}
                        <div className={styles.toastCountdown}>
                            {toast.duration}s
                        </div>
                    </div>
                    <div className={styles.toastMessage}>{toast.message}</div>
                    <div className={styles.toastActions}>
                        <MdClose
                            className={styles.dismissToastIcon}
                            onClick={() => handleDismissToast(toast)}
                        />
                    </div>
                </div>
            );
        });

        return renderedToasts;
    };

    return (
        <>
            <div
                className={styles.toasterContainer}
                style={{
                    left: isToasterOpen ? 2 : -300,
                    width: isToasterOpen ? 'auto' : 0,
                    right: isToasterOpen ? 2 : 'auto',
                }}
            >
                <div
                    className={styles.dismissOverlay}
                    onClick={handleNotificationIconClick}
                />
                <div className={styles.toaster}>
                    <div className={styles.toasterHeader}>
                        <div className={styles.title}>
                            <MdNotifications
                                className={styles.notificationIcon}
                            />
                            <div> {toasts.length} Notifications</div>
                        </div>
                        <MdClose
                            className={styles.closeButton}
                            title='Close Notification Panel'
                            onClick={handleNotificationIconClick}
                        />
                    </div>
                    <div className={styles.list}>{renderToasts()}</div>
                </div>
            </div>
            {isToasterOpen ? (
                <></>
            ) : (
                <div
                    className={styles.pullOutTab}
                    onClick={handleNotificationIconClick}
                    title={'Open Notification Panel'}
                >
                    <MdNotifications className={styles.notificationIcon} />
                    {toasts.length}
                </div>
            )}
        </>
    );
};
