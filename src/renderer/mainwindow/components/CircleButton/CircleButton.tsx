import React, { PropsWithChildren } from 'react';
import styles from './CircleButton.module.scss';

interface Props {
    width: number;
    height: number;
    onClick?: () => void;
}

export const CircleButton: React.FC<Props> = (
    props: PropsWithChildren<Props>
) => {
    return (
        <div
            className={styles.button}
            style={{ width: props.width, height: props.height }}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    );
};
