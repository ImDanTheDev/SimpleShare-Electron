import React, { PropsWithChildren } from 'react';
import styles from './CircleButton.module.scss';

interface Props {
    style: React.CSSProperties | undefined;
    onClick?: () => void;
    tooltip?: string;
}

export const CircleButton: React.FC<Props> = (
    props: PropsWithChildren<Props>
) => {
    return (
        <div
            className={styles.button}
            style={props.style}
            onClick={props.onClick}
            title={props.tooltip}
        >
            {props.children}
        </div>
    );
};
