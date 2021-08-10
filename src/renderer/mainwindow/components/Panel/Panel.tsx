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
                {props.left}
                <div className={styles.title}>{props.title}</div>
                {props.right}
            </div>
            <div className={styles.body}>{props.children}</div>
        </div>
    );
};
