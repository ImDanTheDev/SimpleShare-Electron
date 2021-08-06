import React, { PropsWithChildren } from 'react';
import styles from './WindowFrame.module.scss';

interface Props {
    borderRadius: number | string;
}

const WindowFrame: React.FC<Props> = (props: PropsWithChildren<Props>) => {
    return (
        <div
            className={styles.frame}
            style={{ borderRadius: props.borderRadius }}
        >
            {props.children}
        </div>
    );
};

export default WindowFrame;
