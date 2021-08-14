import React, { PropsWithChildren, ReactNode } from 'react';
import styles from './Panel.module.scss';

interface Props {
    title: string;
    left?: ReactNode;
    right?: ReactNode;
}

export const Panel: React.FC<Props> = (props: PropsWithChildren<Props>) => {
    return (
        <div className={styles.panel}>
            <div className={styles.titleBar}>
                <div className={styles.left}>{props.left}</div>
                <div className={styles.title}>{props.title}</div>
                <div className={styles.right}>{props.right}</div>
            </div>
            <div className={styles.body}>{props.children}</div>
        </div>
    );
};
