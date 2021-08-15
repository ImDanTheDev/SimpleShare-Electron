import React from 'react';
import styles from './LoadingIcon.module.scss';
import { CgSpinnerTwo } from 'react-icons/cg';

interface Props {
    style?: React.CSSProperties;
}

export const LoadingIcon: React.FC<Props> = (props: Props) => {
    return <CgSpinnerTwo className={styles.loadingIcon} style={props.style} />;
};
